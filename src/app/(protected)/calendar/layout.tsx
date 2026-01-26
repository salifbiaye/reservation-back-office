import { PageHeader } from "@/components/page-header"
import { PageHeroSection } from "@/components/page-hero"
import { Calendar } from "lucide-react"
import { CalendarDataLoader } from "@/features/calendar/calendar-data-loader"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <PageHeader />
      <div className="flex-1 space-y-6 p-6">
        <PageHeroSection
          icon={Calendar}
          title="Calendrier"
          description="Visualisez toutes les réservations dans le calendrier"
          visualIcon={Calendar}
        />

        <Suspense fallback={<CalendarSkeleton />}>
          <CalendarDataLoader>{children}</CalendarDataLoader>
        </Suspense>
      </div>
    </>
  )
}

function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-48" />
      </div>
      <Skeleton className="h-[600px] w-full rounded-xl" />
    </div>
  )
}
