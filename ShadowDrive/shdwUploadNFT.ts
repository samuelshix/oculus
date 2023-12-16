import * as anchor from "@project-serum/anchor";
import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js";
import { ShdwDrive, ShadowFile } from "@shadow-drive/sdk";
import key from '../N1VSg77Gwz2Raz48PYETHKRLYdxDVvcuespZK9wdK99.json' assert { type: "json"};

export const uploadImage = async () => {
    let secretKey = Uint8Array.from(key);
    let keypair = Keypair.fromSecretKey(secretKey)
    const connection = new Connection(
        `https://rpc.helius.xyz/?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`, "confirmed"
    );
    console.log()
    const wallet = new anchor.Wallet(keypair);
    const drive = await new ShdwDrive(connection, wallet).init();
    const accts = await drive.getStorageAccounts();
    let acctPubKey = new anchor.web3.PublicKey(accts[0].publicKey);
    console.log(acctPubKey)
    const addStorageRes = await drive.addStorage(acctPubKey, "10MB");
    console.log(addStorageRes)
    // const fileToUpload: ShadowFile = {
    //     name: "Porftolio.png",
    //     file: fileBuffer,
    // };
    // const uploadFile = await drive.uploadFile(acctPubKey, fileToUpload);
    // console.log(uploadFile);
    // 4tMFuc9wotygbzYUBCntX7UicFL3uFBJE7nguqLvZDbXi7QbtDEEUGcopxYNZkNhjE5uBhgsDHdJZYSsQxCDPXwV
}


export { }