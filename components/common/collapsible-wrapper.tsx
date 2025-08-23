import { ReactNode, useState } from 'react'
import ChevronDownIcon from '../icons/chevron-down'

const CollapsibleWrapper = ({ title, children }: { title?: string, children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(true)

    const toggleCollapse = () => {
        setIsOpen(!isOpen)
    }

    return (
        <div className="collapsible-wrapper">
            <div className="flex items-center gap-x-2 mb-6">
                {/* {title && <h3 className="collapsible-title">{title}</h3>} */}
                {title && <h1 className="text-lg md:text-xl text-gray-700 dark:text-gray-200 font-medium">{title}</h1>}

                

                <button 
                    className={`${isOpen ? "rotate-180" : ""} transition-transform duration-200 ease-in-out`}
                    onClick={toggleCollapse}
                >
                    <ChevronDownIcon />
                </button>
            </div>
            {isOpen && (
                <div className="collapsible-content">
                    {children}
                </div>
            )}
        </div>
    )
}

export default CollapsibleWrapper