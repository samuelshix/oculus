import { useWallet } from "@solana/wallet-adapter-react";
import { FC } from "react";
import html2canvas from "html2canvas";
import { Button } from "@chakra-ui/react";
import { mintCompressedNft } from "../utils/mintNFT";
// import 
type CreateNFTProps = {
    htmlElement: HTMLDivElement;
};

import axios from "axios";


const CreateNFT: FC<CreateNFTProps> = ({ htmlElement }) => {
    const wallet = useWallet();

    // async function uploadNFT(fileBuff: Buffer) {
    //     console.log(SHADOW_DRIVE_BUCKET)
    //     try {
    //         const drive = await new ShdwDrive(connection, wallet).init();
    //         const account = await drive.getStorageAccount(
    //             new PublicKey(SHADOW_DRIVE_BUCKET as PublicKeyInitData)
    //         )
    //         console.log(account)
    //         const fileToUpload: ShadowFile = {
    //             name: "Porftolio.png",
    //             file: fileBuff,
    //         };
    //         try {
    //             if (wallet.publicKey) {
    //                 const uploadFile = await drive.uploadFile(account.publicKey, fileToUpload);
    //                 return uploadFile.finalized_locations[0];
    //             }
    //         } catch (err) {
    //             console.log(err)
    //             return `${err}`
    //         }
    //     } catch (err) {
    //         console.log(err)
    //         return `Error: ${err}`
    //     }
    // }

    async function create(ele: HTMLDivElement) {
        const canvas = await html2canvas(ele);

        const context = canvas.getContext("2d");
        const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);

        // const imageFile = canvas.toDataURL();
        let imageUrl: string | undefined;

        canvas.toBlob(async (blob) => {
            const data = new FormData();
            const file = new File([blob!], "Portfolio.png");
            data.append('file', file, 'Portfolio.png');
            await axios.post(
                `http://localhost:3001/api/nft/uploadImage`,
                data,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            ).then(async res => {
                imageUrl = res.data;
                if (imageUrl) {
                    // Call your function with imageUrl as an argument
                    const res = await mintCompressedNft(imageUrl, wallet?.publicKey?.toString()!)
                    console.log(res)
                } else {
                    alert("Error creating NFT")
                }

            })
        })


        // const imageUrl = await axios.post(`http://localhost:3001/api/nft/uploadImage`, data).then(res => {
        //     return res.data
        // })
        // var data = stringify({
        //     workerName: 'ImageUploader',
        //     data: buffer!.toString()
        // });
        // const imageUrl = await fetch(`http://localhost:3001/api/nft/uploadImage`, {
        //     method: 'POST',
        //     body: data,
        //     headers: {
        //         'Content-Type': 'application/x-www-form-urlencoded'
        //     }
        // }).then((res) => {
        //     return res.json()
        // });
        // const data = new FormData();
        // data.append('file', buffer!) 
        // let imageUrl;

        // try {
        //     imageUrl = await fetch(`http://localhost:3001/api/nft/uploadImage/${data}`, {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'multipart/form-data'
        //         },
        //         body: data
        //     }).then((res) => res.json());
        // } catch (err) {
        //     alert(err)
        // }

        // if (!imageUrl) return

        try {
            // const res = await mintCompressedNft(imageUrl as string, wallet?.publicKey?.toString() as string)
            // console.log(res)
            // console.log("hi")
        } catch (err) {
            alert(err)
        }
    }


    return (
        <>
            <Button onClick={() => create(htmlElement)}>Mint portfolio as NFT</Button>
            {/* <ShadowUploadImage /> */}
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

export default CreateNFT;