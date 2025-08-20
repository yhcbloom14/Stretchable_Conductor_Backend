import { CheckCircle } from "lucide-react";

export default function SuccessIcon() {
    return (
        <div className="flex items-center justify-center">
            <div className="h-24 w-24 rounded-full bg-white dark:bg-[#1c2438]/50 border border-gray-200 dark:border-[#2a3349] flex items-center justify-center">
              <CheckCircle className="h-14 w-14 text-[#4CAF50] dark:text-[#3EC972]" />
            </div>
        </div>
    )
}
