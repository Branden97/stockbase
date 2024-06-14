import { log } from '@repo/logger'
import { CounterButton } from '@repo/ui'
import Link from 'next/link' 

export const metadata = {
  title: 'Store | Stockbase',
}

export default function Store(): JSX.Element {
  log('Hey! This is the Store page.')

  return (
    <div className="container">
      <h1 className="title">
        Store <br />
        <span>Stockbase</span>
      </h1>
      <CounterButton />
      <p className="description">
        <Link href="login">Login</Link>
      </p>
    </div>
  )
}
