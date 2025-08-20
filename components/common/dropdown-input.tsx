import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import ChevronDownIcon from "../icons/chevron-down";
import CheckIcon from "../icons/check";
import clsx from "clsx";
import { OptionHTMLAttributes } from "react";
interface DropdownInputProps {
  options: OptionHTMLAttributes<HTMLOptionElement>[] 
  selected: string | number
  handleSelect: (value?: string | number) => void
  className?: string
}

export default function DropdownInput({options, selected, handleSelect, className = ""}: DropdownInputProps) {
    const current = options.find(opt => opt.value === selected);
    return (
      <Menu as="div" className={clsx("relative inline-flex w-[300px]", className)}>
        {({ open }) => (
          <>
            <MenuButton className="btn justify-between min-w-[11rem] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100" aria-label="Select material">
              <span className="flex items-center">
                <span>{current?.label || ""}</span>
              </span>
              <ChevronDownIcon/>
            </MenuButton>
            <Transition
              as="div"
              className="absolute top-full left-0 min-w-[11rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1 z-50"
              enter="transition ease-out duration-100 transform"
              enterFrom="opacity-0 -translate-y-2"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-out duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <MenuItems className="font-medium text-sm text-gray-600 dark:text-gray-300 focus:outline-none">
                {options.map((option, index) => (
                  <MenuItem key={`menu-option-${index}`}>
                    {({ active }) => (
                      <button
                        className={`flex items-center w-full py-1 px-3 cursor-pointer disabled:pointer-events-none disabled:opacity-50 ${active && !(selected === option.id) ? 'bg-gray-50 dark:bg-gray-700/20' : 'text-violet-500'}`}
                        onClick={() => { handleSelect(option.value as number | string) }}
                        disabled={option?.disabled || false}
                      >
                        <span className={`${option.value !== selected && 'invisible'}`}>
                        <CheckIcon/>
                        </span>
                        <span className={clsx(
                          selected !== option.value && 'text-gray-600 dark:text-gray-300 whitespace-nowrap'
                        )}>{option.label}</span>
                      </button>
                    )}
                  </MenuItem>
                ))}
              </MenuItems>
            </Transition>
          </>
        )}
      </Menu>
    )
}