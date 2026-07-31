# InvestScape — Notification System Design (Supabase/WeWeb) — Doc 11

**Supersedes `11-Notification-System-Design.md`.** Strictly additive to Doc 02. Same purpose as before: generalizes what would otherwise be Doc 10 §3.4's standalone `ImportBatch` ribbon badge into one unified notification system, rather than running two separate badge mechanisms side by side.

**What changed, in one line:** the notification and archive mechanics are a straightforward re-derivation — plain CRUD with no Bubble-specific behavior to lose. The delete mechanics are not a straightforward re-derivation, and this document says so plainly in Part B rather than translating the old manual cascade steps as if they still applied. Per Doc 53 §1, Postgres's `ON DELETE CASCADE` (already built into every foreign key in Doc 02, Doc 02 Addendum A, and Doc 02 Addendum B) makes the entire old manual-cleanup section **obsolete** — genuinely obsolete, not just relocated — but that upgrade quietly removes a safety habit the old tedium provided for free, and this document's job is to replace that habit deliberately rather than let it disappear.

---

## Part A — spec-ready now

### 1. New enum: `notification_type`

```sql
CREATE TYPE notification_type AS ENUM ('Pending Draft', 'Item Archived', 'Item Deleted', 'System');
```

Same four types as before, same reasoning: `Pending Draft` fires on an unconfirmed `import_batches` row (Doc 10 §3.4 — this type just folds that logic in); `Item Archived` and `Item Deleted` are user-initiated and reversible/irreversible respectively (see Part B); `System` is reserved for future use (formula-engine updates, tier changes). Community/Research post types remain deliberately excluded — see Part C.

### 2. New table: `notifications` (belongs to a user)

```sql
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title text NOT NULL,                    -- e.g. "Draw Report #4 awaiting review"
  body text,                              -- one-line detail
  deep_link_page text,                    -- WeWeb page name to navigate to on click (e.g. "import-review")
  deep_link_param text,                   -- the record's unique ID, appended to the link
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
```

Field-for-field identical to the Bubble version. `ON DELETE CASCADE` on `user_id` is new relative to the original — a deleted user's notifications now clean up automatically, which the Bubble version would have needed its own manual step to handle and likely never got around to specifying.

### 3. New column on `profiles`: `notification_opt_outs`

```sql
ALTER TABLE profiles ADD COLUMN notification_opt_outs notification_type[] NOT NULL DEFAULT '{}';
```

Same behavior as before: empty array means everything on by default; a type present in this array means the user turned it off, checked before any `notifications` row is created for them. Postgres's native array type is a direct fit for what was a "list of NotificationType" field in Bubble — no schema compromise either direction.

### 4. Bell icon behavior (ribbon, top-right, next to avatar) — unchanged UX, Supabase-native query

- **Badge count:**
  ```sql
  SELECT COUNT(*) FROM notifications WHERE user_id = auth.uid() AND is_read = false;
  ```
  Zero → badge doesn't render (same "ambient, not interruptive" rule as Doc 10's original badge).
- Click opens a dropdown panel bound to a WeWeb collection query: most recent 10 `notifications` rows for the current user, unread ones visually distinct (small gold dot). Clicking a row navigates to `deep_link_page` with `deep_link_param`, and sets `is_read = true` via a simple `UPDATE`.
- "Mark all as read" link at the panel's bottom — a single `UPDATE notifications SET is_read = true WHERE user_id = auth.uid() AND is_read = false`, one query rather than a Bubble bulk-workflow action.
- This still replaces Doc 10 §3.4's standalone import badge — same underlying `import_batches` query, now just one of several `notifications` sources feeding one bell instead of its own separate UI element.

### 5. Settings → Notifications page — unchanged design

- One row per `notification_type`, each with a checkbox ("Notify me") and a one-line plain-English description.
- "Save" writes the unchecked types into `profiles.notification_opt_outs`.
- Row example: *"☑ Pending drafts — when an import or entry is left unconfirmed"*

