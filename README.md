# VoteChain

## Hybrid Blockchain Voting DApp

VoteChain is a professional hybrid blockchain voting application developed for the **CN6035 Mobile and Distributed Systems** module. The system combines a modern React frontend, a Node.js backend and a Solidity smart contract to provide secure, transparent and decentralised digital voting.

---

## Project Overview

Traditional voting systems can face issues such as slow counting, limited transparency and security concerns. VoteChain solves these problems by recording votes on a blockchain network where data becomes tamper-resistant and trustworthy.

The application allows users to connect their MetaMask wallet, vote securely and view results in real time. Administrators can add candidates, start elections and end elections to display the final winner.

---

## Main Features

### User Features

- Connect wallet using MetaMask
- View election candidates
- Cast one secure vote
- View live vote counts
- View final winner

### Admin Features

- Add candidates
- Start election
- End election
- Manage election flow

### System Features

- Blockchain vote storage
- Smart contract automation
- Professional dashboard UI
- Real-time result display
- Hybrid frontend + backend architecture

---

## Technologies Used

### Frontend

- React.js
- JavaScript
- CSS

### Backend

- Node.js
- Express.js

### Blockchain

- Solidity
- Hardhat
- Ethers.js
- MetaMask

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




## Easy Setup Guide for Tutor / Marker

## Requirements
- Node.js installed
- MetaMask Chrome Extension installed

## Step 1: Install Dependencies

Open terminal in project folders and run:

### Blockchain
cd blockchain
npm install

### Frontend
cd client
npm install

### Backend
cd server
npm install

---

## Step 2: Start Local Blockchain

Open terminal in blockchain folder:

npx hardhat node

Keep this terminal running.

---

## Step 3: Deploy Smart Contract

Open a new terminal in blockchain folder:

npx hardhat run scripts/deploy.js --network localhost

Copy the deployed contract address shown in terminal.

---

## Step 4: Update Frontend Contract Address

Open:

client/src/App.jsx

Replace:

const CONTRACT_ADDRESS = "PASTE_YOUR_NEW_DEPLOYED_CONTRACT_ADDRESS_HERE";

with the deployed address.

Save file.

---

## Step 5: Start Backend

Open terminal in server folder:

npm start

---

## Step 6: Start Frontend

Open terminal in client folder:

npm run dev

Open browser:

http://localhost:5173

---

## Step 7: MetaMask Setup

- Open MetaMask
- Select Hardhat Local Network

Network Details:

RPC URL: http://127.0.0.1:8545  
Chain ID: 31337  
Currency Symbol: ETH

---

## Step 8: Testing the Project

Click **Connect Wallet**

Admin Panel is visible in Demo Mode for easier testing.

Tutor can test:

- Add Candidate
- Start Election
- Connect another wallet
- Vote
- End Election
- View Winner
- Reset Election

---

## Notes

- First deployed wallet is original smart contract owner.
- Demo mode enabled for easier assessment.
- Votes are stored on blockchain.
