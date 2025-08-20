export default function Container({children}: {children: React.ReactNode}) {
    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
            {children}
        </div>
    )
}
