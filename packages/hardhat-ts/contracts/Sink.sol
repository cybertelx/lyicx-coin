pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract Sink is Ownable {
  IERC20 public token;

  using SafeERC20 for IERC20;

  constructor(IERC20 _token) {
    token = _token;
  }

  function drip() public {
    require(token.balanceOf(address(this)) > 0, "Sink is broke");

    if (token.balanceOf(address(this)) > 1000 * 10**18) {
      token.safeTransfer(_msgSender(), 1000 * 10**18);
    } else {
      token.safeTransfer(_msgSender(), token.balanceOf(address(this)));
    }
  }

  function withdraw(uint256 amount) public onlyOwner {
    token.safeTransfer(_msgSender(), amount);
  }
}
