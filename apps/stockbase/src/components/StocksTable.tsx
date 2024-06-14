'use client'

import ListAltIcon from '@mui/icons-material/ListAlt'
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material'
import type { ReactNode } from 'react'
import { forwardRef, useState } from 'react'
import type { TableComponents } from 'react-virtuoso'
import { TableVirtuoso } from 'react-virtuoso'
import {
  useListStockPricesQuery,
  useListStocksQuery,
} from '@/src/lib/features/stocks/stocksApiSlice'

export const ROW_SIZE = 48

interface Data {
  stockId: number
  companyName: string
  symbol: string
  recordedAt: string
  price: number
  isLoading?: boolean
  buttons?: ReactNode
}

interface ColumnData {
  dataKey: keyof Data
  label: string
  numeric?: boolean
  width: number
}

const columns: ColumnData[] = [
  {
    width: 50,
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
  {
    width: 40,
    label: 'Buttons',
    dataKey: 'buttons',
  },
]

const LoadingRow = rowContent(9999, {
  stockId: 0,
  companyName: `asdf`,
  symbol: `asdf`,
  recordedAt: '2021-10-01',
  price: 100,
  isLoading: true,
})

const VirtuosoTableComponents: TableComponents<Data> = {
  Scroller: forwardRef<HTMLDivElement>((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />,
  // @ts-expect-error
  TableHead,
  TableRow: ({ item: _item, ...props }) => <TableRow {...props} />,
  TableBody: forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableBody {...props} ref={ref} />
  )),
}

function fixedHeaderContent(): JSX.Element {
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

function rowContent(_index: number, row: Data): JSX.Element {
  return (
    <>
      {columns.map((column) => {
        let cellContents = row[column.dataKey]
        if (column.dataKey === 'buttons')
          cellContents = <AddToWatchlistButton symbol={row.symbol} />
        if (column.dataKey === 'price') cellContents = <StockPriceCell stockId={`${row.stockId}`} />
        if (column.dataKey === 'recordedAt')
          cellContents = <StockTimeCell stockId={`${row.stockId}`} />

        return (
          <TableCell align={column.numeric ? 'right' : 'left'} key={column.dataKey}>
            {cellContents}
          </TableCell>
        )
      })}
    </>
  )
}

interface AddToWatchlistButtonProps {
  symbol: string
}

function AddToWatchlistButton({ symbol }: AddToWatchlistButtonProps): JSX.Element {
  return (
    <Tooltip title="Add to watchlist">
      <IconButton
        onClick={() => {
          alert(`TODO: Add [${symbol}] to watchlist`)
        }}
      >
        {/* TODO: show a small popup menu with watchlists to add to */}
        <ListAltIcon />
      </IconButton>
    </Tooltip>
  )
}

interface StockPriceCellProps {
  stockId: string
}

function StockPriceCell({ stockId }: StockPriceCellProps): JSX.Element {
  const { data, isLoading, isError, isFetching, refetch } = useListStockPricesQuery({
    stockId,
    limit: 1,
  })

  return <>{data?.prices?.[0]?.price}</>
}

interface StockTimeCellProps {
  stockId: string
}

function StockTimeCell({ stockId }: StockTimeCellProps): JSX.Element {
  const { data, isLoading, isError, isFetching, refetch } = useListStockPricesQuery({
    stockId,
    limit: 1,
  })

  return <>{data?.prices?.[0]?.recordedAt}</>
}

export function StocksTable(): JSX.Element {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, isFetching, refetch } = useListStocksQuery({ limit: 20, page })
  const rows: Data[] = (data?.stocks || []).map(({ companyName, symbol, id }) => ({
    stockId: id || 0,
    companyName: `${companyName}`,
    symbol: `${symbol}`,
    recordedAt: '2021-10-01',
    price: 100,
  }))

  function handleBottomStateChange(isAtBottom: boolean): void {
    const totalPages = data?.paginationMeta?.totalPages
    if (!isAtBottom || !totalPages || page >= totalPages || isFetching) return
    setPage((prevPage) => prevPage + 1)
  }

  return (
    <Paper style={{ height: '100%', width: '100%' }}>
      <TableVirtuoso
        atBottomStateChange={handleBottomStateChange}
        atBottomThreshold={ROW_SIZE * 8}
        components={VirtuosoTableComponents}
        data={rows}
        fixedHeaderContent={fixedHeaderContent}
        itemContent={rowContent}
      />
    </Paper>
  )
}
