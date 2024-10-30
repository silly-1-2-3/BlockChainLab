import {ethers} from "hardhat";

async function main() {
    const SimpleAMM = await ethers.getContractFactory("SimpleAMM");
    const simpleAMM = await SimpleAMM.deploy();
    await simpleAMM.deployed();
    console.log("SimpleAMM deployed to:", simpleAMM.address);

    const BuyMyRoom = await ethers.getContractFactory("BuyMyRoom");
    const buyMyRoom = await BuyMyRoom.deploy(simpleAMM.address);
    await buyMyRoom.deployed();
    console.log("BuyMyRoom deployed to:", buyMyRoom.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});