import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();
const YESTERDAY = Math.round(new Date(Date.now() - 86400000).getTime() / 1000);

export async function checkIfTokenExists(tokenName) {
  const token = await prisma.coin.findUnique({
    where: {
      name: tokenName
    }
  })
  return token
}

async function getNewTokenHistories(tokenAddress) {
  const options = { method: 'GET', headers: { 'X-API-KEY': '5db8fc01121a42ad9d3977f07736961c' } };
  const prices = await fetch(`https://public-api.birdeye.so/public/history_price?address=${tokenAddress}&address_type=token&time_from=${0}&time_to=${YESTERDAY}`, options)
    .then(response => response.json())
  console.log("prices", prices)
  return prices.data.items
}

async function getFullPriceHistory(coinGeckoID) {
  const prices = await fetch(`https://api.coingecko.com/api/v3/coins/${coinGeckoID}/market_chart/range?vs_currency=usd&from=${0}&to=${YESTERDAY}`)
    .then(res => res.json())
    .then(json => json.prices)

  return prices
}


export async function createToken(coinIdentifier, newToken, mintAddress, coinName) {
  let prices;

  if (newToken) {
    prices = await getNewTokenHistories(mintAddress);
    prices = prices.map(price => {
      return {
        price: price.value,
        date: new Date(price.unixTime * 1000)
      }
    })
  } else {
    prices = await getFullPriceHistory(coinIdentifier);
    prices = prices.map(price => {
      return {
        price: price[1],
        date: new Date(price[0]),
        mintAddress: mintAddress
      }
    })
  }
  console.log(prices)
  await prisma.coin.create({
    data: {
      name: coinName,
      coinIdentifier: coinIdentifier,
      prices: {
        create: prices
      },
      mintAddress: mintAddress
    }
  })
}

export async function getTokenPriceHistory(tokenName) {
  const prices = await prisma.price.findMany({
    where: {
      coin: {
        name: tokenName
      }
    }
  })
  return prices
}
async function main() {
  // delete all fields
  // await prisma.price.deleteMany({})
  // await prisma.coin.deleteMany({})
  // const tokenWithPrices = await prisma.price.findMany({
  // })
  // console.log(tokenWithPrices)


  // console.dir(tokenWithPrices, { depth: null })
  // const prices = await prisma.coin.findUnique({
  //   where: {
  //     name: 'bitcoin'
  //   }
  // })
  // console.log(prices.prices)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })