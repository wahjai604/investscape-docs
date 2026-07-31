# InvestScape — Notification System (Design Addendum)

**Strictly additive.** Generalizes Doc 10 §3.4's `ImportBatch` ribbon badge into one unified system, rather than running two separate badge mechanisms side by side.

---

## Part A — spec-ready now

### 1. New option set: `NotificationType`
| Option | Fires on |
|---|---|
| Pending Draft | Unconfirmed `ImportBatch` (already exists per Doc 10 §3.4 — this type just folds that logic in) |
| Item Archived | An item is archived (user-initiated, reversible) |
| Item Deleted | An item is permanently deleted (user-initiated, irreversible — see Part B) |
| System | Anything not yet categorized — reserved for future use, e.g. formula-engine updates, tier changes |

*(Community/Research post types deliberately excluded here — see Part B.)*

### 2. New data type: `Notification` (belongs to User)
| Field | Type | Default | Notes |
|---|---|---|---|
| User | User | (link) | recipient |
| Type | NotificationType | — | |
| Title | text | — | e.g. "Draw Report #4 awaiting review" |
| Body | text | — | one-line detail |
| DeepLinkPage | text | — | Bubble page name to navigate to on click (e.g. `import-review`) |
| DeepLinkParam | text | — | the record's unique ID, appended to the link |
| IsRead | yes/no | no | |
| CreatedDate | date | (auto) | |

### 3. New field on `User`: `NotificationOptOuts`
- Type: list of `NotificationType`
- Default: empty (everything on by default)
- A type present in this list means the user has turned it off — checked before any `Notification` row is created for them.

### 4. Bell icon behavior (ribbon, top-right, next to avatar)
- Badge count: `Search Notification where User = Current User and IsRead = no, :count`. Zero → badge doesn't render (same "ambient, not interruptive" rule as Doc 10's original badge).
- Click opens a dropdown panel: most recent 10 `Notification`s, unread ones visually distinct (small gold dot). Clicking a row navigates to `DeepLinkPage` with `DeepLinkParam`, and sets `IsRead = yes`.
- "Mark all as read" link at the panel's bottom.
- This replaces Doc 10 §3.4's standalone import badge — same underlying `ImportBatch` search, now just one of several `Notification` sources feeding one bell instead of its own separate UI element.

### 5. Settings → Notifications page (new — none of your mockups have a Settings frame yet, per Doc 10 §6)
- One row per `NotificationType`, each with a checkbox ("Notify me") and a one-line plain-English description.
- "Save" writes the unchecked types into `User.NotificationOptOuts`.
- Row example: *"☑ Pending drafts — when an import or entry is left unconfirmed"*

### 6. Where `Notification` rows get created
Backend workflow addition at the point each event already happens — no new triggers needed, just an extra "Create a Notification" step:
- `ImportBatch` created with Status = Pending Review → create Notification (Type: Pending Draft), **only if** `NotificationOptOuts` doesn't contain Pending Draft
- (Item Archived and System — see Part B before wiring these)

---

## Part B — needs your decision before I spec it further

## Part B (resolved) — Archive-default, with confirmed hard delete

**Decision: hybrid.** Archive stays the default, low-stakes action everywhere. Hard delete becomes a real, separate, deliberately-harder-to-reach action, gated behind a type-to-confirm modal — the same pattern GitHub uses for repo deletion, which most of your users will already recognize instinctively.

### Schema additions

**New field on `Property`, `Deal`, `DevProject`:** `ArchivedDate` (date, null = active). This is the user-initiated archive — distinct from the Pro→Free downgrade's automatic read-only lock, which stays exactly as already specced (tier-driven, not this field). Archiving hides a record from default list views; a "Show archived" toggle reveals it, fully intact and reversible with an "Unarchive" action.

**New data type: `DeletionLog`** (standalone, not linked to the deleted record — the whole point is it survives after that record is gone)
| Field | Type | Notes |
|---|---|---|
| User | User | who deleted it |
| RecordType | text | e.g. "Property", "DevProject" |
| RecordSummary | text | a short human-readable receipt captured *before* deletion — e.g. "142 Maple Grove Ave." or "796 Main Street" — not the full data, just enough for support/audit to know what existed |
| DeletedDate | date | (auto) |
| Reason | text | optional, user-entered |

