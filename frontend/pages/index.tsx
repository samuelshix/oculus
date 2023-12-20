
import { Center, Box, Heading } from '@chakra-ui/react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { AppBar } from '../components/AppBar'
import styles from '../styles/Home.module.css'
import Portfolio from '../components/Portfolio'

const Home: NextPage = () => {
  return (
    <div className={styles.App}>
      <Head>
        <title>Solana Account Value Historical</title>
      </Head>
      <AppBar />
      <Center>
        <Portfolio />
      </Center>
    </div>
  )
}

export default Home
