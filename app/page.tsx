import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function Page() {
    return (
        <section className="flex min-h-[80vh] w-full items-center py-12 md:py-24  lg:min-h-[87.5vh] lg:items-start lg:py-32 xl:py-48">
            <div className="container px-4 md:px-6">
                <div
                    className="absolute inset-x-0 top-[calc(15%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl"
                    aria-hidden="true"
                >
                    <div
                        className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] 
                        -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:w-[72.1875rem]"
                        style={{
                            clipPath: `polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 
                                72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 
                                0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)`,
                        }}
                    />
                </div>

                <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                            Welcome to GamesLink
                        </h1>
                        <p className="mx-auto max-w-[700px] md:text-xl">
                            Your place to find games to play with friends.
                        </p>
                    </div>
                    <div className="space-x-4">
                        <Link className={buttonVariants()} href="/home">
                            View Games
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
