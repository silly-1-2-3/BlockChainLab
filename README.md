# ZJU-blockchain-course-2024 Lab2

by 叶皓天，3220105788

## Introduction

This project is a combination of two contracts: one ERC721 contract which can mint NFC (we call it "Room") and trade these NFCs, and one ERC20 contract which can transform Ethers to sepcial ERC20 credits. Then the credits we got from ERC20 contract will be used as the currency in ERC721 contract.

I also build a simple browser GUI frontend for easy usage. In total, this project has following features:

- an ERC721 contract which can mint NFCs
- the ERC721 contract can also use ERC20 credits to sell and buy NFCs
- an ERC20 contract used to exchage Ethers for credits and vice versa
- transaction fees were charged during the transaction
- a GUI frontend run on browser (should be working under Ganache network and Metamask browser plugin)
- (two contracts means I finished the bonus point declared in the lab description!)

## Implementation

Two contracts were implemented in this project. Let's begin with the ERC721 one:

#### 1.Declaration of the ERC721 contract ButMyRoom.sol

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// Uncomment the line to use openzeppelin/ERC721,ERC20
// You can use this dependency directly because it has been installed by TA already
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract BuyMyRoom is ERC721 {

    // use a event if you want
    // to represent time you can choose block.timestamp
    event RoomListed(uint256 tokenId, uint256 price, address owner);
    event RoomUnlisted(uint256 tokenId, address owner);
    event RoomTransferred(uint256 tokenId, address owner, address buyer);

    // maybe you need a struct to store Room information
    struct Room {
        address owner;
        uint256 onListTimestamp;
        uint price;
        bool onList;
        // ...
    }

    mapping(uint256 => Room) public Rooms; // A map from Room-index to its information
```

The given codes shows how this ERC721 contract "BuyMyRoom" was declared. It also shows my struct, "Room", which contained useful information. A mapping was used to map the memory to an array Rooms[], which stored all the Room structs.

Some explaination: Room has 4 attributes: owner(which is an address), onListTimestamp(a timestamp when it was listed), price, and a boolean onList(is it on the list or not).

#### 2.The build of our NFC Room

```solidity
    function BuildRoom(address owner) public {
        require(msg.sender == blockOwner, "building needs user as block owner");
        Rooms[total] = Room({owner: owner, price: 0, onListTimestamp: 0, onList: false});
        _safeMint(owner, total);
        total++;
    }
```

Building an NFC Room needs a call of \_safeMint in ERC721, which could mint a NFC for an address (some address of an user). I also allocate a space for future data storage for this NFC. The index of this struct is also important, that it will be called tokenId as one identification of this NFC.

Building takes 2 steps: 1. store the room information in memory 2. mint a NFT numbered _total_ for the owner, and the counter _total_ should increase

#### 3.List Rooms and Taking them off

```solidity
    function ListRoom(uint tokenId, uint price) public {
        require(msg.sender == ownerOf(tokenId), "listing needs user as Room owner");
        require(price > 0, "price should greater than 0");
        require(Rooms[tokenId].onList == false, "listing needs the Room not on the list");

        Rooms[tokenId].price = price;
        Rooms[tokenId].onListTimestamp = block.timestamp;
        Rooms[tokenId].onList = true;

        theList.push(tokenId);
        emit RoomListed(tokenId, price, ownerOf(tokenId));
    }

    function RemoveFromArray(uint[] storage arr, uint val) internal {
        //    omitted
    }

    function UnlistRoom(uint tokenId) public {
        require(msg.sender == ownerOf(tokenId), "unlisting needs user as Room owner");
        require(tokenId >= 0 && tokenId < total, "cannot find this Room");
        require(Rooms[tokenId].onList == true, "unlisting needs the Room on the list");

        Rooms[tokenId].onList = false;
        RemoveFromArray(theList, tokenId);

        emit RoomUnlisted(tokenId, ownerOf(tokenId));
    }

    function GetListedRooms() public view returns (uint[] memory) {return theList;}
```

For we need to make transactions upon this platform, listing one's rooms and taking them off are important. These functions can list them or vice versa. When one room
was listed, some important characters, like the price and the listing time stamp, would be changed along. 

I maintained a list called _theList_, which stores the tokenId(s) of the on-list _Rooms_. When listing one _Room_, the attribute of this room will be updated and its tokenId will be added to the _theList_. 

Function _UnlistRoom_ is very alike: remove the tokenId from _theList_, and update the attributes.

#### 4.Buy a romm

```solidity
    function BuyRoom(uint tokenId) public {
        Room memory roomCopy = Rooms[tokenId];
        require(roomCopy.onList == true, "buying needs Room on the list");
        require(roomCopy.owner != msg.sender, "buying needs others to buy, not the owner");

        uint fee = GetFee(roomCopy);

        __ERC20_address.transferFrom(msg.sender, roomCopy.owner, roomCopy.price - fee);
        __ERC20_address.transferFrom(msg.sender, blockOwner, fee);

        _transfer(roomCopy.owner, msg.sender, tokenId);

        Rooms[tokenId].owner = msg.sender;
        Rooms[tokenId].onList = false;
        RemoveFromArray(theList, tokenId);

        emit RoomTransferred(tokenId, roomCopy.owner, msg.sender);
    }
```

This function may be the most important one. I haven't use the _payable_ attribute, because I set that the purchase could only be done with ERC20 credits but not Ethernums. In this function, the owner of the selected room was changed, and some ERC20 credits were transfered through an ERC20 interface _\__ERC20_address_ to call ERC20 function _transferFrom_.

One thing to mention is that I calculate a fee, and transfer some fee to the contract-deployer (sorry I called him "blockOwner" in code and that was wrong). This will be important in real environment, for this will encourage the minters of the block and other important character who provide services for dealers.

And this ERC721 contract has more functions, but rest functions are of less importance. Let's show the ERC20 part:

#### 5.Exchange the ERC20 credits and Ethernums

```solidity
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
```

The ERC20 contract SimpleAMM implements a simple automated market maker, which will exchange 1 credit for 1 Ethernum. I make two _payable_ functions toToken and toEther here, exchanging two currencies.

Function _toToken_ looks shorter, because paying Ethernum to contract need no explicit call to transfer the Ethernum; they will be automatically stored inside the contract. So we just need to mint some credits for the message sender.

Function _toEther_ looks longer. We need to take out Ethernums from the contract and transfer them to message sender. Meanwhile, the ERC20 credits should be burnt because they were comsumed to get Ethernums. 

## Frontend display

#### 1.Login

![](./resources/pics/屏幕截图%202024-10-31%20202130.png)

Login page: need you to login Metamask at first. Once you login to Metamask, frontend will detect and help you set your login account.

#### 2.Overview of interface

![](./resources/pics/屏幕截图%202024-10-31%20202158.png)

![](./resources/pics/屏幕截图%202024-10-31%20202407.png)

![](./resources/pics/屏幕截图%202024-10-31%20202438.png)

Here are the simple overview of the interface. I will explain how they work later.

#### 3.Build a "Room"

![](./resources/pics/屏幕截图%202024-10-31%20202534.png)

Put user's address into the text box and click. Metamask will response and ask you to comfirm this contract.

#### 4.Buy ERC20 credits

![](./resources/pics/屏幕截图%202024-10-31%20202611.png)

Put how many Ethernum you'd like to pay (and it equals to how many credits you'll get) and comfirm. After comfirming, go to the top of the page, and click to refresh rest credits count. 

![](./resources/pics/屏幕截图%202024-10-31%20202639.png)

You can see that the balance changed. 

Exchanging credits for Ethernum is very alike, and you can operate like the same. 

#### 5.List "Room" and buy them with credits

![](./resources/pics/屏幕截图%202024-10-31%20202825.png)

List the room with tokenIds (if you do own them), and you can set price in credits.

Then refresh the lists upon, you can see what you've listed:

![](./resources/pics/屏幕截图%202024-10-31%20202851.png)

Change an account (because you cannot buy your own room), and exchange some credits if not enough. Then click buy, you can see Metamask asking you to permit a gas limit:

![](./resources/pics/屏幕截图%202024-10-31%20203009.png)

choose "Next" and continue:

![](./resources/pics/屏幕截图%202024-10-31%20203153.png)

then the room will be transfered to your account.

#### 6. Change root owner

![](./resources/pics/屏幕截图%202024-10-31%20203247.png)

This operation will change the root owner. Root owner is the character who can build rooms for others and collect the transaction fees. 

## How to start running?

1. Lauch Ganache app and Metamask plugin locally

2. run under`./contracts` :
   
   ```bash
   npm install
   ```

3. under `./contracts` run:
   
   ```bash
    npx hardhat run scripts/deploy.ts --network ganache
   ```

4. collect the result in the console, and copy the result to `${project}/frontend/src/utils/contract-address.json`. This will help the frontend connects to the contracts.

5. go to `./frontend`

6. run under `./frontend` :
   
   ```bash
   npm install
   npm run start
   ```

## References

- 课程的参考Demo见：[DEMOs](https://github.com/LBruyne/blockchain-course-demos)。

- 快速实现 ERC721 和 ERC20：[模版](https://wizard.openzeppelin.com/#erc20)。记得安装相关依赖 ``"@openzeppelin/contracts": "^5.0.0"``。

- 如何实现ETH和ERC20的兑换？ [参考讲解](https://www.wtf.academy/en/docs/solidity-103/DEX/)

如果有其它参考的内容，也请在这里陈列。
