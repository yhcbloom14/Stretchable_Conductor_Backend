import Container from '@/components/common/container'

export default function ModelLayout({
    children
}: {
    children: React.ReactNode
}) {
    
    return (
        <Container>
            <div className="md:flex flex-1">

            {/* Left content
            <SettingsSidebar /> */}

            {/* Middle content */}
            <div className="flex-1 md:ml-8 xl:mx-4 2xl:mx-8">
            <div className="md:py-8">

                <div className="space-y-10">
                    {children}
                </div>

            </div>
            </div>

            </div>
        </Container>
    )
}