'use client'

import { useState, useEffect } from 'react'
import { useListStocksQuery } from '@/src/lib/features/stocks/stocksApiSlice'
import './page.css'

function StocksPage(): JSX.Element {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, isFetching, refetch } = useListStocksQuery(
    { limit: 10, page }
  )

  const loadMore = () => {
    const totalPages = data?.paginationMeta?.totalPages
    if (!totalPages || page >= totalPages || isFetching) return
    setPage((prevPage) => prevPage + 1)
  }

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 2
      ) {
        loadMore()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isFetching, loadMore])

  if (isLoading && page === 1) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error occurred while fetching data</div>
  }

  return (
    <div>
      <h1>Stocks</h1>
      {data?.stocks?.map((stock) => (
        <div className="stockRow" key={stock.id}>
          <h2>{stock.symbol}</h2>
          <p>{stock.companyName}</p>
        </div>
      ))}
      {isFetching && <div>Loading more...</div>}
    </div>
  )
}

export default StocksPage
