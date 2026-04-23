const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const electionInfo = {
  title: "UEL Student Election 2026",
  description:
    "A hybrid decentralized voting application built with React, Node.js, Express, Solidity, Hardhat and MetaMask."
};

const candidateProfiles = [
  {
    name: "Jivan",
    party: "Innovation Party",
    manifesto: "Improve digital learning, employability and student opportunities."
  },
  {
    name: "Sagar Jaishi",
    party: "Future Vision Party",
    manifesto: "Enhance student support and create more real-world tech placements."
  }
];

app.get("/api/election", (req, res) => {
  res.json(electionInfo);
});

app.get("/api/candidates", (req, res) => {
  res.json(candidateProfiles);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});