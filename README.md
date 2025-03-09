# Stryke Rewards Lookup Application

A web application to look up rewards from a Stryke smart contract on the Arbitrum blockchain.

## Features

- Query rewards for specific pools or all pools at once
- Simple and intuitive user interface
- Works both locally and in production with Vercel

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
RPC_URL=https://arb1.arbitrum.io/rpc
CONTRACT_ADDRESS=0x82C13fCab02A168F06E12373F9e5D2C2Bd47e399
```

## Running Locally

To run the application locally:

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

Then visit `http://localhost:3000` in your browser.

## Deploying to Vercel

The application is set up to deploy to Vercel. Simply push to your repository and connect it to Vercel.

Or deploy from the command line:

```bash
vercel
```

## API Endpoints

- `POST /api/rewards` - Get rewards for a single pool
  - Body: `{ "poolId": "0x...", "epoch": 1 }`

- `POST /api/all-pools` - Get rewards for all pools
  - Body: `{ "epoch": 1 }`

## Directory Structure

- `app.js` - Main Express application file
- `contract-abi.json` - ABI for the smart contract
- `public/` - Static files (optional)
- `vercel.json` - Vercel deployment configuration
- `.env` - Environment variables (not checked into version control)# ExpressEpoch
