export interface TokenInfo {
    mintAddress: any;
    tokenAddress: string;
    name: string;
    symbol: string;
    amount: number;
    logoURI: string;
    price: number;
    value: number;
    coinGeckoId: { coingeckoId: string };
    decimals: number;
}

export interface TokenHistoricValue {
    mint: string,
    accountValueHistory: Array<{
        date: Date,
        value: number
    }>
}

export interface DateValue {
    date: Date,
    value: number
}
