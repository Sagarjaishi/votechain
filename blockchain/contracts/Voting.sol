// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {
    address public owner;
    bool public electionStarted;
    bool public electionEnded;

    struct Candidate {
        uint256 id;
        string name;
        string party;
        uint256 voteCount;
    }

    uint256 public candidatesCount;

    mapping(uint256 => Candidate) public candidates;
    mapping(address => bool) public hasVoted;
    address[] private voters;

    event CandidateAdded(uint256 id, string name, string party);
    event VoteCast(address voter, uint256 candidateId);
    event ElectionStarted();
    event ElectionEnded();
    event ElectionReset();
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only admin allowed");
        _;
    }

    modifier electionLive() {
        require(electionStarted, "Election not started");
        require(!electionEnded, "Election ended");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // ANY WALLET
    function addCandidate(string memory _name, string memory _party) public {
        require(!electionStarted, "Election already started");
        require(bytes(_name).length > 0, "Candidate name required");
        require(bytes(_party).length > 0, "Party name required");

        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, _party, 0);

        emit CandidateAdded(candidatesCount, _name, _party);
    }

    // ANY WALLET
    function startElection() public {
        require(candidatesCount > 0, "Add candidates first");
        require(!electionStarted, "Election already started");

        electionStarted = true;
        electionEnded = false;

        emit ElectionStarted();
    }

    // ANY WALLET
    function endElection() public {
        require(electionStarted, "Election not started");
        require(!electionEnded, "Election already ended");

        electionEnded = true;

        emit ElectionEnded();
    }

    function vote(uint256 _candidateId) public electionLive {
        require(!hasVoted[msg.sender], "Already voted");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate");

        hasVoted[msg.sender] = true;
        voters.push(msg.sender);
        candidates[_candidateId].voteCount++;
        emit VoteCast(msg.sender, _candidateId);
    }

    // ANY WALLET
    function resetElection() public {
        require(electionEnded || !electionStarted, "End election first");

        for (uint256 i = 1; i <= candidatesCount; i++) {
            candidates[i].voteCount = 0;
        }

        for (uint256 i = 0; i < voters.length; i++) {
            hasVoted[voters[i]] = false;
        }

        delete voters;

        electionStarted = false;
        electionEnded = false;

        emit ElectionReset();
    }

    // KEEP OWNER ONLY
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid new owner");

        address previousOwner = owner;
        owner = newOwner;

        emit OwnershipTransferred(previousOwner, newOwner);
    }

    function getWinner() public view returns (string memory) {
        require(candidatesCount > 0, "No candidates available");

        uint256 maxVotes = 0;
        uint256 winnerId = 1;

        for (uint256 i = 1; i <= candidatesCount; i++) {
            if (candidates[i].voteCount > maxVotes) {
                maxVotes = candidates[i].voteCount;
                winnerId = i;
            }
        }

        return candidates[winnerId].name;
    }

    function getVotersCount() public view returns (uint256) {
        return voters.length;
    }
}