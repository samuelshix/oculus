
const url = `https://mainnet.helius-rpc.com/?api-key=<api_key>`;
export const mintCompressedNft = async (publicKey: string, imageUrl: string) => {
    const response = await fetch(url, {
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
                description:
                    `Your historical portfolio value in the last 30 days. As of ${new Date().toLocaleDateString()}`,
                // attributes: [
                //     {
                //         trait_type: 'Type',
                //         value: 'Legendary',
                //     }
                // ],
                imageUrl: imageUrl,
                sellerFeeBasisPoints: 50,
            },
        }),
    });
    const { result } = await response.json();
    return result;
};