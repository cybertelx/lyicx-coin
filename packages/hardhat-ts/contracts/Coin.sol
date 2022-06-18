pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract Coin is ERC20, Ownable {
  constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) {}

  function adminMint(address user, uint256 amount) public onlyOwner {
    _mint(user, amount);
  }

  function adminBurn(address user, uint256 amount) public onlyOwner {
    _burn(user, amount);
  }
}
