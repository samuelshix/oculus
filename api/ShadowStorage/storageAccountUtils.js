import anchor from "@project-serum/anchor";
import { Connection, Keypair } from "@solana/web3.js";
import { ShdwDrive } from "@shadow-drive/sdk";
import key from '../../N1VSg77Gwz2Raz48PYETHKRLYdxDVvcuespZK9wdK99.json' assert { type: "json"};

async function main() {
  let secretKey = Uint8Array.from(key);
  let keypair = Keypair.fromSecretKey(secretKey);
  const connection = new Connection(
    `https://near-tabina-fast-mainnet.helius-rpc.com/`, "confirmed"
  );
  const wallet = new anchor.Wallet(keypair);
  const drive = await new ShdwDrive(connection, wallet).init();
  const accts = await drive.getStorageAccounts();
  let acctPubKey = new anchor.web3.PublicKey(accts[0].publicKey);
  console.log(acctPubKey)
  // const addStorageRes = await drive.addStorage(acctPubKey, "10MB");
  const topUpRes = await drive.topUp(acctPubKey, 9000000000);
  console.log(topUpRes)
  // const test = await drive.getStorageAccount()

}
main();
