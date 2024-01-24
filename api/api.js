import express from 'express';
import { createToken, getTokenPriceHistory, updateMissingPrices, checkIfTokenExists } from './priceHistoryScript.js';
import cors from 'cors';
import { handleTokenTransfers } from './getTokenTransfer.js';
import { uploadImage } from './ShadowStorage/uploadImage.js';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

const app = express()
const port = 3001
app.use(cors())
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }))

// parse application/json
app.use(express.json())

const apiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;

const getAssetsByOwner = async (walletAddress) => {
    const url = `https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
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
    // updateMissingPrices();
    const token = await checkIfTokenExists(req.query.tokenIdentifier)
    const coinName = req.query.name;
    // if token exists in the database, return the price history, otherwise create a token object in the database
    if (token) {
        const prices = await getTokenPriceHistory(coinName);
        console.log('Token found: ', token.name)
        res.send({ coinName: coinName, prices: prices })
    } else {
        console.log("Creating coin", coinName)
        createToken(
            req.query.tokenIdentifier,
            req.query.newToken,
            req.query.mint,
            coinName)
            .then(token => {
                getTokenPriceHistory(coinName).then(prices => {
                    res.send({ coinName: coinName, prices: prices })
                })
            })
    }

})
app.get('/api/tokenAddressHistory', async (req, res) => {
    const tokenAddress = req.query.tokenAddress;
    const mintDecimals = req.query.decimals;
    const isNativeTransfer = req.query.isNativeTransfer;
    const mint = req.query.mint;
    var parsedTokenTransfers = await handleTokenTransfers(tokenAddress, mintDecimals, mint, isNativeTransfer);


    res.send(parsedTokenTransfers);
})

app.get('/test', async (req, res) => {
    res.send(process.env.NODE_ENV)
})

const upload = multer();
app.post('/api/nft/uploadImage', upload.single('file'), async (req, res) => {
    const url = await uploadImage(req.file.buffer)
    res.send(url)
})

app.listen(port, () => {
})
