"use client"

import { Column, ColumnEnum } from "@/lib/types/Column";
import DropdownInput from "@/components/common/dropdown-input";
import { ROLE_OPTIONS } from "@/lib/types/Role";
import ActionMenu from "@/components/common/action-menu";
import { Action, EmptyAction } from "@/lib/types/Action";
import { getTableAction } from "@/components/common/table/get-table-action";
import { formatTime } from "@/components/utils/format-time";
import { toast } from "react-hot-toast";
import { updateRole } from "@/lib/actions/update-role";
import { profileSlice } from "@/lib/store/slices/profileSlice";
import { refreshOrg } from "@/lib/store/slices/orgSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import binderTranslations from "@/lib/data/mock/binder-template-translation.json";

export default function TableCell({column, data}: {column: Column, data: Record<string, any>}) {
    switch (column.type) {
        case ColumnEnum.User:
            return <UserCell data={data}/>;
        case ColumnEnum.ViewRole:
            return <ViewRoleCell data={data}/>;
        case ColumnEnum.SelectRole:
            return <SelectRoleCell data={data}/>;
        case ColumnEnum.LastActive:
            return <LastActiveCell data={data}/>;
        case ColumnEnum.Actions:
            return <ActionsCell data={data} actions={column.actions || []}/>;
        case ColumnEnum.Email:
            return <EmailCell data={data}/>;
        case ColumnEnum.Data:
            return <DataCell data={data} label={column.label as string} column={column}/>
        case ColumnEnum.Organization:
            return <OrganizationCell data={data}/>
        default:
            return null;
    }
}

function UserCell({data}: {data: Record<string, any>}) {
    return (
        <div>
            <div className="font-medium">{data.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{data.email}</div>
        </div>
    )
}

const SelectRoleCell = ({data}: {data: Record<string, any>}) => {
    const dispatch = useAppDispatch()
    const profileId = useAppSelector(profileSlice.selectors.selectId)

    if (profileId === data.id) {
        return <div className="text-center md:text-left md:pl-3">{ROLE_OPTIONS.find(r => r.id === data.role)?.label}</div>
    }

    const handleSelect = async (role?: number | string) => {
        toast.promise(
            updateRole(data.id, role as number),
            {
                loading: "Updating role...",
                success: (response) => {
                    dispatch(refreshOrg())
                    return `${response.message}`
                },
                error: (error) => `${error.message}`
            }
        )
    }

    return <DropdownInput options={ROLE_OPTIONS} selected={data.role} handleSelect={handleSelect}/>
}

function ViewRoleCell({data}: {data: Record<string, any>}) {
    return <div className="text-center md:text-left">{ROLE_OPTIONS.find(r => r.id === data.role)?.label}</div>
}

function LastActiveCell({data}: {data: Record<string, any>}) {
    return <div className="text-center md:text-left">{formatTime(data.last_sign_in_at)}</div>
}

function ActionsCell({data, actions}: {data: Record<string, any>, actions: EmptyAction[]}) {
      const dispatch = useAppDispatch()
    // Create a handler for each action type
    const memoizedActions = actions.map(action => ({
        ...action,
        handler: getTableAction(action.type, data.id, dispatch)
    })) as Action[];

    return <ActionMenu align="right" actions={memoizedActions}/>
}

function EmailCell({data}: {data: Record<string, any>}) {
    return <div className="text-center md:text-left">{data.email}</div>
}

function DataCell({data, label, column}: {data: Record<string, any>, label: string, column: Column}) {
    // For Binder Template, check if we need to use the original (untranslated) label to access data
    const dataKey = (() => {
        // Check if this is a translated label by doing a reverse lookup
        const originalKey = Object.keys(binderTranslations).find(
            key => binderTranslations[key as keyof typeof binderTranslations] === label
        );
        // If we found a match, it means this label was translated, so use the original key
        return originalKey || label;
    })();
    
    return <div className="text-center md:text-left">{data[dataKey]}</div>
}

function OrganizationCell({data}: {data: Record<string, any>}) {
    return <div className="text-center md:text-left">{data.org_name}</div>
}