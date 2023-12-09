import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();
const YESTERDAY = Math.round(new Date(Date.now() - 86400000).getTime() / 1000);

export async function checkIfTokenExists(tokenIdentifier) {
  const token = await prisma.coin.findUnique({
    where: {
      coinIdentifier: tokenIdentifier
    }
  })
  return token
}

async function getNewTokenHistories(tokenAddress) {
  const options = { method: 'GET', headers: { 'X-API-KEY': '5db8fc01121a42ad9d3977f07736961c' } };
  const prices = await fetch(`https://public-api.birdeye.so/public/history_price?address=${tokenAddress}&address_type=token&time_from=${0}&time_to=${YESTERDAY}`, options)
    .then(response => response.json())
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
  return coinName
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
async function clearDB() {
  await prisma.price.deleteMany({})
  await prisma.coin.deleteMany({})
  const tokenWithPrices = await prisma.price.findMany({
  })
  console.log(tokenWithPrices)
}
async function manuallyUpdatePrices() {
  // get today's date as a javascript date object
  const today = new Date()
  // for the first coin in the database, get the last price entry's date
  const lastPrice = await prisma.price.findFirst({
    orderBy: {
      date: 'desc'
    }
  })
  // get the timestamp of the last price entry
  const lastPriceDate = (new Date(lastPrice.date)).getTime() / 1000
  // get the difference in days between today and the last price entry
  const differenceInUnixTime = (today - lastPriceDate)

  // update each coin in the database
  const coins = await prisma.coin.findMany({})
  const res = coins.forEach(async (coin) => {
    // get the coin's coinGeckoID
    const coinGeckoID = coin.coinIdentifier
    console.log(coin.coinIdentifier)
    await fetch(`https://api.coingecko.com/api/v3/coins/${coinGeckoID}/market_chart/range?vs_currency=usd&from=${differenceInUnixTime}&to=${YESTERDAY}`)
      .then(res => {
        console.log(res.json())
        res.json()
      })
      .then(json =>
        json.prices.forEach(async (price) => {
          await prisma.prices.create({
            data: {
              price: price.value,
              date: new Date(price.unixTime * 1000),
              coin: {
                connect: {
                  id: coin.id
                }
              }
            }
          })
        })
      )
    // create a new price entry for each price in the price history
  })
  console.log(res)
}
async function main() {
  // await clearDB()
  // await manuallyUpdatePrices()
  // get the latest date for the first coin in the database
  // const lastPrice = await prisma.price.findMany({
  //   orderBy: {
  //     date: 'desc'
  //   }
  // })
  // get the timestamp of the last price entry
  // const lastPriceDate = (new Date(lastPrice.date))
  // console.log(lastPriceDate)
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