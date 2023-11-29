
import { FC, useEffect, useRef, useState } from 'react';
// import { Connection, PublicKey, PublicKeyInitData } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { FormEvent } from 'react';
import { Button, FormControl, Text, Image, Box, Flex, Center } from '@chakra-ui/react';
import { TokenInfo } from '../models/TokenInfo';
import { fetchPortfolioHistoricalValue, getPortfolioHistoricValue } from '../utils/fetchPortfolioHistoricalValue';
import { LineChart } from './AreaChart';
import LoadingAnimation from './LoadingAnimation';
import { isSameDay } from 'date-fns';
import exportAsImage from '../utils/captureImage';
import CreateNFT from './CreateNFT';
import TokenInfoCard from './TokenInfoCard';
import { get } from 'http';

export default function Portfolio() {
    const [tokenInfos, setTokenInfos] = useState<TokenInfo[]>([]);
    const { publicKey, sendTransaction } = useWallet();
    const [buttonClicked, setButtonClicked] = useState<boolean>(false);
    const [totalValue, setTotalValue] = useState<number>(0);
    const [portfolioHistoricValue, setPortfolioHistoricValue] = useState<{ date: Date, value: number }[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingText, setLoadingText] = useState<string>("Retrieving token balances...");
    const exportRef = useRef<HTMLDivElement>()

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (buttonClicked && publicKey) return;
        setIsLoading(true);
        fetchTokenInfos().then(() => setIsLoading(false));
        setButtonClicked(true);
    };

    async function fetchTokenInfos() {
        if (!publicKey) {
            alert('Please connect your wallet!');
            return;
        }

        // Fetch the user's token accounts
        const tokenAccounts = await fetch(`http://localhost:3001/api/tokenAccounts?owner=${publicKey.toString()}`).then((res) => res.json());
        console.log(tokenAccounts)
        // await connection.getParsedTokenAccountsByOwner(publicKey, {
        //     programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        // });
        const allTokenInfo = await fetch('http://localhost:3001/api/tokens').then((res) => res.json());
        // Fetch the token info for each token account
        var mintAddresses: string[] = [];
        var balanceInfos = await Promise.all(
            tokenAccounts.tokens.map(async (accountInfo: { tokenAccount: string; mint: string; amount: number; decimals: number; }) => {
                const mintAddress = accountInfo.mint;
                // const mintInfo = await connection.getParsedAccountInfo(mintAddress);
                const foundTokenInfo = allTokenInfo.find((tokenInfo: { address: string; }) => tokenInfo.address === mintAddress);
                if (accountInfo.amount > 0 && typeof foundTokenInfo !== "undefined") {
                    mintAddresses = [...mintAddresses, mintAddress];
                    return {
                        mintAddress: accountInfo.mint,
                        tokenAddress: accountInfo.tokenAccount,
                        symbol: foundTokenInfo?.symbol || 'Unknown',
                        coinGeckoId: foundTokenInfo.extensions || '',
                        name: foundTokenInfo?.name || 'Unknown',
                        logoURI: foundTokenInfo?.logoURI || '',
                        amount: accountInfo.amount / Math.pow(10, accountInfo.decimals),
                    };
                } else return null;
            })
        )
        balanceInfos = balanceInfos.filter((info) => info !== null && info.amount > 0 && info.logoURI)
        setLoadingText("Retrieving token prices");
        var tokenPrices = await fetch(`http://localhost:3001/api/prices?mintAddress=${mintAddresses.toString()}`).then((res) => res.json());
        setLoadingText("Calculating token account USD value...");

        let newTotalValue = totalValue;
        var tokenAddressValues: TokenInfo[] = balanceInfos.map((tokenInfo) => {
            const price = tokenPrices.data[tokenInfo.mintAddress]?.price;
            const value = parseFloat((price * tokenInfo.amount).toFixed(3));
            newTotalValue += value;
            return {
                ...tokenInfo,
                price: price,
                value: value
            }
        })
        tokenAddressValues = tokenAddressValues.filter((info) => info.value > 0)
        tokenAddressValues = tokenAddressValues.sort((a, b) => b.value - a.value);
        setTokenInfos(tokenAddressValues);

        setLoadingText("Getting account historical value...");
        const combinedHistoricValue = await getPortfolioHistoricValue(tokenAddressValues);

        setTotalValue(newTotalValue);
        setPortfolioHistoricValue(combinedHistoricValue);
        console.log(portfolioHistoricValue, combinedHistoricValue)
    }

    return (
        <div>
            <Center mt="20">
                <div>
                    <Button type="submit" onClick={handleSubmit}>Fetch Token Infos</Button>
                    <LoadingAnimation loading={isLoading} text={loadingText} />
                </div>
            </Center>
            <Box>
                <Box marginY={25} marginX={-500} borderRadius={25} backgroundColor="rgba(0,0,0,.8)" py={5} boxShadow="2xl">
                    <Box ref={exportRef} p={16} py={10}>
                        <LineChart data1={portfolioHistoricValue} />
                    </Box>
                </Box>
            </Box>
            <div style={{ overflow: "auto" }}>
            </div>
            <Center>
                <CreateNFT htmlElement={exportRef.current} />
            </Center>
            {tokenInfos.length !== 0 &&
                <>
                    <Text fontSize="4xl" ml="16" mt="20" fontWeight="extrabold">Total Value: ${totalValue}</Text>
                    {/* <LineChart data={portfolioHistoricValue} /> */}

                    <Text mt="3" fontSize="2xl" fontWeight={700} mr="2">Balances</Text>
                    <Box bg="rgba(0,0,0,.1)" boxShadow="xl" p="3" borderRadius={20}>
                        {tokenInfos.map((tokenInfo, index) => (
                            <TokenInfoCard key={index} tokenInfo={tokenInfo} />
                        ))}
                    </Box>
                </>
            }
        </div >
    );
}
