'use server'

import { createServiceClient } from '@/lib/utils/supabase/server'
import { isValidEmail } from '../validators/email'
import { revalidatePath } from 'next/cache'
import { ActionResponse } from '../types/Action'
import { checkEmail } from './check-email'
import { fetchProfile } from '../data/fetch-profile'
import { Role } from '../types/Role'

function getAppUrl(): string {
    // Try environment variables in order of preference
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL
    }
    
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`
    }
    
    // Fallback to localhost for development
    return 'http://localhost:3000'
}

export async function inviteUser(formData: FormData): Promise<ActionResponse> {
    try {
        const supabase = await createServiceClient()
        const profile = await fetchProfile()

        if (profile.role !== Role.ADMIN) {
            throw new Error("You are not authorized to invite users.")
        }

        const data = {
            email: formData.get('email') as string,
            name: formData.get('name') as string,
        }

        if (!isValidEmail(data.email)) {
            throw new Error("Invalid email.")
        }

    const {data: emailExists }  = await checkEmail(data.email)

    if (emailExists) {
        const {data: userData, error: userError} = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', data.email)
        .single()

        if (userError) {
            throw new Error(`${userError.code}: ${userError.message}`)
        }

        const {count, error: inviteExistsError} = await supabase
        .from('invites')
        .select('*', { count: 'exact', head: true })
        .eq('accepted', false)
        .eq('cancelled', false)
        .eq('invited_user_id', userData.user_id)
        .eq('org_id', profile.org_id)

        if (inviteExistsError) {
            throw new Error(`${inviteExistsError.code}: ${inviteExistsError.message}`)
        }

        if (count && count > 0) {
            throw new Error("User already invited to this organization.")
        }

        const {data: inviteData, error: inviteError} = await supabase
        .from('invites').insert({
            invited_user_id: userData.user_id,
            org_id: profile.org_id,
            invited_by: profile.id,
        })

        if (inviteError) {
            throw new Error(`${inviteError.code}: ${inviteError.message}`)
        }
        
        return { success: true, message: `Invitation sent to ${data.email}` }
    }

    const { error } = await supabase.auth.admin.inviteUserByEmail(data.email, {
        data: {
            name: data.name,
            org_id: profile.org_id
        },
        redirectTo: `${getAppUrl()}/change-password`
    })

    if (error) {
        console.error('Error inviting user:', error)
        return { success: false, message: `${error.status}: ${error.message}` }
    }

    revalidatePath('/', 'layout')
    return { success: true, message: `Invitation sent to ${data.email}` }
    } catch (error) {
        console.error('Invite user error:', error)
        throw error
    }
}
