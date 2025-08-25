"use client"

import Header from "@/components/common/header";
import { Users } from "lucide-react";
import { Link } from "@/lib/types/Link";
import { usePathname } from "next/navigation";

const links: Link[] = [
    {
        text: "Users",
        href: "/settings/users",
        icon: <Users />
    }
]

export default function SettingsSidebar() {
    const pathname = usePathname();
    return (
      <div className="w-full md:w-[15rem] mb-8 md:mb-0">
        <div className="md:sticky md:top-16 md:h-[calc(100dvh-64px)] md:overflow-x-hidden md:overflow-y-auto no-scrollbar">
          <div className="md:py-8">
            
            <Header text="Settings" />
            
            {/* Links */}
            <div className="flex flex-nowrap overflow-x-scroll no-scrollbar md:block md:overflow-auto px-4 md:space-y-3 -mx-4">
              {/* Group 1 */}
              <div>
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-3 md:sr-only">Menu</div>
                <ul className="flex flex-nowrap md:block mr-3 md:mr-0">
                  {links.map(link => (
                    <li key={`link-${Users}`} className="mr-0.5 md:mr-0 md:mb-0.5">
                        <a className={`flex items-center px-2.5 py-2 rounded-lg whitespace-nowrap ${pathname == link.href && "bg-white dark:bg-gray-800 text-violet-500"}`} href={link.href}>
                        <Users size={16} className={`shrink-0 fill-current mr-2 ${pathname !== link.href && "text-gray-400 dark:text-gray-500"}`}/>
                        <span className={`text-sm font-medium ${pathname !== link.href && "text-gray-600 dark:text-gray-300"}`}>{link.text}</span>
                        </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    )
  }