
import { FC, useEffect, useRef, useState } from 'react';
// import { Connection, PublicKey, PublicKeyInitData } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { FormEvent } from 'react';
import { Button, Text, Box, Flex, Center } from '@chakra-ui/react';
import { getPortfolioHistoricValue } from '../utils/fetchPortfolioHistoricalValue';
import { LineChart } from './AreaChart';
import LoadingAnimation from './LoadingAnimation';
// import CreateNFT from './CreateNFT';
import TokenInfoCard from './TokenInfoCard';
import mockData from '../mockData/example.json'
import { TokenInfo } from '../models/dataTypes';
import CreateNFT from './CreateNFT';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';

export default function Portfolio() {
    const [tokenInfos, setTokenInfos] = useState<TokenInfo[]>([]);
    const { publicKey, sendTransaction } = useWallet();
    const [buttonClicked, setButtonClicked] = useState<boolean>(false);
    const [totalValue, setTotalValue] = useState<number>(0);
    const [portfolioHistoricValue, setPortfolioHistoricValue] = useState<{ date: Date, value: number }[]>([]);
    const [updatedHistoricValue, setUpdatedHistoricValue] = useState<{ date: Date, value: number }[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingText, setLoadingText] = useState<string>("Retrieving token balances...");
    const exportRef = useRef<HTMLDivElement | null>(null);

    const handleSubmit = async (event: FormEvent<Element>) => {
        event.preventDefault();
        console.log('hey')
        if (!publicKey) {
            alert('Please connect your wallet!');
            return;
        }
        if (buttonClicked) {
            return;
        } else {
            setButtonClicked(true);
            fetchTokenInfos()
        }
    };

    async function fetchTokenInfos() {
        setIsLoading(true);
        // Fetch the user's token accounts
        const tokenAccounts = await fetch(`http://localhost:3001/api/tokenAccounts?owner=${publicKey?.toString()}`).then((res) => res.json());
        // for $SOL balance
        tokenAccounts.tokens.push({
            tokenAccount: publicKey?.toString(),
            mint: 'So11111111111111111111111111111111111111112',
            amount: tokenAccounts.nativeBalance,
            decimals: 9
        })
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
                        coinGeckoId: foundTokenInfo.extensions.coinGeckoId as string || '',
                        name: foundTokenInfo?.name || 'Unknown',
                        logoURI: foundTokenInfo?.logoURI || '',
                        amount: accountInfo.amount / Math.pow(10, accountInfo.decimals),
                        decimals: foundTokenInfo?.decimals,
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
        newTotalValue = parseFloat(newTotalValue.toFixed(3));
        tokenAddressValues = tokenAddressValues.filter((info) => info.value > 0)
        tokenAddressValues = tokenAddressValues.sort((a, b) => b.value - a.value);
        setTokenInfos(tokenAddressValues);
        setTotalValue(newTotalValue);

        setLoadingText("Getting account historical value...");
        getPortfolioHistoricValue(tokenAddressValues).then((combinedHistoricValue) => {
            combinedHistoricValue = combinedHistoricValue.slice(0, combinedHistoricValue.length - 1);
            setPortfolioHistoricValue(combinedHistoricValue);
        });
    }

    function updateHistoricValue() {
        // Calculate the difference between the totalValue and the value of the last element
        const lastValue = portfolioHistoricValue[portfolioHistoricValue.length - 1].value;
        const difference = totalValue - lastValue;
        console.log('123', totalValue, lastValue)
        // Add the difference to the value of each element in combinedHistoricValue
        const updatedHistoricValue = portfolioHistoricValue.map((item) => ({
            ...item,
            value: item.value + difference
        }));

        setUpdatedHistoricValue(updatedHistoricValue);
    }

    useEffect(() => {
        setButtonClicked(false)
        setTotalValue(0);
        setTokenInfos([]);
    }, [publicKey])
    useEffect(() => {
        if (portfolioHistoricValue.length === 0) return;
        updateHistoricValue();
        setIsLoading(false);
    }, [portfolioHistoricValue])
    return (
        <div>
            <Center mt="20">
                <div>
                    {!buttonClicked && <Button type="submit" onClick={(event) => handleSubmit(event as FormEvent)}>Fetch Token Infos</Button>}
                    <LoadingAnimation loading={isLoading} text={loadingText} />
                </div>
            </Center>
            <Box>
                <Box marginY={25} marginX={-500} borderRadius={25} backgroundColor="rgba(50,50,50,1)" py={5} boxShadow="2xl">
                    <Box p={16} py={10} backgroundColor="rgba(50,50,50,1)" ref={exportRef}>
                        <LineChart data1={updatedHistoricValue} />
                    </Box>
                </Box>
            </Box>
            <div style={{ overflow: "auto" }}>
            </div>
            <Center>
                {publicKey && <CreateNFT htmlElement={exportRef.current!} />}
            </Center>
            {/* {tokenInfos.length !== 0 && */}
            <>
                <Text fontSize="4xl" ml="16" mt="20" mb="5" fontWeight="extrabold">Total Value: ${totalValue}</Text>
                {/* <LineChart data={portfolioHistoricValue} /> */}
                <Flex justifyContent="space-between" marginBottom={2}>
                    <Box>
                        <Flex mt="3">
                            <Text fontSize="3xl" fontWeight={700} mt="-1" mr="2">Balances</Text>
                        </Flex>
                    </Box>
                    <Text mt="3" fontSize="2xl" fontWeight={700} mr="2"></Text>
                </Flex>
                <Box bg="rgba(0,0,0,.05)" boxShadow="xl" p="3" borderRadius={20}>
                    {(tokenInfos.length !== 0 ? tokenInfos : mockData)
                        // .filter((tokenInfo): tokenInfo is TokenInfo => 'coinGeckoId' in tokenInfo)
                        .map((tokenInfo, index) => (
                            <Box key={index}>
                                <TokenInfoCard tokenInfo={tokenInfo} />
                            </Box>
                        ))}
                </Box>
            </>
            {/* } */}
        </div >
    );
}
