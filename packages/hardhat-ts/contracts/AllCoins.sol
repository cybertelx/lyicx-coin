pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "./Coin.sol";

contract LyicxCoin is Coin {
  constructor() Coin("LyicxCoin", "LYCX") {}
}
