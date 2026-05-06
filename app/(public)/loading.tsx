export default function HomeLoading() {
    return (
        <div className="space-y-14 pb-14">
            {/* Bento Grid Skeleton */}
            <section className="px-4 md:px-6">
                <div className="panel grid gap-8 p-8 md:grid-cols-[1fr_0.7fr] md:p-12">
                    <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-24 mb-4"></div>
                        <div className="h-12 bg-muted rounded w-full mb-4"></div>
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-1/2 mb-6"></div>
                        <div className="flex gap-3">
                            <div className="h-10 bg-muted rounded w-32"></div>
                            <div className="h-10 bg-muted rounded w-28"></div>
                        </div>
                    </div>
                    <div className="animate-pulse">
                        <div className="h-32 bg-muted rounded-lg"></div>
                    </div>
                </div>
            </section>

            {/* Recent Posts Skeleton */}
            <section className="px-4 md:px-6">
                <div className="panel p-8 md:p-12">
                    <div className="animate-pulse mb-8">
                        <div className="h-8 bg-muted rounded w-48 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-64"></div>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="h-48 bg-muted rounded-lg mb-4"></div>
                                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                                <div className="flex gap-4">
                                    <div className="h-3 bg-muted rounded w-16"></div>
                                    <div className="h-3 bg-muted rounded w-12"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}