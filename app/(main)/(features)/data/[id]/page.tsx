import DataContent from "./data-content";
import FileSidebar from "./file-sidebar";
import { FlyoutProvider } from "@/app/flyout-context";

export default async function DataPage({ params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    
    return (
        <FlyoutProvider>
            <div className="relative flex">
                <FileSidebar activeId={id}/>
                <DataContent activeId={id}/>
            </div>
        </FlyoutProvider>
    )
}