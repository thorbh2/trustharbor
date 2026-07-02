# TrustHarbor

TrustHarbor is a GenLayer escrow and milestone verification protocol for service deals, delivery evidence, dispute resolution, appeals and reputation.

Clients and providers create deals, submit milestone proof, ask GenLayer to review delivery evidence and move disputes or appeals through a recorded decision path.

## Live System

| Surface | Link |
| --- | --- |
| App | https://trustharbor.vercel.app |
| GitHub | https://github.com/thorbh2/trustharbor |
| Contract | https://explorer-studio.genlayer.com/contracts/0x9E0Ab8752aEe5DFE4F361f576c99180785392fC9 |
| Network | GenLayer Studionet |

## What Ships

- Product frontend with wallet-gated write actions and public read views.
- GenLayer contract source in `contracts/TrustHarbor.py`.
- Deployment metadata in `deployment.json`.
- Frontend contract client in `lib/trustharbor.ts`.
- Public contract address pinned as a fallback and documented in `.env.local.example`.

## Contract Model

This is not a one-call demo contract. The on-chain package keeps lifecycle state, evidence records, review outputs, challenge and appeal records, indexed read methods and audit-friendly public views.

Verification record: 12 smoke writes finalized, 15 read methods available.

## Run Locally

```powershell
npm install
npm run dev
```

Open the URL printed by Next.js. The public contract address is already present as a fallback; local env files are optional for normal read-only review.

## Public Environment

```text
NEXT_PUBLIC_CONTRACT_ADDRESS=0x9E0Ab8752aEe5DFE4F361f576c99180785392fC9
NEXT_PUBLIC_GENLAYER_RPC=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_EXPLORER=https://explorer-studio.genlayer.com
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
```

## Deploy

```powershell
npx --yes vercel@latest --prod --yes
```

## Security

- No private keys, vault files, local dashboard data or decrypted wallet material belong in this repository.
- The frontend receives only public `NEXT_PUBLIC_*` values.
- Write actions require a connected wallet confirmation.
- `.env.local`, `.vercel/`, build output and local state are ignored.
