import { GamepadIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'

export default function LowPlayersAvatar() {
    return (
        <Alert className="mb-8">
            <GamepadIcon className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
                A User has less than 5 games, results wont be useful unless all users have at least 5 games.
            </AlertDescription>
        </Alert>
    )
}
