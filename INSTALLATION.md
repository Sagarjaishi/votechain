# VoteChain Installation Guide

This document explains how to run the VoteChain Hybrid Blockchain Voting DApp on a local machine.

---

## System Requirements

Before starting, make sure the following software is installed:

- Node.js v20.17.0 or compatible
- npm
- Git
- MetaMask browser extension
- Visual Studio Code

---

## Project Structure

```text
VOTECHAIN/
├── blockchain/
├── client/
├── server/
├── docs/
├── README.md
├── INSTALLATION.md
└── .gitignore


Step 1: Open Project Folder
cd /Users/apple/Desktop/votechain

Step 2: Install Blockchain Dependencies
cd blockchain
npm install

Step 3: Compile Smart Contract
npx hardhat compile

Expected result:

Compiled successfully

Step 4: Start Local Blockchain Network
npx hardhat node

Expected result:

Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Keep this terminal running.

Step 5: Deploy Smart Contract

Open a new terminal:

cd /Users/apple/Desktop/votechain/blockchain
npx hardhat run scripts/deploy.js --network localhost

Expected result:

Voting contract deployed to: 0x....

Copy the contract address.

Step 6: Configure MetaMask
Field	Value
Network Name	Hardhat Local
RPC URL	http://127.0.0.1:8545

Chain ID	31337
Currency Symbol	ETH

Step 7: Import Test Account

From Hardhat terminal copy one private key.

In MetaMask:

Click account icon
Select Import Account
Paste private key
Confirm

You should receive test ETH.

Step 8: Start Frontend
cd /Users/apple/Desktop/votechain/client
npm install
npm run dev

Expected result:

Local: http://localhost:5173/

Open browser:

http://localhost:5173

Step 9: Use Application
Admin Actions
Connect wallet
Add candidate
Start election
End election
User Actions
Connect MetaMask
Vote candidate
View results

Step 10: Reset Election for Demo
cd blockchain
npx hardhat node

Then redeploy:

npx hardhat run scripts/deploy.js --network localhost

Update contract address in frontend if required.

Common Issues
MetaMask not connecting
Ensure MetaMask installed
Use Hardhat Local network
Unlock wallet
Already voted / old data showing

Restart Hardhat node and redeploy contract.

Port busy
npm run dev -- --port 5174

Technologies Used
React.js
Solidity
Hardhat
MetaMask
JavaScript
CSS
