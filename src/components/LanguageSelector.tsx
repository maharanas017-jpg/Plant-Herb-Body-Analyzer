import { Language } from '../types';
import { Globe, Languages } from 'lucide-react';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  const options: { id: Language; label: string; subLabel: string; info: string }[] = [
    {
      id: 'hindi',
      label: 'हिंदी',
      subLabel: 'Devanagari',
      info: 'पूरी जानकारी शुद्ध हिंदी में',
    },
    {
      id: 'hinglish',
      label: 'Hinglish',
      subLabel: 'Hindi + English',
      info: 'Conversational Hinglish script (e.g. Tulsi ek jadi-buti hai)',
    },
    {
      id: 'english',
      label: 'English',
      subLabel: 'Standard English',
      info: 'Scientific & plant care guide in English',
    },
  ];

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 md:p-5" id="language-selector-container">
      <div className="flex items-center gap-2 mb-3">
        <Languages className="w-5 h-5 text-emerald-600" id="lang-icon" />
        <h3 className="text-base font-semibold text-slate-800" id="lang-heading">
          अपनी भाषा चुनें (Choose Response Language)
        </h3>
      </div>
      <p className="text-xs text-slate-500 mb-4" id="lang-description">
        Gemini AI आपके द्वारा चुनी गई भाषा में पौधों की पहचान और उपचार की पूरी जानकारी देगा।
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" id="lang-grid">
        {options.map((option) => {
          const isSelected = currentLanguage === option.id;
          return (
            <button
              key={option.id}
              type="button"
              id={`lang-btn-${option.id}`}
              onClick={() => onLanguageChange(option.id)}
              className={`flex flex-col text-left p-3.5 rounded-lg transition-all duration-200 border cursor-pointer ${
                isSelected
                  ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-base font-bold ${isSelected ? 'text-emerald-700' : 'text-slate-800'}`}>
                  {option.label}
                </span>
                <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  {option.subLabel}
                </span>
              </div>
              <span className="text-xs text-slate-500 mt-2 font-normal line-clamp-1">
                {option.info}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
