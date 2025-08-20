"use client"

import { removeUser } from "@/lib/actions/remove-user"
import { refreshOrg } from "@/lib/store/slices/orgSlice"
import { ActionEnum } from "@/lib/types/Action"
import toast from "react-hot-toast"
import { joinOrganization } from "@/lib/actions/join-organization"
import { cancelInvite } from "@/lib/actions/cancel-invite"
import { rejectInvite } from "@/lib/actions/reject-invite"

export const getTableAction = (type: ActionEnum, id: string, dispatch: any) => {
  switch (type) {
    case ActionEnum.DELETE:
      return async () => {
        try {
          await toast.promise(
            removeUser(id),
            {
              loading: "Removing user...",
              success: (response) => `User successfully removed.`,
              error: (error) => `${error.message}`
            }
          )
          await dispatch(refreshOrg()).unwrap()
        } catch (error) {
          console.error('Error removing user:', error)
        }
      }
    case ActionEnum.CANCEL:
      return async () => {
        try {
          await toast.promise(
            cancelInvite(id),
            {
              loading: "Cancelling invite...",
              success: (response) => `Invite successfully cancelled.`,
              error: (error) => `${error.message}`
            }
          )
          await dispatch(refreshOrg()).unwrap()
        } catch (error) {
          console.error('Error cancelling invite:', error)
        }
      }
    case ActionEnum.FILTER:
      return () => console.log(`Filtered ${id}`)
    case ActionEnum.INVITE:
      return () => console.log(`Invited ${id}`)
    case ActionEnum.JOIN:
      return async () => {
        try {
          await toast.promise(
            joinOrganization(id),
            {
              loading: "Accepting invitation...",
              success: (response) => `Invitation accepted.`,
              error: (error) => `${error.message}`
            }
          )
          await dispatch(refreshOrg()).unwrap()
        } catch (error) {
          console.error('Error joining organization:', error)
        }
      }
    case ActionEnum.DECLINE:
      return async () => {
        try {
          await toast.promise(
            rejectInvite(id),
            {
              loading: "Declining invitation...",
              success: (response) => `Invitation declined.`,
              error: (error) => `${error.message}`
            }
          )
          await dispatch(refreshOrg()).unwrap()
        } catch (error) {
          console.error('Error declining invitation:', error)
        }
      }
    default:
      return () => {
        console.warn(`No action defined for type: ${type}`)
      } 
  }
}