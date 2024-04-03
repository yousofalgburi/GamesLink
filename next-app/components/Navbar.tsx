'use client'

import { authOptions, getAuthSession } from '@/lib/auth'
import { Gamepad } from 'lucide-react'
import { Session, getServerSession } from 'next-auth'
import Link from 'next/link'
import Credits from './Credits'
import Friends from './Friends'
import { ModeToggle } from './ModeToggle'
import SignIn from './SignIn'
import { UserAccountNav } from './UserAccountNav'

import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'

const navigation = [
    { name: 'Home', href: '/home', current: true },
    { name: 'My Games', href: '/my-games', current: false },
    { name: 'Link Room', href: '/link-room/new', current: false },
]

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

interface NavbarProps {
    session: Session | null
}

export default function Navbar({ session }: NavbarProps) {
    return (
        <Disclosure as="nav">
            {({ open }) => (
                <>
                    <div className="mx-auto px-2 sm:px-6 lg:px-8">
                        <div className="relative flex h-16 items-center justify-between">
                            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                                {/* Mobile menu button*/}
                                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-inset">
                                    <span className="absolute -inset-0.5" />
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                    )}
                                </Disclosure.Button>
                            </div>
                            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                                <div className="flex flex-shrink-0 items-center">
                                    <Gamepad className="h-6 w-6" />
                                </div>
                                <div className="hidden sm:ml-6 sm:block">
                                    <div className="flex space-x-4">
                                        {navigation.map((item) => (
                                            <a
                                                key={item.name}
                                                href={item.href}
                                                className="rounded-md px-3 py-2 text-sm font-medium"
                                                aria-current={item.current ? 'page' : undefined}
                                            >
                                                {item.name}
                                            </a>
                                        ))}

                                        {session?.user && <Credits />}
                                    </div>
                                </div>
                            </div>
                            <div className="absolute inset-y-0 right-0 flex items-center gap-6 pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                                <ModeToggle />

                                <Friends session={session} />

                                <button
                                    type="button"
                                    className="relative rounded-full  focus:outline-none focus:ring-2  focus:ring-offset-2 focus:ring-offset-gray-800"
                                >
                                    <span className="absolute -inset-1.5" />
                                    <span className="sr-only">View notifications</span>
                                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                                </button>
                                {/* Profile dropdown relative ml-3 */}
                                {session?.user ? (
                                    <UserAccountNav
                                        user={{
                                            name: session.user.name,
                                            image: session.user.image,
                                            email: session.user.email,
                                            username: session.user.username,
                                        }}
                                    />
                                ) : (
                                    <SignIn />
                                )}
                            </div>
                        </div>
                    </div>

                    <Disclosure.Panel className="sm:hidden">
                        <div className="space-y-1 px-2 pb-3 pt-2">
                            {navigation.map((item) => (
                                <Disclosure.Button
                                    key={item.name}
                                    as="a"
                                    href={item.href}
                                    className={classNames(
                                        item.current
                                            ? 'bg-gray-900 text-white'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                        'block rounded-md px-3 py-2 text-base font-medium'
                                    )}
                                    aria-current={item.current ? 'page' : undefined}
                                >
                                    {item.name}
                                </Disclosure.Button>
                            ))}
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    )
}
