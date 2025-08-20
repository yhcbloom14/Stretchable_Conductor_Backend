import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

interface TextInputProps {
    label: string
    name: string
    type: string
    placeholder?: string
    disabled?: boolean
    autoComplete?: "off" | "email" | "current-password" | "name" | "new-password"
    autoCapitalize?: "none" | "words" | "sentences" | "characters"
    error?: string
    instructions?: string
    required?: boolean
    children?: React.ReactNode
    onChange?: ((value: string) => void) | undefined
    defaultValue?: string
}

export default function TextInput({label, name, type, placeholder, disabled, autoComplete="off", autoCapitalize="none", error, instructions, children, required=false, onChange=undefined, defaultValue=undefined}: TextInputProps) {
    const [showPassword, setShowPassword] = useState(false)
    return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
          </div>
          <div className="relative">
            <input
              id={name}
              name={name}
              placeholder={placeholder || ""}
              type={type === "password" && showPassword ? "text" : type}
              autoCapitalize={autoCapitalize}
              autoComplete={autoComplete}
              autoCorrect="off"
              disabled={disabled || false}
              required
              className="flex h-10 w-full rounded-md border border-gray-200 dark:border-[#2a3349] bg-white dark:bg-[#1c2438] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 focus:ring-offset-1 dark:focus:ring-offset-[#0f1420] disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              onChange={(e) => onChange?.(e.target.value)}
              defaultValue={defaultValue}
            />
            {type === "password" && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
          </div>
          {error && <p className="text-xs text-red-500 dark:text-[#FF5252] mt-1">{error}</p>}
          {instructions && <p className="text-xs text-gray-500 dark:text-gray-400">{instructions}</p>}
        </div>
    )
}
