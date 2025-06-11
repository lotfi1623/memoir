import Link from "next/link";
import Image from "next/image";
import Menu from "@/components/Menu";
import NavbarDash from "@/components/NavbarDash";

export default function DashbordEnsLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
        <div className="w-64 bg-white dark:bg-gray-900 p-4 border-r border-gray-200 min-h-screen">
          <Menu/>
        </div>
        <div className="w-[84%] p-6">
          <NavbarDash/>
          <div className="mt-6">
            {children}
          </div>
        </div>
      </div>
    );
  }
