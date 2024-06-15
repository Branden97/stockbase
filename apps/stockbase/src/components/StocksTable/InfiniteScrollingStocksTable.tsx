'use client'

import ListAltIcon from '@mui/icons-material/ListAlt'
import {
  IconButton,
  Paper,
  Skeleton,
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
import { formatDistanceToNow } from 'date-fns'
import { useListAllStocksQuery } from '@/src/lib/features/stocks/stocksApiSlice'

export const ROW_SIZE = 48

interface RowData {
  stockId: number
  companyName: string
  symbol: string
  recordedAt: string
  price: number
  isLoading?: boolean
  buttons?: ReactNode
}

interface ColumnData {
  dataKey: keyof RowData
  label: string
  floadRight?: boolean
  width: number
}

const columns: ColumnData[] = [
  {
    width: 120,
    label: 'Company',
    dataKey: 'companyName',
  },
  {
    width: 60,
    label: 'Ticker',
    dataKey: 'symbol',
  },
  {
    width: 60,
    label: 'Date/Time',
    dataKey: 'recordedAt',
  },
  {
    width: 40,
    label: 'Price\u00A0($)',
    dataKey: 'price',
    floadRight: true,
  },
  {
    width: 40,
    label: '',
    dataKey: 'buttons',
    floadRight: true,
  },
]

const VirtuosoTableComponents: TableComponents<RowData> = {
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
          align={column.floadRight || false ? 'right' : 'left'}
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

function RowContent(_index: number, row: RowData): JSX.Element {
  if (row.isLoading) {
    return (
      <>
        {columns.map((column) => (
          <TableCell key={column.dataKey} style={{ width: column.width }}>
            <Skeleton />
          </TableCell>
        ))}
      </>
    )
  }
  return (
    <>
      {columns.map((column) => {
        let cellContents = row[column.dataKey]
        if (column.dataKey === 'buttons')
          cellContents = <AddToWatchlistButton symbol={row.symbol} />
        if (column.dataKey === 'recordedAt')
          cellContents = formatDistanceToNow(row.recordedAt, {
            addSuffix: true,
            includeSeconds: true,
          })
        // if (column.dataKey === 'price') cellContents = <StockPriceCell stockId={`${row.stockId}`} />

        return (
          <TableCell align={column.floadRight ? 'right' : 'left'} key={column.dataKey}>
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

export function InfiniteScrollingStocksTable(): JSX.Element {
  const limit = 20
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, isFetching, refetch, isSuccess } = useListAllStocksQuery(
    {
      limit,
      page,
    },
    { pollingInterval: 3000 }
  )

  // TODO: calculate the number of extra loading rows based on the table height
  const extraLoadingRowsCount = 20

  // Prepare the main rows
  const rows: RowData[] = (data?.stocks || []).map(
    ({ companyName, symbol, id, recordedAt, latestPrice }) => ({
      stockId: id || 0,
      companyName: `${companyName}`,
      symbol: `${symbol}`,
      recordedAt: `${recordedAt}`,
      price: latestPrice || 0,
    })
  )

  if ((isFetching || isLoading) && !isError) {
    rows.push(
      ...[...Array(extraLoadingRowsCount)].map((_, index) => ({
        stockId: 0,
        companyName: 'Loading...',
        symbol: 'Loading...',
        recordedAt: 'Loading...',
        price: 0,
        isLoading: true,
      }))
    )
  }

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
        itemContent={RowContent}
      />
    </Paper>
  )
}
