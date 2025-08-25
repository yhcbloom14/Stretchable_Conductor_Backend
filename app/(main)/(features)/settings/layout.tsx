import Container from '@/components/common/container'
import SettingsSidebar from './settings-sidebar'

export default function ModelLayout({
    children
}: {
    children: React.ReactNode
}) {

    return (
        <Container>
            <div className="xl:flex">
                <div className="md:flex flex-1">
                    {/* <SettingsSidebar/> */}
                    <div className="flex-1 md:ml-8 xl:mx-4 2xl:mx-8">
                        <div className="md:py-8">   
                            <div className="space-y-10">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    )
}