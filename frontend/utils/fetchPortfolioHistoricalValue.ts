import { isAfter, isBefore, isSameDay } from 'date-fns';
import { DateValue, TokenHistoricValue, TokenInfo } from "../models/dataTypes";


export const fetchPortfolioHistoricalValue = async (tokenInfos: TokenInfo[]) => {
    const allTokenHistories = [];
    console.log(tokenInfos)
    for (let i = 0; i < tokenInfos.length; i++) {
        const tokenInfo = tokenInfos[i];
        try {
            var tokenAddressHistory: Array<any> = await getTokenAddressHistory(tokenInfo);
            console.log(tokenInfo.name, tokenAddressHistory);
            var prices = await getTokenPriceHistory(tokenInfo, tokenAddressHistory);
            console.log(tokenInfo.name, prices)

            var balance = 0
            const accountValueHistory = prices.map((item: any, index: number) => {
                const tokenTransfers = tokenAddressHistory.filter((transfer: any) => isSameDay(transfer.date, item.date));

                // Update the balance based on all found transfers for that day
                tokenTransfers.forEach((transfer: any) => {
                    balance = balance + transfer.amount;
                });

                return {
                    date: item.date,
                    price: item.price,
                    balance: balance,
                    value: item.price * balance
                };
            })
            console.log("accountValueHistory: ", accountValueHistory)

            allTokenHistories.push(
                {
                    "mint": tokenInfo.tokenAddress,
                    "accountValueHistory": accountValueHistory
                })
        } catch (error) {
            console.error(error);
            continue
        }
    }
    return allTokenHistories
}



export const getTokenAddressHistory = async (tokenInfo: TokenInfo) => {
    var tokenAddressHistory = await fetch(`http://localhost:3001/api/tokenAddressHistory?tokenAddress=${tokenInfo.tokenAddress}&decimals=${tokenInfo.decimals}&mint=${tokenInfo.mintAddress}`).then((res) => res.json());
    console.log(tokenAddressHistory)
    tokenAddressHistory = tokenAddressHistory.map((price: { "amount": number, "date": Date }) => {
        price.date = new Date(price.date);
        return price
    })

    tokenAddressHistory = tokenAddressHistory.sort((a: any, b: any) => {
        return a.date.getTime() - b.date.getTime();
    });

    return tokenAddressHistory
}

export const getTokenPriceHistory = async (tokenInfo: TokenInfo, tokenAddressHistory: Array<any>) => {
    const firstDate = tokenAddressHistory[0].date;
    const tokenIdentifier = tokenInfo.coinGeckoId ? tokenInfo.coinGeckoId : tokenInfo.symbol;
    const url = `http://localhost:3001/api/priceHistory?tokenIdentifier=${tokenIdentifier}&newToken=${!tokenInfo.coinGeckoId}&mint=${tokenInfo.mintAddress}&name=${tokenInfo.name}`
    console.log(url)
    var { prices }: { "prices": any[] } = await fetch(url)
        .then((res) => res.json());

    prices = prices.map((price: { "price": number, "date": Date }) => {
        price.date = new Date(price.date);
        return price
    })
    console.log(tokenInfo.name, prices)
    prices = prices.filter(price => isAfter(price.date, firstDate) || isSameDay(price.date, firstDate));

    return prices
}

export const addSolTokenInfo = (tokenInfos: TokenInfo[]) => {
    // tokenInfos.push({
    //     mintAddress: 'So11111111111111111111111111111111111111112',
    //     name: 'Solana',
    //     symbol: 'SOL',

    // })
}
export const calculatePortfolioValue = (portfolioHistoricValue: Array<TokenHistoricValue>) => {
    const combinedHistoricValue: Array<DateValue> = [];
    // const lengths = portfolioHistoricValue.map(a=>a.length);
    // lengths.indexOf(Math.max(...lengths));
    portfolioHistoricValue.forEach((tokenHistory) => {
        tokenHistory.accountValueHistory.forEach((element) => {
            const existingValue = combinedHistoricValue.find((item) => isSameDay(item.date, element.date));
            if (typeof existingValue !== undefined && existingValue?.value) {
                existingValue.value += element.value;
            } else {
                combinedHistoricValue.push({
                    date: element.date,
                    value: element.value
                });
            }
        })
    })
    combinedHistoricValue.sort((a, b) => a.date.getTime() - b.date.getTime());
}
export const getPortfolioHistoricValue = async (tokenAddressValues: Array<TokenInfo>) => {
    const portfolioHistoricValue = await fetchPortfolioHistoricalValue(tokenAddressValues)

    const combinedHistoricValue: Array<{ date: Date, value: number }> = [];

    portfolioHistoricValue.forEach((tokenHistory) => {
        tokenHistory.accountValueHistory.forEach((element) => {
            const existingValue = combinedHistoricValue.find((item) => isSameDay(item.date, element.date));
            if (typeof existingValue !== undefined && existingValue?.value) {
                existingValue.value += element.value;
            } else {
                combinedHistoricValue.push({
                    date: element.date,
                    value: element.value
                });
            }
        })
    })
    combinedHistoricValue.sort((a, b) => a.date.getTime() - b.date.getTime());
    return combinedHistoricValue
}