'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useSession } from 'next-auth/react'
import { Icons } from './Icons'
import UserAuthForm from './UserAuthForm'
import { Button } from './ui/button'

export default function SignIn() {
    const { data: session } = useSession()

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <Button className='className="text-sm hover:underline" flex gap-2 font-medium underline-offset-4'>
                        Sign In
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Sign In</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col space-y-2 text-center">
                        <Icons.logo className="mx-auto h-6 w-6" />
                        <h1 className="text-2xl font-semibold tracking-tight">GamesLink</h1>
                        <p className="mx-auto max-w-xs text-sm">
                            By continuing, you are setting up a GamesLink account and agree to our User Agreement and
                            Privacy Policy.
                        </p>
                    </div>

                    <UserAuthForm />
                </DialogContent>
            </Dialog>
        </>
    )
}
