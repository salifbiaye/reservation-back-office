"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export function MobileRedirect({ mobileUrl }: { mobileUrl: string }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const isMobile = /mobile|android|iphone|ipad|phone/i.test(navigator.userAgent)
    
    if (isMobile && pathname !== mobileUrl) {
      router.replace(mobileUrl)
    }
  }, [router, pathname, mobileUrl])

  return null
}
