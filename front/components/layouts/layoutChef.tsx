// components/layouts/ChefLayout.tsx
import NavbarChef from "@/components/NavbarChef"
import MenuChef from "@/components/MenuChef"


export default function ChefLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 bg-white p-4 border-r border-gray-200 min-h-screen">
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
