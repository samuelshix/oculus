

const TRANSFER_TX_TYPES = ["WITHDRAW", "DEPOSIT", "SWAP", "TRANSFER", "TOKEN_MINT"];
const apiKey = process.env.HELIUS_API_KEY;

const getTransfersForAddress = async (tokenAddress) => {
    const url = `https://api.solana.fm/v0/accounts/${tokenAddress}/transfers?utcFrom=0&utcTo=${Date.now()}`
    const response = await fetch(url);
    const data = await response.json();

    return data.results;
}

const handleSOLTransfer = (transfers, tokenAddress, mintDecimals) => {
    const netTransfer = transfers.reduce((accumulator, transfer) => {
        // this checks in case there are more than 1 total transfers with the token address
        if (transfer.destination === tokenAddress) {
            return accumulator + (transfer.amount / 10 ** mintDecimals)
        } else if (transfer.source === tokenAddress) {
            return accumulator - (transfer.amount / 10 ** mintDecimals)
        } else return accumulator
    }, 0)
    const date = new Date(transfers[0].timestamp * 1000)
    return { "amount": netTransfer, "date": date }
}

const handleSPLTokenTransfer = (transfers, tokenAddress, mintDecimals) => {
    // this checks in case there are more than 1 total transfers with the token address
    const netTransfer = transfers.reduce((accumulator, transfer) => {
        if (transfer.destinationAssociation === tokenAddress) {
            return accumulator + (transfer.amount / 10 ** mintDecimals)
        } else if (transfer.sourceAssociation === tokenAddress) {
            return accumulator - (transfer.amount / 10 ** mintDecimals)
        } else return accumulator
    }, 0)
    const date = new Date(transfers[0].timestamp * 1000)
    return { "amount": netTransfer, "date": date }
}

const handleTokenTransfer = (transferIXs, tokenAddress, mintDecimals, mint, isNativeTransfer) => {
    let netTransfer = [];
    if (isNativeTransfer) {
        // solana fm api treats native transfers as a mint address of "" or mint of wrapped sol
        const transfers = transferIXs.filter(transfer => transfer.token === "" || transfer.token === mint);
        netTransfer = handleSOLTransfer(transfers, tokenAddress, mintDecimals, mint,)
    } else {
        const transfers = transferIXs.filter(transfer => transfer.token === mint);
        if (transfers.length === 0) return
        netTransfer = handleSPLTokenTransfer(transfers, tokenAddress, mintDecimals, mint,)
    }

    return netTransfer
}
export const handleTokenTransfers = async (tokenAddress, mintDecimals, mint, isNativeTransfer) => {
    var transfers = await getTransfersForAddress(tokenAddress);
    // only include last month's transfers
    var lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    transfers = transfers.filter(transfer => transfer.data[0].timestamp > lastMonth.getTime() / 1000)
    let parsedTokenTransfers = []
    transfers.forEach(transfer => {
        const transferIXs = transfer.data

        if (transferIXs[transferIXs.length - 1].status === 'Successful') {
            const parsedTransfer = handleTokenTransfer(transferIXs, tokenAddress, mintDecimals, mint, isNativeTransfer)
            if (parsedTransfer !== undefined) parsedTokenTransfers.push(parsedTransfer)
        }
    })
    return parsedTokenTransfers
}