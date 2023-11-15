import { TokenInfo } from "../models/TokenInfo";
import { isAfter, isBefore, isSameDay } from 'date-fns';


export const fetchPortfolioHistoricalValue = async (tokenInfos: TokenInfo[]) => {
    console.log(tokenInfos)
    const allTokenHistories = []
    for (let i = 0; i < tokenInfos.length; i++) {
        const tokenInfo = tokenInfos[i];

        var tokenAddressHistory = await fetch(`http://localhost:3001/api/tokenAddressHistory?tokenAddress=${tokenInfo.tokenAddress}`).then((res) => res.json());
        if (tokenAddressHistory.error) continue;
        tokenAddressHistory = tokenAddressHistory.map((price: { "amount": number, "date": Date }) => {
            price.date = new Date(price.date);
            console.log(price.date)
            return price
        })

        tokenAddressHistory = tokenAddressHistory.sort((a: any, b: any) => {
            return b.date.getTime() - a.date.getTime();
        });
        console.log(tokenInfo.name)

        const firstDate = tokenAddressHistory[0].date;
        const tokenIdentifier = tokenInfo.coinGeckoId ? tokenInfo.coinGeckoId.coingeckoId : tokenInfo.symbol;
        const url = `http://localhost:3001/api/priceHistory?tokenIdentifier=${tokenIdentifier}&newToken=${!tokenInfo.coinGeckoId}&mint=${tokenInfo.mintAddress}&name=${tokenInfo.name}`
        var { prices }: { "prices": any[] } = await fetch(url)
            .then((res) => res.json());

        prices = prices.map((price: { "price": number, "date": Date }) => {
            price.date = new Date(price.date);
            return price
        })
        console.log(prices)
        prices = prices.filter(price => isAfter(price.date, firstDate) || isSameDay(price.date, firstDate));

        console.log(tokenAddressHistory, prices)
        var balance = 0
        const accountValueHistory = prices.map((item: any, index: number) => {
            const tokenTransfer = tokenAddressHistory.find((transfer: any) => isSameDay(transfer.date, item.date))

            if (tokenTransfer) balance = balance + tokenTransfer.amount

            return {
                date: item.date,
                price: item.price,
                balance: balance,
                value: item.price * balance
            };
        })
        console.log("accountValueHistory: ", accountValueHistory)

        // priceHistory.prices = priceHistory.prices.map((price: any) => {
        //     return {
        //         date: price.date,
        //         price: price.price
        //     }
        // })
        allTokenHistories.push(accountValueHistory)
    }

    return allTokenHistories
}
