import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
            <p className="text-xs">
                © Made by <Link href="https://twitter.com/yousof_dev">Yousof Algburi</Link>. All rights reserved.
            </p>
            <nav className="flex gap-4 sm:ml-auto sm:gap-6">
                <Link className="text-xs underline-offset-4 hover:underline" href="#">
                    Terms of Service
                </Link>
                <Link className="text-xs underline-offset-4 hover:underline" href="#">
                    Privacy
                </Link>
            </nav>
        </footer>
    )
}
