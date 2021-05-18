import Link from "next/link";
import { ReactElement } from "react";

import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss'

export default function Header(): ReactElement {
  return (
    <header className={`${commonStyles.container} ${styles.headerContainer}`}>
      <Link href='/'>
        <img src="/logo.svg" alt="logo" />
      </Link>
    </header>
  )
}
