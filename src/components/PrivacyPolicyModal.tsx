import { X, ShieldAlert, FileText, Landmark, UserCheck } from 'lucide-react';
import { useState } from 'react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PolicyTab = 'about' | 'disclaimer' | 'privacy' | 'terms';

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  const [activeTab, setActiveTab] = useState<PolicyTab>('disclaimer');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in" id="policy-modal">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden" id="policy-modal-card">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50" id="policy-modal-header">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base md:text-lg font-black text-slate-950">
              नीति और कानूनी सुरक्षा दस्तावेज (Legal & Privacy Center)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            id="policy-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-100 bg-white overflow-x-auto scrollbar-none" id="policy-tab-controls">
          <button
            onClick={() => setActiveTab('disclaimer')}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3.5 border-b-2 text-xs md:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'disclaimer'
                ? 'border-rose-500 text-rose-700 bg-rose-50/20'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            कानूनी डिस्क्लेमर
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3.5 border-b-2 text-xs md:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'about'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/20'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <UserCheck className="w-4 h-4 shrink-0" />
            हमारे बारे में (About)
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3.5 border-b-2 text-xs md:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/20'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            प्राइवेसी पॉलिसी
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3.5 border-b-2 text-xs md:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'terms'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/20'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            सेवा की शर्तें
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto text-slate-700 space-y-6 text-xs md:text-sm leading-relaxed" id="policy-content-area">
          
          {activeTab === 'disclaimer' && (
            <div className="space-y-4" id="policy-tab-disclaimer">
              <div className="p-4 bg-rose-50 border border-rose-150 rounded-2xl flex gap-3 text-rose-950">
                <ShieldAlert className="w-6 h-6 shrink-0 text-rose-600" />
                <div>
                  <h4 className="font-extrabold mb-1">अति आवश्यक सूचना (Important Medical Disclaimer)</h4>
                  <p className="text-xs">
                    यह एप्लीकेशन विशुद्ध रूप से शैक्षणिक एवं सूचनात्मक उद्देश्य के लिए तैयार किया गया है। इसका उपयोग किसी भी कानूनी या चिकित्सीय प्रमाण के रूप में न करें।
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-extrabold text-slate-900 text-sm md:text-base border-b pb-1">1. कोई चिकित्सीय सलाह नहीं (Not Medical Advice)</h3>
                <p>
                  शारीरिक या त्वचा रोगों (Skin Rashes, Acne, Bug Bites, Allergic Reaction, etc.) का विश्लेषण केवल कृत्रिम बुद्धिमत्ता (AI) के माध्यम से चित्रों की समानता के आधार पर किया जाता है। यह किसी भी प्रकार से वास्तविक डॉक्टर, त्वचा रोग विशेषज्ञ (Dermatologist), या वैद्य की परामर्श, परीक्षण, निदान अथवा उपचार का विकल्प नहीं है।
                </p>
                <p className="text-rose-600 font-semibold">
                  यदि आपको कोई गंभीर लक्षण, तीव्र दर्द, संक्रमण अथवा आपातकालीन चिकित्सीय आवश्यकता है, तो बिना देर किए तुरंत नजदीकी चिकित्सा केंद्र या आपातकालीन डॉक्टर से संपर्क करें। इस एप्लीकेशन पर आधारित किसी भी घरेलू नुस्खे को आजमाने से पहले डॉक्टर की सलाह अवश्य लें।
                </p>

                <h3 className="font-extrabold text-slate-900 text-sm md:text-base border-b pb-1 mt-4">2. अवैध या गैर-कानूनी सामग्री निषेध (No Illegal Content Guarantee)</h3>
                <p>
                  यह एप्लिकेशन किसी भी प्रकार की अवैध गतिविधियों, अवैध जड़ी-बूटियों (नशीले पदार्थ या प्रतिबंधित पौधों), या किसी गैर-कानूनी चिकित्सा पद्धतियों का समर्थन या प्रचार नहीं करता है। सभी प्रदर्शित सूचनाएं सार्वजनिक रूप से स्वीकृत पारंपरिक ज्ञान और विज्ञान पर आधारित हैं।
                </p>

                <h3 className="font-extrabold text-slate-900 text-sm md:text-base border-b pb-1 mt-4">3. दायित्व सीमा (Limitation of Liability)</h3>
                <p>
                  इस सेवा के उपयोग से उत्पन्न होने वाले किसी भी प्रत्यक्ष, अप्रत्यक्ष, या आकस्मिक नुकसान (शारीरिक या वित्तीय) के लिए ऐप के डेवलपर या संचालक उत्तरदायी नहीं होंगे। उपयोगकर्ता अपनी स्वेच्छा और विवेक से ही इस एप्लीकेशन की सूचनाओं का उपयोग करें।
                </p>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-4" id="policy-tab-about">
              <h3 className="font-extrabold text-slate-900 text-base border-b pb-2">AI Plant, Herb & Body Analyzer</h3>
              <p>
                हमारा विज़न आधुनिक तकनीक और प्राचीन पारंपरिक ज्ञान (जैसे आयुर्वेद, घरेलू नुस्खे और जैविक कृषि विज्ञान) के बीच सेतु का निर्माण करना है। 
                यह प्लेटफॉर्म उन्नत <strong>Gemini 3.7 Flash AI</strong> मॉडल का उपयोग करके काम करता है जो अपलोड की गई तस्वीरों के विभिन्न पैटर्न का सेकेंडों में विश्लेषण कर लेता है।
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                  <h4 className="font-extrabold text-indigo-950 mb-1">🌿 बागवानी और खेती सुरक्षा</h4>
                  <p className="text-xs text-indigo-900/90">
                    हम पौधों, जड़ी-बूटियों और फसल रोगों की जैविक (Organic remedies) पहचान की मदद से पर्यावरण अनुकूल गार्डनिंग को बढ़ावा देते हैं।
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                  <h4 className="font-extrabold text-emerald-950 mb-1">🧍 स्वास्थ्य और स्किन केयर</h4>
                  <p className="text-xs text-emerald-900/90">
                    रोजमर्रा की छोटी स्वास्थ्य समस्याओं (जैसे सूखी त्वचा, घमौरियां, मच्छर का काटना) के लिए सुरक्षित घरेलू नुस्खों का प्रामाणिक ज्ञान प्रदान करते हैं।
                  </p>
                </div>
              </div>
              
              <p className="text-slate-500 text-xs mt-4">
                हम Google Search Console, Google SEO नीतियों, और उपयोगकर्ता की निजता के सभी मानदंडों का पूर्ण पालन करते हैं ताकि आपको एक स्वच्छ, विज्ञापन-मुक्त और सूचनात्मक अनुभव मिल सके।
              </p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4" id="policy-tab-privacy">
              <h3 className="font-extrabold text-slate-900 text-base border-b pb-2">प्राइवेसी पॉलिसी (Privacy Policy)</h3>
              <p className="text-xs text-slate-500">अंतिम अपडेट: सितंबर 2026</p>
              
              <p>
                आपकी गोपनीयता (Privacy) हमारे लिए अत्यंत महत्वपूर्ण है। हम आपकी डेटा सुरक्षा को सुदृढ़ रखने के लिए पूर्ण रूप से प्रतिबद्ध हैं।
              </p>

              <h4 className="font-extrabold text-slate-900 mt-3">1. हम कौन सी जानकारी एकत्र करते हैं?</h4>
              <p>
                <strong>तस्वीरें (Uploaded Images):</strong> जब आप किसी पौधे या शरीर के अंग की तस्वीर अपलोड करते हैं, तो वह सुरक्षित रूप से विश्लेषण के लिए केवल जेमिनी एपीआई (Gemini API) को भेजी जाती है। हम इन तस्वीरों को अपने सर्वर पर स्थायी रूप से कभी भी सेव नहीं करते हैं।
              </p>
              <p>
                <strong>स्थानीय ब्राउज़र स्टोरेज (Local Storage):</strong> आपके द्वारा स्कैन की गई रिपोर्ट का इतिहास आपके अपने डिवाइस के सुरक्षित <code>localStorage</code> में सहेज कर रखा जाता है ताकि आप इसे कभी भी देख सकें। इसे आप जब चाहें डिलीट भी कर सकते हैं।
              </p>

              <h4 className="font-extrabold text-slate-900 mt-3">2. तृतीय पक्ष प्रकटीकरण (Third-Party Sharing)</h4>
              <p>
                हम कभी भी आपकी व्यक्तिगत जानकारी, ईमेल, या अपलोड की गई तस्वीरें किसी तीसरे पक्ष के साथ बेचते, साझा या ट्रांसफर नहीं करते हैं। सभी प्रक्रियाएं पूर्ण रूप से एन्क्रिप्टेड (SSL Secure) होती हैं।
              </p>

              <h4 className="font-extrabold text-slate-900 mt-3">3. कुकीज़ नीति (Cookies Policy)</h4>
              <p>
                हम केवल एप्लिकेशन की प्राथमिकताओं (जैसे भाषा चयन और साइन-इन टोकन) को याद रखने के लिए आवश्यक फ़ंक्शनल कुकीज़ का उपयोग करते हैं।
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4" id="policy-tab-terms">
              <h3 className="font-extrabold text-slate-900 text-base border-b pb-2">सेवा की शर्तें (Terms of Service)</h3>
              
              <p>
                इस एप्लिकेशन का उपयोग करके, आप निम्नलिखित नियमों व शर्तों से पूर्णतः सहमत होते हैं:
              </p>

              <div className="space-y-3 font-medium">
                <p>
                  • <strong>उचित उपयोग:</strong> आप इस सेवा का उपयोग केवल वैध, व्यक्तिगत और ज्ञानवर्धन उद्देश्यों के लिए करेंगे। किसी भी अवांछित या गैर-कानूनी तस्वीरों को अपलोड करना पूर्णतः वर्जित है।
                </p>
                <p>
                  • <strong>आयु सीमा:</strong> इस एप्लीकेशन का उपयोग करने के लिए आपकी आयु कम से कम 13 वर्ष होनी चाहिए। नाबालिग उपयोगकर्ता माता-पिता की देखरेख में ही स्वास्थ्य सलाहों को पढ़ें।
                </p>
                <p>
                  • <strong>कोई चिकित्सीय गारंटी नहीं:</strong> एआई आधारित परिणाम केवल एक प्रारंभिक संकेत हैं। इसे किसी भी कानूनी या चिकित्सीय दावे (Legal or Medical Claim) के तौर पर प्रस्तुत नहीं किया जा सकता।
                </p>
                <p>
                  • <strong>सेवा में बदलाव:</strong> हम बिना किसी पूर्व सूचना के इस निशुल्क सेवा की सुविधाओं, नियमों या उपलब्धता में बदलाव करने का अधिकार सुरक्षित रखते हैं।
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end" id="policy-modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs md:text-sm font-extrabold cursor-pointer transition-all active:scale-95 shadow-sm"
            id="policy-accept-btn"
          >
            मैंने पढ़ लिया और स्वीकार है (I Accept)
          </button>
        </div>

      </div>
    </div>
  );
}
