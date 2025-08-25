import { Role } from "./Role"

export interface User {
    id: string
    email: string
    name: string
    role: Role
    last_sign_in_at: string
}
