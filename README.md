# Bchnomo

**The first on-chain binary options trading dApp on BCH Testnet.**  
Running on **BCH Testnet**.

Powered by **BCH Testnet** + **Pyth Hermes** price attestations + **Supabase** + instant house balance.

*Trade binary options with oracle-bound resolution and minimal trust.*
---

## Why Bchnomo?

Binary options trading in Web3 is rare. Real-time oracles and sub-second resolution have been the missing piece.

- **Pyth Hermes** delivers millisecond-grade prices for 300+ assets (crypto, stocks, metals, forex).
- **BCH Testnet** — low fees and fast finality for deposits and withdrawals.
- **House balance** — place unlimited bets without signing a transaction every time; only deposit/withdraw hit the chain.
- **5s, 10s, 15s, 30s, 1m** rounds with oracle-bound settlement.

Bchnomo brings binary options to BCH Testnet with transparent, on-chain settlement.

---

## Tech Stack

| Layer        | Technology |
|-------------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS, Zustand, Recharts |
| **Blockchain** | **BCH Testnet**, ethers.js, viem, Wagmi, ConnectKit, Privy |
| **Oracle** | Pyth Network Hermes (real-time prices) |
| **Backend** | Next.js API Routes, Supabase (PostgreSQL) |
| **Payments** | BCH native transfers on BCH Testnet, single treasury |

---

## Market Opportunity

| Metric | Value |
|--------|--------|
| **Binary options / prediction (TAM)** | $27.56B (2025) → ~$116B by 2034 (19.8% CAGR) |
| **Crypto prediction markets** | $45B+ annual volume (Polymarket, Kalshi, on-chain) |
| **Crypto derivatives volume** | $86T+ annually (2025) |
| **Crypto users** | 590M+ worldwide |

---

## Competitive Landscape

| Segment | Examples | Limitation vs Bchnomo |
|--------|----------|----------------------|
| **Web2 binary options** | IQ Option, Quotex | Opaque pricing, regulatory issues, no on-chain settlement; users do not custody funds. |
| **Crypto prediction markets** | Polymarket, Kalshi, Azuro | Event/outcome markets (e.g. "Will X happen?"), not sub-minute **price** binary options; resolution in hours or days. |
| **Crypto derivatives (CEX)** | Binance Futures, Bybit, OKX | Leveraged perps and positions; not short-duration binary options (5s–1m) with oracle-bound resolution. |
| **On-chain options / DeFi** | Dopex, Lyra, Premia | Standard options (calls/puts), complex UX; no simple "price up/down in 30s" binary product. |
| **BCH Testnet binary options** | — | No established on-chain binary options dApp; Bchnomo fills this gap. |

**Bchnomo's differentiation:** On-chain binary options on BCH Testnet with sub-second oracle resolution (Pyth Hermes), house balance for instant bets, and dual modes (Classic + Box) in one treasury.

---

## Future

Endless possibilities across:

- **Stocks, Forex** — Expand beyond crypto into traditional markets via oracles.
- **Options** — Standard options (calls/puts) on top of the same infrastructure.
- **Derivatives & Futures** — More products for advanced traders.
- **DEX** — Deeper DeFi integration and on-chain liquidity.

**Ultimate objective:** To become the go-to on-chain venue for short-duration, oracle-settled binary options on BCH and beyond.

---

## How It Works

```mermaid
flowchart LR
    subgraph User
        A[Connect Wallet] --> B[Deposit BCH]
        B --> C[Place Bets]
        C --> D[Win/Lose]
        D --> E[Withdraw]
    end
    subgraph Bchnomo
        F[MetaMask / ConnectKit / Privy]
        G[Pyth Hermes Prices]
        H[Supabase Balances]
        I[BCH Testnet Treasury]
    end
    A --> F
    B --> I
    C --> G
    C --> H
    D --> H
    E --> I
```

### Flow

1. **Connect** — Connect via MetaMask (ConnectKit/Wagmi) or Privy (social login). All operations use **BCH** on BCH Testnet.
2. **Deposit** — Send BCH from your wallet to the Bchnomo treasury. Your house balance is credited instantly.
3. **Place bet** — Choose **Classic** (up/down + expiry) or **Box** (tap tiles with multipliers). No on-chain tx per bet.
4. **Resolution** — Pyth Hermes provides the price at expiry; win/loss is applied to your house balance.
5. **Withdraw** — Request withdrawal; BCH is sent from the treasury to your wallet on BCH Testnet.

