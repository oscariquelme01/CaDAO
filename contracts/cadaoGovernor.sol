// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";

contract CadaoGovernor is Governor, GovernorCountingSimple, GovernorVotes {

    struct proposal { 
        string description;
        uint256 id;
    }

    proposal currentProposal;


    constructor(IVotes _token) Governor("CadaoGovernor") GovernorVotes(_token) {
        currentProposal.description = 'No proposals yet...';
        currentProposal.id = 256;
    }

    // This function is used as the function that will be passed everytime someone propose something since this is not a real dao!, so ye it does nothing
    function doNothing() public pure {

    }

    function votingDelay() public pure override returns (uint256) {
        return 1; // 1 block
    }

    function votingPeriod() public pure override returns (uint256) {
        return 45; // 10 minutes
    }

    function quorum(uint256 blockNumber) public pure override returns (uint256) {
        return 3e18;
    }

    function retrieveCurrentProposal() public view returns(proposal memory){
        if(currentProposal.id == 0){
            proposal memory ret;
            ret.description = 'No proposals yet!';
            ret.id = 0;
            return ret;
        }

        return currentProposal;
    }
    
    function setCurrentProposal(uint256 id, string memory desc) internal {
        currentProposal.id = id;
        currentProposal.description = desc;
    }

    function propose(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, string memory description) public override returns(uint256){
        uint256 id = hashProposal(targets, values, calldatas, keccak256(abi.encodePacked(description)));
        uint256 ret = super.propose(targets, values, calldatas, description);
        
        // Set current proposal
        setCurrentProposal(id, description);

        return ret;
    }
}
