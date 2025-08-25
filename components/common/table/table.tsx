import TableHeader from './table-header'
import TableItem from './table-item'
import { Column } from '@/lib/types/Column'


interface TableProps {
  rows: Record<string, any>[]
  columns: Column[]
}

export default function Table({ rows, columns }: TableProps) {
  return (
    <div className='flex flex-col gap-4'>
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl relative">
          {/* Table */}
          <div className="overflow-y-auto max-h-[600px]">
            <table className="table-auto w-full dark:text-gray-300 divide-y divide-gray-100 dark:divide-gray-700/60 border-collapse">
              {/* Table header */}
              <TableHeader columns={columns} />
              {/* Table body */}
              <TableItem columns={columns} rows={rows}/>
            </table>
          </div>
      </div>
      {/*Footnotes*/}
      {/*
      <div className='flex flex-col gap-2 text-xs xs:ml-4'>
        <p>1. If the predicted film quality is low, no property results will be displayed.</p>
        <p>2. If the prediction variance is above 30%, the predicted results will not be shown to ensure reliable experimental outcomes.</p>
      </div>
      */}
    </div>
  )
}