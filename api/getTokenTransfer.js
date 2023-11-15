const NON_TRANSFER_IX_TYPES = ["UNKNOWN", "CREATE_ORDER", "CANCEL_ORDER"];

const getSignaturesForAddress = async () => {
    const url = `https://api.helius.xyz/v0/addresses/${tokenAddress}/transactions?&api-key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

const handleSOLTransfer = (signature) => {
    const date = new Date(signature.timestamp * 1000)
    const SOLTranfers = signature.nativeTransfers
    const netTransfer = SOLTranfers.reduce((accumulator, transfer) => {
        if (transfer.toUserAccount === tokenAddress) {
            return accumulator + currentValue.amount
        } else if (transfer.fromUserAccount === tokenAddress) {
            return accumulator - currentValue.amount
        } else return accumulator
    }, 0)
    return { "amount": netTransfer, "date": date }
}

const handleSPLTokenTransfer = (signature) => {
    const date = new Date(signature.timestamp * 1000)
    console.log(signature)
    const tokenTransfers = signature.tokenTransfers.filter(
        transfer => transfer.fromTokenAccount === tokenAddress || transfer.toTokenAccount === tokenAddress
    )[0]

    if (tokenTransfers.fromTokenAccount === tokenAddress) {
        return { "amount": -tokenTransfers.tokenAmount, "date": date }
    } else if (tokenTransfers.toTokenAccount === tokenAddress) {
        return { "amount": tokenTransfers.tokenAmount, "date": date }
    } else return new Error("Token address not found in token transfers")
}

export const getTokenTransfer = async (tokenAddress) => {
    var signatures = await getSignaturesForAddress();
    signatures = signatures.filter(signature => (signature.tokenTransfers || signature.nativeTransfers) && !NON_TRANSFER_IX_TYPES.includes(signature.type));
    const parsedTokenTransfers = signatures.map(signature => {
        // find way to check if this is a native balance
        if (signature.nativeTransfers) {
            return handleSOLTransfer(signature)
        } else if (signature.tokenTransfers) {
            return handleSPLTokenTransfer(signature)
        } else return new Error("No token transfers found")
    })
    return parsedTokenTransfers
}