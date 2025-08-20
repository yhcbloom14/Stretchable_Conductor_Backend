import type { Action, EmptyAction } from "./Action";
import type { Role } from "./Role";
export enum ColumnEnum {
    User = "user",
    SelectRole = "select-role",
    ViewRole = "view-role",
    LastActive = "active",
    Actions = "actions",
    Email = "email",
    Data = "data",
    Organization = "organization"
}

export interface Column {
    type: ColumnEnum
    label?: string
    index?: number
    permission?: Role[]
    actions?: EmptyAction[]
    params?: Record<string, string>
} 