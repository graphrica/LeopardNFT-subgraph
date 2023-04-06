import { Bytes, BigInt, Address } from "@graphprotocol/graph-ts";
import { User, Leopard, Burn, Mint, Transfer } from "../generated/schema";
import { LeopardNFT } from "../generated/LeopardNFT/LeopardNFT"; 

export const ADDRESS_ZERO = Address.fromString("0x0000000000000000000000000000000000000000");

export function getOrCreateUser(address: Bytes) : User | null {
    let user = User.load(address.toHexString());
    if(user == null) {
        user = new User(address.toHexString());
        user.save();
    }
    return user;
}

export function createLeopard(tokenID: BigInt, collectionAddress: Bytes, ownerID: string, blockNumber: BigInt): Leopard {
    let leopard = new Leopard(tokenID.toHexString());
    leopard.collectionAddress = collectionAddress;
    leopard.owner = ownerID;
    leopard.lastModifiedBlock = blockNumber;
    leopard.tokenID = tokenID;
    let contract = LeopardNFT.bind(Address.fromBytes(collectionAddress));
    let uriResponse = contract.try_tokenURI(tokenID);
    if(!uriResponse.reverted) {
        leopard.uri = uriResponse.value;
    }
    leopard.save()
    return leopard;
}

export function updateLeopardOwner(tokenID: BigInt, ownerID:string, blockNumber: BigInt) : void {
    let leopard = Leopard.load(tokenID.toHexString());
    if(leopard != null){
        let oldOwner = leopard.owner;
        leopard.previousOwner = oldOwner;
        leopard.owner = ownerID;
        leopard.lastModifiedBlock = blockNumber;
        leopard.save();
    }
}

export function burnLeopard(tokenID: BigInt, blockNumber: BigInt) : void {
    let leopard = Leopard.load(tokenID.toHexString());
    if(leopard != null){
        let oldOwner = leopard.owner;
        leopard.previousOwner = oldOwner;
        leopard.owner = ADDRESS_ZERO.toHexString();
        leopard.lastModifiedBlock = blockNumber;
        leopard.removed = blockNumber;
        leopard.save();
    }
}

export function createMint(txHash: Bytes, tokenID: BigInt, receiverID: string, blockNumber: BigInt, timestamp: BigInt) : void {
    let mint = new Mint(txHash);
    mint.leopard = tokenID.toHexString();
    mint.timestamp = timestamp;
    mint.blockNumber = blockNumber;
    mint.receiver = receiverID;
    mint.save();
}


export function createTransfer(txHash: Bytes, tokenID: BigInt, receiverID: string, senderID: string, blockNumber: BigInt, timestamp: BigInt) : void {
    let transfer = new Transfer(txHash);
    transfer.leopard = tokenID.toHexString();
    transfer.timestamp = timestamp;
    transfer.blockNumber = blockNumber;
    transfer.receiver = receiverID;
    transfer.sender = senderID;
    transfer.save();
}


export function createBurn(txHash: Bytes, tokenID: BigInt, senderID: string, blockNumber: BigInt, timestamp: BigInt) : void {
    let burn = new Burn(txHash);
    burn.leopard = tokenID.toHexString();
    burn.timestamp = timestamp;
    burn.blockNumber = blockNumber;
    burn.sender = senderID;
    burn.save(); 
}