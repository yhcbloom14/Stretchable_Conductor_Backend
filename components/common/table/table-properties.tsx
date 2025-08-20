import { ColumnEnum, Column } from "@/lib/types/Column"

export const getColumnLabel = (column: Column) => {
  switch (column.type) {
    case ColumnEnum.User:
      return <p>User</p>
    case ColumnEnum.SelectRole:
    case ColumnEnum.ViewRole:
      return <p>Role</p>
    case ColumnEnum.LastActive:
      return <p>Last Active</p>
    case ColumnEnum.Actions:
      return <p>Actions</p>
    case ColumnEnum.Email:
      return <p>Email</p>
    case ColumnEnum.Data:
      return <p>{column.label}</p>
    case ColumnEnum.Organization:
      return <p>Organization</p>
  }
}
