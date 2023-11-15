
import { useEffect, useState } from 'react';
import { Connection, PublicKey, PublicKeyInitData } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import styles from '../styles/Home.module.css'
import { FormEvent } from 'react';
import { Button, FormControl, Text, Image, Box, Flex } from '@chakra-ui/react';
import { TokenInfo } from '../models/TokenInfo';
import { fetchPortfolioHistoricalValue } from '../hooks/fetchPortfolioHistoricalValue';
import { set } from 'date-fns';
import { LineChart } from './AreaChart';

export default function Portfolio() {
    const [tokenInfos, setTokenInfos] = useState<TokenInfo[]>([]);
    const { publicKey, sendTransaction } = useWallet();
    const [buttonClicked, setButtonClicked] = useState<boolean>(false);
    const [totalValue, setTotalValue] = useState<number>(0);
    const [portfolioHistoricValue, setPortfolioHistoricValue] = useState<any[]>([]);
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (buttonClicked) return;
        await fetchTokenInfos();
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
        console.log(balanceInfos)
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
        var exampleAccount = portfolioHistoricValue[0]
        setTotalValue(newTotalValue);
        setTokenInfos(tokenInfosWithPrice);
        setPortfolioHistoricValue(portfolioHistoricValue);
        console.log(portfolioHistoricValue)
    }

    // const mockData = [
    //     { mintAddress: '6naWDMGNWwqffJnnXFLBCLaYu1y5U9Rohe5wwJPHvf1p', symbol: 'SCRAP', logoURI: 'https://art.pixilart.com/bd1b1275fdc0ac1.png', amount: 15.45 },
    //     { mintAddress: 'BWXrrYFhT7bMHmNBFoQFWdsSgA3yXoAnMhDK6Fn1eSEn', symbol: 'HADES', logoURI: 'https://arweave.net/dvKu5BgpSo6j-iGzQOyVXYZ8OU7iyfhHNpkkJ_8qkkQ', amount: 1 },
    //     { mintAddress: 'BqVHWpwUDgMik5gbTciFfozadpE2oZth5bxCDrgbDt52', symbol: 'OPOS', logoURI: 'https://arweave.net/k8uU2yLoYwL4zTBZ-TO-7bs6hgtLNaHhzP4FLUMuaS0', amount: 12.669216324 }

    // ]
    return (
        <div>
            {tokenInfos.length !== 0 &&
                <><Text fontSize="4xl" color='gray.50' mr="2" fontWeight="bold">Total Value: ${totalValue}</Text>
                    <LineChart data={portfolioHistoricValue} /></>
            }
            <Flex alignItems="center" mt="5">
                <Text fontSize="md" fontSize="3xl" color='gray.50' mr="2">Balances</Text>
                <Button _hover={{ backgroundColor: "cyan.400" }} bgColor={"cyan.800"} color={"cyan.50"} transition={"all .3s ease"} type="submit" onClick={handleSubmit}>Fetch Token Infos</Button>
            </Flex>
            <Box mt="5" bg='#1b2428' borderRadius={10}>
                {tokenInfos.map((tokenInfo, index) => (
                    <Box p="5" w="lg" key={index}>
                        <Flex>
                            <Box flex={2} mr="5">
                                <Flex alignItems="flex-start">
                                    <Box>
                                        <Image src={tokenInfo.logoURI} alt={`${tokenInfo.symbol} logo`} boxSize="50px" mr="2" />
                                    </Box>
                                    <Box>
                                        <Text color="cyan.50"
                                            fontSize="xl"
                                            fontWeight="bold">{tokenInfo.name}</Text>

                                        <Text color="cyan.100"
                                            // _hover={{ color: "cyan.400" }}
                                            // transition={"all .3s ease"}
                                            fontSize="md"
                                            fontWeight="md">{tokenInfo.amount} {tokenInfo.symbol}</Text>
                                    </Box>
                                </Flex>
                            </Box>
                            <Box flex={1}>
                                <Text color="cyan.50">${tokenInfo.value}</Text>
                            </Box>
                        </Flex>

                    </Box>
                ))}
                {/* {tokenInfos.map((tokenInfo, index) => (
                    <li key={index} color='grey.50'>
                        {tokenInfo.logoURI && (
                            <Image src={tokenInfo.logoURI} alt={`${tokenInfo.symbol} logo`} boxSize="20px" mr="2" />
                        )}
                        {tokenInfo.symbol}: {tokenInfo.amount}
                    </li>
                ))} */}

            </Box>
        </div >
    );
}

{/* <Stat>
  <StatLabel>Collected Fees</StatLabel>
  <StatNumber>£0.00</StatNumber>
  <StatHelpText>Feb 12 - Feb 28</StatHelpText>
</Stat> */}
