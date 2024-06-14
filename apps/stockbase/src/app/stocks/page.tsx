import { StocksTable } from '@/src/components/StocksTable'
import './page.css'

function StocksPage(): JSX.Element {
  return (
    <>
      <h1>Stocks</h1>
      <StocksTable />
    </>
  )
}

export default StocksPage
