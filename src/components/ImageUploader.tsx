import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, Camera, Image as ImageIcon, CheckCircle, HelpCircle } from 'lucide-react';
import { AnalysisMode } from '../types';

interface ImageUploaderProps {
  onImageSelected: (imageDataUrlOrUrl: string) => void;
  isLoading: boolean;
  mode: AnalysisMode;
}

interface PresetSample {
  id: string;
  label: string;
  labelEn: string;
  url: string;
  type: 'herb' | 'disease' | 'body_rash' | 'body_allergy';
}

export default function ImageUploader({ onImageSelected, isLoading, mode }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Preset Leaf samples
  const plantSamples: PresetSample[] = [
    {
      id: 'tulsi',
      label: 'स्वस्थ तुलसी (Medicinal)',
      labelEn: 'Tulsi (Holy Basil)',
      url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=60',
      type: 'herb',
    },
    {
      id: 'mint',
      label: 'स्वस्थ पुदीना (Medicinal)',
      labelEn: 'Mint / Pudina Leaves',
      url: 'https://images.unsplash.com/photo-1588801931346-6b2a0c4f82be?w=600&auto=format&fit=crop&q=60',
      type: 'herb',
    },
    {
      id: 'tomato-spots',
      label: 'टमाटर पत्ती रोग (Disease)',
      labelEn: 'Tomato Spot Disease',
      url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=600&auto=format&fit=crop&q=60',
      type: 'disease',
    },
    {
      id: 'rose-blight',
      label: 'गुलाब का रोग (Disease)',
      labelEn: 'Rose Leaf Fungus',
      url: 'https://images.unsplash.com/photo-1508609346419-a259737190b4?w=600&auto=format&fit=crop&q=60',
      type: 'disease',
    },
  ];

  // Preset Skin/Body samples
  const bodySamples: PresetSample[] = [
    {
      id: 'rash',
      label: 'सूखी त्वचा (Skin Issue)',
      labelEn: 'Dry Skin Symptom',
      url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&auto=format&fit=crop&q=60',
      type: 'body_rash',
    },
    {
      id: 'allergy',
      label: 'त्वचा एलर्जी (Allergy)',
      labelEn: 'Skin Irritation/Allergy',
      url: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=600&auto=format&fit=crop&q=60',
      type: 'body_allergy',
    },
    {
      id: 'acne',
      label: 'कील-मुहासे (Acne)',
      labelEn: 'Acne Vulgaris',
      url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=60',
      type: 'body_rash',
    },
    {
      id: 'bites',
      label: 'कीड़े का काटना (Insect Bite)',
      labelEn: 'Bug Bite Swelling',
      url: 'https://images.unsplash.com/photo-1508881598441-324f3974994b?w=600&auto=format&fit=crop&q=60',
      type: 'body_allergy',
    },
  ];

  const currentSamples = mode === 'body' ? bodySamples : plantSamples;

  // Drag handlers
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('कृपया केवल इमेज फाइल ही अपलोड करें। (Please upload image files only.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onImageSelected(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-6" id="uploader-section">
      {/* File input (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="hidden-file-input"
        disabled={isLoading}
      />

      {/* Main Drag-Drop Box */}
      <div
        id="drag-drop-zone"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={isLoading ? undefined : handleButtonClick}
        className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[260px] cursor-pointer ${
          isLoading ? 'pointer-events-none opacity-60' : ''
        } ${
          dragActive
            ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
            : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50/50 bg-white'
        }`}
      >
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 text-emerald-600 shadow-sm" id="upload-icon-wrapper">
          <Upload className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-2" id="upload-main-text">
          {mode === 'body' 
            ? 'शरीर के प्रभावित अंग की इमेज/स्क्रीनशॉट यहाँ डालें या चुनें'
            : 'इमेज या स्क्रीनशॉट यहाँ डालें या चुनें'
          }
        </h3>
        <p className="text-slate-500 text-sm max-w-sm mb-4 leading-relaxed" id="upload-sub-text">
          {mode === 'body'
            ? 'Drag & drop skin symptom or rash photo, or click to browse files from your device.'
            : 'Drag & drop your leaf or plant picture, or click to browse files from your device.'
          }
        </p>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full font-medium" id="upload-formats-badge">
          <ImageIcon className="w-3.5 h-3.5" />
          Supports JPG, PNG, WEBP, Screenshots
        </div>
      </div>

      {/* Preset sample testing options */}
      <div id="sample-section" className="border-t border-slate-100 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-700">
            उदाहरण के साथ तुरंत जांचें (Test Instantly with Samples)
          </h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3" id="sample-grid">
          {currentSamples.map((sample) => (
            <button
              key={sample.id}
              type="button"
              id={`sample-card-${sample.id}`}
              onClick={() => !isLoading && onImageSelected(sample.url)}
              disabled={isLoading}
              className="group flex flex-col text-left bg-white border border-slate-200 hover:border-emerald-400 rounded-xl overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-md disabled:opacity-50"
            >
              <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                <img
                  src={sample.url}
                  alt={sample.labelEn}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${
                  sample.type === 'herb' 
                    ? 'bg-emerald-500 text-white' 
                    : sample.type === 'disease'
                    ? 'bg-amber-500 text-white'
                    : 'bg-indigo-500 text-white'
                }`}>
                  {sample.type === 'herb' ? 'Jadi-Buti' : sample.type === 'disease' ? 'Plant Disease' : 'Skin Issue'}
                </span>
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <span className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                  {sample.label}
                </span>
                <span className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                  {sample.labelEn}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

