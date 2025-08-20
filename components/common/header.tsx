import { Action } from "@/lib/types/Action";
import ActionButton from "./action-button";

export default function Header({text, description, actions}: {text: string, description?: string, actions?: Action[]}) {
    return (
        <div className="sm:flex sm:justify-between sm:items-center mb-5">
            {/*Left Title*/}
            <div className="mb-4 sm:mb-0">
                <h1 className="text-lg md:text-xl text-gray-700 dark:text-gray-200 font-medium">{text}</h1>
                {description && <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">{description}</p>}
            </div>
            {/*Right Actions*/}
            <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                {/*Actions*/}
                {actions?.map((action, i) => (<ActionButton key={`action-button-${i}`} action={action}/>))}
            </div>
        </div>
    );
}