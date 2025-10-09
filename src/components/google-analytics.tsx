'use client';

import { GoogleAnalytics } from "nextjs-google-analytics";

export default function GoogleAnalyticsClient() {
  return (
    <GoogleAnalytics
      trackPageViews
      gaMeasurementId={process.env.NEXT_PUBLIC_GA4_TAG!}
    />
  );
}
