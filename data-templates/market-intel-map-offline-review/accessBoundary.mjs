/** Offline review candidate. No runtime mount, environment access or live connector. */
const failure = (status, code) => ({ status, body: { error: { code } } });
const own = (v, key) => Object.prototype.hasOwnProperty.call(v, key);

/**
 * Dependencies are server-owned adapters. verify must cryptographically verify
 * the token; this boundary never decodes JWTs or trusts caller-supplied claims.
 * Offline tests exercise policy, not signature verification or deployed auth.
 */
export function createAccessBoundary({ expectedIssuer, expectedAudience, verify,
  resolveEntitlement, resolvePublication, readRelease, now = () => Date.now() / 1000 }) {
  return async function read({ authorization, geographyId, layerId, pinnedReleaseId,
    pinnedGeneration, use = 'ui' } = {}) {
    if (!expectedIssuer || !expectedAudience || typeof verify !== 'function' ||
        typeof resolveEntitlement !== 'function' || typeof resolvePublication !== 'function' ||
        typeof readRelease !== 'function') return failure(503, 'MAP_UNAVAILABLE');
    if (typeof authorization !== 'string' || authorization.length > 16384 ||
        !/^Bearer +[^\s]+$/i.test(authorization)) return failure(401, 'AUTHENTICATION_REQUIRED');
    let verified;
    try { verified = await verify(authorization.replace(/^Bearer +/i, '')); }
    catch { return failure(503, 'MAP_UNAVAILABLE'); }
    if (!verified?.ok) return failure(401, 'AUTHENTICATION_REQUIRED');
    const s = verified.session;
    const time = now();
    if (!s || s.issuer !== expectedIssuer || s.audience !== expectedAudience ||
        typeof s.subject !== 'string' || !s.subject || s.subject.length > 256 ||
        !Number.isFinite(s.expiresAt) || s.expiresAt <= time ||
        s.role !== 'authenticated' || s.isAnonymous !== false ||
        !['RS256', 'ES256'].includes(s.algorithm)) return failure(401, 'AUTHENTICATION_REQUIRED');
    // No email/user_metadata/app_metadata shortcut: a current authority is required.
    let entitlement;
    try { entitlement = await resolveEntitlement({ issuer: s.issuer, subject: s.subject }); }
    catch { return failure(503, 'MAP_UNAVAILABLE'); }
    if (!entitlement || entitlement.active !== true || entitlement.revoked === true ||
        !Array.isArray(entitlement.capabilities) || !entitlement.capabilities.includes('map_read') ||
        !Number.isFinite(entitlement.expiresAt) || entitlement.expiresAt <= now())
      return failure(403, 'ACCESS_DENIED');
    if (!['ui', 'export', 'ai'].includes(use) ||
        !['CA-CMA-535', 'CA-CMA-933', 'US-STATE-04', 'US-STATE-48'].includes(geographyId) ||
        typeof layerId !== 'string' || !/^[a-z][a-z0-9-]{0,79}$/.test(layerId) ||
        (pinnedReleaseId !== undefined && (typeof pinnedReleaseId !== 'string' || !pinnedReleaseId)) ||
        (pinnedGeneration !== undefined && (!Number.isSafeInteger(pinnedGeneration) || pinnedGeneration < 0)) ||
        ((pinnedReleaseId === undefined) !== (pinnedGeneration === undefined)))
      return failure(400, 'INVALID_SELECTION');
    let p;
    try { p = await resolvePublication({ geographyId, layerId }); }
    catch { return failure(503, 'MAP_UNAVAILABLE'); }
    if (!p || p.state !== 'published' || !p.releaseId || !p.rights ||
        p.rights[use] !== true || !Number.isSafeInteger(p.generation) || p.generation < 0 ||
        !p.boundaryVersion || !p.boundaryHash) return failure(503, 'LAYER_UNAVAILABLE');
    // Conservative first slice: changed heads invalidate all old pins. Never switch pages.
    if (pinnedReleaseId !== undefined &&
        (pinnedReleaseId !== p.releaseId || pinnedGeneration !== p.generation))
      return failure(409, 'RELEASE_CHANGED');
    if (p.requiredAgreement && !entitlement.agreements?.includes(p.requiredAgreement))
      return failure(403, 'TERMS_REQUIRED');
    let release;
    try { release = await readRelease({ releaseId: p.releaseId, geographyId, layerId,
      boundaryVersion: p.boundaryVersion, boundaryHash: p.boundaryHash }); }
    catch { return failure(503, 'LAYER_UNAVAILABLE'); }
    if (!release || release.releaseId !== p.releaseId || release.geographyId !== geographyId ||
        release.layerId !== layerId || release.boundaryVersion !== p.boundaryVersion ||
        release.boundaryHash !== p.boundaryHash || !Array.isArray(release.observations) ||
        release.observations.length > 250) return failure(503, 'LAYER_UNAVAILABLE');
    // Recheck current control after reading: a withdrawal/revocation during the read
    // must win over an earlier authorization/publication check.
    let current, member;
    try {
      current = await resolvePublication({ geographyId, layerId });
      member = await resolveEntitlement({ issuer: s.issuer, subject: s.subject });
    } catch { return failure(503, 'MAP_UNAVAILABLE'); }
    if (!member || member.active !== true || member.revoked === true ||
        !member.capabilities?.includes('map_read') || !Number.isFinite(member.expiresAt) ||
        member.expiresAt <= now()) return failure(403, 'ACCESS_DENIED');
    if (s.expiresAt <= now()) return failure(401, 'AUTHENTICATION_REQUIRED');
    if (!current || current.state !== 'published' || current.rights?.[use] !== true)
      return failure(503, 'LAYER_UNAVAILABLE');
    if (current.generation !== p.generation || current.releaseId !== p.releaseId ||
        current.boundaryVersion !== p.boundaryVersion || current.boundaryHash !== p.boundaryHash ||
        current.requiredAgreement !== p.requiredAgreement) return failure(409, 'RELEASE_CHANGED');
    if (current.requiredAgreement && !member.agreements?.includes(current.requiredAgreement))
      return failure(403, 'TERMS_REQUIRED');
    const observations = [];
    for (const row of release.observations) {
      if (!row || !['available', 'suppressed', 'missing'].includes(row.status) ||
          (row.value !== null && (!own(row, 'value') || !Number.isFinite(row.value))) ||
          (row.status !== 'available' && row.value !== null) ||
          (row.status === 'available' && row.value === null) ||
          typeof row.metricId !== 'string' || typeof row.period !== 'string' ||
          typeof row.unit !== 'string' || typeof row.sourceUrl !== 'string' ||
          !/^https:\/\//.test(row.sourceUrl)) return failure(503, 'LAYER_UNAVAILABLE');
      // Whitelist response metadata: internal identities/artifacts/claims cannot escape.
      observations.push({ metricId: row.metricId, period: row.period, unit: row.unit,
        value: row.value, status: row.status, sourceUrl: row.sourceUrl,
        qualityFlags: Array.isArray(row.qualityFlags) ? row.qualityFlags.filter(x=>typeof x==='string') : [],
        moe: Number.isFinite(row.moe) ? row.moe : null,
        rawMoeMarker: typeof row.rawMoeMarker === 'string' ? row.rawMoeMarker : null });
    }
    return { status: 200, body: { contractVersion: 'map-offline-review-1',
      state: !observations.length ? 'no_data' : observations.some(r=>r.status !== 'available') ? 'partial' : 'available', geographyId, layerId,
      releaseId: p.releaseId, generation: p.generation,
      boundaryVersion: p.boundaryVersion, observations } };
  };
}
