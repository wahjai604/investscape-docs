import test from 'node:test';
import assert from 'node:assert/strict';
import { createAccessBoundary } from './accessBoundary.mjs';
// Synthetic fixtures only. This is a policy test, not a real JWT/auth acceptance test.
const issuer='https://synthetic.invalid/auth/v1';
function setup() {
  const calls={verify:0,member:0,publication:0,read:0};
  const state={session:{issuer,audience:'authenticated',subject:'synthetic-member',expiresAt:200,
    role:'authenticated',isAnonymous:false,algorithm:'ES256'}, member:{active:true,revoked:false,
    capabilities:['map_read'],expiresAt:200,agreements:[]}, publication:{state:'published',
    releaseId:'release-1',generation:1,rights:{ui:true,export:false,ai:false},
    boundaryVersion:'boundary-2024',boundaryHash:'synthetic-hash'},
    observations:[{metricId:'population',period:'2020–2024',unit:'persons',value:0,
      status:'available',sourceUrl:'https://example.invalid/source',rawMoeMarker:'*****',
      qualityFlags:['preliminary'],internalActor:'never-return'}], clock:100};
  const deps={expectedIssuer:issuer,expectedAudience:'authenticated',now:()=>state.clock,
    verify:async()=>{calls.verify++;return {ok:true,session:state.session};},
    resolveEntitlement:async()=>{calls.member++;return structuredClone(state.member);},
    resolvePublication:async()=>{calls.publication++;return structuredClone(state.publication);},
    readRelease:async args=>{calls.read++;if(state.duringRead)state.duringRead();return {...args,
      observations:state.observations};}};
  const selection={authorization:'Bearer synthetic-token',geographyId:'US-STATE-04',layerId:'us-population'};
  return {state,calls,deps,selection,read:()=>createAccessBoundary(deps)(selection)};
}
test('valid member: zero, quality, raw MOE marker preserved; internal identity absent',async()=>{
 const f=setup();const r=await f.read();assert.equal(r.status,200);assert.equal(r.body.observations[0].value,0);
 assert.equal(r.body.observations[0].rawMoeMarker,'*****');assert.equal(r.body.observations[0].moe,null);
 assert.deepEqual(r.body.observations[0].qualityFlags,['preliminary']);assert(!JSON.stringify(r).includes('never-return'));
 assert(!JSON.stringify(r).includes('synthetic-member'));assert.equal(f.calls.member,2);
});
for(const [label,changes] of Object.entries({wrongIssuer:{issuer:'other'},wrongAudience:{audience:'other'},
 expired:{expiresAt:100},noExpiry:{expiresAt:undefined},anonymous:{isAnonymous:true},
 unknownAnonymous:{isAnonymous:undefined},devIdentity:{issuer:'dev'},hsAlgorithm:{algorithm:'HS256'},
 unsigned:{algorithm:'none'},noSubject:{subject:''}}))test(label+' denies before catalog',async()=>{
 const f=setup();Object.assign(f.state.session,changes);assert.equal((await f.read()).status,401);
 assert.equal(f.calls.member,0);assert.equal(f.calls.read,0);
});
test('missing token fails before verifier',async()=>{const f=setup();delete f.selection.authorization;
 assert.equal((await f.read()).status,401);assert.equal(f.calls.verify,0);});
test('verifier rejection has no fallback',async()=>{const f=setup();f.deps.verify=async()=>({ok:false});
 assert.equal((await f.read()).status,401);assert.equal(f.calls.read,0);});
