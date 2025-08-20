'use client'

import { useEffect, useRef, useState } from 'react'
import { useAppProvider } from '@/app/app-provider'
import { useSelectedLayoutSegments } from 'next/navigation'
import { Transition } from '@headlessui/react'
import { getBreakpoint } from '@/components/utils/get-breakpoint'
import SidebarLinkGroup from './sidebar-link-group'
import SidebarLink from './sidebar-link'
import Logo from './logo'
import { Link } from '@/lib/types/Link'
import ExpandCollapseIcon from '../icons/expand-collapse'
import ArrowLeft from '../icons/arrow-left'
import ChevronDownIcon from '../icons/chevron-down'
import { Home, Database, Share2, RotateCcw, Settings2,Settings, View, Bug } from 'lucide-react'

const links: Link[] = [
  // {
  //   text: "Platform Overview",
  //   href: "/overview",
  //   icon: <Home size={16} />
  // },
  // {
  //   text: "Data Organization Tab",
  //   href: "/data",
  //   icon: <Database size={16} />
  // },

  {
    text: "Platform Overview",
    href: "/predictor/overview",
    icon: <Home size={16} />
  },
  {
    text: "Forward Prediction",
    href: "/views/direct-prediction",
    icon: <Share2 size={16} />
  },

  {
    text: "Inverse Design",
    href: "/views/design",
    icon: <RotateCcw size={16} />
  }


  // {
  //   text: "Predictor Module",
  //   href: "/materials",
  //   icon: <View size={16} />,
  //   children: [
  //     { text: "Overview", href: "/predictor/overview", icon: null },
  //     { text: "Single-Point Property Prediction", href: "/views/direct-prediction", icon: null },
  //     { text: "Heatmap and Sensitivity Analysis", href: "/views/heatmap", icon: null },
  //     { text: "Inverse Design Engine", href: "/views/design", icon: null },
  //     { text: "Data Analytics View", href: "/views/data-analytics", icon: null },
  //   ]
  // }
  // {
  //   text: "Settings",
  //   href: "/settings",
  //   icon: <Settings size={16} />,
  //   children: [
  //     { text: "Users", href: "/settings/users", icon: null }
  //   ]
  // }
]

export default function Sidebar({
  variant = 'default',
}: {
  variant?: 'default' | 'v2'
}) {
  const sidebar = useRef<HTMLDivElement>(null)
  const { sidebarOpen, setSidebarOpen } = useAppProvider()
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false)
  const segments = useSelectedLayoutSegments()  
  const [breakpoint, setBreakpoint] = useState<string | undefined>(getBreakpoint())
  const expandOnly = !sidebarExpanded && (breakpoint === 'lg' || breakpoint === 'xl')

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: { target: EventTarget | null }): void => {      
      if (!sidebar.current) return
      if (!sidebarOpen || sidebar.current.contains(target as Node)) return
      setSidebarOpen(false)
    }
    document.addEventListener('click', clickHandler)
    return () => document.removeEventListener('click', clickHandler)
  })

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: { keyCode: number }): void => {
      if (!sidebarOpen || keyCode !== 27) return
      setSidebarOpen(false)
    }
    document.addEventListener('keydown', keyHandler)
    return () => document.removeEventListener('keydown', keyHandler)
  })
  
  const handleBreakpoint = () => {
    setBreakpoint(getBreakpoint())      
  }
  
  useEffect(() => {
    window.addEventListener('resize', handleBreakpoint)
    return () => {
      window.removeEventListener('resize', handleBreakpoint)
    }
  }, [breakpoint])    



  return (
    <div className={`min-w-fit ${sidebarExpanded ? 'sidebar-expanded' : ''}`}>
      {/* Sidebar backdrop (mobile only) */}
      <Transition
        as="div"
        className="fixed inset-0 bg-gray-900 bg-opacity-30 z-40 lg:hidden lg:z-auto"
        show={sidebarOpen}
        enter="transition-opacity ease-out duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity ease-out duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        aria-hidden="true"
      />      

      {/* Sidebar */}
      <Transition
        show={sidebarOpen}
        unmount={false}
        as="div"
        id="sidebar"
        ref={sidebar}
        className={`flex lg:!flex flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-[100dvh] overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-20 sidebar-expanded:!w-fit 2xl:!w-64 shrink-0 bg-white dark:bg-gray-800 p-4 transition-all duration-200 ease-in-out ${variant === 'v2' ? 'border-r border-gray-200 dark:border-gray-700/60' : 'rounded-r-2xl shadow-sm'}`}
        enterFrom="-translate-x-full"
        enterTo="translate-x-0"
        leaveFrom="translate-x-0"
        leaveTo="-translate-x-full"
      >      
        {/* Sidebar header */}
        <div className="flex justify-center mb-10 pr-3 sm:px-2">
          {/* Close button */}
          <button
            className="lg:hidden text-gray-500 hover:text-gray-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Close sidebar</span>
            <ArrowLeft />
          </button>
          {/* Logo */}
          <Logo />
        </div>

        {/* Links */}
        <div className="space-y-8">
          {/*Project Group*/}
          <div>
            <ul className="mt-3">
              {links.map(link => {
                return link.children ? (
                  <SidebarLinkGroup key={link.href} open={segments.includes(link.href.slice(1))}>
                    {(handleClick, open) => {
                      return (
                        <>
                          <a
                            href="#0"
                            className={`block text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition duration-150 ease-in-out`}
                            onClick={(e) => {
                              e.preventDefault()
                              expandOnly ? setSidebarExpanded(true) : handleClick()
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className={`${segments.includes(link.href.slice(1)) ? 'text-violet-500' : ''}`}>
                                  {link.icon}
                                </div>
                                <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200 text-gray-800 dark:text-gray-100">
                                  {link.text}
                                </span>
                              </div>
                              {/* Icon */}
                              <div className="flex shrink-0 ml-2">
                                <ChevronDownIcon />
                              </div>
                            </div>
                          </a>
                          <div className="lg:hidden lg:sidebar-expanded:block 2xl:block">
                            <ul className={`pl-8 mt-1 ${!open && 'hidden'}`}>
                              {link.children?.map(child => (
                                <li key={child.href} className="mb-1 last:mb-0">
                                  <SidebarLink href={child.href}>
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition duration-150 ease-in-out lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                      {child.text}
                                    </span>
                                  </SidebarLink>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )
                    }}
                  </SidebarLinkGroup>
                ) : (
                  <li key={link.href} className={`pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition duration-150 ease-in-out ${segments.includes(link.href.slice(1)) ? 'bg-gradient-to-r from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04]' : ''}`}>
                    <SidebarLink href={link.href}>
                      <div className="flex items-center justify-between">
                        <div className="grow flex items-center">
                          <div className={`${segments.includes(link.href.slice(1)) ? 'text-violet-500' : ''}`}>
                            {link.icon}
                          </div>
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-100 transition duration-150 ease-in-out ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                            {link.text}
                          </span>
                        </div>
                      </div>
                    </SidebarLink>
                  </li> 
                )
              })}
            </ul>
          </div>
        </div>

        {/* Expand / collapse button */}
        <div className="pt-3 hidden lg:inline-flex 2xl:hidden justify-end mt-auto">
          <div className="w-12 pl-4 pr-3 py-2">
            <button className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400" onClick={() => setSidebarExpanded(!sidebarExpanded)}>
              <span className="sr-only">Expand / collapse sidebar</span>
              <ExpandCollapseIcon />             
            </button>
          </div>
        </div>
      </Transition>
    </div>
  )
}