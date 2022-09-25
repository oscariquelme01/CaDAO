// contracts/Box.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";

contract Box is Ownable { 

    uint256 private value;

    constructor (address owner ){
        _transferOwnership(owner);
    }

    event valueChanged(uint256 newValue);

    // emmits the valueChanged event
    function store(uint256 updatedValue) public onlyOwner{ 
        value = updatedValue;
    }

    function retrieve() public view returns(uint256){ 
        return value;
    }

}