test('missing config and dependency failures unavailable without exception detail',async()=>{
 for(const kind of ['config','verify','member','publication','read']){const f=setup();
  if(kind==='config')f.deps.expectedAudience='';else f.deps[{verify:'verify',member:'resolveEntitlement',
   publication:'resolvePublication',read:'readRelease'}[kind]]=async()=>{throw Error('private diagnostic');};
  const r=await f.read();assert.equal(r.status,503);assert(!JSON.stringify(r).includes('private diagnostic'));}
});
for(const [label,changes] of Object.entries({revoked:{revoked:true},inactive:{active:false},expired:{expiresAt:100},
 noCapability:{capabilities:[]},claimedMember:{capabilities:[],user_metadata:{map_read:true}}}))
 test('member '+label+' denied',async()=>{const f=setup();Object.assign(f.state.member,changes);
 assert.equal((await f.read()).status,403);assert.equal(f.calls.read,0);});
test('unpublished and restricted selections never reach catalog',async()=>{
 for(const mode of ['quarantine','withdrawn','restricted','export','ai']){const f=setup();
 if(['quarantine','withdrawn'].includes(mode))f.state.publication.state=mode;
 else if(mode==='restricted')f.state.publication.rights.ui=false;else f.selection.use=mode;
 assert.equal((await f.read()).status,503);assert.equal(f.calls.read,0);}
});
test('CMHC agreement checked before read and after read',async()=>{const f=setup();
 f.state.publication.requiredAgreement='cmhc-version';assert.equal((await f.read()).body.error.code,'TERMS_REQUIRED');
 assert.equal(f.calls.read,0);f.state.member.agreements=['cmhc-version'];assert.equal((await f.read()).status,200);
 f.state.duringRead=()=>{f.state.member.agreements=[]};assert.equal((await f.read()).body.error.code,'TERMS_REQUIRED');
});
test('previously successful selection reauthorizes after membership revocation',async()=>{const f=setup();
 assert.equal((await f.read()).status,200);const reads=f.calls.read;f.state.member.revoked=true;
 assert.equal((await f.read()).status,403);assert.equal(f.calls.read,reads);
});
test('old cursor refuses promotion and withdrawal, never silently changes revision',async()=>{
 const f=setup();f.selection.pinnedReleaseId='release-1';f.selection.pinnedGeneration=1;
 assert.equal((await f.read()).status,200);f.state.publication.releaseId='release-2';f.state.publication.generation=2;
 assert.equal((await f.read()).body.error.code,'RELEASE_CHANGED');f.state.publication.state='withdrawn';
 assert.equal((await f.read()).body.error.code,'LAYER_UNAVAILABLE');
});
for(const mode of ['revocation','withdrawal','promotion','expiry'])test(mode+' during read wins',async()=>{
 const f=setup();f.state.duringRead=()=>{if(mode==='revocation')f.state.member.revoked=true;
 else if(mode==='withdrawal')f.state.publication.state='withdrawn';
 else if(mode==='promotion')f.state.publication.generation++;else f.state.clock=201;};
 assert.notEqual((await f.read()).status,200);
});
test('boundary artifact mismatch refuses result',async()=>{const f=setup();f.deps.readRelease=async args=>
 ({...args,boundaryHash:'wrong',observations:f.state.observations});assert.equal((await f.read()).status,503);});
test('no observations differs from suppressed; no coercion',async()=>{const f=setup();f.state.observations=[];
 assert.equal((await f.read()).body.state,'no_data');f.state.observations=[{metricId:'rent',period:'2025',unit:'CAD/month',
 value:null,status:'suppressed',sourceUrl:'https://example.invalid/source'}];const r=await f.read();
 assert.equal(r.body.state,'partial');assert.equal(r.body.observations[0].value,null);assert.equal(r.body.observations[0].status,'suppressed');
 f.state.observations[0].value=0;assert.equal((await f.read()).status,503);
});
test('malformed selection denies and missing cursor partner rejected',async()=>{
 for(const change of [{geographyId:'unknown'},{layerId:'../escape'},{pinnedReleaseId:'release-1'},
 {pinnedGeneration:1},{use:'unknown'}]){const f=setup();Object.assign(f.selection,change);
 assert.equal((await f.read()).status,400);assert.equal(f.calls.read,0);}
});
