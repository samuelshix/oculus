// import { getKeypairFromEnvironment } from "@solana-developers/node-helpers";
// import { useConnection, useWallet } from "@solana/wallet-adapter-react";
// import { FC } from "react";
// import html2canvas from "html2canvas";
// import { Button } from "@chakra-ui/react";

// import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
// import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
// import { awsUploader } from '@metaplex-foundation/umi-uploader-aws';
// import * as metaplex from "@metaplex-foundation/mpl-token-metadata"
// import { generateSigner, keypairIdentity } from "@metaplex-foundation/umi";
// type CreateNFTProps = {
//     htmlElement: HTMLDivElement;
// };
// const CreateNFT: FC<CreateNFTProps> = ({ htmlElement }) => {
//     const { connection } = useConnection();
//     const wallet = useWallet();
//     async function create(ele: HTMLDivElement) {
//         let nft;
//         const canvas = await html2canvas(ele);
//         const context = canvas.getContext("2d");
//         const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);
//         const buffer = imageData?.data.buffer
//         // const signer = createSignerFromWalletAdapter(useWallet())

//         const umi = createUmi('https://api.mainnet-beta.solana.com')
//             .use(walletAdapterIdentity(useWallet()))
//             .use(awsUploader({
//                 bucket: 'metaplex',
//                 region: 'us-east-1',
//                 accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
//                 secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
//             }))
//         // .use(metaplex.mplTokenMetadata())
//         const mint = generateSigner(umi);

//         const metadata = {
//             name: "Portfolio",
//             symbol: "PFOLIO",
//             uri: "https://raw.githubusercontent.com/solana-developers/program-examples/new-examples/tokens/tokens/.assets/spl-token.json",
//         };

//         metaplex.createAndMint(umi, {
//             mint,
//             authority: umi.identity,

//         })
//         if (buffer && wallet?.publicKey) {
//             const file = toMetaplexFile(buffer, "image.png");
//             const imageUri = await metaplex.storage().upload(file);

//             nft = await metaplex.nfts().create({
//                 uri: imageUri,
//                 name: "My NFT",
//                 sellerFeeBasisPoints: 500, // Represents 5.00%.
//                 tokenOwner: wallet.publicKey,
//                 // updateAuthority: signer
//             });
//             console.log(nft)
//         }
//     }

//     return (
//         <>
//             <Button onClick={() => create(htmlElement)}>Mint portfolio as NFT</Button>
//         </>
//     )

//     // // const userKeyPair = getKeypairFromEnvironment('SECRET_KEY')
//     // const connection = new Connection(clusterApiUrl("mainnet-beta"));

//     // const metaplex = Metaplex.make(connection)
//     //     .use(walletAdapterIdentity(useWallet()))
//     // bundlrStorage({
//     //     address: "https://devnet.bundlr.network",
//     //     providerUrl: "https://api.devnet.solana.com",
//     //     timeout: 60000,
//     // })

//     // const buffer = exportAsImage(el);
//     // we need to figure out how to make this component use the html element to pass into the function
//     // const file = toMetaplexFile(buffer, "image.png");
//     // const imageUri = await metaplex.storage().upload(file);

//     // const { nft } = await metaplex.nfts().create({
//     //     uri: imageUri,
//     //     name: "My NFT",
//     //     sellerFeeBasisPoints: 500, // Represents 5.00%.
//     //     tokenOwner: userKeyPair.publicKey,
//     //     updateAuthority: userKeyPair
//     // });

// }

// export default CreateNFT;