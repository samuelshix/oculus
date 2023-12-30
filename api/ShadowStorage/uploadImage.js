import anchor from "@project-serum/anchor";
import { Connection, Keypair } from "@solana/web3.js";
import { ShdwDrive } from "@shadow-drive/sdk";
import dotenv from 'dotenv';
dotenv.config();

let key;
if (process.env.NODE_ENV === 'development') {
    fetch('./N1VSg77Gwz2Raz48PYETHKRLYdxDVvcuespZK9wdK99.json')
    .then((response) => {
        key = response.json()
    })
  }
if (process.env.NODE_ENV === 'production') {
    key = process.env.SHADOW_SECRET_KEY
  }
  
export async function uploadImage(fileBuffer) {
    let secretKey = Uint8Array.from(key);
    let keypair = Keypair.fromSecretKey(secretKey);
    const connection = new Connection(
        `https://rpc.helius.xyz/?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`, "confirmed"
    );
    console.log(fileBuffer)
    const wallet = new anchor.Wallet(keypair);
    const drive = await new ShdwDrive(connection, wallet).init();
    const accts = await drive.getStorageAccounts("v2");
    let acctPubKey = new anchor.web3.PublicKey(accts[0].publicKey);
    const fileToUpload = {
        name: "Porftolio1.png",
        file: fileBuffer,
    };
    console.log(fileToUpload)
    const uploadFile = await drive.uploadFile(acctPubKey, fileToUpload);
    console.log(uploadFile);
    return uploadFile.finalized_locations[0];
}
