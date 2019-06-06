/* eslint-disable */
module.exports = {
  "Account": {
    "addresses": {},
    "abi": [
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "name": "devices",
        "outputs": [
          {
            "name": "isOwner",
            "type": "bool"
          },
          {
            "name": "exists",
            "type": "bool"
          },
          {
            "name": "existed",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0xe7b4cac6"
      },
      {
        "inputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor",
        "signature": "constructor"
      },
      {
        "payable": true,
        "stateMutability": "payable",
        "type": "fallback"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "device",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "isOwner",
            "type": "bool"
          }
        ],
        "name": "DeviceAdded",
        "type": "event",
        "signature": "0x3525178f8d4a5c0dc1e61a0ede8d6a7a9ea67a23ec515983bbb940be4b419650"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "device",
            "type": "address"
          }
        ],
        "name": "DeviceRemoved",
        "type": "event",
        "signature": "0x15c62ec158a6c18af42b447791266b9b0764ba2a6df610890d4da85c3d4185db"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "recipient",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "value",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "data",
            "type": "bytes"
          },
          {
            "indexed": false,
            "name": "response",
            "type": "bytes"
          }
        ],
        "name": "TransactionExecuted",
        "type": "event",
        "signature": "0x012ae8711b8dc37e405d8e422569d1ee78d52d76bc8fe2a9ea81ffe17569e51a"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_device",
            "type": "address"
          },
          {
            "name": "_isOwner",
            "type": "bool"
          }
        ],
        "name": "addDevice",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x811d54dc"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_device",
            "type": "address"
          }
        ],
        "name": "removeDevice",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x1f7b6324"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_recipient",
            "type": "address"
          },
          {
            "name": "_value",
            "type": "uint256"
          },
          {
            "name": "_data",
            "type": "bytes"
          }
        ],
        "name": "executeTransaction",
        "outputs": [
          {
            "name": "_response",
            "type": "bytes"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x3f579f42"
      }
    ],
    "byteCodeHash": "0x38f70e2d9e8c2700595640dfbfb0b46d0f1af5c7873f7cf6d88d2565ef97f5cd"
  },
  "AccountProvider": {
    "addresses": {
      "3": "0x69Cd4Fd7B5622F892Ee8cFCaa20A930AecA64cAB",
      "4": "0xD76fB46c4af359a1905193572832524987Ca5E24",
      "42": "0x4fd179a80dFCa5f1529016F45f2eC74ea452B54C"
    },
    "abi": [
      {
        "constant": false,
        "inputs": [
          {
            "name": "_rootNode",
            "type": "bytes32"
          }
        ],
        "name": "verifyEnsRootNode",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x04aa74cb"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_node",
            "type": "bytes32"
          }
        ],
        "name": "addr",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x3b3b57de"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_rootNode",
            "type": "bytes32"
          }
        ],
        "name": "addEnsRootNode",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x416ae7ff"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "guardian",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x452a9320"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "bytes32"
          }
        ],
        "name": "ensRootNodes",
        "outputs": [
          {
            "name": "owner",
            "type": "address"
          },
          {
            "name": "verified",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x7ff4dfd0"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_rootNode",
            "type": "bytes32"
          }
        ],
        "name": "releaseEnsRootNode",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0xbb223ce4"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_node",
            "type": "bytes32"
          },
          {
            "name": "_addr",
            "type": "address"
          }
        ],
        "name": "setAddr",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0xd5fa2b00"
      },
      {
        "inputs": [
          {
            "name": "_guardian",
            "type": "address"
          },
          {
            "name": "_accountContractCode",
            "type": "bytes"
          },
          {
            "name": "_accountProxy",
            "type": "address"
          },
          {
            "name": "_ens",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor",
        "signature": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "account",
            "type": "address"
          }
        ],
        "name": "AccountCreated",
        "type": "event",
        "signature": "0x805996f252884581e2f74cf3d2b03564d5ec26ccc90850ae12653dc1b72d1fa2"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "rootNode",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "EnsRootNodeAdded",
        "type": "event",
        "signature": "0x44a96c3928a5c6ba670970f10868d09235a6b7a5770c2ebbf244e2228e546f5c"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "rootNode",
            "type": "bytes32"
          }
        ],
        "name": "EnsRootNodeVerified",
        "type": "event",
        "signature": "0x3c1e12021a68eb78df268e4fed874721bb38a7b278d9029db9a7b2056592baf2"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "rootNode",
            "type": "bytes32"
          }
        ],
        "name": "EnsRootNodeReleased",
        "type": "event",
        "signature": "0xc98be4d6a6f25550c39fb4e66d7ecd9ed01b3a569eff063b00e6608270d31f3d"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "node",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "name": "addr",
            "type": "address"
          }
        ],
        "name": "AddrChanged",
        "type": "event",
        "signature": "0x52d7d861f09ab3d26239d492e8968629f95e9e318cf0b73bfddc441522a15fd2"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_ensLabel",
            "type": "bytes32"
          },
          {
            "name": "_ensNode",
            "type": "bytes32"
          },
          {
            "name": "_refundGas",
            "type": "uint256"
          },
          {
            "name": "_signature",
            "type": "bytes"
          }
        ],
        "name": "createAccount",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0xc6147fc8"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_accountId",
            "type": "uint256"
          },
          {
            "name": "_device",
            "type": "address"
          },
          {
            "name": "_ensLabel",
            "type": "bytes32"
          },
          {
            "name": "_ensNode",
            "type": "bytes32"
          },
          {
            "name": "_refundGas",
            "type": "uint256"
          }
        ],
        "name": "unsafeCreateAccount",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x188b954f"
      }
    ],
    "byteCodeHash": null
  },
  "AccountProxy": {
    "addresses": {
      "3": "0xA6796c83024258E0aC222aC19f19def9D8f2e032",
      "4": "0x6Aa0aE42bDc9DddC0e128af101fCF9198fAaD73a",
      "42": "0xe77B0413Fa997f36d5aA4f3f19868C25F3f07548"
    },
    "abi": [
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "name": "accounts",
        "outputs": [
          {
            "name": "nonce",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x5e5c06e2"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "account",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "nonce",
            "type": "uint256"
          }
        ],
        "name": "NewAccountOwnerCall",
        "type": "event",
        "signature": "0xabdd351df118af9f4fddc77805d3855fc9b508fd37b13ed9bda0027c30d7aafb"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_account",
            "type": "address"
          },
          {
            "name": "_nonce",
            "type": "uint256"
          },
          {
            "name": "_data",
            "type": "bytes"
          },
          {
            "name": "_fixedGas",
            "type": "uint256"
          },
          {
            "name": "_signature",
            "type": "bytes"
          }
        ],
        "name": "forwardAccountOwnerCall",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x09403cb6"
      }
    ],
    "byteCodeHash": null
  },
  "AccountFriendRecovery": {
    "addresses": {
      "3": "0x4d128BCfe76136d7Cf067F190757654c282d0875",
      "4": "0xF5932C003DC297A74d920eAC231996D1d629C613",
      "42": "0xc11F17D00569be0F279590DAa84eadBF5030219d"
    },
    "abi": [
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "name": "accounts",
        "outputs": [
          {
            "name": "nonce",
            "type": "uint256"
          },
          {
            "name": "requiredFriends",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x5e5c06e2"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "account",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "requiredFriends",
            "type": "uint256"
          }
        ],
        "name": "RequiredFriendsChanged",
        "type": "event",
        "signature": "0x66f92348ae6d17cffb78f8bb20d50b5ac8c983e02794942c183116d3add7d2c0"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "account",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "friends",
            "type": "address[]"
          }
        ],
        "name": "FriendsChanged",
        "type": "event",
        "signature": "0xca4c23b9ce256db47e380479ed723fa548baf50a55c53aec593bbc3c8be1bcf1"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_requiredFriends",
            "type": "uint256"
          },
          {
            "name": "_friends",
            "type": "address[]"
          }
        ],
        "name": "setup",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x0e298303"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_requiredFriends",
            "type": "uint256"
          }
        ],
        "name": "setRequiredFriends",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x4d56bbc9"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_friends",
            "type": "address[]"
          }
        ],
        "name": "setFriends",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0xb8755fe2"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_account",
            "type": "address"
          },
          {
            "name": "_device",
            "type": "address"
          },
          {
            "name": "_friends",
            "type": "address[]"
          },
          {
            "name": "_signatures",
            "type": "bytes"
          },
          {
            "name": "_gasFee",
            "type": "uint256"
          }
        ],
        "name": "recoverAccount",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x53f3aac6"
      }
    ],
    "byteCodeHash": null
  },
  "ENSRegistry": {
    "addresses": {
      "3": "0xAcCB4436F9f1C16D9384Ed95180D9Eee2dC293BD",
      "4": "0x15DE0EA6B145Ffc544Cc955005179b2Bd5230CD2",
      "42": "0x0297206c7a08F9Dd14D76D1f66D56d4463cF9d3B"
    },
    "abi": [
      {
        "inputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor",
        "signature": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "node",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "name": "label",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "NewOwner",
        "type": "event",
        "signature": "0xce0457fe73731f824cc272376169235128c118b49d344817417c6d108d155e82"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "node",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "Transfer",
        "type": "event",
        "signature": "0xd4735d920b0f87494915f556dd9b54c8f309026070caea5c737245152564d266"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "node",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "name": "resolver",
            "type": "address"
          }
        ],
        "name": "NewResolver",
        "type": "event",
        "signature": "0x335721b01866dc23fbee8b6b2c7b1e14d6f05c28cd35a2c934239f94095602a0"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "node",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "name": "ttl",
            "type": "uint64"
          }
        ],
        "name": "NewTTL",
        "type": "event",
        "signature": "0x1d4f9bbfc9cab89d66e1a1562f2233ccbf1308cb4f63de2ead5787adddb8fa68"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "node",
            "type": "bytes32"
          },
          {
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "setOwner",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x5b0fc9c3"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "node",
            "type": "bytes32"
          },
          {
            "name": "label",
            "type": "bytes32"
          },
          {
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "setSubnodeOwner",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x06ab5923"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "node",
            "type": "bytes32"
          },
          {
            "name": "resolver",
            "type": "address"
          }
        ],
        "name": "setResolver",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x1896f70a"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "node",
            "type": "bytes32"
          },
          {
            "name": "ttl",
            "type": "uint64"
          }
        ],
        "name": "setTTL",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x14ab9038"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "node",
            "type": "bytes32"
          }
        ],
        "name": "owner",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x02571be3"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "node",
            "type": "bytes32"
          }
        ],
        "name": "resolver",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x0178b8bf"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "node",
            "type": "bytes32"
          }
        ],
        "name": "ttl",
        "outputs": [
          {
            "name": "",
            "type": "uint64"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x16a25cbd"
      }
    ],
    "byteCodeHash": null
  },
  "ENSResolver": {
    "addresses": {},
    "abi": [
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "node",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "name": "addr",
            "type": "address"
          }
        ],
        "name": "AddrChanged",
        "type": "event"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_node",
            "type": "bytes32"
          }
        ],
        "name": "addr",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_node",
            "type": "bytes32"
          },
          {
            "name": "_addr",
            "type": "address"
          }
        ],
        "name": "setAddr",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    "byteCodeHash": null
  },
  "Guardian": {
    "addresses": {
      "3": "0xfE6F6c554D1a32BE5b65728B9AF8a7c283642791",
      "4": "0xfb19f10c1dA444d12E51C1429665a3A774022c4d",
      "42": "0x1AEc00Fea01ef534e76DA54796d218E9a5696688"
    },
    "abi": null,
    "byteCodeHash": null
  },
  "VirtualPaymentManager": {
    "addresses": {
      "3": "0x39B778aA9c0D7CA8e4287C5F538287b3f50a7142",
      "4": "0xCccD693173C0fe39533388DE8C07C706416D3b40",
      "42": "0xf9D669e8057D0c9bbf90FBe66b34B3eBA3b79f8c"
    },
    "abi": [
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "bytes32"
          }
        ],
        "name": "payments",
        "outputs": [
          {
            "name": "value",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x0716326d"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "guardian",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x452a9320"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "depositWithdrawalLockPeriod",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x525fb194"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "name": "deposits",
        "outputs": [
          {
            "name": "value",
            "type": "uint256"
          },
          {
            "name": "withdrawalUnlockedAt",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0xfc7e286d"
      },
      {
        "inputs": [
          {
            "name": "_guardian",
            "type": "address"
          },
          {
            "name": "_depositWithdrawalLockPeriod",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor",
        "signature": "constructor"
      },
      {
        "payable": true,
        "stateMutability": "payable",
        "type": "fallback"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "sender",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "NewDeposit",
        "type": "event",
        "signature": "0x2cb77763bc1e8490c1a904905c4d74b4269919aca114464f4bb4d911e60de364"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "receiver",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "NewWithdrawal",
        "type": "event",
        "signature": "0x6e2e05fb6a732995d6952d9158ca6b75f11cc6bf5a4af943aa1eb475a249440b"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "receiver",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "unlockedAt",
            "type": "uint256"
          }
        ],
        "name": "NewWithdrawalRequest",
        "type": "event",
        "signature": "0x4c9080ec1aaa52271e38e548e49fca5ee3a853d5a59759393034ac00ca2ea7d7"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "sender",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "receiver",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "id",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "NewPayment",
        "type": "event",
        "signature": "0xf62e438cfa75c1fc743ada55b6e1437d24c0e0f83ddf8a7b62ef765e65285e86"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_sender",
            "type": "address"
          },
          {
            "name": "_receiver",
            "type": "address"
          },
          {
            "name": "_id",
            "type": "uint256"
          },
          {
            "name": "_value",
            "type": "uint256"
          },
          {
            "name": "_senderSignature",
            "type": "bytes"
          },
          {
            "name": "_guardianSignature",
            "type": "bytes"
          }
        ],
        "name": "depositPayment",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x2438f435"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_sender",
            "type": "address"
          },
          {
            "name": "_receiver",
            "type": "address"
          },
          {
            "name": "_id",
            "type": "uint256"
          },
          {
            "name": "_value",
            "type": "uint256"
          },
          {
            "name": "_senderSignature",
            "type": "bytes"
          },
          {
            "name": "_guardianSignature",
            "type": "bytes"
          }
        ],
        "name": "withdrawPayment",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0xa26ee3ae"
      },
      {
        "constant": false,
        "inputs": [],
        "name": "withdrawDeposit",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x117df088"
      }
    ],
    "byteCodeHash": null
  }
};
