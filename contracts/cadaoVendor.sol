
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./cadaoToken.sol";

contract CadaoVendor is Ownable {
    CadaoToken token;
    uint256 public tokensPerEth = 1000;

    constructor(address tokAddress){
        token = CadaoToken(tokAddress);
    }

    /* Buy tokens function */
    function buyTokens() public payable returns(uint256 tokenAmount){
        require(msg.value > 0, "No ether was sent!");
        
        uint256 amountToBuy = msg.value * tokensPerEth;

        uint256 vendorBalance = token.balanceOf(address(this));
        require(vendorBalance > amountToBuy, "Vendor has not enough tokens!");

        bool sent = token.transfer(msg.sender, amountToBuy);
        require(sent, "Failed to send tokens!");

        return amountToBuy;
    }
    
    function withdraw() public onlyOwner {
        uint256 ownerBalance = address(this).balance;
        require(ownerBalance > 0, "No balance to withdraw!");

        (bool sent,) = msg.sender.call{value: address(this).balance}("");
        require(sent, "Failed to send user balance to the owner");
      }
}
