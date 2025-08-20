"use client"

interface NumericalInputProps {
    label: string
    name: string
    min: number
    max: number
    step?: number
    disabled?: boolean
    error?: string
    instructions?: string
    children?: React.ReactNode
    value?: number
    onChange?: (value: number) => void
}

export default function NumericalInput({name, label, min, max, step, disabled, error, instructions, children, value, onChange}: NumericalInputProps) {
    return (
        <div className="space-y-2">
          <div className="flex items-center justify-between min-h-[20px]">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 leading-5">
                {label}
            </label>
            {children}
          </div>
          <div className="relative">
            <input
              id={name}
              name={name}
              type="number"
              value={value}
              onChange={(e) => onChange?.(Number(e.target.value))}
              disabled={disabled || false}
              min={min}
              max={max}
              step={step || 0.1}
              required
              className="flex h-10 w-full max-w-48 rounded-md border border-gray-200 dark:border-[#2a3349] bg-white dark:bg-[#1c2438] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 focus:ring-offset-1 dark:focus:ring-offset-[#0f1420] disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            />
          </div>
          {error && <p className="text-xs text-red-500 dark:text-[#FF5252] mt-1">{error}</p>}
          {instructions && <p className="text-xs text-gray-500 dark:text-gray-400">{instructions}</p>}
        </div>
    )
}
