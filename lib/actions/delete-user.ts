'use server'

import { createServiceClient } from '@/lib/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { ActionResponse } from '../types/Action'
import { fetchProfile } from '../data/fetch-profile'
import { Role } from '../types/Role'

export async function deleteUser(id: string): Promise<ActionResponse> {
    const supabase = await createServiceClient()
    const profile = await fetchProfile()

    if (profile.role !== Role.ADMIN) {
        throw new Error("You are not authorized to delete users.")
    }

    const {data: user, error: userError} = await supabase.from('profiles').select('user_id').eq('id', id).single()
    
    if (userError) {
        throw new Error(`${userError.code}: ${userError.message}`)
    }
    
    const { data, error } = await supabase.auth.admin.deleteUser(user?.user_id)

    if (error) {
        throw new Error(`${error.code}: ${error.message}`)
    }
    
    revalidatePath('/', 'layout')
    return {success: true, message: 'User deleted successfully.'}
}
