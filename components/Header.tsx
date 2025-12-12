'use client'

import Image from 'next/image'

export default function Header() {
    return (
        <header className="bg-omegle-blue text-white shadow-lg">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="text-4xl font-bold tracking-tight">
                            <span className="text-white">Omegle</span>
                        </div>
                        <div className="hidden sm:block text-sm text-blue-100">
                            Talk to strangers!
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <a href="#" className="text-sm hover:text-blue-200 transition">About</a>
                        <a href="#" className="text-sm hover:text-blue-200 transition">Safety</a>
                    </div>
                </div>
            </div>
        </header>
    )
}
