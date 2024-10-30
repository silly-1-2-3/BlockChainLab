// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleAMM is ERC20 {

    address public blockOwner;

    constructor() ERC20("SimpleAMM", "AMM"){blockOwner = msg.sender;}

    function toToken() external payable {
        require(msg.value > 0, "ether transforming to token needs ether > 0");
        _mint(msg.sender, msg.value);
    }

    function toEther(uint tokens) external payable {
        require(tokens > 0, "token transforming to ether needs token > 0");
        require(balanceOf(msg.sender) >= tokens, "token transforming needs enough tokens");
        uint256 ethers = tokens;
        require(address(this).balance >= ethers, "transforming needs more ethers in bank");
        _burn(msg.sender, tokens);
        payable(msg.sender).transfer(ethers);
    }

    function restCredit() external view returns (uint) {return address(this).balance;}
}
