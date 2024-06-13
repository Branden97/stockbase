'use client'

import { useState, useEffect, forwardRef, Fragment } from 'react'
import StockRow from '@/src/app/stocks/StockRow'
import './page.css'
import {
  Box,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { GetStockPrices200Response, ListStocks200Response } from '@repo/api-client'
import memoizeOne from 'memoize-one'
import ReactVirtualizedAutoSizer from 'react-virtualized-auto-sizer'
import type { TableComponents } from 'react-virtuoso'
import { TableVirtuoso } from 'react-virtuoso'
import { useListStocksQuery } from '@/src/lib/features/stocks/stocksApiSlice'

export const ROW_SIZE = 48

interface Data {
  companyName: string
  symbol: string
  recordedAt: string
  price: number
}

interface ColumnData {
  dataKey: keyof Data
  label: string
  numeric?: boolean
  width: number
}

const columns: ColumnData[] = [
  {
    width: 200,
    label: 'Company',
    dataKey: 'companyName',
  },
  {
    width: 120,
    label: 'Ticker',
    dataKey: 'symbol',
  },
  {
    width: 120,
    label: 'Date/Time',
    dataKey: 'recordedAt',
  },
  {
    width: 120,
    label: 'Price\u00A0($)',
    dataKey: 'price',
    numeric: true,
  },
]

const VirtuosoTableComponents: TableComponents<Data> = {
  Scroller: forwardRef<HTMLDivElement>((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />,
  TableHead,
  TableRow: ({ item: _item, ...props }) => <TableRow {...props} />,
  TableBody: forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableBody {...props} ref={ref} />
  )),
}

function fixedHeaderContent() {
  return (
    <TableRow>
      {columns.map((column) => (
        <TableCell
          align={column.numeric || false ? 'right' : 'left'}
          key={column.dataKey}
          style={{ width: column.width }}
          sx={{
            backgroundColor: 'background.paper',
          }}
          variant="head"
        >
          {column.label}
        </TableCell>
      ))}
    </TableRow>
  )
}

function rowContent(_index: number, row: Data) {
  return (
    <>
      {columns.map((column) => (
        <TableCell align={column.numeric ? 'right' : 'left'} key={column.dataKey}>
          {row[column.dataKey]}
        </TableCell>
      ))}
    </>
  )
}

export function ReactVirtualizedTable(): JSX.Element {
  const { data: stocksData } = useListStocksQuery({ limit: 100, page: 1 })
  const rows: Data[] = (stocksData?.stocks || []).map(({ companyName, symbol }) => ({
    companyName: `${companyName}`,
    symbol: `${symbol}`,
    recordedAt: '2021-10-01',
    price: 100,
  }))

  return (
    <Paper style={{ height: 400, width: '100%' }}>
      <TableVirtuoso
        components={VirtuosoTableComponents}
        data={rows}
        fixedHeaderContent={fixedHeaderContent}
        itemContent={rowContent}
      />
    </Paper>
  )
}

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
      {data !== undefined && <ReactVirtualizedTable />}
      {isFetching ? <div>Loading more...</div> : null}
    </>
  )
}

export default StocksPage
