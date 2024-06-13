import React, { useEffect, useState } from 'react'
import type { Stock, StockPrice } from '@repo/api-client'
import { useListStockPricesQuery } from '@/src/lib/features/stocks/stocksApiSlice'
import { Paper, Typography } from '@mui/material'

interface StockRowProps {
  stock: Stock
  fetchAllPrices?: boolean
}

function StockRow({ stock, fetchAllPrices }: StockRowProps): React.JSX.Element {
  const [prices, setPrices] = useState<StockPrice[]>([])
  const [page, setPage] = useState(1)
  const [allFetched, setAllFetched] = useState(false)

  const {
    data: pricesData,
    isFetching: isFetchingPrices,
    isError: isErrorPrices,
  } = useListStockPricesQuery(
    { stockId: `${stock.id}`, limit: 1, page },
    { skip: allFetched } // Skip fetching if all data has been fetched
  )

  useEffect(() => {
    if (pricesData?.prices) {
      setPrices((prevPrices) => [...prevPrices, ...(pricesData?.prices || [])])
      const totalPages = pricesData.paginationMeta?.totalPages
      if (page >= (totalPages || 0)) {
        setAllFetched(true)
      } else if (fetchAllPrices) {
        setPage((prevPage) => prevPage + 1)
      }
    }
  }, [pricesData, fetchAllPrices, page])

  return (
    <Paper style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ flex: 1 }}>
        <Typography variant="h4">{stock.symbol}</Typography>
        <Typography variant="body1">{stock.companyName}</Typography>
      </div>
      <div style={{ flex: 1, textAlign: 'right', gap: 8 }}>
        {/* <Typography variant="h5">Prices</Typography> */}
        {prices.length > 0 ? (
          prices.map((price, index) => (
            <div key={index}>
              <Typography variant="body1">Date: {price.recordedAt}</Typography>
              <Typography variant="body1">Price: {price.price}</Typography>
            </div>
          ))
        ) : (
          <Typography variant="body1">Loading prices...</Typography>
        )}
        {isFetchingPrices ? <div>Loading more prices...</div> : null}
        {isErrorPrices ? <div>Error occurred while fetching prices</div> : null}
      </div>
    </Paper>
  )
}

export default StockRow
