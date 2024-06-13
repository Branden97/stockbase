'use client'

import { useState, useEffect } from 'react'
import { useListStocksQuery } from '@/src/lib/features/stocks/stocksApiSlice'
import StockRow from '@/src/app/stocks/StockRow'
import { FixedSizeList as List } from 'react-window'
import './page.css'

function StocksPage(): JSX.Element {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, isFetching, refetch } = useListStocksQuery({ limit: 10, page })

  useEffect(() => {
    const loadMore = () => {
      const totalPages = data?.paginationMeta?.totalPages
      if (!totalPages || page >= totalPages || isFetching) return
      setPage((prevPage) => prevPage + 1)
    }
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 2
      ) {
        loadMore()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isFetching])

  if (isLoading && page === 1) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error occurred while fetching data</div>
  }

  return (
    <>
      <h1>Stocks</h1>
      <List
        height={400} // Specify the height of the list
        itemCount={data?.stocks?.length || 0} // Specify the number of items in the list
        itemSize={70} // Specify the height of each item
        width="100%" // Specify the width of the list
      >
        {({ index, style }) => (
          <div style={style}>
            <StockRow key={data?.stocks[index].id} stock={data?.stocks[index]} />
          </div>
        )}
      </List>
      {isFetching ? <div>Loading more...</div> : null}
    </>
  )
}

export default StocksPage
