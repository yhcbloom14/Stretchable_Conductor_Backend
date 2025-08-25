'use client'

import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks'
import { fileSlice, refreshFiles } from '@/lib/store/slices/fileSlice'
import { useEffect } from 'react'
import { SkeletonSidebar, SkeletonTable, SkeletonTitle } from '@/components/common/skeleton-data'
import { FlyoutProvider } from '@/app/flyout-context'
import Container from '@/components/common/container'

export default function Home() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const files = useAppSelector(fileSlice.selectors.selectFiles)
    const isLoading = useAppSelector(fileSlice.selectors.selectLoading)

    useEffect(() => {
        if (files.length > 0) {
            // Use client-side navigation to prevent flash
            router.replace(`/data/${files[0].id}`)
        } else {
            // Only fetch files if we don't have any cached
            dispatch(refreshFiles(false));
        }
    }, [dispatch, files, router])

    // Show skeleton while loading files or if no files exist
    if (isLoading || files.length === 0) {
        return (
            <FlyoutProvider>
                <div className="relative flex">
                    <SkeletonSidebar />
                    <div className="grow bg-white dark:bg-gray-900 flex flex-col md:translate-x-0 transition-transform duration-300 ease-in-out overflow-hidden">
                        <Container>
                            <div className="flex-1 md:ml-8 xl:mx-4 2xl:mx-8">
                                <div className="md:py-8">
                                    <div className="space-y-10">
                                        <div className="">
                                            <SkeletonTitle />
                                        </div>
                                        <SkeletonTable />
                                    </div>
                                </div>
                            </div>
                        </Container>
                    </div>
                </div>
            </FlyoutProvider>
        )
    }

    // This should rarely be reached as useEffect will redirect
    return null
}