import Sidebar from '@/components/ui/sidebar'
import Header from '@/components/ui/header'
import StoreProvider from './StoreProvider'
import { Toaster } from 'react-hot-toast'
export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode
}) {  
  return (
    <StoreProvider>
      <div className="flex h-[100dvh] overflow-hidden">

        {/* Sidebar */}
        <Sidebar />

        {/* Content area */}
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">

          {/*  Site header */}
          <Header />
        
          <main className="grow [&>*:first-child]:scroll-mt-16 p-4 sm:p-6 lg:p-8">
            {children}
          </main>        

        </div>
      </div>
      <Toaster />
    </StoreProvider>
  )
}
