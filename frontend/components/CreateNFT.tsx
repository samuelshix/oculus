import { useWallet } from "@solana/wallet-adapter-react";
import { FC } from "react";
import html2canvas from "html2canvas";
import { Button } from "@chakra-ui/react";
import { mintCompressedNft } from "../utils/mintNFT";
import axios from "axios";

type CreateNFTProps = {
    htmlElement: HTMLDivElement;
};

const CreateNFT: FC<CreateNFTProps> = ({ htmlElement }) => {
    const wallet = useWallet();
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
                `/api/nft/uploadImage`,
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
                    const res = await mintCompressedNft(wallet?.publicKey?.toString()!, imageUrl)
                } else {
                    alert("Error creating NFT")
                }

            })
        })
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