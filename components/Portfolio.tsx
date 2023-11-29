
import { FC, useEffect, useRef, useState } from 'react';
// import { Connection, PublicKey, PublicKeyInitData } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { FormEvent } from 'react';
import { Button, FormControl, Text, Image, Box, Flex, Center } from '@chakra-ui/react';
import { TokenInfo } from '../models/TokenInfo';
import { fetchPortfolioHistoricalValue } from '../utils/fetchPortfolioHistoricalValue';
import { LineChart } from './AreaChart';
import LoadingAnimation from './LoadingAnimation';
import { isSameDay } from 'date-fns';
import exportAsImage from '../utils/captureImage';
import CreateNFT from './CreateNFT';

export default function Portfolio() {
    const [tokenInfos, setTokenInfos] = useState<TokenInfo[]>([]);
    const { publicKey, sendTransaction } = useWallet();
    const [buttonClicked, setButtonClicked] = useState<boolean>(false);
    const [totalValue, setTotalValue] = useState<number>(0);
    const [portfolioHistoricValue, setPortfolioHistoricValue] = useState<[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const exportRef = useRef<HTMLDivElement>()

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (buttonClicked) return;
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

        var tokenPrices = await fetch(`http://localhost:3001/api/prices?mintAddress=${mintAddresses.toString()}`).then((res) => res.json());

        let newTotalValue = totalValue;
        var tokenInfosWithPrice: TokenInfo[] = balanceInfos.map((tokenInfo) => {
            const price = tokenPrices.data[tokenInfo.mintAddress]?.price;
            const value = parseFloat((price * tokenInfo.amount).toFixed(3));
            newTotalValue += value;
            return {
                ...tokenInfo,
                price: price,
                value: value
            }
        })
        tokenInfosWithPrice = tokenInfosWithPrice.filter((info) => info.value > 0)
        tokenInfosWithPrice = tokenInfosWithPrice.sort((a, b) => b.value - a.value);
        var portfolioHistoricValue = await fetchPortfolioHistoricalValue(tokenInfosWithPrice)

        const combinedHistoricValue: Array<{ date: Date, value: number }> = [];
        // const lengths = portfolioHistoricValue.map(a=>a.length);
        // lengths.indexOf(Math.max(...lengths));
        portfolioHistoricValue.forEach((tokenHistory) => {
            tokenHistory.accountValueHistory.forEach((element) => {
                const existingValue = combinedHistoricValue.find((item) => isSameDay(item.date, element.date));
                if (typeof existingValue !== undefined && existingValue?.value) {
                    existingValue.value += element.value;
                    console.log("found", element.date, element.value)
                } else {
                    combinedHistoricValue.push({
                        date: element.date,
                        value: element.value
                    });
                }
            })
        })
        combinedHistoricValue.sort((a, b) => a.date.getTime() - b.date.getTime());
        // portfolioHistoricValue.reduce((acc: any, curr: any) => {
        //     const valueMap = new Map(acc.map((item: any) => [item.date, item.value]));
        //     curr.accountValueHistory.forEach((item: any) => {
        //         const existingValue = valueMap.get(item.date) || 0;
        //         valueMap.set(item.date, existingValue + item.value);
        //     });
        //     const newAcc = Array.from(valueMap, ([date, value]) => ({ date, value }));
        //     return newAcc;
        // }, []);
        // var exampleAccount = portfolioHistoricValue[0]
        setTotalValue(newTotalValue);
        setTokenInfos(tokenInfosWithPrice);
        setPortfolioHistoricValue(combinedHistoricValue);
        console.log(portfolioHistoricValue, combinedHistoricValue)
    }

    return (
        <div>
            <LoadingAnimation loading={isLoading} />

            <Center mt="20">
                <div>
                    <Button type="submit" onClick={handleSubmit}>Fetch Token Infos</Button>
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

                    <Box bg='black' boxShadow="xl" p="3" borderRadius={20}>
                        {tokenInfos.map((tokenInfo, index) => (
                            <Box py="5" px="4" mb="2" borderRadius={20} bg="rgba(255,255,255,.1)" shadow={"md"} key={index}>
                                <Flex>
                                    <Box flex={2} mr="5">
                                        <Flex alignItems="flex-start">
                                            <Box>
                                                <Image src={tokenInfo.logoURI} alt={`${tokenInfo.symbol} logo`} boxSize="50px" mr="2" />
                                            </Box>
                                            <Box>
                                                <Text
                                                    className='light'
                                                    fontSize="xl"
                                                    fontWeight="bold">{tokenInfo.name}</Text>

                                                <Text
                                                    className='light'
                                                    fontSize="md"
                                                    fontWeight="md">{tokenInfo.amount} {tokenInfo.symbol}</Text>
                                            </Box>
                                        </Flex>
                                    </Box>
                                    <Box flex={1}>
                                        <Text className='light'>${tokenInfo.value}</Text>
                                    </Box>
                                    <Box>
                                        <Text
                                            className='light'
                                            fontSize="sm"
                                            fontWeight="md">
                                            {`${tokenInfo.tokenAddress.slice(0, 4)}...${tokenInfo.tokenAddress.slice(-4)}`}
                                        </Text>
                                    </Box>
                                </Flex>
                            </Box>
                        ))}
                    </Box>
                </>
            }
        </div >
    );
}

{/* <Stat>
  <StatLabel>Collected Fees</StatLabel>
  <StatNumber>£0.00</StatNumber>
  <StatHelpText>Feb 12 - Feb 28</StatHelpText>
</Stat> */}
