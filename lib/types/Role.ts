import { OptionHTMLAttributes } from "react";

export enum Role {
    ADMIN = 1,
    EDITOR = 2
}

export const ROLE_OPTIONS: OptionHTMLAttributes<HTMLOptionElement>[] = [
    {id: `${Role.ADMIN}`, label: "Admin", value: Role.ADMIN },
    {id: `${Role.EDITOR}`, label: "Editor", value: Role.EDITOR }
]
