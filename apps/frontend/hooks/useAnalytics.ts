import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { identifyUser, trackPageView, trackUserJourney } from "../lib/analytics";

export function useAnalytics() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      identifyUser(user);
    }
  }, [isLoaded, user]);

  return {
    trackPageView,
    trackUserJourney,
    user,
    isLoaded,
  };
}
