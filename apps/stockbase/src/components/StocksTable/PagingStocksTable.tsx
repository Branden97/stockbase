'use client'
import {
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  LinearProgress,
  IconButton,
  Typography,
} from '@mui/material'
import ListAltIcon from '@mui/icons-material/ListAlt'
import type { ReactNode } from 'react'
import { useState } from 'react'
import type { ListStocks200Response, Stock } from '@repo/api-client'
import { useListAllStocksQuery } from '../../lib/features/stocks/stocksApiSlice'
import { formatDistanceToNow } from 'date-fns'

/**
 * Interface for column data used in the table
 */
interface ColumnData {
  dataKey: keyof Stock
  label: string
  floatRight?: boolean
  width: number
}

const columns: ColumnData[] = [
  { width: 100, label: 'Company', dataKey: 'companyName' },
  { width: 60, label: 'Ticker', dataKey: 'symbol' },
  { width: 60, label: 'Last Updated', dataKey: 'recordedAt' },
  { width: 40, label: 'Price ($)', dataKey: 'latestPrice', floatRight: true },
  { width: 40, label: '', dataKey: 'id', floatRight: true },
]

/**
 * Selects stocks from the query data
 * @param data - The data returned from the query
 * @returns Array of stocks
 */
function selectStocksFromQuery(data: ListStocks200Response | undefined): Stock[] {
  return data?.stocks || []
}

/**
 * Selects the total number of pages from the query data
 * @param data - The data returned from the query
 * @returns Total number of pages
 */
function selectTotalPagesFromQuery(data: ListStocks200Response | undefined): number {
  return data?.paginationMeta?.totalPages || 0
}

/**
 * Component for rendering the table header
 */
function TableHeader() {
  return (
    <TableHead>
      <TableRow>
        {columns.map((column) => (
          <TableCell
            align={column.floatRight ? 'right' : 'left'}
            key={column.dataKey}
            style={{ width: column.width }}
          >
            {column.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

/**
 * Renders the content for each table cell
 * @param {Stock} stock - The stock data for the current row
 * @param {ColumnData} column - The column configuration
 * @returns {ReactNode} - The rendered content for the cell
 */
function renderCellContent(stock: Stock, column: ColumnData): ReactNode {
  if (column.dataKey === 'id') {
    return (
      <IconButton
        onClick={() => {
          alert(`TODO: Add "${stock.symbol}" to watchlist`)
        }}
      >
        <ListAltIcon />
      </IconButton>
    )
  }

  if (column.dataKey === 'recordedAt')
    return formatDistanceToNow(`${stock[column.dataKey]}`, {
      addSuffix: true,
      includeSeconds: true,
    })

  if (column.dataKey === 'latestPrice')
    return (
      <Typography
        variant="body2"
        sx={{ color: parseFloat(`${stock.percentChange}`) < 0 ? 'error.main' : 'success.main' }}
      >
        {stock[column.dataKey]}
        <br />({stock.percentChange})
      </Typography>
    )

  return (
    <Typography variant="body2" noWrap>
      {stock[column.dataKey]}
    </Typography>
  )
}

/**
 * Component for rendering the table body
 * @param {Object} props - Component props
 * @param {boolean} props.isLoading - Flag indicating if the data is loading
 * @param {boolean} props.isFetching - Flag indicating if the data is fetching
 * @param {Stock[]} props.stocks - Array of stocks
 * @param {number} props.rowsPerPage - Number of rows per page
 */
function TableBodyContent({
  isLoading,
  isFetching,
  stocks,
  rowsPerPage,
}: {
  isLoading: boolean
  isFetching: boolean
  stocks: Stock[]
  rowsPerPage: number
}) {
  if (isLoading) {
    return (
      <>
        {[...Array(rowsPerPage)].map((_, index) => (
          <TableRow key={`loading-${index}`}>
            {columns.map((column) => (
              <TableCell
                align={column.floatRight ? 'right' : 'left'}
                key={`loading-${index}-${column.dataKey}`}
                style={{ width: column.width }}
              >
                <Skeleton />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </>
    )
  }

  return (
    <>
      <tr>
        <td colSpan={columns.length}>
          <LinearProgress sx={{ visibility: isFetching ? 'visible' : 'hidden' }} />
        </td>
      </tr>
      {stocks.map((stock) => (
        <TableRow key={stock.id}>
          {columns.map((column) => (
            <TableCell
              align={column.floatRight ? 'right' : 'left'}
              key={column.dataKey}
              style={{ width: column.width }}
            >
              {renderCellContent(stock, column)}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

/**
 * Component for rendering the stocks table
 */
export function PagingStocksTable(): JSX.Element {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const { data, isLoading, isError, isFetching, refetch, isSuccess } = useListAllStocksQuery(
    {
      limit: rowsPerPage,
      page: page + 1,
    },
    { pollingInterval: 3000 }
  )

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const stocks = selectStocksFromQuery(data)
  const totalPages = selectTotalPagesFromQuery(data)

  return (
    <TableContainer id="table-container">
      <Table>
        <TableHeader />
        <TableBody
        // TODO: figure out a nice contrast color for the table body
        // sx={{backgroundColor: theme => theme.palette}}
        >
          <TableBodyContent
            isLoading={isLoading}
            isFetching={isFetching}
            stocks={stocks}
            rowsPerPage={rowsPerPage}
          />
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={totalPages * rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 20, 30, 100]}
      />
    </TableContainer>
  )
}
