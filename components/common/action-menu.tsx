'use client'

import { Action } from '@/lib/types/Action'
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from '@headlessui/react'
import MenuIcon from '@/components/icons/menu'
import Button from './button'

export default function ActionMenu({
  align,
  actions
}: React.HTMLAttributes<HTMLDivElement> & {
  align?: 'left' | 'right'
  actions: Action[]
}) {
  return (
    <Menu as="div" className={`relative inline-flex`}>
      {({ open }) => (
        <>
          <MenuButton
            className={`rounded-md ${open ? 'bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400' : 'text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400'}`}
          >
            <span className="sr-only">Menu</span>
            <MenuIcon/>
          </MenuButton>
          <Transition
            as="div"
            className={`origin-top-right z-10 absolute top-full min-w-[8rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1 ${align === 'right' ? 'right-0' : 'left-0'}`}
            enter="transition ease-out duration-200 transform"
            enterFrom="opacity-0 -translate-y-2"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-out duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <MenuItems as="ul" className="focus:outline-none">
              {actions.map((action, index) => (
                <MenuItem as="li" key={`action-menu-item-${index}`}>
                    <Button
                      type="button"
                      text={action.label || ""}
                      variant={action.style}
                      size="xs"
                      onClick={action.handler}
                      className="border-0 hover:bg-gray-50 dark:hover:bg-gray-700/60 w-full justify-start"
                    />
                </MenuItem>
              ))}
            </MenuItems>
          </Transition>
        </>
      )}
    </Menu>
  )
}