'use client'

import { Label } from './ui/label'

export default function LinkRoom() {
    return (
        <div className="grid grid-cols-2 gap-10">
            <Label>Coming soon...</Label>

            {/* <Card>
                <CardHeader>
                    <CardTitle>Test 2</CardTitle>
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
            </Card> */}
        </div>
    )
}
