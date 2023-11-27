import { FC } from 'react'
import styles from '../styles/Home.module.css'
import "../styles/Home.module.css"
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import Image from 'next/image'

export const AppBar: FC = () => {
    return (
        <div className={styles.AppHeader}>
            <p> ◕ ‿ ◕</p>
            <span style={{ translate: "30px" }}>Oculus</span>
            <WalletMultiButton className={styles.walletButton} />
        </div>
    )
}