---

## System Architecture

```mermaid
graph TB
    subgraph Client
        UI["Next.js + React UI"]
        Store["Zustand Store"]
        Wallets["Wagmi / ConnectKit / Privy"]
    end

    subgraph Oracle
        Pyth["Pyth Hermes Price Feeds"]
    end

    subgraph BCHTestnet["BCH Testnet"]
        UserWallet["User Wallet MetaMask or Privy"]
        Treasury["Bchnomo Treasury BCH EOA"]
        BchRPC["BCH RPC / node"]
    end

    subgraph Backend
        API["Next.js API Routes"]
        DB["Supabase PostgreSQL"]
    end

    UI --> Store
    UI --> Wallets
    Wallets --> UserWallet
    UserWallet --> BchRPC
    BchRPC --> Treasury
    UI --> Pyth
    UI --> API
    API --> DB
    API --> Treasury
```

### Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant App as Bchnomo App
    participant P as Pyth Hermes
    participant API as API + Supabase
    participant BCH as BCH Testnet Treasury

    U->>App: Connect wallet MetaMask or Privy
    U->>App: Deposit BCH
    App->>BCH: Transfer BCH to treasury
    BCH-->>App: Tx confirmed
    App->>API: Credit house balance

    loop Betting
        P->>App: Live price stream
        U->>App: Place bet Classic or Box
        App->>API: Record bet in Supabase
        Note over App,API: No on-chain tx per bet, house balance only
        P->>App: Price at expiry
        App->>API: Settle win or loss, update house balance
    end

    U->>App: Request withdrawal
    App->>API: Debit balance, create payout
    API->>BCH: Sign and send BCH from treasury to user
    BCH-->>U: BCH received in wallet
```

### Game Modes

```mermaid
flowchart TD
    Start[Select Mode] --> Classic[Classic Mode]
    Start --> Box[Box Mode]

    Classic --> C1[Choose UP or DOWN]
    C1 --> C2[Pick expiry 5s to 1m]
    C2 --> C3[Enter stake in BCH]
    C3 --> C4[Price at expiry vs entry - Oracle settlement]

    Box --> B1[Tap a tile on the chart]
    B1 --> B2[Each tile is multiplier up to 10x]
    B2 --> B3[Price touches tile before expiry equals WIN]
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn (or npm)
- An BCH Testnet wallet (e.g. MetaMask) and some BCH on BCH Testnet (e.g. from a faucet)
- Supabase project

### 1. Clone and install

```bash
git clone https://github.com/AmaanSayyad/Bchnomo.git
cd Bchnomo
yarn install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Edit `.env` with:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID ([cloud.walletconnect.com](https://cloud.walletconnect.com)) |
| `NEXT_PUBLIC_PRIVY_APP_ID` | Privy app ID (optional, for social login) |
| `PRIVY_APP_SECRET` | Privy app secret (backend only; keep secret) |
| `NEXT_PUBLIC_APP_NAME` | App name shown in the UI (default: `Bchnomo`) |
| `NEXT_PUBLIC_ROUND_DURATION` | Default round duration in seconds (e.g. `30`) |
| `NEXT_PUBLIC_PRICE_UPDATE_INTERVAL` | Price refresh interval in ms (e.g. `1000`) |
| `NEXT_PUBLIC_CHART_TIME_WINDOW` | Chart time window in ms (e.g. `300000`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_BCH_NETWORK` | BCH network (e.g. `chipnet` for testnet) |
| `NEXT_PUBLIC_BCH_TREASURY_ADDRESS` | BCH treasury address for deposits/withdrawals (e.g. `bchtest:...`) |
| `BCH_TREASURY_SECRET_KEY` | BCH treasury WIF private key (withdrawals; backend only; keep secret) |

### 3. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run the SQL migrations in `supabase/migrations/` in the Supabase SQL Editor.

### 4. Run the app

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000); the app redirects to `/trade`.

---

## BCH Testnet

Bchnomo is built for **BCH Testnet**:

- **BCH only** — Deposits and withdrawals are native BCH transfers. House balance is tracked in BCH.
- **Treasury** — An EOA on BCH Testnet; no custom contract required for core flow.
- **Wallets** — Connect via ConnectKit (MetaMask, Rabby, etc.) or Privy.