This is a receipt, not a recovery mechanism — it confirms *that* something existed and was deleted, not *what* was in it. That distinction matters for the confirmation copy below: it has to stay true.

### UX flow

1. **Hard delete is only reachable from the Archived view**, not the main active list — reinforces archive-first, and a record has to already be archived before it can be permanently deleted. One extra step, deliberately.
2. Clicking "Delete Permanently" opens a modal:
   > **This can't be undone.**
   > Deleting **[record name]** permanently removes it and everything under it — no backup, no recovery. Anything you've already shared to Community as a snapshot is unaffected; those are frozen copies and stay exactly as they are.
   > Type **DELETE** to confirm.
   > `[input field]` → **Delete Permanently** (disabled until the input exactly matches "DELETE")
3. On confirm: create the `DeletionLog` row first (capturing the summary before anything is gone), then run the cascade-delete workflow (below), then create a `Notification` (Type: Item Deleted) as the user's own receipt.

**The "shared snapshots are unaffected" line is deliberate, not filler** — `DealSnapshot` in Community is already specced as a frozen JSON copy, never linked to live deal data (Doc 02's schema decisions), so a hard delete genuinely can't touch it. Confirming that explicitly in the modal answers a question the user would otherwise have to guess at.

### Cascade delete — what actually goes with it

Bubble doesn't cascade deletes automatically; each parent type needs its own cleanup step in the delete workflow before the parent record itself is deleted:
- **Property** → its `Deal`(s) → each Deal's `DealInputs`, `DealMetrics` → all `PortfolioSnapshot` rows for that Property
- **Deal** (deleted independently of its Property) → `DealInputs`, `DealMetrics`
- **DevProject** → `Parcel`, `TenureComponent`, `UnitSale`, `BudgetLine`, `LoanFacility` (→ its `DrawMonth`s), `WaterfallSpec` (→ `WaterfallDeduction`, `WaterfallTier`), `Scenario`

**Not cascaded, by design:** any `DealSnapshot` already posted to Community — confirmed above, this is the correct, expected behavior, not a gap.

### One thing worth raising with the privacy lawyer specifically
Now that this performs genuine, irreversible erasure (not just archiving), it's worth naming explicitly on your legal-consultation list: does this satisfy or interact with PIPEDA right-to-erasure obligations, and does `DeletionLog`'s retained summary (record type + name, not full data) create any retention concern of its own? Small, specific question — cheap to ask, worth having an answer before launch rather than after a user asks you to prove something was really deleted.

### One copy fix this creates elsewhere
The empty-state screens (`investscape-v2-unified-addendum.html`) currently say *"Your data is never deleted."* That's no longer accurate once this ships. Suggested replacement: *"Your data is archived, not lost — and if you ever want something permanently gone, that's your call too."* Small fix, but worth catching before it's live copy contradicting a real feature.

---

## Part C — still open

### Item 1 — "Sitting in draft, not saved" beyond ImportBatch
Right now, `ImportBatch` is the *only* place a genuine draft state exists in your schema. The Property Intake Wizard (Doc 03 Stage 6) doesn't create any record until final submit — so if someone abandons it on step 3, there's currently nothing to notify about, because nothing was saved at all. Two paths:
- **A — Leave it as-is.** Notification coverage for "unsaved drafts" stays scoped to `ImportBatch` only (already spec'd in Part A). Cheapest, no change to Stage 6.
- **B — Make the wizard save-as-you-go.** Create the `Property`/`DealInputs` row after Step 1 instead of waiting for Step 4, so an abandoned wizard becomes a real draft record a notification can point to. More useful, but it's a change to an already-built Stage 6 flow, not a new addition.

### Item 3 — Community/Research new-post notifications
Can't be wired until Community and Research exist as real modules (currently Phase 2, "do not build now"). Worth keeping this addendum's `NotificationType` option set open to add `New Community Post` / `New Research Article` later — no action needed now, just noting it's correctly blocked rather than forgotten.

---
*End of addendum · Depends on: 10-Import-Export-Storage-Architecture.md §3.4 (generalizes this) · Needs your input before finishing: Part C items 1 and 3*
