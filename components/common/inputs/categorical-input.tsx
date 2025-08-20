"use client"

interface CategoricalInputProps {
    label: string
    name: string
    options: {value: string, label: string}[]
    disabled?: boolean
    error?: string
    instructions?: string
    children?: React.ReactNode
    value?: string
    onChange?: (value: string) => void
}

export default function CategoricalInput({label, name, options, disabled, error, instructions, children, value, onChange }: CategoricalInputProps) {
    return (
        <div className="space-y-2">
          <div className="flex items-center justify-between min-h-[20px]">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 leading-5">
                {label}
            </label>
            {children}
          </div>
          <div className="relative">
            <select
              id={name}
              name={name}
              disabled={disabled || false}
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              required
              className="flex h-10 w-full max-w-48 rounded-md border border-gray-200 dark:border-[#2a3349] bg-white dark:bg-[#1c2438] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 
                focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 focus:ring-offset-1 dark:focus:ring-offset-[#0f1420]
                hover:border-gray-300 dark:hover:border-gray-600
                disabled:cursor-not-allowed disabled:opacity-50 
                transition-colors
                appearance-none cursor-pointer
                bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236B7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M10%203a1%201%200%2001.707.293l3%203a1%201%200%2001-1.414%201.414L10%205.414%207.707%207.707a1%201%200%2001-1.414-1.414l3-3A1%201%200%200110%203zm-3.707%209.293a1%201%200%20011.414%200L10%2014.586l2.293-2.293a1%201%200%20011.414%201.414l-3%203a1%201%200%2001-1.414%200l-3-3a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10"
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-xs text-red-500 dark:text-[#FF5252] mt-1">{error}</p>}
          {instructions && <p className="text-xs text-gray-500 dark:text-gray-400">{instructions}</p>}
        </div>
    )
}
