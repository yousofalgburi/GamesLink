import SignIn from '@/components/SignIn'
import { toast } from '@/components/ui/use-toast'

export const useCustomToasts = () => {
	const loginToast = () => {
		const { dismiss } = toast({
			title: 'Login required.',
			description: 'You need to be logged in to do that.',
			variant: 'destructive',
			action: <SignIn />,
		})
	}

	return { loginToast }
}
