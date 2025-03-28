# Stryke Epoch Rewards

A web application for looking up rewards from the Stryke protocol based on epoch and pool ID.

## Project Structure

- `/app.js` - Express.js server that handles API requests
- `/client` - React frontend built with Vite
- `/contract-config.js` - Configuration for the blockchain contract
- `/contract-abi.json` - ABI for the contract

## Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   cd client && npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Start both servers together (recommended):
   ```
   npm run dev:all
   ```
   
   This will start both the backend server and the frontend development server simultaneously.

   Alternatively, you can start them separately:
   ```
   # Terminal 1 - Start the backend
   npm run dev
   
   # Terminal 2 - Start the frontend
   cd client && npm run dev
   ```

5. Access the application:
   - Frontend: http://localhost:5173 (or another port as shown in the terminal)
   - Backend API: http://localhost:3000

## Troubleshooting Local Development

If you see API errors in the console when running only the frontend, make sure the backend server is also running. The frontend needs to communicate with the backend API for contract interactions.

## Deploying to Vercel

### Option 1: Deploy from GitHub

1. Push your code to GitHub
2. Create a new project on Vercel
3. Import your GitHub repository
4. Set the following environment variables in Vercel:
   - `RPC_URL` - URL for the Arbitrum RPC
   - `CONTRACT_ADDRESS` - Address of the contract
5. Deploy

### Option 2: Deploy with Vercel CLI

1. Install Vercel CLI:
   ```
   npm install -g vercel
   ```
2. Login to Vercel:
   ```
   vercel login
   ```
3. Deploy:
   ```
   vercel
   ```

## Environment Variables

- `PORT` - Port for the server (default: 3000)
- `RPC_URL` - URL for the Arbitrum RPC
- `CONTRACT_ADDRESS` - Address of the contract
- `DEBUG` - Set to true to enable debug logging

## Features

- View rewards for specific epochs and pools
- Call contract functions directly
- View options data from Stryke API
- Dashboard with epoch countdown and historical data

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
- `.env` - Environment variables (not checked into version control)
