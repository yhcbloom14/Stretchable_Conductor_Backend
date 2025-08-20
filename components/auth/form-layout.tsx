import Link from "next/link"
import Logo from "@/components/common/logo"
interface FormLayoutProps {
    title: string
    description: string
    children: React.ReactNode
    link?: {
        prefix: string
        text: string
        href: string
    }
}

export default function FormLayout({title, description, children, link}: FormLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="w-full max-w-md space-y-8">
            <div className="space-y-2 text-center">
                <Logo />
                <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-gray-100">{title}</h1>
                <p className="text-gray-600 dark:text-gray-400">{description}</p>
            </div>

            {children}

            <div className="text-center">
            {
            link && 
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {link.prefix} {" "}
                    <Link href={link.href} className="text-[#2196F3] hover:text-[#42a5f5] font-medium transition-colors">
                    {link.text}
                    </Link>
                </p>
            }
            </div>
        </div>
    </div>
  );
}