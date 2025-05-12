pragma solidity ^0.8.0;

contract Voting {
    mapping(string => uint256) private votes;
    string[] private candidates;
    mapping(address => bool) private voters;

    constructor(string[] memory candidateNames) {
        candidates = candidateNames;
    }

    function vote(string memory candidate) public {
        require(!voters[msg.sender], "You have already voted.");
        require(validCandidate(candidate), "Invalid candidate.");
        
        voters[msg.sender] = true;
        votes[candidate]++;
    }

    function getVotes(string memory candidate) public view returns(uint256) {
        require(validCandidate(candidate), "Invalid candidate.");
        return votes[candidate];
    }

    function getCandidates() public view returns(string[] memory) {
        return candidates;
    }

    function validCandidate(string memory candidate) internal view returns(bool) {
        for(uint i = 0; i < candidates.length; i++) {
            if (keccak256(abi.encodePacked(candidates[i])) == keccak256(abi.encodePacked(candidate))) {
                return true;
            }
        }
        return false;
    }
}