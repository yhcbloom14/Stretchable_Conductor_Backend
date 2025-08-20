'use client'

import { Action } from "@/lib/types/Action";
import ActionButton from "./action-button";
import { ReactNode } from "react";

export default function Title({text, actions, children}: {text: string, actions?: Action[], children?: ReactNode}) {
    return (
        <div className="sm:flex sm:justify-between sm:items-center mb-5">
            {/*Left Title*/}
            <div className="mb-4 sm:mb-0 flex items-center gap-4">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">{text}</h1>
                {children}
            </div>
            {/*Right Actions*/}
            <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                {/*Actions*/}
                {/*Map buttons with types*/}
                {actions?.map((action, i) => (<ActionButton key={`action-button-${i}`} action={action}/>))}
            </div>
        </div>
    );
}
