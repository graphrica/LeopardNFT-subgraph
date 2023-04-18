import { log } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/LeopardNFT/LeopardNFT";
import {
  ADDRESS_ZERO,
  burnLeopard,
  createBurn,
  createLeopard,
  createMint,
  createTransfer,
  getOrCreateUser,
  updateLeopardOwner,
} from "./helper";

export function handleTransfer(event: Transfer): void {
  // If the from is the zeroAddress -> MINT
  // If the to is the zeroAddress -> BURN
  // Everything else -> Transfer
  log.info("TRANSFER - txhash = {}, tokenId = {}, from = {}, to = {}", [
    event.transaction.hash.toHexString(),
    event.params.tokenId.toHexString(),
    event.params.from.toHexString(),
    event.params.to.toHexString(),
  ]);

  if (event.params.from == ADDRESS_ZERO) {
    // MINT
    getOrCreateUser(event.params.from);
    let receiver = getOrCreateUser(event.params.to);
    if (receiver != null) {
      createLeopard(
        event.params.tokenId,
        event.address,
        receiver.id,
        event.block.number
      );
      createMint(
        event.transaction.hash,
        event.params.tokenId,
        receiver.id,
        event.block.number,
        event.block.timestamp
      );
    }
  } else if (event.params.to == ADDRESS_ZERO) {
    // BURN
    let sender = getOrCreateUser(event.params.from);
    if (sender != null) {
      burnLeopard(event.params.tokenId, event.block.number);
      createBurn(
        event.transaction.hash,
        event.params.tokenId,
        sender.id,
        event.block.number,
        event.block.timestamp
      );
    }
  } else {
    // TRANSFER

    let sender = getOrCreateUser(event.params.from);
    let receiver = getOrCreateUser(event.params.to);

    if (sender != null && receiver != null) {
      updateLeopardOwner(event.params.tokenId, receiver.id, event.block.number);
      createTransfer(
        event.transaction.hash,
        event.params.tokenId,
        receiver.id,
        sender.id,
        event.block.number,
        event.block.timestamp
      );
    }
  }
}
