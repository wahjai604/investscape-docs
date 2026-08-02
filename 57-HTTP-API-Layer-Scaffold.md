# InvestScape Calc Engine — HTTP API Layer (Doc 57)

**Purpose:** Expose the TypeScript calc engines as REST endpoints so Bubble (Route 1) and WeWeb components (Route 2) can call them without embedding the code.

**Architecture:**
```
┌─────────────────────────────────────────────────────────┐
│  Calc Engines (investscape-calc-engine)                 │
│  - mortgage.ts, cmhc.ts, qualifying.ts, dscr.ts, etc.   │
│  - 35 passing tests, all hand-verified                  │
└──────────────────────┬──────────────────────────────────┘
                       │ (npm import)
┌──────────────────────▼──────────────────────────────────┐
│  HTTP API (Express + TypeScript)                        │
│  - POST /calculate/mortgage                             │
│  - POST /calculate/qualify                              │
│  - POST /calculate/dscr                                 │
│  - POST /calculate/exit                                 │
│  - POST /calculate/portfolio                            │
│  - etc.                                                 │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼─────────┐         ┌────────▼──────────┐
│  Route 1 (Bubble)          │  Route 2 (WeWeb)   │
│  HTML embed calls API      │  Vue component     │
│  via fetch/XMLHttpRequest  │  calls API         │
└────────────────┘         └────────────────────┘
```

---

## Phase 1: API Scaffold (this session)

Create a new Express server that:

1. **Imports** the calc engines from investscape-calc-engine
2. **Exposes** each engine as a POST endpoint
3. **Validates** inputs with Zod (per Doc 54's non-deferrable list)
4. **Returns** JSON responses
5. **Runs locally** on `localhost:3001` for initial testing

Structure:
```
investscape-api/
├── src/
│   ├── index.ts                 (Express server entry)
│   ├── routes/
│   │   ├── mortgage.ts          (POST /calculate/mortgage)
│   │   ├── qualifying.ts        (POST /calculate/qualify)
│   │   ├── dscr.ts             (POST /calculate/dscr)
│   │   ├── cashflow.ts         (POST /calculate/cashflow)
│   │   ├── exit.ts             (POST /calculate/exit)
│   │   ├── portfolio.ts        (POST /calculate/portfolio)
│   │   └── index.ts            (route aggregation)
│   └── validation/
│       └── schemas.ts           (Zod input/output schemas)
├── package.json
├── tsconfig.json
└── README.md
```

---

## Phase 2: Wiring & Testing (next session)

Once the API scaffold is live:

1. **Bubble HTML embed** makes a fetch call to `localhost:3001/calculate/mortgage`
2. **Renders the chart** using the returned JSON
3. **WeWeb Vue component** makes the same fetch call
4. **Renders the same chart** using the returned JSON

Both get the same numbers from the same source → the architecture is proven.

---

## Immediate Next Step

Claude Code should:

1. **Create a new folder** `C:\Users\Eric\investscape-api`
2. **Initialize** a new Node/TypeScript project with Express, Zod, and ts-node-dev
3. **Scaffold** the file structure above
4. **Implement** one endpoint (e.g., `/calculate/mortgage`) as a proof of concept
5. **Test it locally** by making a fetch call from the command line

Once that's working, we add the remaining endpoints, then wire Route 1 and Route 2 to call it.

---

## Instruction for Claude Code

Paste this into Claude Code:

```
Create a new HTTP API for the investscape-calc-engine. Set up a new folder at C:\Users\Eric\investscape-api with Express, TypeScript, and Zod. Initialize package.json, tsconfig.json, and create src/index.ts with an Express server listening on port 3001. Create src/routes/mortgage.ts that exports a POST /calculate/mortgage endpoint. The endpoint should accept a JSON body with {purchasePrice, downPaymentPercent, contractRate, amortizationYears}, validate it with Zod, call calculateMonthlyMortgagePayment from investscape-calc-engine, and return {monthlyPayment, qualifyingRate, status}. Create src/validation/schemas.ts with Zod input/output schemas for mortgage calculation. Wire the route into index.ts. Create a .gitignore and README.md. Install dependencies, build, and run the server. Test the /calculate/mortgage endpoint by making a curl or fetch request with sample data and confirm the response.
```

---

*End of Doc 57 · HTTP API scaffold plan, ready for build · Next: Express API implementation + wiring to Route 1 & Route 2*
