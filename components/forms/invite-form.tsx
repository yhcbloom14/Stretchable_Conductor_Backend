"use client"

import { Suspense } from "react"
import { useSearchParams, usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import TextInput from "../common/text-input"
import { inviteUser } from "@/lib/actions/invite-user"
import Button from "../common/button"
import { toast } from "react-hot-toast"
import { useAppDispatch } from "@/lib/store/hooks"
import { refreshOrg } from "@/lib/store/slices/orgSlice"

function InviteUserForm({onClose}: {onClose: () => void}) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()
    const dispatch = useAppDispatch()

    const name = searchParams.get("name")
    const email = searchParams.get("email")

    const handleUpdate = useDebouncedCallback((field:string, value: string) => {
        const params = new URLSearchParams(searchParams)
        params.set(field, value)
        replace(`${pathname}?${params.toString()}`)
    }, 300)

    const handleEmailChange = handleUpdate.bind(null, "email")
    const handleNameChange = handleUpdate.bind(null, "name")

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget as HTMLFormElement)

        try {
            await toast.promise(
                inviteUser(formData),
                {
                loading: "Inviting user...",
                success: (response) => {
                    return response.message || 'User invited successfully'
                },
                    error: (error) => {
                        console.error('Invite error details:', error)
                        return error.message || 'Failed to invite user'
                    }
                }
            )
            await dispatch(refreshOrg()).unwrap()
            onClose()
        } catch (error) {
            console.error('Error inviting user:', error)
        }
    }
        
    return (
        <form onSubmit={onSubmit}>
            <div className="px-5 py-4">
                <div className="text-sm">
                    <div className="font-medium text-gray-800 dark:text-gray-100 mb-3">Invite a new user to your organization.</div>
                </div>
                <div className="space-y-3">
                    <TextInput label="Full Name" name="name" type="text" placeholder="John Doe" autoCapitalize="words" autoComplete="name" onChange={handleNameChange} defaultValue={name || undefined} />
                    <TextInput label="Email" name="email" type="email" placeholder="name@example.com" autoComplete="email" required onChange={handleEmailChange} defaultValue={email || undefined} />
                </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700/60">
                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        text="Close"
                        size="small"
                        variant="default"
                        onClick={onClose}

                    />
                    <Button
                        type="submit"
                        text="Send"
                        size="small"
                        variant="gradient"
                    />
                </div>
            </div>
        </form>
    )
}

export default function InviteUserFormWrapper({onClose}: {onClose: () => void}) {
    return (
        <Suspense fallback="Loading...">
            <InviteUserForm onClose={onClose} />
        </Suspense>
    )
}