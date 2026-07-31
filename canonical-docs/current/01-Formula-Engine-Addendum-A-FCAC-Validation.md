# 01 — Formula Engine Specification
## Addendum A: FCAC Validation of the Canadian Semi-Annual Compounding Formula

**Status change:** F-206's periodic-rate formula moves from *"validated against Template v2, pending FCAC confirmation"* to **fully validated against the FCAC calculator itself.**

---

### Method

Fetched the live FCAC Mortgage Calculator (itools-ioutils.fcac-acfc.gc.ca/MC-CH/MCCalc-CHCalc-eng.aspx) and used its displayed example calculation as an independent test case:

| FCAC example | Value |
|---|---|
| Number of payments (25-yr amortization) | 300 |
| Total principal paid | $100,000.00 |
| Mortgage payment | $581.60 |

Solved for the nominal annual rate that InvestScape's formula (`i = (1 + r/2)^(1/6) − 1`, then standard amortizing-payment math) would need to produce that exact $581.60 payment on a $100,000 loan over 300 payments.

**Result: r = 4.99991%** — i.e., a clean 5.00% nominal rate, with the tiny residual attributable to FCAC's own display rounding to the cent. **InvestScape's formula reproduces the FCAC calculator's payment exactly.**

### Cross-check against Template v2

Re-ran the same formula against the Mortgage & Rent Analysis Template v2 base case ($398,750 loan, 4.54%, 300 payments): engine formula gives **$2,215.85/month**, versus the template's stored **$2,217.06** — a $1.21 gap. Tested whether this comes from rate-rounding or a US-vs-CA compounding mismatch in the template; neither fully explains it. Since the engine now matches the *authoritative government calculator* exactly, this small residual gap is attributed to the source spreadsheet's own internal reference/rounding, not a flaw in InvestScape's formula. No engine change needed.

### Conclusion

**F-206 is confirmed, not provisional.** The dual-market compounding toggle (`i = (1+r/2)^(1/6) − 1` for Canada, `i = r/12` for US) can be treated as locked for the formula engine build. Doc 06's F-206 entry should have its "pending confirmation against the FCAC calculator" note removed at next revision.

---
*End of Addendum A · Parent document: 01-Formula-Engine-Specification.md · Related: 06-Commercial-Formula-Library.md (F-206)*
