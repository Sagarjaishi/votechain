# VoteChain

## Hybrid Blockchain Voting DApp

VoteChain is a professional hybrid blockchain voting application developed for the **CN6035 Mobile and Distributed Systems** module at the **University of East London**.

The system combines a modern **React frontend**, **Node.js / Express backend**, and **Solidity smart contract** to provide secure, transparent, and decentralised digital voting.

---

# Project Overview

Traditional voting systems may suffer from:

- Slow counting processes  
- Limited transparency  
- Centralised control risks  
- Human error  
- Security concerns  

VoteChain addresses these challenges by recording votes on a blockchain network where transactions are tamper-resistant and auditable.

Users can connect MetaMask wallets, vote securely, and view results in real time.

---

# Main Features

## User Features

- Connect wallet using MetaMask  
- View election candidates  
- Cast one secure vote per wallet  
- View live vote totals  
- View final winner  

## Admin Features

- Add candidates  
- Start election  
- End election  
- Reset election  
- Manage election lifecycle  

## System Features

- Blockchain vote storage  
- Smart contract automation  
- Professional dashboard UI  
- Real-time result display  
- Hybrid frontend + backend architecture  

---

# Technologies Used

## Frontend

- React.js  
- JavaScript  
- CSS  

## Backend

- Node.js  
- Express.js  

## Blockchain

- Solidity  
- Hardhat v2  
- Ethers.js  
- MetaMask  

---

# Development Environment

This project was developed and tested using:

- **Node.js v20.17.0**  
- **Hardhat v2**  
- **npm**  
- **Google Chrome**  
- **MetaMask Extension**

---

# Project Structure

```text
VOTECHAIN/
├── blockchain/
├── client/
├── server/
├── docs/
├── README.md
├── INSTALLATION.md
└── .gitignore

Easy Setup Guide for Tutor / Marker
Requirements
Please install:


Node.js v20.17.0


npm


MetaMask browser extension


Google Chrome recommended



Step 1: Install Dependencies
Blockchain Folder
cd blockchainnpm install
Frontend Folder
cd clientnpm install
Backend Folder
cd servernpm install

Step 2: Start Local Blockchain
Open terminal in blockchain folder:
cd blockchainnpx hardhat node
Keep this terminal running.

Step 3: Deploy Smart Contract
Open a new terminal:
cd blockchainnpx hardhat run scripts/deploy.js --network localhost
Copy the deployed contract address shown in terminal.

Step 4: Update Frontend Contract Address
Open:
client/src/App.jsx
Replace:
const CONTRACT_ADDRESS = "PASTE_DEPLOYED_ADDRESS_HERE";
with your newly deployed contract address.
Save the file.

Step 5: Start Backend Server
Open terminal in server folder:
cd servernpm start

Step 6: Start Frontend
Open terminal in client folder:
cd clientnpm run dev
Open browser:
http://localhost:5173

Step 7: MetaMask Setup
Add Custom Network
Use the following details:
Network Name: Hardhat LocalRPC URL: http://127.0.0.1:8545
Chain ID: 31337  Currency Symbol: ETH
Import Hardhat Test Account
Use one private key shown in the npx hardhat node terminal.
After importing, the wallet should display 10,000 ETH on Hardhat Local.

Step 8: Testing the Project
Click Connect Wallet

Tutor / Marker can test the following:


Add Candidate


Start Election


Connect another wallet


Vote securely


End Election


View Winner


Reset Election



Notes


First deployed wallet is the original smart contract owner.


Demo mode enabled for easier assessment.


Votes are recorded on blockchain.


MetaMask approval required for transactions.


Any connected wallet can test core election functions in local mode.



Troubleshooting
Wallet Not Connecting
Refresh browser and reconnect MetaMask.
Wrong Network
Switch MetaMask to Hardhat Local.
Contract Not Responding
Ensure latest deployed contract address is updated in App.jsx.
Transaction Warning
Approve localhost MetaMask review prompt.
Empty Candidate List
Refresh page after adding candidates.



