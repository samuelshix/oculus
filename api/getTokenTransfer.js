

const TRANSFER_TX_TYPES = ["WITHDRAW", "DEPOSIT", "SWAP", "TRANSFER", "TOKEN_MINT"];
const apiKey = process.env.HELIUS_API_KEY;

const getTransfersForAddress = async (tokenAddress) => {
    // const url = `https://api.helius.xyz/v0/addresses/${tokenAddress}/transactions?&api-key=${apiKey}`;
    const url = `https://api.solana.fm/v0/accounts/${tokenAddress}/transfers?utcFrom=0&utcTo=${Date.now()}`
    const response = await fetch(url);
    const data = await response.json();

    return data.results;
}

const handleSOLTransfer = (signature, tokenAddress) => {
    const date = new Date(signature.timestamp * 1000)
    const SOLTranfers = signature.nativeTransfers
    const netTransfer = SOLTranfers.reduce((accumulator, transfer) => {
        if (transfer.toUserAccount === tokenAddress) {
            return accumulator + transfer.amount
        } else if (transfer.fromUserAccount === tokenAddress) {
            return accumulator - transfer.amount
        } else return accumulator
    }, 0)
    return { "amount": netTransfer, "date": date }
}

const handleSPLTokenTransfer = (signature, tokenAddress) => {
    const date = new Date(signature.timestamp * 1000)
    const netTransfer = signature.tokenTransfers.reduce((accumulator, transfer) => {
        if (transfer.toTokenAccount === tokenAddress) {
            return accumulator + transfer.amount
        } else if (transfer.fromTokenAccount === tokenAddress) {
            return accumulator - transfer.amount
        } else return accumulator
    }, 0)
    return { "amount": netTransfer, "date": date }
}

const handleTokenTransfer = (transferIXs, tokenAddress, mintDecimals, mint) => {
    // assumption: first or last transfer instruction is the token transfer
    const transfers = transferIXs.filter(transfer => transfer.token === mint);
    console.log(transfers)
    if (transfers.length === 0) return
    // this checks in case there are more than 1 total transfers with the token address
    const netTransfer = transfers.reduce((accumulator, transfer) => {
        console.log(transfer.amount / 10 ** mintDecimals)
        if (transfer.destinationAssociation === tokenAddress) {
            return accumulator + (transfer.amount / 10 ** mintDecimals)
        } else if (transfer.sourceAssociation === tokenAddress) {
            return accumulator - (transfer.amount / 10 ** mintDecimals)
        } else return accumulator
    }, 0)
    console.log("net transfer", netTransfer)
    const date = new Date(transfers[0].timestamp * 1000)
    return { "amount": netTransfer, "date": date }
}
export const handleTokenTransfers = async (tokenAddress, mintDecimals, mint) => {
    var transfers = await getTransfersForAddress(tokenAddress);
    // only include last month's transfers
    var lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    transfers = transfers.filter(transfer => transfer.data[0].timestamp > lastMonth.getTime() / 1000)
    let parsedTokenTransfers = []
    transfers.forEach(transfer => {
        const transferIXs = transfer.data
        // if (signature.nativeTransfers.length > 0) {
        //     console.log("found SOL transfer")
        //     return handleSOLTransfer(signature, tokenAddress)
        // } else {
        //     return handleSPLTokenTransfer(signature, tokenAddress)
        // }
        if (transferIXs[transferIXs.length - 1].status === 'Successful') {
            const parsedTransfer = handleTokenTransfer(transferIXs, tokenAddress, mintDecimals, mint)
            console.log("Transfer:", parsedTransfer)
            if (parsedTransfer !== undefined) parsedTokenTransfers.push(parsedTransfer)
        }
    })
    console.log(parsedTokenTransfers)
    return parsedTokenTransfers
}