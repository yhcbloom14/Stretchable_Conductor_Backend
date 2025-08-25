"use client"

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { profileSlice, refreshProfile } from "@/lib/store/slices/profileSlice";
import { useEffect, Suspense } from "react";

import Header from "@/components/common/header";
import Card from "@/components/common/card";
import Title from "@/components/common/title";
import Table from "@/components/common/table/table";
import { ColumnEnum, Column } from "@/lib/types/Column";
import { ActionEnum } from "@/lib/types/Action";
import { Role } from "@/lib/types/Role";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ModalBasic from "@/components/common/modal-basic";
import InviteUserForm from "@/components/forms/invite-form";
import { refreshOrg, orgSlice } from "@/lib/store/slices/orgSlice";
import { isFeatureEnabled } from "@/lib/constants";

  const userColumns: Column[] = [
    {type: ColumnEnum.User}, 
    {type: ColumnEnum.ViewRole, permission: [Role.EDITOR]},
    {type: ColumnEnum.SelectRole, permission: [Role.ADMIN]}, 
    {type: ColumnEnum.LastActive}, 
    {type: ColumnEnum.Actions, actions: [{type: ActionEnum.DELETE, label: 'Remove', permission: [Role.ADMIN], style: "warning"}], permission: [Role.ADMIN]}
  ]

  const inviteColumns: Column[] = [
    {type: ColumnEnum.Email}, 
    {type: ColumnEnum.ViewRole},
    {type: ColumnEnum.Actions, actions: [{type: ActionEnum.CANCEL, label: 'Cancel', permission: [Role.ADMIN], style:"warning"}], permission: [Role.ADMIN]}
  ]


function UsersPage() {

    const role = useAppSelector(profileSlice.selectors.selectRole);
    const activeMembers = useAppSelector(orgSlice.selectors.selectActiveMembers);
    const inactiveMembers = useAppSelector(orgSlice.selectors.selectInactiveMembers);
    
    const searchParams = useSearchParams()
    const modalParam = searchParams.get('modal')
    const router = useRouter()
    const pathname = usePathname()

    const openModal = () => {
        const params = Object.fromEntries(searchParams.entries())
        const newParams = {...params, modal: "invite"}
        router.push(`${pathname}?${new URLSearchParams(newParams).toString()}`)
    }
    

    const closeModal = () => {
        const params = Object.fromEntries(searchParams.entries())
        const newParams = {...params, modal: ""}
        router.push(`${pathname}?${new URLSearchParams(newParams).toString()}`)
    }
    
    const titleActions = isFeatureEnabled('USER_INVITES') 
        ? [{type: ActionEnum.INVITE, label: 'Invite User', permission: [Role.ADMIN], handler: openModal}]
        : []
    
    const headerActions = isFeatureEnabled('USER_INVITES')
        ? [{type: ActionEnum.INVITE, label: 'Invite User', permission: [Role.ADMIN], handler: openModal}]
        : []

    return (
        <>
            <Title text="User Management" actions={titleActions}/>
            {isFeatureEnabled('USER_INVITES') && (
                <ModalBasic isOpen={modalParam === 'invite' && role === Role.ADMIN} onClose={closeModal} title="Invite User">
                  <InviteUserForm onClose={closeModal}/>
                </ModalBasic>
            )}
            <Card>
                <Header text="Project Users" description="Manage users and their permissions for this project."/>
                <Table rows={activeMembers} columns={userColumns.filter(column => !column.permission || (role && column.permission.includes(role)))}/>
            </Card>
            <Card>  
                <Header text="Pending Invitations" description="Manage pending invitations for this project." actions={headerActions}/>
                <Table rows={inactiveMembers} columns={inviteColumns.filter(column => !column.permission || (role && column.permission.includes(role)))}/>
            </Card>
        </>
    )
}


export default function UsersPageWrapper() {
    const dispatch = useAppDispatch()
    
    useEffect(() => {
        dispatch(refreshProfile())
        dispatch(refreshOrg())
    }, [dispatch])

    return (
        <Suspense fallback="Loading...">
            <UsersPage />
        </Suspense>
    )
}