### 6. Where `notifications` rows get created

Same trigger points as before, called from the calc-engine or from WeWeb workflows at the moment each event already happens — no new triggers needed, just an extra insert at the point of action:
- `import_batches` row created with status = Pending Review → insert a `notifications` row (type: Pending Draft), **only if** `notification_opt_outs` doesn't contain `Pending Draft`
- (Item Archived and System — see Part B before wiring these)

---

## Part B — archive-default, with confirmed hard delete (Postgres-native, with one added discipline point)

**Decision, unchanged from the original:** Archive stays the default, low-stakes action everywhere. Hard delete remains a real, separate, deliberately-harder-to-reach action, gated behind a type-to-confirm modal — the same GitHub-repo-deletion pattern most users already recognize instinctively.

### Schema additions

**New column on `properties`, `deals`, `dev_projects`:** `archived_at timestamptz` (null = active). Same purpose as the original's `ArchivedDate` — distinct from the Pro→Free downgrade's automatic read-only lock, which is a separate mechanism entirely (tier-driven, not this column). Archiving hides a record from default list views; a "Show archived" toggle reveals it, fully intact and reversible by clearing this column.

```sql
ALTER TABLE properties ADD COLUMN archived_at timestamptz;
ALTER TABLE deals ADD COLUMN archived_at timestamptz;
ALTER TABLE dev_projects ADD COLUMN archived_at timestamptz;
```

**New table: `deletion_log`** (standalone, no foreign key to the deleted record — the whole point is it survives after that record is gone)

```sql
CREATE TABLE deletion_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,                  -- deliberately NOT a foreign key with CASCADE — see note below
  record_type text NOT NULL,              -- e.g. "properties", "dev_projects"
  record_summary text NOT NULL,           -- a short human-readable receipt captured BEFORE deletion —
                                           -- e.g. "142 Maple Grove Ave." or "796 Main Street" — not the
                                           -- full data, just enough for support/audit to know what existed
  deleted_at timestamptz NOT NULL DEFAULT now(),
  reason text                             -- optional, user-entered
);

ALTER TABLE deletion_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_deletion_log_read" ON deletion_log FOR SELECT USING (auth.uid() = user_id);
-- No client INSERT/UPDATE/DELETE policy at all — only the RPC function below (§ "Cascade delete")
-- writes this table, and nothing ever updates or deletes a row in it once written.
```

**Why `user_id` here is a plain column, not a `REFERENCES auth.users(id) ON DELETE CASCADE` foreign key, unlike almost everything else in this schema:** if a user's account itself is later deleted, their deletion history is exactly the kind of record that should survive that event rather than cascade away with it — the same "this is a receipt, not a piece of the user's data" reasoning the original document applied to why `DeletionLog` isn't linked to the deleted record. Applying the same reasoning one level up, it shouldn't be linked to the user's account either, in the one direction that would erase it. This is a genuine design refinement Postgres's cascade behavior surfaces that the original Bubble version never had reason to consider, since Bubble had no automatic cascade to accidentally sweep this table into.

This remains a receipt, not a recovery mechanism — it confirms *that* something existed and was deleted, not *what* was in it. That distinction still has to stay true in the confirmation copy below.

### UX flow — unchanged from the original, one step re-sequenced for safety (see discipline point below)

1. **Hard delete is only reachable from the Archived view**, not the main active list — reinforces archive-first, and a record has to already be archived before it can be permanently deleted. One extra step, deliberately, unchanged.
2. Clicking "Delete Permanently" opens a modal:
   > **This can't be undone.**
   > Deleting **[record name]** permanently removes it and everything under it — no backup, no recovery. Anything you've already shared to Community as a snapshot is unaffected; those are frozen copies and stay exactly as they are.
   > Type **DELETE** to confirm.
   > `[input field]` → **Delete Permanently** (disabled until the input exactly matches "DELETE")
