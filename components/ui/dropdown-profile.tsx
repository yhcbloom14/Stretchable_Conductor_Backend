'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from '@headlessui/react'
import UserAvatar from '@/public/images/user-avatar-32.png'
import { signout } from '@/lib/actions/signout'
import { useEffect } from 'react'
import { refreshProfile, profileSlice } from '@/lib/store/slices/profileSlice'
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks'
import { refreshOrg, orgSlice } from '@/lib/store/slices/orgSlice'
import { ROLE_OPTIONS } from '@/lib/types/Role'
import { NULL_ORG } from '@/lib/constants'

export default function DropdownProfile({ align }: {
  align?: 'left' | 'right'
}) {

  const dispatch = useAppDispatch()

  useEffect(() => {
      dispatch(refreshProfile())
      dispatch(refreshOrg())
  }, [])

  const name = useAppSelector(profileSlice.selectors.selectName)
  const role = useAppSelector(profileSlice.selectors.selectRole)
  const orgName = useAppSelector(orgSlice.selectors.selectName)
  const email = useAppSelector(profileSlice.selectors.selectEmail)

  // If no user is authenticated, show login link
  if (!name || !email) {
    return (
      <div className="flex items-center space-x-3">
        <Link 
          href="/login" 
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <Menu as="div" className="relative inline-flex">
      <MenuButton className="inline-flex justify-center items-center group">
        <Image className="w-8 h-8 rounded-full" src={UserAvatar} width={32} height={32} alt="User" />
        <div className="flex items-center truncate">
          <span className="truncate mx-2 text-sm font-medium text-gray-600 dark:text-gray-100 group-hover:text-gray-800 dark:group-hover:text-white">{orgName === NULL_ORG ? '' : orgName}</span>
          <svg className="w-3 h-3 shrink-0 ml-1 fill-current text-gray-400 dark:text-gray-500" viewBox="0 0 12 12">
            <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
          </svg>
        </div>
      </MenuButton>
      <Transition
        as="div"
        className={`origin-top-right z-10 absolute top-full min-w-[11rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1 ${align === 'right' ? 'right-0' : 'left-0'
          }`}
        enter="transition ease-out duration-200 transform"
        enterFrom="opacity-0 -translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="pt-0.5 pb-2 px-3 mb-1 border-b border-gray-200 dark:border-gray-700/60">
          <div className="truncate font-medium text-gray-800 dark:text-gray-100">{name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 italic">{email}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 italic">{ROLE_OPTIONS.find(r => r.value === role)?.label}</div>
        </div>
        <MenuItems as="ul" className="focus:outline-none">
          {/* <MenuItem as="li">
            {({ active }) => (
              <Link className={`font-medium text-sm flex items-center py-1 px-3 ${active ? 'text-violet-600 dark:text-violet-400' : 'text-violet-500'}`} href="/settings/users">
                Settings
              </Link>
            )}
          </MenuItem> */}
          <MenuItem as="li">
            {({ active }) => (
              <button 
                className={`font-medium text-sm flex items-center py-1 px-3 ${active ? 'text-violet-600 dark:text-violet-400' : 'text-violet-500'}`}
                onClick={() => signout()}
              >
                Sign Out
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Transition>
    </Menu>
  )
}