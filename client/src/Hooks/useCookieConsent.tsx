import { useState, useEffect } from "react";

const useCookieConsent = () => {
  const [consent, setConsent] = useState<boolean | null>(null); // null indicates loading state

  useEffect(() => {
    // Simulate fetching consent status from storage or API
    const storedConsent = localStorage.getItem("cookieConsent");
    setConsent(storedConsent === "true");
  }, []);

  const accept = () => {
    localStorage.setItem("cookieConsent", "true");
    setConsent(true);
  };

  return { consent, accept };
};

export default useCookieConsent;
