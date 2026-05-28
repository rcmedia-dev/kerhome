'use client';

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "nextjs-google-analytics";

export default function GoogleAnalyticsClient() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return (
    <GoogleAnalytics
      trackPageViews
      gaMeasurementId={process.env.NEXT_PUBLIC_GA4_TAG!}
    />
  );
}

