import {
  describe,
  test,
  clearStore,
  afterEach,
  assert
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { handleTransfer } from "../src/leopard-nft"
import { ADDRESS_ZERO, collectionAddress, createLeopard, createMockedURICall, createTransferEvent, getOrCreateUser, userOneAddress, userThreeAddress, userTwoAddress } from "./leopard-nft-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Handle Transfer Event", () => {
  afterEach(() => {
    clearStore()
  })


  test("Mint", () => {
    //Arrange
    getOrCreateUser(userTwoAddress)
    let tokenId = BigInt.fromI32(4);
    let transactionHash = Bytes.fromHexString("0x02082029394f438ca1472adeb502c30376df44983ca7cc1f99c4917e14223e90");
    let blockNumber = BigInt.fromString("4");
    let mintEvent = createTransferEvent(ADDRESS_ZERO, userTwoAddress, tokenId, collectionAddress, transactionHash, blockNumber);
    createMockedURICall(collectionAddress, tokenId, "IPFS");

    //Act
    handleTransfer(mintEvent, true)

    //Assert
    assert.fieldEquals("Leopard", tokenId.toHexString(), "owner", userTwoAddress.toHexString());
    assert.fieldEquals("Mint", transactionHash.toHexString(), "blockNumber", blockNumber.toString());
    assert.fieldEquals("Mint", transactionHash.toHexString(), "receiver", userTwoAddress.toHexString());
    assert.fieldEquals("Mint", transactionHash.toHexString(), "leopard", tokenId.toHexString())
  })
  test("Burn", () => {
    //Arrange
    getOrCreateUser(userOneAddress)
    createLeopard(BigInt.fromI32(1), collectionAddress, userOneAddress.toString(), BigInt.fromString("1"))
   
    let tokenId = BigInt.fromI32(1);
    let transactionHash = Bytes.fromHexString("0x02082029394f438ca1472adeb502c30376df44983ca7cc1f99c4917e14223e90");
    let blockNumber = BigInt.fromString("4");
    let burnEvent = createTransferEvent(userOneAddress, ADDRESS_ZERO, tokenId, collectionAddress, transactionHash, blockNumber);
   

    //Act
    handleTransfer(burnEvent, true)

    //Assert
    assert.fieldEquals("Leopard", tokenId.toHexString(), "owner", ADDRESS_ZERO.toHexString())
    assert.fieldEquals("Leopard", tokenId.toHexString(), "removed", blockNumber.toString())
    assert.fieldEquals("Burn", transactionHash.toHexString(), "sender", userOneAddress.toHexString())
    assert.fieldEquals("Burn", transactionHash.toHexString(), "leopard", tokenId.toHexString())

  })
  test("Transfer", () => {
   //Arrange
   getOrCreateUser(userOneAddress)
   createLeopard(BigInt.fromI32(1), collectionAddress, userOneAddress.toString(), BigInt.fromString("1"))

   let tokenId = BigInt.fromI32(1);
   let transactionHash = Bytes.fromHexString("0x02082029394f438ca1472adeb502c30376df44983ca7cc1f99c4917e14223e90");
   let blockNumber = BigInt.fromString("4");
   let transferEvent = createTransferEvent(userOneAddress, userTwoAddress, tokenId, collectionAddress, transactionHash, blockNumber);

   //Act
   handleTransfer(transferEvent, true)
  
   //Assert
   assert.fieldEquals("Leopard", tokenId.toHexString(), "owner", userTwoAddress.toHexString());
   assert.fieldEquals("Leopard", tokenId.toHexString(), "lastModifiedBlock", blockNumber.toString());
   assert.fieldEquals("Transfer", transactionHash.toHexString(), "leopard", tokenId.toHexString());
   assert.fieldEquals("Transfer", transactionHash.toHexString(), "sender", userOneAddress.toHexString());
   assert.fieldEquals("Transfer", transactionHash.toHexString(), "receiver", userTwoAddress.toHexString());
  })
})
