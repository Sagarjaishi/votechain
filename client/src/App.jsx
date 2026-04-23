import { useEffect, useMemo, useRef, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import "./App.css";

const DEMO_MODE = true;
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const CONTRACT_ABI = [
  "function owner() view returns (address)",
  "function electionStarted() view returns (bool)",
  "function electionEnded() view returns (bool)",
  "function candidatesCount() view returns (uint256)",
  "function candidates(uint256) view returns (uint256 id, string name, string party, uint256 voteCount)",
  "function hasVoted(address) view returns (bool)",
  "function addCandidate(string memory _name, string memory _party)",
  "function startElection()",
  "function endElection()",
  "function resetElection()",
  "function transferOwnership(address newOwner)",
  "function vote(uint256 _candidateId)",
  "function getWinner() view returns (string memory)"
];

const cardThemes = ["purple", "blue", "green", "orange", "pink"];

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [contractOwner, setContractOwner] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [winner, setWinner] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [electionStarted, setElectionStarted] = useState(false);
  const [electionEnded, setElectionEnded] = useState(false);
  const [candidateName, setCandidateName] = useState("");
  const [candidateParty, setCandidateParty] = useState("");
  const [electionInfo, setElectionInfo] = useState(null);
  const [loadingAction, setLoadingAction] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [highlightedSection, setHighlightedSection] = useState("");
  const [hasUserVoted, setHasUserVoted] = useState(false);
  const [newOwnerAddress, setNewOwnerAddress] = useState("");

  const dashboardRef = useRef(null);
  const adminRef = useRef(null);
  const candidatesRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    fetchElectionInfo();
  }, []);

  useEffect(() => {
    if (contract) {
      loadBlockchainData();
    }
  }, [contract, refreshKey]);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (!accounts.length) {
        setAccount("");
        setContract(null);
        setIsOwner(false);
        setHasUserVoted(false);
        return;
      }
      await connectWallet(false);
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const totalVotes = useMemo(
    () => candidates.reduce((sum, c) => sum + c.voteCount, 0),
    [candidates]
  );

  const statusText = electionEnded
    ? "Ended"
    : electionStarted
      ? "Active"
      : "Not Started";

  const fetchElectionInfo = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/election");
      setElectionInfo(res.data);
    } catch (error) {
      console.log("Backend not running yet");
    }
  };

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3200);
  };

  const getCandidateInitials = (name) => {
    if (!name) return "VC";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const switchToHardhatNetwork = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x7a69" }]
      });
    } catch (error) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x7a69",
              chainName: "Hardhat Local",
              rpcUrls: ["http://127.0.0.1:8545"],
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18
              }
            }
          ]
        });
      } else {
        throw error;
      }
    }
  };

  const connectWallet = async (showSuccessMessage = true) => {
    try {
      if (!window.ethereum) {
        showMessage("MetaMask is not installed.", "error");
        return;
      }

      setLoadingAction("connect");
      await switchToHardhatNetwork();

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      const votingContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      const ownerAddress = await votingContract.owner();
      const currentAddress = accounts[0];
      const voted = await votingContract.hasVoted(currentAddress);

      setAccount(currentAddress);
      setContract(votingContract);
      setContractOwner(ownerAddress);
      setIsOwner(currentAddress.toLowerCase() === ownerAddress.toLowerCase());
      setHasUserVoted(voted);

      if (showSuccessMessage) {
        showMessage("Wallet connected successfully.", "success");
      }
    } catch (error) {
      console.error(error);
      showMessage(`Failed to connect MetaMask: ${error.message}`, "error");
    } finally {
      setLoadingAction("");
    }
  };

  const loadBlockchainData = async () => {
    try {
      const started = await contract.electionStarted();
      const ended = await contract.electionEnded();
      const count = await contract.candidatesCount();
      const ownerAddress = await contract.owner();

      setElectionStarted(started);
      setElectionEnded(ended);
      setContractOwner(ownerAddress);
      setIsOwner(
        !!account && account.toLowerCase() === ownerAddress.toLowerCase()
      );

      if (account) {
        const voted = await contract.hasVoted(account);
        setHasUserVoted(voted);
      }

      const loadedCandidates = [];
      for (let i = 1; i <= Number(count); i++) {
        const c = await contract.candidates(i);
        loadedCandidates.push({
          id: Number(c.id),
          name: c.name,
          party: c.party,
          voteCount: Number(c.voteCount)
        });
      }

      setCandidates(loadedCandidates);

      if (ended && Number(count) > 0) {
        const winnerName = await contract.getWinner();
        setWinner(winnerName);
      } else {
        setWinner("");
      }
    } catch (error) {
      console.error(error);
      showMessage("Failed to load blockchain data.", "error");
    }
  };

  const addCandidate = async () => {
    try {
      if (!contract) {
        showMessage("Please connect your wallet first.", "error");
        return;
      }

      if (!candidateName.trim() || !candidateParty.trim()) {
        showMessage("Please enter candidate name and party.", "error");
        return;
      }

      setLoadingAction("addCandidate");
      const tx = await contract.addCandidate(
        candidateName.trim(),
        candidateParty.trim()
      );
      await tx.wait();

      setCandidateName("");
      setCandidateParty("");
      showMessage("Candidate added successfully.", "success");
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error(error);
      showMessage(error?.shortMessage || error?.message || "Failed to add candidate.", "error");
    } finally {
      setLoadingAction("");
    }
  };

  const startElection = async () => {
    try {
      if (!contract) {
        showMessage("Please connect your wallet first.", "error");
        return;
      }

      setLoadingAction("startElection");
      const tx = await contract.startElection();
      await tx.wait();
      showMessage("Election started successfully.", "success");
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error(error);
      showMessage(error?.shortMessage || error?.message || "Failed to start election.", "error");
    } finally {
      setLoadingAction("");
    }
  };

  const endElection = async () => {
    try {
      if (!contract) {
        showMessage("Please connect your wallet first.", "error");
        return;
      }

      setLoadingAction("endElection");
      const tx = await contract.endElection();
      await tx.wait();
      showMessage("Election ended successfully.", "success");
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error(error);
      showMessage(error?.shortMessage || error?.message || "Failed to end election.", "error");
    } finally {
      setLoadingAction("");
    }
  };

  const resetElection = async () => {
    try {
      if (!contract) {
        showMessage("Please connect your wallet first.", "error");
        return;
      }

      setLoadingAction("resetElection");
      const tx = await contract.resetElection();
      await tx.wait();
      showMessage("Election reset successfully. Voting can start again.", "success");
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error(error);
      showMessage(error?.shortMessage || error?.message || "Failed to reset election.", "error");
    } finally {
      setLoadingAction("");
    }
  };

  const transferOwnership = async () => {
    try {
      if (!contract) {
        showMessage("Please connect your wallet first.", "error");
        return;
      }

      if (!ethers.isAddress(newOwnerAddress.trim())) {
        showMessage("Enter a valid wallet address.", "error");
        return;
      }

      setLoadingAction("transferOwnership");
      const tx = await contract.transferOwnership(newOwnerAddress.trim());
      await tx.wait();
      showMessage("Admin ownership transferred successfully.", "success");
      setNewOwnerAddress("");
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error(error);
      showMessage(error?.shortMessage || error?.message || "Failed to transfer admin.", "error");
    } finally {
      setLoadingAction("");
    }
  };

  const voteCandidate = async (id) => {
    try {
      if (!contract) {
        showMessage("Please connect your wallet first.", "error");
        return;
      }

      setLoadingAction(`vote-${id}`);
      const tx = await contract.vote(id);
      await tx.wait();
      showMessage("Vote submitted successfully.", "success");
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error(error);
      showMessage(error?.shortMessage || error?.message || "Voting failed.", "error");
    } finally {
      setLoadingAction("");
    }
  };

  const handleRefresh = () => {
    if (!contract) {
      showMessage("Please connect your wallet first.", "error");
      return;
    }

    setRefreshKey((prev) => prev + 1);
    showMessage("Blockchain data refreshed.", "info");
  };

  const scrollToSection = (section) => {
    setActiveMenu(section);
    setHighlightedSection(section);

    const refs = {
      dashboard: dashboardRef,
      admin: adminRef,
      candidates: candidatesRef,
      results: resultsRef
    };

    refs[section]?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    setTimeout(() => {
      setHighlightedSection("");
    }, 1800);
  };

  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : "Connect Wallet";

  const shortOwnerAddress = contractOwner
    ? `${contractOwner.slice(0, 6)}...${contractOwner.slice(-4)}`
    : "Not loaded";

  return (
    <div className="final-app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">🛡️</div>
          <div>
            <h2>VoteChain</h2>
            <p>Voting Dashboard</p>
          </div>
        </div>

        <div className="sidebar-menu">
          <button
            className={`menu-item ${activeMenu === "dashboard" ? "active" : ""}`}
            onClick={() => scrollToSection("dashboard")}
          >
            <span className="menu-icon">🏠</span>
            <span>Dashboard</span>
          </button>

          <button
            className={`menu-item ${activeMenu === "admin" ? "active" : ""}`}
            onClick={() => scrollToSection("admin")}
          >
            <span className="menu-icon">⚙️</span>
            <span>Admin</span>
          </button>

          <button
            className={`menu-item ${activeMenu === "candidates" ? "active" : ""}`}
            onClick={() => scrollToSection("candidates")}
          >
            <span className="menu-icon">🧑‍🤝‍🧑</span>
            <span>Candidates</span>
          </button>

          <button
            className={`menu-item ${activeMenu === "results" ? "active" : ""}`}
            onClick={() => scrollToSection("results")}
          >
            <span className="menu-icon">📊</span>
            <span>Results</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div>
            <h1 className="page-title">Hybrid Blockchain Voting DApp</h1>
            <p className="page-subtitle">
              Secure election management with smart-contract powered blockchain voting
            </p>
          </div>

          <button className="wallet-button" onClick={() => connectWallet(true)}>
            {loadingAction === "connect" ? "Connecting..." : shortAddress}
          </button>
        </header>

        <section
          className={`hero-banner ${highlightedSection === "dashboard" ? "section-highlight" : ""}`}
          ref={dashboardRef}
        >
          <div className="hero-left">
            <span className="hero-chip">CN6035 Final Project</span>
            <h2 className="hero-title">
              Secure, Transparent and Professional Election Platform
            </h2>
            <p className="hero-desc">
              This decentralized voting application allows an admin to create
              candidates, start and end the election, while users can vote
              transparently through blockchain transactions.
            </p>

            {account && (
              <div className="wallet-display">
                <span>Connected Wallet</span>
                <strong>{account}</strong>
                <span style={{ marginTop: "8px" }}>Contract Admin: {shortOwnerAddress}</span>
              </div>
            )}
          </div>

          <div className="hero-illustration">
            <div className="cartoon-box">
              <div className="cartoon-face">😊</div>
              <div className="cartoon-vote">🗳️</div>
            </div>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-box">
            <div className="stat-icon">👥</div>
            <div>
              <span>Total Candidates</span>
              <h3>{candidates.length}</h3>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">🗳️</div>
            <div>
              <span>Total Votes</span>
              <h3>{totalVotes}</h3>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">📢</div>
            <div>
              <span>Status</span>
              <h3 className={electionEnded ? "danger-color" : "dark-color"}>
                {statusText}
              </h3>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">🏆</div>
            <div>
              <span>Winner</span>
              <h3>{winner || "—"}</h3>
            </div>
          </div>
        </section>

        {message && (
          <div className={`toast-message toast-${messageType}`}>
            {message}
          </div>
        )}

        {electionInfo && (
          <section className="panel info-panel">
            <h3>{electionInfo.title}</h3>
            <p>{electionInfo.description}</p>
          </section>
        )}

        <section className="panel info-panel">
          <h3>Demo Mode</h3>
          <p>
            Admin panel is visible for coursework demonstration on any device.
            Real blockchain actions still require MetaMask transaction approval.
          </p>
          <p>
            Connected: <strong>{account ? shortAddress : "Not connected"}</strong> | Owner:{" "}
            <strong>{shortOwnerAddress}</strong>
          </p>
        </section>

        <div className="content-grid">
          {(isOwner || DEMO_MODE) && (
            <section
              className={`panel admin-panel ${highlightedSection === "admin" ? "section-highlight" : ""}`}
              ref={adminRef}
            >
              <div className="panel-header">
                <div>
                  <h3>Admin Panel (Demo Access Enabled)</h3>
                  <p>Manage election and candidate setup</p>
                </div>
                <button className="refresh-button" onClick={handleRefresh}>
                  Refresh
                </button>
              </div>

              <div className="quick-guide">
                <h4>Demo Quick Start Guide</h4>
                <ol>
                  <li>Connect wallet</li>
                  <li>Add candidate</li>
                  <li>Start election</li>
                  <li>Vote</li>
                  <li>End election</li>
                  <li>Reset election to run again</li>
                </ol>
              </div>

              <div className="form-grid">
                <input
                  className="form-input"
                  type="text"
                  placeholder="Candidate Name"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                />
                <input
                  className="form-input"
                  type="text"
                  placeholder="Party Name"
                  value={candidateParty}
                  onChange={(e) => setCandidateParty(e.target.value)}
                />
                <button className="primary-btn" onClick={addCandidate}>
                  {loadingAction === "addCandidate" ? "Adding..." : "Add Candidate"}
                </button>
              </div>

              <div className="action-buttons">
                <button className="start-btn" onClick={startElection}>
                  {loadingAction === "startElection" ? "Starting..." : "Start Election"}
                </button>
                <button className="end-btn" onClick={endElection}>
                  {loadingAction === "endElection" ? "Ending..." : "End Election"}
                </button>
                <button className="refresh-button" onClick={resetElection}>
                  {loadingAction === "resetElection" ? "Resetting..." : "Reset Election"}
                </button>
              </div>

              <div className="form-grid" style={{ marginTop: "18px" }}>
                <input
                  className="form-input"
                  type="text"
                  placeholder="New Admin Wallet Address"
                  value={newOwnerAddress}
                  onChange={(e) => setNewOwnerAddress(e.target.value)}
                />
                <button className="primary-btn" onClick={transferOwnership}>
                  {loadingAction === "transferOwnership" ? "Transferring..." : "Transfer Admin"}
                </button>
              </div>
            </section>
          )}

          <section
            className={`panel candidates-panel ${highlightedSection === "candidates" ? "section-highlight" : ""}`}
            ref={candidatesRef}
          >
            <div className="panel-header">
              <div>
                <h3>Candidates</h3>
                <p>Live blockchain voting results</p>
              </div>

              <div className="status-chips">
                <span className={`status-chip ${electionStarted ? "chip-green" : "chip-gray"}`}>
                  {electionStarted ? "Started" : "Not Started"}
                </span>
                <span className={`status-chip ${electionEnded ? "chip-red" : "chip-blue"}`}>
                  {electionEnded ? "Ended" : "Active"}
                </span>
                {account && (
                  <span className={`status-chip ${hasUserVoted ? "chip-red" : "chip-green"}`}>
                    {hasUserVoted ? "You Voted" : "Not Yet Voted"}
                  </span>
                )}
              </div>
            </div>

            {candidates.length === 0 ? (
              <div className="empty-state">
                <div className="empty-cartoon">📦</div>
                <h4>No candidates added yet</h4>
                <p>Start by adding candidates from the admin panel.</p>
              </div>
            ) : (
              <div className="candidate-grid">
                {candidates.map((candidate, index) => {
                  const percentage =
                    totalVotes > 0 ? Math.round((candidate.voteCount / totalVotes) * 100) : 0;

                  return (
                    <div className="candidate-card" key={candidate.id}>
                      <div className="candidate-top">
                        <div className={`candidate-avatar ${cardThemes[index % cardThemes.length]}`}>
                          {getCandidateInitials(candidate.name)}
                        </div>

                        <div>
                          <h4>{candidate.name}</h4>
                          <p>{candidate.party}</p>
                          <span className="vote-count">Votes: {candidate.voteCount}</span>
                        </div>
                      </div>

                      <div className="progress-section">
                        <div className="progress-labels">
                          <span>Vote Share</span>
                          <span>{percentage}%</span>
                        </div>
                        <div className="progress-track">
                          <div
                            className="progress-bar"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <button
                        className="vote-btn"
                        disabled={!account || !electionStarted || electionEnded || hasUserVoted}
                        onClick={() => voteCandidate(candidate.id)}
                      >
                        {loadingAction === `vote-${candidate.id}`
                          ? "Submitting..."
                          : hasUserVoted
                            ? "Already Voted"
                            : "Vote Now"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <section
          className={`panel winner-panel ${highlightedSection === "results" ? "section-highlight" : ""}`}
          ref={resultsRef}
        >
          <h3>Results</h3>
          <div className="winner-badge">
            {winner ? `🏆 ${winner}` : "No result available yet"}
          </div>
        </section>

        {loadingAction && loadingAction !== "connect" && (
          <div className="loading-overlay">
            <div className="loading-box">
              <div className="spinner"></div>
              <h4>Waiting for transaction...</h4>
              <p>Please approve the transaction in MetaMask.</p>
            </div>
          </div>
        )}

        <footer className="footer-final">
          <div className="footer-brand">
            <div className="footer-logo">🛡️</div>
            <div>
              <h4>VoteChain DApp</h4>
              <p>Secure Digital Election Platform</p>
            </div>
          </div>

          <div className="footer-center">
            <span>CN6035 Final Coursework Project</span>
            <span>University of East London</span>
          </div>

          <div className="footer-right">
            <span>Blockchain Voting</span>
            <span>Secure Election</span>
            <span>Smart Contract Powered</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;