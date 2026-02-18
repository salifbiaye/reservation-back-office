import { redirect } from "next/navigation"
import { headers } from "next/headers"

export default function CalendarPage() {
  const headersList = headers()
  const userAgent = headersList.get("user-agent") || ""
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent)
  
  if (isMobile) {
    redirect("/calendar/week")
  }
  
  redirect("/calendar/month")
}
