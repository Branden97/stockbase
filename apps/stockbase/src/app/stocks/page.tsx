'use client'

import { InfiniteScrollingStocksTable } from '@/src/components/StocksTable'
import { PagingStocksTable } from '@/src/components/StocksTable'
import './page.css'
import { useState } from 'react'
import { Box, Switch } from '@mui/material'

function StocksPage(): JSX.Element {
  // add a @mui/material switch to toggle between the two tables
  const [useInfiniteScrolling, setUseInfiniteScrolling] = useState(false)
  return (
    <>
      <Box display="flex" justifyContent="left" alignItems="center" p={2}>
        <h1>All Stocks</h1>
        {/* <label>
          <Switch
            checked={useInfiniteScrolling}
            onChange={(e) => setUseInfiniteScrolling(e.target.checked)}
            inputProps={{ 'aria-label': 'Toggle Infinite Scrolling' }}
          />
          Use Infinite Scrolling
        </label> */}
      </Box>
      {useInfiniteScrolling ? <InfiniteScrollingStocksTable /> : <PagingStocksTable />}
    </>
  )
}

export default StocksPage
