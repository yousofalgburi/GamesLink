'use client'

import { Icons } from '@/components/Icons'
import { Button } from './ui/button'
import { useSession } from 'next-auth/react'
import { CreditCard, X } from 'lucide-react'
import { useState } from 'react'

const Credits = () => {
    const { data: session } = useSession()
    const [openModal, setOpenModal] = useState(false)

    return (
        <>
            <Button
                onClick={() => setOpenModal(!openModal)}
                variant="ghost"
                className='className="text-sm hover:underline" flex gap-2 font-medium underline-offset-4'
            >
                {session && session.user.credits} Credits <CreditCard />
            </Button>

            <div className={`fixed inset-0 z-10 bg-zinc-900/20 ${openModal ? '' : 'hidden'}`}>
                <div className="container mx-auto flex h-full max-w-lg items-center">
                    <div className="auth-modal-color relative h-fit w-full rounded-lg px-2 py-20">
                        <div className="absolute right-4 top-4">
                            <Button
                                variant="ghost"
                                className="h-6 w-6 rounded-md p-0"
                                onClick={() => setOpenModal(false)}
                            >
                                <X aria-label="close modal" className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="container mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                            <div className="flex flex-col space-y-2 text-center">
                                <Icons.logo className="mx-auto h-6 w-6" />
                                <p className="mx-auto max-w-xs text-sm">
                                    Coming soon, 1 credit for an AI generated list of games to play using games you
                                    liked/disliked plus games your friends disliked/liked.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Credits
