import {HardhatUserConfig} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
    solidity: "0.8.20",
    networks: {
        ganache: {
            // rpc url, change it according to your ganache configuration
            url: 'http://localhost:8545',
            // the private key of signers, change it according to your ganache user
            accounts: [
                '0x99121927230eba98265e2c31d3e8905f87e7603e2211ec6806d9f57e9b022569',
                '0x1bdf350212d44861554f78d4b498749c741c5a58c03b34e75ccd4241ea9a80b0',
                '0xf515e6f9c6ff5a3836c4bc492e3f54993b6d0c2af09539aaa0a1517975a2fa50',
                '0xe0cda371a6a81264fe4c65b3d52df21842442f37215e765f31f53bbeebdc86a6',
                '0xb72f7ec105a10ef3d9c3f6daa7b2fae652f29008e58e9a5e48f9e8e7f133b552',
                '0xdcda6b80761fa8950fa2bc3f27b9fdc99685700c842608bdb2849d393b55ef03',
                '0x32efe3c21f7cfd04a8b266e295d8d077195fe155189297f8618302b68145289b',
                '0xda04e269055acc5a6730f04c7875246d6a011953d74cc3d43fda27446ae3c91e',
                '0xe565fc6cbcf6a24fea107a5fa62fc42bf1d6e1bdbf9c609203193032843f588e',
                '0xf71b0fe1559808f80ca12f01a7c144ecfcf2f4e4e1c7543df2ae1cd9b31a9515'
            ]
        },
    },
};

export default config;
