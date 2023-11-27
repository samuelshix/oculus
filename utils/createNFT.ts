import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { Connection, Keypair, clusterApiUrl } from "@solana/web3.js";


// const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=6674cc09-55bd-4ac9-a44d-bc712dbc3f6f");
const connection = new Connection(clusterApiUrl("devnet"));
const wallet = Keypair.generate();
const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(wallet))
