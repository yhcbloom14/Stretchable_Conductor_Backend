"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchPlaceholder?: string
  searchColumn?: string
  pageSize?: number
  onRowClick?: (row: TData) => void
  expandable?: {
    expandedRowRender: (record: TData) => React.ReactNode
    defaultExpandedRowKeys?: string[]
  }
  bordered?: boolean
  size?: "small" | "medium" | "large"
  loading?: boolean
  actions?: {
    render: (record: TData, index: number) => React.ReactNode
  }
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Search...",
  searchColumn,
  pageSize = 10,
  onRowClick,
  expandable,
  bordered = false,
  size = "medium",
  loading = false,
  actions
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [expandedRows, setExpandedRows] = React.useState<Record<string, boolean>>({})

  // Add actions column if actions prop is provided
  const columnsWithActions = React.useMemo(() => {
    if (actions) {
      return [
        ...columns,
        {
          id: "actions",
          header: "Actions",
          cell: ({ row, table }) => {
            const index = table.getRowModel().rows.findIndex(r => r.id === row.id)
            return actions.render(row.original, index)
          },
        } as ColumnDef<TData, TValue>
      ]
    }
    return columns
  }, [columns, actions])

  const table = useReactTable({
    data,
    columns: columnsWithActions,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const toggleRowExpansion = (rowId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }))
  }

  const sizeClasses = {
    small: "text-xs",
    medium: "text-sm", 
    large: "text-base"
  }

  const cellPaddingClasses = {
    small: "p-2",
    medium: "p-4",
    large: "p-6"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        {(() => {
          // If no searchColumn provided, try to find the first column that can be filtered
          let columnToSearch = searchColumn;
          if (!columnToSearch || columnToSearch === "") {
            const firstColumn = table.getAllColumns().find(col => col.getCanFilter());
            columnToSearch = firstColumn?.id;
          }
          
          if (!columnToSearch) return null;
          
          try {
            const column = table.getColumn(columnToSearch);
            if (!column) return null;
            return (
              <Input
                placeholder={searchPlaceholder}
                value={(column.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  column.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
            );
          } catch (error) {
            return null;
          }
        })()}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className={`rounded-md ${bordered ? 'border' : ''}`}>
        <Table className={sizeClasses[size]}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {expandable && (
                  <TableHead className={cellPaddingClasses[size]} style={{ width: 50 }}>
                    {/* Expand/Collapse column header */}
                  </TableHead>
                )}
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className={cellPaddingClasses[size]}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {expandable && (
                      <TableCell className={cellPaddingClasses[size]}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleRowExpansion(row.id)
                          }}
                        >
                          {expandedRows[row.id] ? "−" : "+"}
                        </Button>
                      </TableCell>
                    )}
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={cellPaddingClasses[size]}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {expandable && expandedRows[row.id] && (
                    <TableRow>
                      <TableCell 
                        colSpan={row.getVisibleCells().length + (expandable ? 1 : 0)}
                        className={`${cellPaddingClasses[size]} bg-muted/30`}
                      >
                        {expandable.expandedRowRender(row.original)}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (expandable ? 1 : 0) + (actions ? 1 : 0)}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}