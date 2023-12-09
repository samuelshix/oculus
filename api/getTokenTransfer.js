

const TRANSFER_TX_TYPES = ["WITHDRAW", "DEPOSIT", "SWAP", "TRANSFER", "TOKEN_MINT"];
const apiKey = process.env.HELIUS_API_KEY;

const getSignaturesForAddress = async (tokenAddress) => {
    const url = `https://api.helius.xyz/v0/addresses/${tokenAddress}/transactions?&api-key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
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

const handleTokenTransfer = (signature, tokenAddress) => {
    const date = new Date(signature.timestamp * 1000)
    const netTransfer = signature.tokenTransfers.reduce((accumulator, transfer) => {
        console.log(tokenAddress, transfer.toTokenAccount, transfer.fromTokenAccount, transfer.tokenAmount)
        if (transfer.toTokenAccount === tokenAddress) {
            return accumulator + transfer.tokenAmount
        } else if (transfer.fromTokenAccount === tokenAddress) {
            return accumulator - transfer.tokenAmount
        } else return accumulator
    }, 0)
    return { "amount": netTransfer, "date": date }
}
export const getTokenTransfer = async (tokenAddress) => {
    var signatures = await getSignaturesForAddress(tokenAddress);

    // var signatures = signatures.filter(signature => TRANSFER_TX_TYPES.includes(signature.type));


    const parsedTokenTransfers = signatures.map(signature => {
        // if (signature.nativeTransfers.length > 0) {
        //     console.log("found SOL transfer")
        //     return handleSOLTransfer(signature, tokenAddress)
        // } else {
        //     return handleSPLTokenTransfer(signature, tokenAddress)
        // }
        return handleTokenTransfer(signature, tokenAddress)
    })
    return parsedTokenTransfers
}