'use client'
import clsx from "clsx"
import Link from "next/link"


interface ButtonProps {
    type?: "submit" | "reset" | "button" | "link" | "back" | undefined
    text?: string
    size?: "xs" | "small" | "medium" | "large"
    disabled?: boolean
    onClick?: () => void
    href?: string
    children?: React.ReactNode
    variant?: "default" | "gradient" | "warning" | "ghost"
    className?: string
}

export default function Button({type, text, size="small", disabled, onClick, href, children, variant="default", className}: ButtonProps) {
    const buttonClass = clsx(
        "inline-flex w-full items-center justify-center rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        {
            // Gradient variant
            "bg-gradient-to-r from-[#4CAF50] to-[#2196F3] hover:from-[#5fd761] hover:to-[#42a5f5] text-white focus:outline-none focus:ring-1 focus:ring-[#4CAF50] focus:ring-offset-1 dark:focus:ring-offset-[#0f1420]": variant === "gradient",
            
            // Default variant
            "border border-gray-200 dark:border-[#2a3349] bg-white dark:bg-[#1c2438] text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#2a3349] focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 focus:ring-offset-1 dark:focus:ring-offset-[#0f1420]": variant === "default",
            
            // Warning variant
            "border border-red-200 dark:border-red-900/30 bg-white dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-1 focus:ring-red-400 dark:focus:ring-red-500 focus:ring-offset-1 dark:focus:ring-offset-[#0f1420]": variant === "warning",

            //Ghost variant
            "hover:bg-accent hover:text-accent-foreground px-3 h-6 w-6 p-0 text-destructive": variant === "ghost",
            
            // Size variants
            "text-xs px-2 py-1 h-8": size === "xs",
            "text-sm px-3 py-2 h-10": size === "small",
            "text-base px-4 py-2 h-11": size === "medium",
            "text-lg px-4 py-2 h-12": size === "large"
        },
        className
    )

    if (type === "link") {
        return (
            <Link href={href || '/'} className={buttonClass}>
                {text || children}
            </Link>
        )
    } else if (type === "back") {
        return (
            <button
                disabled={disabled || false}
                className={buttonClass}
                onClick={() => window.history.back()}
            >
                {text || children}
            </button>
        )
    } else {
        return (
            <button
                type={type}
                disabled={disabled || false}
                className={buttonClass}
                onClick={onClick}
            >
                {text || children}
            </button>
        )
    }
}
