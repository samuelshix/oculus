import { getKeypairFromEnvironment } from "@solana-developers/node-helpers";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { FC } from "react";
import html2canvas from "html2canvas";
import { Button } from "@chakra-ui/react";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { awsUploader } from '@metaplex-foundation/umi-uploader-aws';
import * as metaplex from "@metaplex-foundation/mpl-token-metadata"
import { generateSigner, keypairIdentity } from "@metaplex-foundation/umi";
import { ShadowFile, ShdwDrive } from "@shadow-drive/sdk";
import { toMetaplexFile } from "@metaplex-foundation/js";
import { mintCompressedNft } from "../utils/mintNFT";
type CreateNFTProps = {
    htmlElement: HTMLDivElement;
};
const CreateNFT: FC<CreateNFTProps> = ({ htmlElement }) => {
    const { connection } = useConnection();
    const wallet = useWallet();
    async function uploadNFT(fileBuff: Buffer) {
        try {
            const drive = await new ShdwDrive(connection, wallet).init();
            const newAccount = await drive.createStorageAccount("portfolio", "1MB");

            const accts = await drive.getStorageAccounts();
            console.log(accts)
            let acctPubKey = wallet.publicKey;
            const fileToUpload: ShadowFile = {
                name: "Porftolio.png",
                file: fileBuff,
            };
            console.log(acctPubKey)
            if (wallet.publicKey) {
                const uploadFile = await drive.uploadFile(wallet?.publicKey, fileToUpload);
                return uploadFile.finalized_locations[0];
            }
        } catch (err) {
            console.log(err)
            return "Error"
        }
    }

    async function create(ele: HTMLDivElement) {
        const canvas = await html2canvas(ele);
        const context = canvas.getContext("2d");
        const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);
        const buffer = imageData?.data.buffer
        if (buffer) {
            const imageUrl = await uploadNFT(buffer as Buffer);
            if (imageUrl === "Error") {
                return;
            }
            const res = mintCompressedNft(imageUrl as string, wallet?.publicKey?.toString() as string)
            console.log(res)
        }

    }


    return (
        <>
            <Button onClick={() => await create(htmlElement)}>Mint portfolio as NFT</Button>
        </>
    )
}
    // // const userKeyPair = getKeypairFromEnvironment('SECRET_KEY')
    // const connection = new Connection(clusterApiUrl("mainnet-beta"));

    // const metaplex = Metaplex.make(connection)
    //     .use(walletAdapterIdentity(useWallet()))
    // bundlrStorage({
    //     address: "https://devnet.bundlr.network",
    //     providerUrl: "https://api.devnet.solana.com",
    //     timeout: 60000,
    // })

    // const buffer = exportAsImage(el);
    // we need to figure out how to make this component use the html element to pass into the function
    // const file = toMetaplexFile(buffer, "image.png");
    // const imageUri = await metaplex.storage().upload(file);

    // const { nft } = await metaplex.nfts().create({
    //     uri: imageUri,
    //     name: "My NFT",
    //     sellerFeeBasisPoints: 500, // Represents 5.00%.
    //     tokenOwner: userKeyPair.publicKey,
    //     updateAuthority: userKeyPair
    // });

}

export default CreateNFT;