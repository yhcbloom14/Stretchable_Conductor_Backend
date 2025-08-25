import { Role } from "./Role";

export enum ActionEnum {
    DELETE = 'delete',
    FILTER = 'filter',
    CANCEL = 'cancel',
    INVITE = 'invite',
    DOWNLOAD = 'download-file',
    JOIN = 'join-organization',
    DECLINE = 'decline-invite',
    SELECT_TEMPLATE = 'select-template'
}

export interface EmptyAction {
    type: ActionEnum
    label?: string
    style?: "default" | "gradient" | "warning"
    permission?: Role[]
}

export interface Action extends EmptyAction {
    handler: ((...args: any[]) => void)
}

export interface ActionResponse {
    success: boolean;
    message: string;
}

export interface ActionFieldError {
    error: string;
    field: string;
}
