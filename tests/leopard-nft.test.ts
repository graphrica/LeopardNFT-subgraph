import {
  describe,
  test,
  clearStore,
  afterEach,
  beforeEach,
  assert,
  dataSourceMock
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes, DataSourceContext, Value } from "@graphprotocol/graph-ts"
import { handleTransfer } from "../src/leopard-nft"
import { ADDRESS_ZERO, collectionAddress, createLeopard, createMockedURICall, createTransferEvent, getOrCreateUser, userOneAddress, userThreeAddress, userTwoAddress } from "./leopard-nft-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Handle Transfer Event", () => {
  beforeEach(() => {
    getOrCreateUser(userOneAddress)
    getOrCreateUser(userTwoAddress)
    getOrCreateUser(userThreeAddress)

  })

  afterEach(() => {
    clearStore()
  })


  test("Mint", () => {
    //Arrange
    getOrCreateUser(userTwoAddress)
    let tokenId = BigInt.fromI32(4);
    let transactionHash = Bytes.fromHexString("0x123");
    let blockNumber = BigInt.fromString("4");
    let mintEvent = createTransferEvent(ADDRESS_ZERO, userTwoAddress, tokenId, collectionAddress, transactionHash, blockNumber);
    createMockedURICall(collectionAddress, tokenId, "IPFS");

    //Act
    handleTransfer(mintEvent)

    //Assert
    assert.fieldEquals("Leopard", tokenId.toHexString(), "owner", userTwoAddress.toHexString());
    assert.fieldEquals("Mint", transactionHash.toHexString(), "blockNumber", blockNumber.toHexString());
    assert.fieldEquals("Mint", transactionHash.toHexString(), "receiver", userTwoAddress.toHexString());
    assert.fieldEquals("Mint", transactionHash.toHexString(), "leopard", tokenId.toHexString())
  })
  test("Burn", () => {
    //Arrange
    getOrCreateUser(userOneAddress)
    createLeopard(BigInt.fromI32(1), collectionAddress, userOneAddress.toString(), BigInt.fromString("1"))
   
    let tokenId = BigInt.fromI32(1);
    let transactionHash = Bytes.fromHexString("0x1234");
    let blockNumber = BigInt.fromString("4");
    let burnEvent = createTransferEvent(userOneAddress, ADDRESS_ZERO, tokenId, collectionAddress, transactionHash, blockNumber);
   

    //Act
    handleTransfer(burnEvent)

    //Assert
    assert.fieldEquals("Leopard", tokenId.toHexString(), "previousOwner", userOneAddress.toHexString())
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
   let transactionHash = Bytes.fromHexString("0x1234");
   let blockNumber = BigInt.fromString("4");
   let transferEvent = createTransferEvent(userOneAddress, userTwoAddress, tokenId, collectionAddress, transactionHash, blockNumber);

   //Act
   handleTransfer(transferEvent)
  
   //Assert
   assert.fieldEquals("Leopard", tokenId.toHexString(), "owner", userTwoAddress.toHexString());
   assert.fieldEquals("Leopard", tokenId.toHexString(), "previousOwner", userOneAddress.toHexString())
   assert.fieldEquals("Leopard", tokenId.toHexString(), "lastModifiedBlock", blockNumber.toString());
   assert.fieldEquals("Transfer", transactionHash.toHexString(), "leopard", tokenId.toHexString());
   assert.fieldEquals("Transfer", transactionHash.toHexString(), "sender", userOneAddress.toHexString());
   assert.fieldEquals("Transfer", transactionHash.toHexString(), "receiver", userTwoAddress.toHexString());
  })
})
