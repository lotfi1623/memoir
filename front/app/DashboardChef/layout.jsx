'use client'

import MenuChef from '@/components/MenuChef'
import NavbarChef from '@/components/NavbarChef'
import '@/app/globals.css'


export default function DashbordChefLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
            <div className="w-64 bg-white dark:bg-gray-900 p-4 border-r border-gray-200 min-h-screen">
                <MenuChef />
            </div>
            <div className="w-[84%] p-6">
                <NavbarChef />
                <div className="mt-6">
                    {children}
                </div>
            </div>
        </div>
    )
}