"use client"

interface RangeInputProps {
    label: string
    name: string
    min: number
    max: number
    step?: number
    disabled?: boolean
    error?: string
    instructions?: string
    children?: React.ReactNode
    value?: any
    onChange?: (value: number) => void
    accentColor?: string
}

export default function RangeInput({
    label,
    name,
    min,
    max,
    step = 0.1,
    disabled = false,
    error,
    instructions,
    children,
    value,
    onChange,
    accentColor = "#3B82F6" // Default blue color, can be overridden
}: RangeInputProps) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
                {children}
            </div>
            <div className="relative">
                <input
                    id={name}
                    name={name}
                    type="range"
                    value={value}
                    onChange={(e) => onChange?.(Number(e.target.value))}
                    disabled={disabled}
                    min={min}
                    max={max}
                    step={step}
                    required
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700"
                    style={{
                        accentColor: accentColor,
                    }}
                />
                <div className="flex justify-between mt-1">
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{min}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">LL</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{max}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">UL</span>
                    </div>
                </div>
            </div>
            {error && <p className="text-xs text-red-500 dark:text-[#FF5252] mt-1">{error}</p>}
            {instructions && <p className="text-xs text-gray-500 dark:text-gray-400">{instructions}</p>}
        </div>
    )
}
