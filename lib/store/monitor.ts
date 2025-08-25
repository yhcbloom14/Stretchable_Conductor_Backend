"use client"

import { useEffect } from "react"
import { useSelector } from "react-redux"
import { useRouter } from "next/navigation"

interface MonitorProps {
    statusSelector: (state: any) => any
    redirectOn: string[]
    redirectTo: string
}

export function useMonitor({statusSelector, redirectOn, redirectTo}: MonitorProps) {
    const router = useRouter()
    const status = useSelector(statusSelector)

    useEffect(() => {
        if (redirectOn.includes(status)) {
            router.push(redirectTo)
        }
    }, [status, redirectOn, redirectTo, router])
}   