import { Column } from "@/lib/types/Column";
import TableCell from "./table-cell";

interface TableItemProps {
  columns: Column[]
  rows: Record<string, any>[]
}

export default function TableItem({ columns, rows }: TableItemProps) {
  /*const {  
    uncertaintyColor,
    feasibilityColor,
    feasibilityIcon
  } = TableProperties()*/
   if (!rows?.length) return null

  return (
    <tbody className="text-sm">
      {rows.map((row, i) => (
        <tr className="border-b border-gray-200 dark:border-gray-700" key={`row-${i}`}>
          {columns.map((column, j) => (
              <td key={`${row}-${i}-${j}`} className="px-2 first:pl-5 last:pr-5 py-4 whitespace-nowrap">
                <TableCell column={column} data={row}/>
              </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}

{/*Data*/}
{/*{columns[col].isUncertainty ?
    <div className={`inline-flex font-medium rounded-full text-center px-2.5 py-0.5 ${uncertaintyColor(output[col])}`}>{output[col].toPrecision(3)}</div> 
: columns[col].isFeasibility ?
    <div className='flex'>
      <div className={`rounded-full px-2.5 ${feasibilityColor(output[col])}`}>
        <div className={`flex items-center gap-1`}>
          {feasibilityIcon(output[col])}
        </div>
      </div>
    </div>
:
  <div className="text-center md:text-left">{output[col].toPrecision(3)}</div>
}*/}

//Image Cell
{/*
<td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
  <div className="flex items-center text-gray-800">
    <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full mr-2 sm:mr-3">
      <Image className="ml-1" src={order.image} width={20} height={20} alt={order.order} />
    </div>
    <div className="font-medium text-sky-600">{order.order}</div>
  </div>
</td>
*/}
//Icon Cell
{/*
<td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
  <div className="flex items-center">
    {typeIcon(invoice.type)}
  </div>
</td>
*/}

//X-cell
{/*
  <div className='flex'>
    <div className={`rounded-full px-2.5 ${uncertaintyColor(output[col])}`}>
    <div className={`flex items-center gap-1`}>
    <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6"/>
    </svg>
  </div>
</div>
*/}

//Row Actions
{/*
<td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px">
  <div className="space-x-1">
    <button className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 rounded-full">
      <span className="sr-only">Edit</span>
      <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32">
        <path d="M19.7 8.3c-.4-.4-1-.4-1.4 0l-10 10c-.2.2-.3.4-.3.7v4c0 .6.4 1 1 1h4c.3 0 .5-.1.7-.3l10-10c.4-.4.4-1 0-1.4l-4-4zM12.6 22H10v-2.6l6-6 2.6 2.6-6 6zm7.4-7.4L17.4 12l1.6-1.6 2.6 2.6-1.6 1.6z" />
      </svg>
    </button>
    <button className="text-red-500 hover:text-red-600 rounded-full">
      <span className="sr-only">Delete</span>
      <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32">
        <path d="M13 15h2v6h-2zM17 15h2v6h-2z" />
        <path d="M20 9c0-.6-.4-1-1-1h-6c-.6 0-1 .4-1 1v2H8v2h1v10c0 .6.4 1 1 1h12c.6 0 1-.4 1-1V13h1v-2h-4V9zm-6 1h4v1h-4v-1zm7 3v9H11v-9h10z" />
      </svg>
    </button>
  </div>
</td>
*/}

//Toggle More    
{/*<td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px">
  <div className="flex items-center">
    <button
      className={`text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 ${descriptionOpen && 'rotate-180'}`}
      aria-expanded={descriptionOpen}
      onClick={() => setDescriptionOpen(!descriptionOpen)}
      aria-controls={`description-${output.id}`}
    >
      <span className="sr-only">Menu</span>
      <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32">
        <path d="M16 20l-5.4-5.4 1.4-1.4 4 4 4-4 1.4 1.4z" />
      </svg>
    </button>
  </div>
</td>*/}
 {/*
Example of content revealing when clicking the button on the right side:
Note that you must set a "colSpan" attribute on the <td> element,
and it should match the number of columns in your table
*/}
{/*className={`${!descriptionOpen && 'hidden'}`}>*/}
{/*}
<tr id={`description-`} role="region">
  <td colSpan={10} className="px-2 first:pl-5 last:pr-5 py-3">
    <div className="flex items-center bg-gray-50 dark:bg-gray-950/[0.15] dark:text-gray-400 p-3 -mt-3">
      <svg className="shrink-0 fill-current text-gray-400 dark:text-gray-500 mr-2" width="16" height="16">
        <path d="M1 16h3c.3 0 .5-.1.7-.3l11-11c.4-.4.4-1 0-1.4l-3-3c-.4-.4-1-.4-1.4 0l-11 11c-.2.2-.3.4-.3.7v3c0 .6.4 1 1 1zm1-3.6l10-10L13.6 4l-10 10H2v-1.6z" />
      </svg>
      <div className="">
        <div className='flex flex-row justify-start gap-4'>{
          Object.entries(inputs[0])
          //.filter(([abbr, value]) => materials.find(material => material.abbr === abbr))
          .filter(([abbr, value]) => value > 0)
          .map(([abbr, value]) => (
            <span key={`report-composition-${abbr}`}><strong>{abbr}</strong> {value.toFixed(2)}%</span>
          ))
        }</div>
      </div>
    </div>
  </td>
</tr>
*/}