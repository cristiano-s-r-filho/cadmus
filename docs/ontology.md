# 🧬 Cadmus OS: Ontology & Business Logic

## 1. Class Taxonomy (Archetypes)
Documents are structured via Archetypes, defining their visual schema and reactive rules.

| Category | Classes | Tier | Key Feature |
| :--- | :--- | :--- | :--- |
| **Primitiva** | `note`, `task`, `project`, `container` | Community | Basic building blocks. |
| **Dados** | `folha` (Spreadsheet) | Community | Tabular data via FortuneSheet. |
| **Operacional** | `meeting`, `blueprint`, `inventory` | PRO | Specialized workflows. |
| **Recursos** | `contract`, `finance`, `ledger`, `asset` | PRO | Encrypted financial/legal logic. |

## 2. User Model & Tiers
User identity is bound to a `User` entity with `id`, `username`, and `avatar_url`.

- **Community Tier ($0):** Standard sync, 100 node limit, no PRO classes.
- **Operator Tier ($12/mo):** Unlimited nodes, Cloud Mirroring, PRO Archetypes, Synapse AI.
- **Sovereign Tier (Custom):** Dedicated infrastructure, full E2EE, advanced audit chains.

## 3. Monetization Strategy
- **Trial:** All new users start with 7 days of "Operator" tier.
- **Downgrade Path:** If the trial expires, the user is downgraded to "Community", but PRO nodes remain read-only.
- **Sovereign Credits:** Future implementation for per-request AI/Vector usage.
