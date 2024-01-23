import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
const TODAY_UNIX = Math.round(new Date(Date.now()).getTime() / 1000);
const YESTERDAY = new Date(Date.now() - 86400000);
const BIRDEYE_OPTIONS = { method: 'GET', headers: { 'X-API-KEY': process.env.BIRDEYE_API_KEY } };
async function getNewTokenHistories(tokenAddress) {

  const prices = await fetch(`https://public-api.birdeye.so/public/history_price?address=${tokenAddress}&address_type=token&time_from=${0}&time_to=${TODAY_UNIX}`, BIRDEYE_OPTIONS)
    .then(response => response.json())
  return prices.data.items
}

async function getFullPriceHistory(coinGeckoID) {
  const prices = await fetch(`https://api.coingecko.com/api/v3/coins/${coinGeckoID}/market_chart/range?vs_currency=usd&from=${0}&to=${TODAY_UNIX}`)
    .then(res => res.json())
    .then(json => json.prices)

  return prices
}

export async function checkIfTokenExists(tokenIdentifier) {
  const token = await prisma.coin.findUnique({
    where: {
      coinIdentifier: tokenIdentifier
    }
  })
  return token
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
        // only use last 30 days
        create: prices.slice(-30)
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

export async function updateMissingPrices() {
  // for the first coin in the database, get the last price entry's date
  const lastPrice = await prisma.price.findFirst({
    orderBy: {
      date: 'desc'
    }
  })
  const lastPriceDate = new Date(lastPrice.date)
  // do not run this script if price is already up to date
  if (lastPriceDate.getDate() === YESTERDAY.getDate() &&
    lastPriceDate.getMonth() === YESTERDAY.getMonth() &&
    lastPriceDate.getFullYear() === YESTERDAY.getFullYear()) {
    console.log("Prices already up to date")
    return;
  }

  // get the timestamp of the last price entry
  const lastPriceDateUnix = lastPriceDate.getTime();
  // get the difference in days between today and the last price entry
  const differenceInUnixTime = (TODAY_UNIX - lastPriceDateUnix)

  // update each coin in the database
  const coins = await prisma.coin.findMany({})
  const res = await coins.forEach(async (coin) => {
    // get the coin's coinGeckoID
    const mintAddress = coin.mintAddress
    await fetch(`https://public-api.birdeye.so/public/history_price?address=${mintAddress}&address_type=token&time_from=${differenceInUnixTime}&time_to=${TODAY_UNIX}`, BIRDEYE_OPTIONS)
      .then(res => res.json())
      .then(json => {
        if (!json.prices) return "Rate limit reached"
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
      })
  })
  console.log("Prices updated", res)
}

async function clearDB() {
  console.log("Clearing database")
  await prisma.price.deleteMany({})
  await prisma.coin.deleteMany({})
  const tokenWithPrices = await prisma.price.findMany({
  })
  console.log(tokenWithPrices)
}

async function main(args) {
  const commands = {
    updateMissingPrices: updateMissingPrices,
    clearDB: clearDB,
    getTokenPriceHistory: getTokenPriceHistory,
  };

  if (args.length > 0) {
    args.forEach((arg) => {
      const command = commands[arg];
      if (command) {
        command();
      } else {
        console.log(`Invalid command: ${arg}`);
      }
    });
  } else {
    console.log("No arguments provided.");
  }
}

// make sure to not run main when calling functions from another file
if (import.meta.url === `file://${process.argv[1]}`) {
  main(process.argv.slice(2))
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}