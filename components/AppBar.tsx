import { FC } from 'react'
import styles from '../styles/Home.module.css'
import "../styles/Home.module.css"
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import Image from 'next/image'

export const AppBar: FC = () => {
    return (
        <div className={styles.AppHeader}>
            <p> ◕ ‿ ◕</p>
            <div className={styles.AppTitleWrapper}>
                <span className={styles.AppTitle}>Snapshot</span>
                <div className={styles.AppTitleBar}></div>
            </div>
            <WalletMultiButton className={styles.walletButton} />
        </div>
    )
}