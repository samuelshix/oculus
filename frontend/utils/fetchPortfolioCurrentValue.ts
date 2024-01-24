import { TokenAccount } from "../models/dataTypes";

const getAllTokenInfo = async () => {
    return await fetch('/api/tokens').then((res) => res.json());
}
export const fetchPortfolioCurrentValue = async (tokenAccounts: TokenAccount[], mintAddresses: string[]) => {
    const allTokenInfo = await getAllTokenInfo();
    return await Promise.all(
        tokenAccounts.map(async (accountInfo: { tokenAccount: string; mint: string; amount: number; decimals: number; }) => {
            const mintAddress = accountInfo.mint;
            const foundTokenInfo = allTokenInfo.find((tokenInfo: { address: string; }) => tokenInfo.address === mintAddress);
            if (accountInfo.amount > 0 && typeof foundTokenInfo !== "undefined") {
                mintAddresses = [...mintAddresses, mintAddress];
                const tokenCoinGeckoId = foundTokenInfo.extensions ? foundTokenInfo.extensions.coingeckoId : '';
                const enrichedTokenInfo = {
                    mintAddress: accountInfo.mint,
                    tokenAddress: accountInfo.tokenAccount,
                    symbol: foundTokenInfo?.symbol || 'Unknown',
                    coinGeckoId: tokenCoinGeckoId,
                    name: foundTokenInfo?.name || 'Unknown',
                    logoURI: foundTokenInfo?.logoURI || '',
                    amount: accountInfo.amount / Math.pow(10, accountInfo.decimals),
                    decimals: foundTokenInfo?.decimals,
                };
                return enrichedTokenInfo;
            } else return null;
        })
    )
}