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
        currentProposal.description = 'Hola!';
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
        return currentProposal;
    }
    
    function setCurrentProposal(uint256 id, string memory desc) public {
        currentProposal.id = id;
        currentProposal.description = desc;
    }
}
