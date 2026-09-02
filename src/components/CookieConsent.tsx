import { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState<boolean>(false);

  useEffect(() => {
    // Check if consent already given
    const consent = localStorage.getItem('user_cookie_consent');
    if (!consent) {
      // Small delay for clean aesthetic entrance
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('user_cookie_consent', 'accepted');
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('user_cookie_consent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up" id="cookie-consent-banner">
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 shadow-2xl border border-slate-800 flex flex-col gap-3 relative overflow-hidden">
        
        {/* Absolute branding accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-indigo-500" />
        
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-slate-800 rounded-lg text-emerald-400 shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white">कुकी और गोपनीयता प्राथमिकता (Cookie & Privacy Consent)</h4>
            <p className="text-slate-300 text-xs leading-relaxed mt-1">
              हम आपके अनुभव को बेहतर बनाने, भाषा प्राथमिकताओं को याद रखने, और स्कैन इतिहास को आपके ब्राउज़र में सुरक्षित रखने के लिए कुकीज़ और लोकल स्टोरेज का उपयोग करते हैं।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end text-xs font-bold mt-2">
          <button
            type="button"
            onClick={handleDecline}
            className="px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
          >
            अस्वीकार करें (Decline)
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 rounded-lg transition-all cursor-pointer shadow-md shadow-emerald-500/10"
          >
            स्वीकार करें (Accept All)
          </button>
        </div>

        {/* Quick Close Button */}
        <button
          type="button"
          onClick={() => setShowBanner(false)}
          className="absolute top-3 right-3 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