3. On confirm, WeWeb calls a single Postgres function via RPC — **not** three separate client-side steps:

```sql
CREATE OR REPLACE FUNCTION delete_property_permanently(p_property_id uuid, p_reason text DEFAULT NULL)
RETURNS void AS $$
DECLARE
  v_address text;
BEGIN
  -- Must be the owner
  SELECT address INTO v_address FROM properties WHERE id = p_property_id AND user_id = auth.uid();
  IF v_address IS NULL THEN
    RAISE EXCEPTION 'Property not found or not owned by current user';
  END IF;

  -- Write the receipt FIRST, before anything is gone
  INSERT INTO deletion_log (user_id, record_type, record_summary, reason)
  VALUES (auth.uid(), 'properties', v_address, p_reason);

  -- Then perform the actual delete — ON DELETE CASCADE (Doc 02) handles every
  -- child row (deals, deal_inputs, deal_metrics, portfolio_snapshots) automatically
  DELETE FROM properties WHERE id = p_property_id;

  -- Notification (Item Deleted) is the user's own receipt, inserted after
  INSERT INTO notifications (user_id, type, title, body)
  VALUES (auth.uid(), 'Item Deleted', 'Property deleted', v_address || ' was permanently deleted.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Equivalent functions (`delete_deal_permanently`, `delete_dev_project_permanently`) follow the same three-step shape: capture the summary, write the `deletion_log` row, then delete — same ordering the original document specified, now enforced inside one atomic function rather than three sequential Bubble workflow steps that could, in principle, be interrupted between steps.

**The "shared snapshots are unaffected" line is still deliberate, not filler** — `deals` shared to Community as a frozen JSON snapshot are still specced (Doc 02's schema decisions) as disconnected from live deal data, so a hard delete genuinely can't touch a posted snapshot. Confirming that explicitly in the modal still answers a question the user would otherwise have to guess at.

### Cascade delete — what actually goes with it, and the discipline point this upgrade creates

**This is the one place this document most needs to say something the Bubble version couldn't have said, because the underlying fact changed, not just the platform.** The original document opened this section with: *"Bubble doesn't cascade deletes automatically; each parent type needs its own cleanup step in the delete workflow before the parent record itself is deleted"* — and then listed, by hand, every child type that needed its own manual cleanup step: Property → Deal(s) → DealInputs/DealMetrics → PortfolioSnapshot; Deal → DealInputs/DealMetrics; DevProject → Parcel/TenureComponent/UnitSale/BudgetLine/LoanFacility(→DrawMonth)/WaterfallSpec(→WaterfallDeduction/WaterfallTier)/Scenario.

**Every one of those relationships already carries `ON DELETE CASCADE` in Doc 02, Doc 02 Addendum A, and Doc 02 Addendum B** — verified directly against all three schema documents, not assumed. Deleting a `properties` row genuinely, automatically erases every `deals`, `deal_inputs`, `deal_metrics`, and `portfolio_snapshots` row beneath it. Deleting a `dev_projects` row automatically erases every `parcels`, `tenure_components`, `unit_sales`, `budget_lines`, `loan_facilities` (and their `draw_months`), `waterfall_specs` (and its `waterfall_deductions`/`waterfall_tiers`), and `scenarios` row beneath it. **The entire manual cleanup list from the original document is obsolete.** This is a genuine upgrade — good news, not a gap to fill.

**But per Doc 53 §1, that upgrade has a real cost the original document's own tedium happened to prevent for free.** The old UX flow depends on a specific *order*: capture the `deletion_log` receipt, *then* delete. A database-level cascade doesn't know about that ordering — it fires the instant anything calls `DELETE FROM properties WHERE ...`, with no awareness of whether a receipt was written first, whether a confirmation modal was ever shown, or whether the caller was the "type DELETE to confirm" flow at all. Bubble's manual step-by-step deletion workflow was tedious specifically in the way that made it hard to accidentally skip a step. Postgres's cascade removes that tedium and, with it, that accidental protection.

**The discipline this creates, stated as a hard rule rather than a suggestion:** the delete action must never be exposed as a raw table delete anywhere in WeWeb, ever — not as a quick "delete row" button on an admin view, not as a convenience shortcut during testing, not anywhere. The RPC function above (`delete_property_permanently` and its siblings) is the **only** path to actual erasure. Enforce this at the RLS layer too, not just by convention: the client role should have no `DELETE` grant on `properties`, `deals`, or `dev_projects` at all — only `SELECT`, `INSERT`, and `UPDATE` policies, so that even a WeWeb workflow built by mistake to call a raw delete would fail outright rather than silently cascading everything with no receipt written and no confirmation honored.

```sql
-- No DELETE policy for the authenticated client role on any of these three tables.
-- The only way rows are ever removed is through the SECURITY DEFINER functions above,
-- which run with elevated privilege specifically so the client role itself never needs
-- direct DELETE access to exercise it.
```

### One thing worth raising with the privacy lawyer specifically — unchanged, still open

Now that this performs genuine, irreversible erasure (not just archiving), it's worth naming explicitly on the legal-consultation list: does this satisfy or interact with PIPEDA right-to-erasure obligations, and does `deletion_log`'s retained summary (record type + name, not full data) create any retention concern of its own? Same small, specific, cheap-to-ask question as before — this is a platform-independent legal question, not something the Supabase rewrite answers or changes.

### One copy fix this creates elsewhere — unchanged, still pending

The empty-state screens (`investscape-v2-unified-addendum.html`) currently say *"Your data is never deleted."* That's still not accurate once this ships, regardless of platform. Suggested replacement, unchanged: *"Your data is archived, not lost — and if you ever want something permanently gone, that's your call too."*

---

## Part C — still open, unchanged by the platform switch

### Item 1 — "Sitting in draft, not saved" beyond `import_batches`

Right now, `import_batches` is the *only* place a genuine draft state exists in the schema. The Property Intake Wizard (Doc 03 Stage 6) doesn't create any row until final submit — so if someone abandons it partway through, there's currently nothing to notify about, because nothing was saved at all. Two paths, unchanged from the original:
- **A — Leave it as-is.** Notification coverage for "unsaved drafts" stays scoped to `import_batches` only (already spec'd in Part A). Cheapest, no change to Stage 6.
- **B — Make the wizard save-as-you-go.** Insert the `properties`/`deal_inputs` rows after Step 1 instead of waiting for Step 4, so an abandoned wizard becomes a real draft record a notification can point to. More useful, but it's a change to Doc 03 Stage 6's already-specced flow, not a new addition — and worth noting the platform switch makes option B marginally cheaper than it would have been in Bubble, since a partial-row insert is a plain `INSERT` rather than a Bubble "create a thing early and hope nothing downstream assumes it's complete" pattern.

### Item 3 — Community/Research new-post notifications

Still can't be wired until Community and Research exist as real modules (currently Phase 2, "do not build now"). The `notification_type` enum can be extended later (`ALTER TYPE notification_type ADD VALUE 'New Community Post'`, and similarly for Research) — no action needed now, just noting it's correctly blocked rather than forgotten, same as the original.

---
*End of Doc 11 (Supabase/WeWeb revision) · Supersedes: 11-Notification-System-Design.md · Depends on: 02-Database-Schema-Supabase.md, 02-Database-Schema-Addendum-A-DevStudio-Supabase.md, 02-Database-Schema-Addendum-B-PortfolioSnapshot-Supabase.md (all three confirmed to already carry every `ON DELETE CASCADE` this document's cascade section depends on) · Confirmed against: 53-WeWeb-Supabase-Integration-Audit.md §1 (cascade-delete upgrade and the RPC-routing discipline point) · Needs input before finishing: Part C items 1 and 3, unchanged from the original*
