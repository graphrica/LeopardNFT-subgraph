import { createMockedFunction, newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes, } from "@graphprotocol/graph-ts"
import {
  Transfer
} from "../generated/LeopardNFT/LeopardNFT"
import {Leopard, User} from "../generated/schema";

export const userOneAddress = Address.fromString("0x0000000000000000000000000000000000000001");
export const userTwoAddress = Address.fromString("0x0000000000000000000000000000000000000002");
export const userThreeAddress = Address.fromString("0x0000000000000000000000000000000000000003");
export const collectionAddress = Address.fromString("0x1000000000000000000000000000000000000004");
export const ADDRESS_ZERO = Address.fromString("0x0000000000000000000000000000000000000000");

export function createTransferEvent(
  from: Address,
  to: Address,
  tokenId: BigInt,
  address: Address,
  hash: Bytes,
  blockNumber: BigInt
): Transfer {
  //@ts-ignore
  let transferEvent = changetype<Transfer>(newMockEvent())

  transferEvent.parameters = new Array()
  transferEvent.address = address;
  transferEvent.transaction.hash = hash;
  transferEvent.block.number = blockNumber;

  transferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return transferEvent
}

export function createLeopard(tokenID: BigInt, collectionAddress: Address, ownerID: string, blockNumber: BigInt): void {
  let leopard = new Leopard(tokenID.toHexString());
  leopard.collectionAddress = collectionAddress;
  leopard.owner = ownerID;
  leopard.previousOwner = ADDRESS_ZERO.toHexString();
  leopard.lastModifiedBlock = blockNumber;
  leopard.tokenID = tokenID;
  leopard.uri = "IPFS";
  leopard.metadata = "IPFS";
  leopard.save()
}


export function createMockedURICall(address: Address, tokenId: BigInt, expectedReturn: string) : void {
  
  createMockedFunction(address, "tokenURI", "tokenURI(uint256):(string)")
  .withArgs([ethereum.Value.fromUnsignedBigInt(tokenId)]).returns([ethereum.Value.fromString("IPFS")])
}

export function getOrCreateUser(address: Address) : User | null {
  let user = User.load(address.toHexString());
  if(user == null) {
      user = new User(address.toHexString());
      user.save();
  }
  return user;
}