'use client'

import { useListStocksQuery } from '@/src/lib/features/stocks/stocksApiSlice'

function StocksPage(): JSX.Element {
  const { data, isLoading, isError } = useListStocksQuery(100)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error occurred while fetching data</div>
  }

  return (
    <div>
      <h1>Stocks</h1>
      {data?.stocks?.map((stock) => (
        <div key={stock.id}>
          <h2>{stock.symbol}</h2>
          <p>{stock.companyName}</p>
        </div>
      ))}
    </div>
  )
}

export default StocksPage
