import { useState, useEffect } from 'react';
import { Language, AnalysisMode, AnalysisResult as ResultType, SavedScan } from './types';
import LanguageSelector from './components/LanguageSelector';
import ImageUploader from './components/ImageUploader';
import CameraCapture from './components/CameraCapture';
import AnalysisResult from './components/AnalysisResult';
import SavedScans from './components/SavedScans';
import AuthModal from './components/AuthModal';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';
import CookieConsent from './components/CookieConsent';
import { 
  Sprout, 
  Camera, 
  AlertCircle, 
  Leaf, 
  Info, 
  Cpu, 
  HeartHandshake,
  User,
  LogOut,
  ShieldAlert,
  FileText
} from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>('hinglish');
  const [mode, setMode] = useState<AnalysisMode>('plant');
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<ResultType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scans, setScans] = useState<SavedScan[]>([]);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [tipIndex, setTipIndex] = useState<number>(0);

  // Authentication & Policies States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState<boolean>(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  // Check login session on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('active_user_session');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Session retrieval error:', e);
    }
  }, []);

  const handleLoginSuccess = (name: string, email: string) => {
    const sessionUser = { name, email };
    setUser(sessionUser);
    localStorage.setItem('active_user_session', JSON.stringify(sessionUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('active_user_session');
  };

  // Rotating tips for the loading screen based on mode
  const plantTips = [
    'तुलसी का पौधा घर की हवा को शुद्ध करने और कीड़ों को दूर रखने में मदद करता है।',
    'नीम के तेल (Neem Oil) का स्प्रे अधिकांश पौधों के कीटों और फंगस का सबसे अच्छा जैविक इलाज है।',
    'पौधों की मिट्टी सूखने पर ही पानी दें; अधिक पानी (Overwatering) से जड़ें सड़ जाती हैं।',
    'पुदीना (Mint) पाचन तंत्र के लिए बेहद गुणकारी है और इसे घर पर गमले में आसानी से उगाया जा सकता है।',
    'यदि पत्तों पर सफेद पाउडर जैसा धब्बा दिखे, तो यह पाउडरी मिल्ड्यू (फंगल रोग) हो सकता है, जिसे छाछ या बेकिंग सोडा स्प्रे से ठीक कर सकते हैं।'
  ];

  const bodyTips = [
    'त्वचा की खुजली या लाल चकत्तों पर नारियल तेल में थोड़ा कपूर मिलाकर लगाने से तुरंत आराम मिलता है।',
    'कील-मुहासों (Acne) को बार-बार छूने से बचें; इससे इन्फेक्शन बढ़ता है और काले दाग बन जाते हैं।',
    'गर्मियों की घमौरियों (Heat Rashes) के लिए मुल्तानी मिट्टी या शुद्ध चंदन का पेस्ट सबसे बेहतरीन प्राकृतिक उपाय है।',
    'एलोवेरा जेल सनबर्न, रैशेज और रूखी त्वचा को ठीक करने तथा ठंडक पहुंचाने में अत्यंत लाभकारी है।',
    'अधिकतर त्वचा रोग शरीर में पानी की कमी या अपच के कारण भी होते हैं; दिन में 8-10 गिलास पानी अवश्य पिएं।'
  ];

  const loadingTips = mode === 'body' ? bodyTips : plantTips;

  // Rotate tips during loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setTipIndex((prev) => (prev + 1) % loadingTips.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isLoading, loadingTips]);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('plant_analyzer_scans');
    if (saved) {
      try {
        setScans(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse saved scans history', err);
      }
    }
  }, []);

  // Request analysis from the backend Express server
  const analyzeImage = async (selectedImage: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setImage(selectedImage);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: selectedImage,
          language: language,
          mode: mode,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'सर्वर से संपर्क करने में त्रुटि आई। (Failed to connect to the analysis server.)');
      }

      const data: ResultType = await response.json();
      setResult(data);

      // Save scan to history
      const newScan: SavedScan = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        image: selectedImage,
        result: data,
        language: language,
        mode: mode,
      };

      const updatedScans = [newScan, ...scans];
      setScans(updatedScans);
      localStorage.setItem('plant_analyzer_scans', JSON.stringify(updatedScans));

    } catch (err: any) {
      console.error('Scan Error:', err);
      setError(
        err.message || 
        'पहचान करने में समस्या आई। कृपया सुनिश्चित करें कि आपका इंटरनेट चालू है और AI Studio Secrets में GEMINI_API_KEY कॉन्फ़िगर किया गया है।'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Load a historical scan
  const handleSelectHistoricalScan = (scan: SavedScan) => {
    setImage(scan.image);
    setResult(scan.result);
    setLanguage(scan.language);
    setMode(scan.mode || 'plant');
    setError(null);
    // Scroll smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete a scan from history
  const handleDeleteScan = (id: string) => {
    const updated = scans.filter((scan) => scan.id !== id);
    setScans(updated);
    localStorage.setItem('plant_analyzer_scans', JSON.stringify(updated));
  };

  // Clear all history
  const handleClearHistory = () => {
    if (confirm('क्या आप सचमुच पूरा इतिहास मिटाना चाहते हैं? (Are you sure you want to clear all scan history?)')) {
      setScans([]);
      localStorage.removeItem('plant_analyzer_scans');
    }
  };

  // Reset analysis to scan again
  const handleReset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-800 transition-all duration-350 relative overflow-hidden ${
      mode === 'body' 
        ? 'selection:bg-indigo-100 selection:text-indigo-900' 
        : 'selection:bg-emerald-100 selection:text-emerald-900'
    }`} id="app-root">
      
      {/* GLOWING AMBIENT COLOR ORBS (BACKGROUND ART) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Orb 1: Emerald/Indigo Dynamic Glow */}
        <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] opacity-25 transition-all duration-700 ${
          mode === 'body' ? 'bg-indigo-500' : 'bg-emerald-400'
        }`} />
        
        {/* Orb 2: Teal/Violet Dynamic Glow */}
        <div className={`absolute top-[30%] right-[-10%] w-[45%] h-[45%] rounded-full blur-[130px] opacity-20 transition-all duration-700 ${
          mode === 'body' ? 'bg-pink-500' : 'bg-teal-400'
        }`} />
        
        {/* Orb 3: Golden/Rose Glow for pure warmth */}
        <div className={`absolute bottom-[-10%] left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 transition-all duration-700 ${
          mode === 'body' ? 'bg-purple-400' : 'bg-amber-300'
        }`} />
      </div>

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 relative" id="main-header">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md transition-all duration-300 ${
              mode === 'body' 
                ? 'bg-indigo-600 shadow-indigo-600/10' 
                : 'bg-emerald-500 shadow-emerald-500/10'
            }`}>
              {mode === 'body' ? <HeartHandshake className="w-5.5 h-5.5" /> : <Leaf className="w-5.5 h-5.5" />}
            </div>
            <div>
              <h1 className="text-base md:text-xl font-black text-slate-900 leading-tight">
                AI Plant & Body Analyzer
              </h1>
              <p className="text-[10px] md:text-[11px] text-slate-500 font-medium">
                पौधों, औषधियों की पहचान और शारीरिक/त्वचा लक्षणों के घरेलू उपाय
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3 ml-auto md:ml-0">
            {/* User Account login indicators */}
            {user ? (
              <div className="flex items-center gap-2 bg-slate-100/80 border border-slate-200/50 pl-2.5 pr-1 py-1 rounded-xl text-xs font-bold text-slate-700" id="user-profile-badge">
                <span className="hidden sm:inline">नमस्ते, {user.name}</span>
                <span className="sm:hidden"><User className="w-4 h-4 text-indigo-600" /></span>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="लॉगआउट करें (Sign Out)"
                  className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer border border-slate-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs px-3 py-2 rounded-xl border border-slate-200 cursor-pointer transition-all active:scale-95"
                id="header-login-btn"
              >
                <User className="w-3.5 h-3.5" />
                <span>साइन इन (Sign In)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowCamera(true)}
              className={`flex items-center gap-2 active:scale-95 text-white font-bold text-xs md:text-sm px-3.5 py-2 rounded-xl shadow-md cursor-pointer transition-all duration-200 ${
                mode === 'body'
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/15'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/15'
              }`}
              id="header-camera-btn"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">कैमरा स्कैनर (Camera Scan)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Layout */}
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-10 flex flex-col gap-8" id="main-content">
        
        {/* POLISHED SEGMENTED MODE SELECTOR */}
        {!image && !isLoading && (
          <div className="flex flex-col items-center gap-3" id="mode-selector-block">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              क्या जांचना चाहते हैं? (Select Analyzer Mode)
            </span>
            <div className="flex bg-slate-200/80 p-1 rounded-2xl w-full max-w-md shadow-inner border border-slate-300/30" id="mode-switcher-container">
              <button
                type="button"
                onClick={() => !isLoading && setMode('plant')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-extrabold text-xs md:text-sm transition-all duration-250 cursor-pointer ${
                  mode === 'plant'
                    ? 'bg-white text-emerald-800 shadow-md scale-100'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                id="btn-mode-plant"
              >
                <Sprout className="w-4 h-4" />
                🌿 पौधा व जड़ी-बूटी
              </button>
              <button
                type="button"
                onClick={() => !isLoading && setMode('body')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-extrabold text-xs md:text-sm transition-all duration-250 cursor-pointer ${
                  mode === 'body'
                    ? 'bg-white text-indigo-800 shadow-md scale-100'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                id="btn-mode-body"
              >
                <HeartHandshake className="w-4 h-4" />
                🧍 शरीर व त्वचा
              </button>
            </div>
          </div>
        )}

        {/* Intro Hero banner (Only shown when not presenting results or loading) */}
        {!image && !isLoading && (
          <div className={`rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl border transition-all duration-500 transform hover:scale-[1.01] ${
            mode === 'body'
              ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 border-indigo-700/80 text-white'
              : 'bg-gradient-to-br from-emerald-850 via-teal-850 to-cyan-900 border-emerald-600/80 text-white'
          }`} id="hero-banner">
            <div className={`absolute top-[-20%] right-[-10%] w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
              mode === 'body' ? 'bg-pink-500/20' : 'bg-lime-400/20'
            }`} />
            <div className={`absolute bottom-[-20%] left-[-10%] w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
              mode === 'body' ? 'bg-indigo-400/25' : 'bg-teal-400/25'
            }`} />
            <div className="relative max-w-2xl" id="hero-text-container">
              <span className={`text-[10px] font-extrabold tracking-widest uppercase px-3 py-1.5 rounded-full inline-block mb-3 ${
                mode === 'body' ? 'text-pink-200 bg-pink-950/60 border border-pink-700/30' : 'text-emerald-200 bg-emerald-950/60 border border-emerald-700/30'
              }`}>
                Gemini 3.7 AI Power
              </span>
              <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-3">
                {mode === 'body' 
                  ? 'त्वचा और शरीर के लक्षणों का तुरंत घरेलू व प्राथमिक उपचार जानें'
                  : 'पौधे, औषधि या बीमारी की तुरंत सटीक जानकारी पाएं'
                }
              </h2>
              <p className="text-sm md:text-base leading-relaxed mb-6 opacity-90">
                {mode === 'body'
                  ? 'शरीर के प्रभावित अंग, त्वचा पर रैश, मुहासे, एलर्जी या कीड़े के काटने की फोटो अपलोड करें। हमारा AI आपको रोग की संभावित पहचान, आसान घरेलू उपचार, परहेज व चिकित्सक की सलाह की पूरी रिपोर्ट देगा।'
                  : 'किसी भी पौधे या पत्ती की फोटो अपलोड करें। हमारा AI आपको बताएगा कि वह कौन सी जड़ी-बूटी है, उसके क्या औषधीय उपयोग हैं, या पौधे को कौन सा रोग हुआ है और उसका जैविक इलाज क्या है।'
                }
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-semibold" id="hero-stats">
                {mode === 'body' ? (
                  <>
                    <div className="flex items-center gap-1.5 bg-indigo-900/40 px-3 py-2 rounded-lg">
                      <HeartHandshake className="w-4 h-4 text-indigo-400" />
                      Skin & Body Symptoms
                    </div>
                    <div className="flex items-center gap-1.5 bg-indigo-900/40 px-3 py-2 rounded-lg">
                      <Cpu className="w-4 h-4 text-indigo-400" />
                      Homeopathic & Ayurvedic Care
                    </div>
                    <div className="flex items-center gap-1.5 bg-indigo-900/40 px-3 py-2 rounded-lg">
                      <Info className="w-4 h-4 text-indigo-400" />
                      Medical & Doctor Advice
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 bg-emerald-800/40 px-3 py-2 rounded-lg">
                      <Sprout className="w-4 h-4 text-emerald-400" />
                      Medicinal Herbs & Crops
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-800/40 px-3 py-2 rounded-lg">
                      <Cpu className="w-4 h-4 text-emerald-400" />
                      Organic Pathology
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-800/40 px-3 py-2 rounded-lg">
                      <Leaf className="w-4 h-4 text-emerald-400" />
                      Ayurvedic & Home Remedies
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Scan / Upload Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="layout-dashboard-grid">
          
          {/* Column 1: Main Analyzer Stage */}
          <div className="lg:col-span-8 flex flex-col gap-6" id="dashboard-left">
            
            {/* Language Selector */}
            {!result && !isLoading && (
              <LanguageSelector 
                currentLanguage={language} 
                onLanguageChange={setLanguage} 
              />
            )}

            {/* Error Message Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 md:p-5 flex gap-3 items-start animate-fade-in" id="error-alert">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm md:text-base">जांच विफल रही (Analysis Failed)</h4>
                  <p className="text-xs md:text-sm text-red-700/90 mt-1 leading-relaxed">
                    {error}
                  </p>
                  <p className="text-xs text-red-600 mt-2 font-medium">
                    सुझाव: सुनिश्चित करें कि आपका इंटरनेट सक्रिय है और Gemini API की कार्यशीलता सही है।
                  </p>
                  <button 
                    type="button" 
                    onClick={handleReset}
                    className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    पुनः प्रयास करें (Retry)
                  </button>
                </div>
              </div>
            )}

            {/* Loading / Wait State Panel */}
            {isLoading && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[360px] shadow-sm relative overflow-hidden" id="loading-stage">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-md ${
                  mode === 'body' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {mode === 'body' ? (
                    <HeartHandshake className="w-8 h-8 animate-pulse text-indigo-500" />
                  ) : (
                    <Leaf className="w-8 h-8 animate-pulse text-emerald-500" />
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {mode === 'body' 
                    ? 'Gemini AI शरीर व त्वचा के लक्षणों का विश्लेषण कर रहा है...'
                    : 'Gemini AI फोटो का विश्लेषण कर रहा है...'
                  }
                </h3>
                <p className="text-slate-500 text-xs md:text-sm max-w-sm mb-6">
                  {mode === 'body'
                    ? 'Please wait, Gemini is identifying skin rashes, infection signs, insect bites, or dermatological symptoms.'
                    : 'Please wait, Gemini is identifying the leaf pattern, disease markers, and botanical traits.'
                  }
                </p>

                {/* Rotating Gardening / Plant / Body Tips Panel */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 max-w-md w-full transition-all duration-500" id="loading-tips-wrapper">
                  <div className="flex gap-2 text-left">
                    <Info className={`w-4 h-4 shrink-0 mt-0.5 ${mode === 'body' ? 'text-indigo-600' : 'text-emerald-600'}`} />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        {mode === 'body' ? 'स्वस्थ जीवन व त्वचा टिप (Health & Wellness Tip)' : 'मजेदार बागवानी टिप (Botanical Tip)'}
                      </span>
                      <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
                        {loadingTips[tipIndex]}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Simulated Progress bar */}
                <div className="w-full max-w-xs bg-slate-100 h-1 rounded-full overflow-hidden mt-8">
                  <div className={`h-full rounded-full animate-progress-loading ${
                    mode === 'body' ? 'bg-indigo-500' : 'bg-emerald-500'
                  }`} style={{ width: '40%' }}></div>
                </div>
              </div>
            )}

            {/* Scan State 1: Fresh Upload Uploader */}
            {!image && !isLoading && (
              <ImageUploader 
                onImageSelected={analyzeImage} 
                isLoading={isLoading} 
                mode={mode}
              />
            )}

            {/* Scan State 2: Result presentation */}
            {image && result && !isLoading && (
              <AnalysisResult 
                result={result} 
                image={image} 
                language={language} 
                onReset={handleReset} 
              />
            )}

          </div>

          {/* Column 2: Saved Scans History Panel */}
          <div className="lg:col-span-4 flex flex-col gap-6" id="dashboard-right">
            
            {/* Quick Informational Guide Widget */}
            {!image && !isLoading && (
              <div className={`border rounded-2xl p-4 md:p-5 flex flex-col gap-3 transition-all duration-300 ${
                mode === 'body' 
                  ? 'bg-indigo-50/40 border-indigo-100 text-indigo-900' 
                  : 'bg-emerald-50/40 border-emerald-100 text-emerald-900'
              }`} id="quick-guide-widget">
                <div className="flex items-center gap-2 font-bold text-sm md:text-base">
                  {mode === 'body' ? (
                    <>
                      <HeartHandshake className="w-5 h-5 shrink-0 text-indigo-700" />
                      <h4>लक्षण जांच कैसे करें? (How to scan)</h4>
                    </>
                  ) : (
                    <>
                      <Sprout className="w-5 h-5 shrink-0 text-emerald-700" />
                      <h4>स्कैन कैसे करें? (How to scan)</h4>
                    </>
                  )}
                </div>
                <ul className={`text-xs md:text-sm flex flex-col gap-2.5 leading-relaxed list-decimal pl-4 font-medium ${
                  mode === 'body' ? 'text-indigo-800/90' : 'text-emerald-800/90'
                }`} id="guide-list">
                  {mode === 'body' ? (
                    <>
                      <li>शरीर के प्रभावित हिस्से, त्वचा, मुहासे या रैश की एक साफ़ फ़ोटो लें।</li>
                      <li>सुनिश्चित करें कि फ़ोटो में पर्याप्त रोशनी हो और वह धुंधली न हो।</li>
                      <li>नीचे दिए गए 'उदाहरण' (Samples) पर क्लिक करके तुरंत परीक्षण करें।</li>
                      <li>अपनी पसंदीदा भाषा चुनकर उपचार और सावधानियों की रिपोर्ट प्राप्त करें।</li>
                    </>
                  ) : (
                    <>
                      <li>अपने पौधे की पत्ती या रोगग्रस्त हिस्से की एक साफ फोटो लें।</li>
                      <li>सुनिश्चित करें कि फोटो धुंधली न हो और पर्याप्त रोशनी हो।</li>
                      <li>यदि आपके पास फोटो नहीं है, तो नीचे दिए गए 'उदाहरण' का उपयोग करें।</li>
                      <li>अपनी पसंदीदा भाषा (Hindi/Hinglish/English) चुनकर रिपोर्ट देखें।</li>
                    </>
                  )}
                </ul>
              </div>
            )}

            {/* History component */}
            <SavedScans 
              scans={scans} 
              onSelectScan={handleSelectHistoricalScan} 
              onDeleteScan={handleDeleteScan} 
              onClearAll={handleClearHistory} 
            />

          </div>

        </div>
      </main>

      {/* Footer copyright and policies for Google SEO ranking & protection */}
      <footer className="border-t border-slate-200/80 bg-white py-10 mt-16 text-center text-xs text-slate-500 font-medium" id="main-footer">
        <div className="max-w-6xl mx-auto px-4 flex flex-col gap-4">
          
          {/* Footer Policy Links (Important for Search Console & Crawler Indexing) */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2.5 text-[11px] font-bold text-slate-600 mb-2" id="footer-policy-links">
            <button
              type="button"
              onClick={() => setIsPolicyModalOpen(true)}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              हमारे बारे में (About Us)
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => setIsPolicyModalOpen(true)}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              प्राइवेसी पॉलिसी (Privacy Policy)
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => setIsPolicyModalOpen(true)}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              सेवा की शर्तें (Terms of Service)
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => setIsPolicyModalOpen(true)}
              className="hover:text-rose-600 text-rose-700 transition-colors cursor-pointer"
            >
              कानूनी डिस्क्लेमर (Medical Disclaimer)
            </button>
          </div>

          <p>© 2026 AI Plant & Body Analyzer. Powered securely by Google Gemini 3.7 Flash AI.</p>
          <p className="max-w-2xl mx-auto text-[10px] text-slate-400 leading-relaxed">
            सुरक्षा निर्देश: यह एप्लिकेशन चित्रों के साम्य के आधार पर केवल शैक्षणिक और सूचनात्मक जानकारी प्रदान करता है। किसी भी रोग के लक्षण दिखने पर तुरंत योग्य चिकित्सक या डर्मेटोलॉजिस्ट से संपर्क करें।
          </p>
        </div>
      </footer>

      {/* Auth Modal overlay */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Privacy Policy, About Us, Terms & Disclaimer center */}
      <PrivacyPolicyModal 
        isOpen={isPolicyModalOpen} 
        onClose={() => setIsPolicyModalOpen(false)} 
      />

      {/* Floating Cookie Consent banner */}
      <CookieConsent />

      {/* Camera Capture Modal popup */}
      {showCamera && (
        <CameraCapture 
          onCapture={(dataUrl) => {
            setShowCamera(false);
            analyzeImage(dataUrl);
          }} 
          onClose={() => setShowCamera(false)} 
          mode={mode}
        />
      )}
    </div>
  );
}
