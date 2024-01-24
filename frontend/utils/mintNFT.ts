
const url = `https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`;
export const mintCompressedNft = async (publicKey: string, imageUrl: string) => {
    const today = new Date().toLocaleDateString()

    const result = fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'portfolio-nft',
            method: 'mintCompressedNft',
            params: {
                name: 'Portfolio',
                symbol: 'PFOLIO',
                owner: publicKey,
                description: `Your historical portfolio value in the last 30 days. As of ${today}`,
                imageUrl: imageUrl,
                sellerFeeBasisPoints: 50,
            },
            creators: [
                {
                    address: "N1VSg77Gwz2Raz48PYETHKRLYdxDVvcuespZK9wdK99",
                    "share": 1
                }
            ]
        }),
    }).then((res) => res.json());
    console.log(result)
    return result;
};