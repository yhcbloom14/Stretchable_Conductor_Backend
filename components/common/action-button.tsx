"use client"

import { ActionEnum, Action } from "@/lib/types/Action";
import Button from "./button";
import { useAppSelector } from "@/lib/store/hooks";
import { profileSlice } from "@/lib/store/slices/profileSlice";
import DownloadIcon from "../icons/download";
import CategoricalInput from "./inputs/categorical-input";
import {selectTemplateOptions, selectActiveTemplate} from "@/lib/store/slices/templateSlice";

export default function ActionButton({action}: {action: Action} ) {
  const role = useAppSelector(profileSlice.selectors.selectRole)
  if (role === null || (('permission' in action) && action.permission && !action.permission.includes(role))) {
    return
  }

  switch (action.type) {
      case ActionEnum.DELETE:
          return <DeleteActionButton label={action.label} handleAction={action.handler}/>
      case ActionEnum.FILTER:
          return <></>
      case ActionEnum.CANCEL:
          return <></>
      case ActionEnum.INVITE:
          return <InviteActionButton handleAction={action.handler} label={action.label}/>
      case ActionEnum.DOWNLOAD:
        return <DownloadButton handleAction={action.handler}/>
      case ActionEnum.SELECT_TEMPLATE:
        return <SelectTemplateSwitcher handleAction={action.handler} label={action.label}/>
  }
}

function InviteActionButton({handleAction, label}: {handleAction: (() => void) | undefined, label: string | undefined}) {
  return (
    <Button
      type="button"
      text={label || "Invite"}
      size="small"
      onClick={handleAction}
    />
  )
}

function DeleteActionButton({handleAction, label}: {handleAction: (() => void) | undefined, label: string | undefined}) {
  return (
    <Button
      type="button"
      text={label || "Delete"}
      variant="warning"
      size="xs"
      onClick={handleAction}
    />
  )
}

function DownloadButton({handleAction}: {handleAction: (() => void) | undefined}) {
  return (
    <Button
      type="button"
      variant="default"
      size="medium"
      onClick={handleAction}
    >
      <DownloadIcon/>
    </Button>
  )
}

function SelectTemplateSwitcher({handleAction, label}: {handleAction: ((value: string) => void) | undefined, label: string | undefined}) {
  const templatesOptions = useAppSelector(selectTemplateOptions)
  const activeTemplate = useAppSelector(selectActiveTemplate)
  return (
    <CategoricalInput
      label={label || "Select Template"}
      name="select-template"
      options={templatesOptions}
      value={activeTemplate?.id}
      onChange={handleAction}
    />
  )
}