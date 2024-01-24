export interface TokenInfo {
    mintAddress?: string;
    tokenAddress?: string;
    name?: string;
    symbol?: string;
    amount?: number;
    logoURI?: string;
    price?: number;
    value?: number;
    coinGeckoId?: string;
    decimals?: number;
}

export interface TokenAccount {
    tokenAccount: string;
    mint: string;
    amount: number;
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
