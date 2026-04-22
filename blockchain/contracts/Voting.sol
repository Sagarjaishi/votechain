 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {
    address public owner;
    bool public electionStarted;
    bool public electionEnded;

    struct Candidate {
        uint id;
        string name;
        string party;
        uint voteCount;
    }

    uint public candidatesCount;

    mapping(uint => Candidate) public candidates;
    mapping(address => bool) public hasVoted;

    event CandidateAdded(uint id, string name, string party);
    event VoteCast(address voter, uint candidateId);

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

    function addCandidate(string memory _name, string memory _party) public onlyOwner {
        require(!electionStarted, "Election already started");

        candidatesCount++;

        candidates[candidatesCount] = Candidate(
            candidatesCount,
            _name,
            _party,
            0
        );

        emit CandidateAdded(candidatesCount, _name, _party);
    }

    function startElection() public onlyOwner {
        electionStarted = true;
    }

    function endElection() public onlyOwner {
        electionEnded = true;
    }

    function vote(uint _candidateId) public electionLive {
        require(!hasVoted[msg.sender], "Already voted");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate");

        hasVoted[msg.sender] = true;
        candidates[_candidateId].voteCount++;

        emit VoteCast(msg.sender, _candidateId);
    }

    function getWinner() public view returns(string memory) {
        uint maxVotes = 0;
        uint winnerId = 0;

        for(uint i = 1; i <= candidatesCount; i++) {
            if(candidates[i].voteCount > maxVotes) {
                maxVotes = candidates[i].voteCount;
                winnerId = i;
            }
        }

        return candidates[winnerId].name;
    }
}