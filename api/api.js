import express from 'express';
import * as scripts from './priceHistoryScript.js';
import cors from 'cors';

const app = express()
const port = 3001

app.use(cors())

const apiKey = "6674cc09-55bd-4ac9-a44d-bc712dbc3f6f";
const SPL_TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

const getAssetsByOwner = async (walletAddress) => {
    const url = `https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log("balances: ", data);
    return data;
}
const getAllTokens = async () => {
    const url = 'https://token.jup.ag/all';
    const response = await fetch(url);
    const data = await response.json();
    return data;
}
const getPriceByMintAddress = async (mintAddress) => {
    const url = `https://price.jup.ag/v4/price?ids=${mintAddress}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

app.get('/api/tokenAccounts', async (req, res) => {
    const walletAddress = req.query.owner;
    const assets = await getAssetsByOwner(walletAddress);
    res.send(assets);
})
app.get('/api/tokens', async (req, res) => {
    const tokens = await getAllTokens();
    res.send(tokens);
})
app.get('/api/prices', async (req, res) => {
    const mintAddress = req.query.mintAddress;
    const price = await getPriceByMintAddress(mintAddress);
    res.send(price);
})
app.get('/api/priceHistory', async (req, res) => {
    const token = await scripts.checkIfTokenExists(req.query.tokenIdentifier)
    const coinName = req.query.name;
    // if token exists in the database, return the price history, otherwise create a token object in the database
    console.log(token)
    if (token) {
        const prices = await scripts.getTokenPriceHistory(coinName);
        console.log('Token found: ', token)
        res.send({ coinName: coinName, prices: prices })
    } else {
        console.log("creating coin name", coinName)
        scripts.createToken(
            req.query.tokenIdentifier,
            req.query.newToken,
            req.query.mint,
            coinName)
            .then(token => {
                scripts.getTokenPriceHistory(coinName).then(prices => {
                    console.log('Token created: ', token)
                    res.send({ coinName: coinName, prices: prices })
                })
            })
    }

})
app.get('/api/tokenAddressHistory', async (req, res) => {
    const tokenAddress = req.query.tokenAddress;

    res.send(parsedTokenTransfers);

    // console.log(signatures)
    // const url = `https://api.helius.xyz/v0/transactions?api-key=${apiKey}`
    // const response = await fetch(url, {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //         transactions: ["your-txn-id-here"],
    //     }),
    // });

    // const data = await response.json();
    // console.log("tokenAddressHistory: ", data);
})
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})