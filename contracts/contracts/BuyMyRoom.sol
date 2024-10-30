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

    uint[] public theList;

    IERC20 public __ERC20_address;
    address public blockOwner; // who collect the fees

    uint public rate = 1;

    uint public total = 0; // maybe not 0 ? not sure

    constructor(IERC20 __address) ERC721("BuyMyRoom", "BMR") {
        __ERC20_address = __address;
        blockOwner = msg.sender;
    }

    function BuildRoom(address owner) public {
        require(msg.sender == blockOwner, "building needs user as block owner");
        Rooms[total] = Room({owner: owner, price: 0, onListTimestamp: 0, onList: false});
        _safeMint(owner, total);
        total++;
    }

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
        for (uint i = 0; i < arr.length; i ++)
            if (arr[i] == val) {
                arr[i] = arr[arr.length - 1];
                arr.pop();
                break;
            }
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
/*
    function GetFee(uint tokenId) internal view returns (uint) {
        uint res = (block.timestamp - Rooms[tokenId].onListTimestamp) * rate * Rooms[tokenId].price / 3600;
        res = res > Rooms[tokenId].price / 2 ? Rooms[tokenId].price / 2 : res;
        return (res <= 0 ? 1 : res);
    }
*/
    function GetFee(Room memory roomCopy) internal view returns (uint) {
        uint res = (block.timestamp - roomCopy.onListTimestamp) * rate * roomCopy.price / 3600;
        uint mx = roomCopy.price / 2;
        uint mn = 1;
        if( res > mx ) res = mx;
        if( res < mn ) res = mn;
        return res;
    }
/*
    function toAsciiString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint(uint160(x)) / (2 ** (8 * (19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2 * i] = char(hi);
            s[2 * i + 1] = char(lo);
        }
        return string(s);
    }

    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
*/
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

    function GetMyRooms() public view returns (uint[] memory) {
        uint[] memory res = new uint[](balanceOf(msg.sender));
        uint cnt = 0;

        for (uint i = 1; i < total; i ++)
            if (Rooms[i].owner == msg.sender)
                res[cnt++] = i;
        return res;
    }

    function ChangeBlockOwner(address newBlockOwner) public {
        require(blockOwner == msg.sender, "changing block owner needs the user is the old owner");
        blockOwner = newBlockOwner;
    }

}