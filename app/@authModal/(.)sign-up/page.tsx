import CloseModal from '@/components/CloseModal'
import SignUp from '@/components/SignUp'

const page = ({}) => {
    return (
        <div className="fixed inset-0 z-10 bg-zinc-900/20">
            <div className="container mx-auto flex h-full max-w-lg items-center">
                <div className="auth-modal-color relative h-fit w-full rounded-lg  px-2 py-20">
                    <div className="absolute right-4 top-4">
                        <CloseModal />
                    </div>

                    <SignUp />
                </div>
            </div>
        </div>
    )
}

export default page
