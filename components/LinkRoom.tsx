'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from './ui/button'
import { toast } from 'sonner'
import pusher from '@/lib/pusher'
import { useState } from 'react'

export default function LinkRoom() {
    const [testText, setTestText] = useState('')

    pusher.subscribe('my-channel').bind('my-event', (data: any) => {
        setTestText(data.message)
    })

    return (
        <div className="grid grid-cols-2 gap-10">
            <Card>
                <CardHeader>
                    <CardTitle>{testText}</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Card Content</p>
                </CardContent>
                <CardFooter>
                    <p>Card Footer</p>
                </CardFooter>
            </Card>

            <Card>
                <CardContent className="flex h-full w-full items-center justify-center">
                    <Button
                        onClick={() => {
                            toast('Invite Link Copied to Clipboard')
                            navigator.clipboard.writeText('test')
                        }}
                    >
                        Copy Invite Link
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
