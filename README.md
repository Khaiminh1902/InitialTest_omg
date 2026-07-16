# Blockchain Web3 Full Stack Assessment

## Overview

This project is a production-minded refinement of a simplified blockchain demo for a Web3 Full Stack Engineer assessment. It keeps the original architecture and API surface intact while improving reliability, usability, error handling, and documentation.

The repository includes:

- An Express API for wallets, balances, transactions, mining, chain inspection, and stats
- A React dashboard for interacting with the blockchain
- A simplified blockchain domain model with persistence
- A Solidity example contract in `contracts/AssessmentToken.sol`

## Architecture

The backend keeps the existing layered design:

```text
Routes
  ↓
Controllers
  ↓
Services
  ↓
Models
```

The frontend keeps business logic out of components by using API helpers, hooks, and utility functions.

## Folder Structure

```text
.
├── config/         # Environment and runtime configuration
├── controllers/    # Request handlers
├── contracts/      # Solidity assessment artifact
├── middleware/     # Express middleware
├── models/         # Blockchain, Block, Transaction domain models
├── routes/         # API route definitions
├── services/       # Persistence and supporting services
├── src/            # React application
├── tests/          # Backend regression tests
├── server.js       # Express entrypoint
└── README.md
```

## Features

- Fixed local development port separation
- Production-only static asset serving
- Consistent API response structure
- Improved persistence restore behavior
- Wallet generation with copy actions and balance refresh
- Transaction validation and clearer feedback
- Mining feedback with loading and success/error notifications
- Card-based blockchain explorer with expandable transactions
- Dashboard-style statistics panel
- Regression tests for transaction validation and persistence

## Environment

Create `.env` from the example file:

```bash
cp .env.example .env
```

Example values:

```env
API_PORT=3002
NODE_ENV=development
BLOCKCHAIN_DIFFICULTY=2
BLOCKCHAIN_MINING_REWARD=100
INITIAL_MINER_ADDRESS=genesis-miner
SEED_DEMO_DATA=true
REACT_APP_API_URL=http://localhost:3002
```

Important:

- React runs on `http://localhost:3000`
- Express runs on `http://localhost:3002`
- The backend now reads `API_PORT`, not `PORT`

## How To Run

Install dependencies:

```bash
npm install
```

### Development

Run the frontend and backend in separate terminals:

```bash
# Terminal 1
npm start
```

```bash
# Terminal 2
npm run dev
```

The React dev server proxies `/api/*` to the backend. In development, Express exposes API routes only and does not try to serve `build/index.html`.

### Production

Create the React build and serve it through Express:

```bash
npm run serve
```

In production, Express serves the compiled frontend from `build/`.

## API Overview

Responses follow a consistent JSON format.

Success:

```json
{
  "success": true
}
```

Error:

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

Core endpoints:

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/chain` | Full blockchain |
| `GET` | `/api/chain/valid` | Chain validity |
| `GET` | `/api/stats` | Blockchain statistics |
| `POST` | `/api/wallets` | Create a wallet |
| `GET` | `/api/balance/:address` | Fetch wallet balance |
| `POST` | `/api/transactions` | Add a pending transaction |
| `GET` | `/api/transactions/pending` | Pending transaction pool |
| `GET` | `/api/transactions/all` | Confirmed transactions |
| `POST` | `/api/mine` | Mine pending transactions |

## Development Notes

- Persistence is stored in `blockchain.json` by default.
- Tests can override the persistence path with `BLOCKCHAIN_STATE_PATH`.
- Mining and transaction writes are rate-limited.
- The UI polls for updated chain and stats data every 5 seconds.

## Testing

Run:

```bash
npm run lint
node --test
npm run build
```

Manual verification checklist:

- Create a wallet
- Copy the generated address
- Refresh the balance
- Submit a transaction
- Mine a block
- Confirm the stats update
- Restart the API and confirm the blockchain state is restored
- Check `/api/chain/valid`

## Screenshots

Placeholder:

- Dashboard overview
- Wallet creation flow
- Transaction form validation
- Blockchain explorer expanded block view

## Future Improvements

- End-to-end cryptographic signing in the browser
- More granular automated frontend tests
- Richer wallet history and transaction filtering
- Multiple saved wallets per browser session
- Stronger persistence recovery diagnostics

## Known Limitations

- The blockchain implementation is intentionally simplified and not distributed.
- Transaction signing is still demo-oriented rather than a full wallet protocol.
- Persistence uses a local JSON file instead of a database.
- The Solidity contract is included as an assessment artifact and is not wired into the UI.
