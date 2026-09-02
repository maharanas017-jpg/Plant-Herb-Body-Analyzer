import { useState, useEffect } from 'react';
import { AnalysisResult as ResultType, Language } from '../types';
import { 
  Sprout, 
  Bug, 
  Sparkles, 
  BookOpen, 
  Compass, 
  CheckCircle, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check,
  ShieldCheck,
  CalendarCheck,
  HeartHandshake
} from 'lucide-react';

interface AnalysisResultProps {
  result: ResultType;
  image: string; // Image scanned
  language: Language;
  onReset: () => void;
}

type TabType = 'description' | 'origin' | 'treatment' | 'usage';

export default function AnalysisResult({ result, image, language, onReset }: AnalysisResultProps) {
  const [activeTab, setActiveTab] = useState<TabType>('description');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Stop TTS when component unmounts
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Text-To-Speech Reader
  const toggleTTS = () => {
    if (!window.speechSynthesis) {
      alert('Your browser does not support text-to-speech.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Prepare text based on active tab
    let textToSpeak = '';
    const intro = `${result.commonName}. Scientific name: ${result.scientificName}. `;
    
    if (activeTab === 'description') {
      textToSpeak = intro + result.description;
    } else if (activeTab === 'origin') {
      textToSpeak = result.originOrCause;
    } else if (activeTab === 'treatment') {
      textToSpeak = result.treatmentOrCure;
    } else if (activeTab === 'usage') {
      textToSpeak = result.usageOrCare;
    }

    if (result.funFact) {
      textToSpeak += `. Fun Fact: ${result.funFact}`;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Choose appropriate voice/lang
    if (language === 'hindi') {
      utterance.lang = 'hi-IN';
    } else if (language === 'hinglish') {
      utterance.lang = 'hi-IN'; // Reads English script with Hindi-like phonetic pacing
    } else {
      utterance.lang = 'en-US';
    }

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Copy result text to clipboard
  const handleCopy = () => {
    const isBody = result.category === 'Human Body Issue';
    const text = `
${isBody ? '🧍 [Body & Skin Symptom Analyzer Result] 🧍' : '🌿 [Plant & Herb Analyzer Result] 🌿'}
-------------------------------------
Category: ${result.category}
Name: ${result.commonName}
Scientific/Medical Name: ${result.scientificName}
Local/Other Names: ${result.localNames}
Confidence: ${result.confidenceScore}%

📝 [Description / Pehchan]
${result.description}

🌱 [Origin / Cause / Triggers]
${result.originOrCause}

💊 [Remedy / Home Treatment / Care]
${result.treatmentOrCure}

🍵 [Usage / Precautions / Warnings]
${result.usageOrCare}

✨ [Wellness Tip / Fun Fact]
${result.funFact}
    `.trim();

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Get localized tab headers
  const getTabLabel = (tab: TabType) => {
    const isBody = result.category === 'Human Body Issue';
    if (language === 'hindi') {
      switch (tab) {
        case 'description': return 'परिचय (About)';
        case 'origin': return isBody ? 'कारण व ट्रिगर्स (Causes)' : 'उत्पत्ति / कारण (Origin)';
        case 'treatment': return isBody ? 'उपचार व नुस्खे (Remedy)' : 'इलाज / समाधान (Cure)';
        case 'usage': return isBody ? 'परहेज व सावधानी (Care)' : 'उपयोग / देखभाल (Usage)';
      }
    } else if (language === 'hinglish') {
      switch (tab) {
        case 'description': return 'Pehchan (Info)';
        case 'origin': return isBody ? 'Karan & Triggers' : 'Karan (Origin)';
        case 'treatment': return isBody ? 'Upchar & Remedies' : 'Remedy (Cure)';
        case 'usage': return isBody ? 'Parhej & Warning' : 'Upayog (Care)';
      }
    } else {
      switch (tab) {
        case 'description': return 'Overview';
        case 'origin': return isBody ? 'Causes & Triggers' : 'Origin / Cause';
        case 'treatment': return isBody ? 'Remedies & Cure' : 'Treatment / Cure';
        case 'usage': return isBody ? 'Care & Warnings' : 'Usage / Care';
      }
    }
  };

  const getLocalizedSectionHeader = (key: string) => {
    const isBody = result.category === 'Human Body Issue';
    if (language === 'hindi') {
      if (key === 'scientific') return isBody ? 'मेडिकल / वैज्ञानिक नाम:' : 'वैज्ञानिक नाम:';
      if (key === 'local') return isBody ? 'स्थानीय नाम / लक्षण:' : 'स्थानीय नाम:';
      if (key === 'confidence') return 'सटीकता:';
    } else if (language === 'hinglish') {
      if (key === 'scientific') return isBody ? 'Medical Name (Scientific):' : 'Scientific Name:';
      if (key === 'local') return isBody ? 'Local Names / Symptoms:' : 'Local Names:';
      if (key === 'confidence') return 'Confidence Score:';
    } else {
      if (key === 'scientific') return isBody ? 'Medical / Scientific Name:' : 'Scientific Name:';
      if (key === 'local') return isBody ? 'Local Names / Symptoms:' : 'Local Names:';
      if (key === 'confidence') return 'Confidence Score:';
    }
    return '';
  };

  // Styles based on category
  const isDisease = result.category === 'Plant Disease';
  const isBodyIssue = result.category === 'Human Body Issue';
  
  const categoryColor = isBodyIssue
    ? 'bg-indigo-100 text-indigo-950 border-indigo-200'
    : isDisease 
    ? 'bg-amber-100 text-amber-900 border-amber-200' 
    : 'bg-emerald-100 text-emerald-950 border-emerald-200';

  return (
    <div className="flex flex-col gap-6" id="analysis-result-container">
      {/* Top action header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 p-3 rounded-xl" id="result-toolbar">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700 bg-white border border-slate-200 hover:border-emerald-300 px-4 py-2 rounded-lg transition-all cursor-pointer shadow-sm"
          id="btn-scan-another"
        >
          <RotateCcw className="w-4 h-4" />
          नया स्कैन करें (Scan Another)
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTTS}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition-all cursor-pointer shadow-sm ${
              isSpeaking
                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
            }`}
            id="btn-tts"
            title="बोलकर सुनें (Listen to Info)"
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4" />
                पढ़ना बंद करें (Stop Listening)
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 animate-bounce" />
                बोलकर सुनें (Listen Info)
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:border-emerald-300 hover:text-emerald-700 px-4 py-2 rounded-lg transition-all cursor-pointer shadow-sm"
            id="btn-copy"
            title="जानकारी कॉपी करें (Copy Info)"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                कॉपी हो गया!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                कॉपी करें (Copy)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="result-main-grid">
        {/* Left Side: Scanned Image and Key Facts */}
        <div className="md:col-span-4 flex flex-col gap-4" id="result-left-column">
          <div className="aspect-square w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 relative" id="result-img-wrapper">
            <img 
              src={image} 
              alt={result.commonName} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-3 left-3 flex gap-2">
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm ${categoryColor}`}>
                {isBodyIssue ? (
                  <HeartHandshake className="w-3.5 h-3.5 inline mr-1 text-indigo-600" />
                ) : isDisease ? (
                  <Bug className="w-3.5 h-3.5 inline mr-1 text-amber-600" />
                ) : (
                  <Sprout className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
                )}
                {result.category}
              </span>
            </div>
          </div>

          {/* Key Quick Info Panel */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 md:p-5 flex flex-col gap-4" id="result-key-facts">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{getLocalizedSectionHeader('scientific')}</span>
              <p className="text-base font-semibold text-slate-800 italic mt-0.5" id="val-scientific-name">
                {result.scientificName || 'N/A'}
              </p>
            </div>
            <div className="border-t border-slate-200/60 pt-3">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{getLocalizedSectionHeader('local')}</span>
              <p className="text-sm font-medium text-slate-700 mt-0.5" id="val-local-names">
                {result.localNames || 'N/A'}
              </p>
            </div>
            <div className="border-t border-slate-200/60 pt-3">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{getLocalizedSectionHeader('confidence')}</span>
              <div className="flex items-center gap-3 mt-1.5" id="confidence-bar-container">
                <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      result.confidenceScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${result.confidenceScore}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-800 shrink-0">{result.confidenceScore}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Detailed Information */}
        <div className="md:col-span-8 flex flex-col gap-5" id="result-right-column">
          <div className="border-b border-slate-200" id="tabs-container">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-4" id="result-common-name">
              {result.commonName}
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-px" id="tabs-nav">
              {(['description', 'origin', 'treatment', 'usage'] as TabType[]).map((tab) => {
                const isSelected = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`py-2.5 px-4 font-bold text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 text-emerald-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                    }`}
                    id={`tab-btn-${tab}`}
                  >
                    {getTabLabel(tab)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Tab Panel Content */}
          <div className="min-h-[180px]" id="tab-content-panel">
            {activeTab === 'description' && (
              <div className="flex flex-col gap-4 animate-fade-in" id="panel-description">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 mb-1.5">
                      {language === 'hindi' ? 'मुख्य विवरण' : language === 'hinglish' ? 'Khaas Jaankari' : 'General Description'}
                    </h3>
                    <p className="text-slate-600 text-base leading-relaxed whitespace-pre-line max-w-2xl" id="val-description">
                      {result.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'origin' && (
              <div className="flex flex-col gap-4 animate-fade-in" id="panel-origin">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 mb-1.5">
                      {isDisease 
                        ? (language === 'hindi' ? 'रोग का मुख्य कारण व प्रसार' : language === 'hinglish' ? 'Bimari Ka Karan' : 'Pathology & Causes')
                        : (language === 'hindi' ? 'उत्पत्ति और अनुकूल वातावरण' : language === 'hinglish' ? 'Paudhe ki Origin aur weather' : 'Habitat & Growing Conditions')
                      }
                    </h3>
                    <p className="text-slate-600 text-base leading-relaxed whitespace-pre-line max-w-2xl" id="val-origin">
                      {result.originOrCause}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'treatment' && (
              <div className="flex flex-col gap-4 animate-fade-in" id="panel-treatment">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 mb-1.5">
                      {isDisease 
                        ? (language === 'hindi' ? 'जैविक व रासायनिक उपचार (इलाज)' : language === 'hinglish' ? 'Organic aur Chemical Ilaaj' : 'Organic & Chemical Remediation')
                        : (language === 'hindi' ? 'उगाने और संवर्धन की विधि' : language === 'hinglish' ? 'Kaise ugayein (Cultivation)' : 'Propagation & Soil Care')
                      }
                    </h3>
                    <p className="text-slate-600 text-base leading-relaxed whitespace-pre-line max-w-2xl" id="val-treatment">
                      {result.treatmentOrCure}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'usage' && (
              <div className="flex flex-col gap-4 animate-fade-in" id="panel-usage">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 mb-1.5">
                      {isDisease 
                        ? (language === 'hindi' ? 'सुरक्षा नियम व बचाव' : language === 'hinglish' ? 'Kaise bachayein (Prevention)' : 'Precaution & Prevention')
                        : (language === 'hindi' ? 'उपयोग के तरीके और औषधीय नुस्खे' : language === 'hinglish' ? 'Use kaise karein (Recipes/Applications)' : 'Medicinal Recipes & Preparation')
                      }
                    </h3>
                    <p className="text-slate-600 text-base leading-relaxed whitespace-pre-line max-w-2xl" id="val-usage">
                      {result.usageOrCare}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fun Fact / Trivia Box */}
          {result.funFact && (
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex gap-3 mt-4" id="fun-fact-box">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-900 mb-1">
                  {language === 'hindi' ? 'रोचक तथ्य / खास टिप' : language === 'hinglish' ? 'Roachak Tathya / Special Tip' : 'Interesting Botanical Fact / Tip'}
                </h4>
                <p className="text-sm text-emerald-800 leading-relaxed max-w-2xl" id="val-fun-fact">
                  {result.funFact}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
