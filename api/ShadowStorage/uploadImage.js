import anchor from "@project-serum/anchor";
import { Connection, Keypair } from "@solana/web3.js";
import { ShdwDrive } from "@shadow-drive/sdk";
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

export async function uploadImage(fileBuffer) {
    let key = process.env.SHADOW_SECRET_KEY.split(' ')
    console.log(key)
    let keypair = Keypair.fromSecretKey(Uint8Array.from(key));
    const connection = new Connection(
        `https://rpc.helius.xyz/?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`, "confirmed"
    );
    const wallet = new anchor.Wallet(keypair);
    const drive = await new ShdwDrive(connection, wallet).init();
    const accts = await drive.getStorageAccounts("v2");
    let acctPubKey = new anchor.web3.PublicKey(accts[0].publicKey);
    const fileToUpload = {
        name: "Porftolio.png",
        file: fileBuffer,
    };
    const uploadFile = await drive.uploadFile(acctPubKey, fileToUpload);
    console.log(uploadFile);
    return uploadFile.finalized_locations[0];
}
