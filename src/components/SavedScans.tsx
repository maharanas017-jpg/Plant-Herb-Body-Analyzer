import { SavedScan } from '../types';
import { History, Trash2, Calendar, FileText, ChevronRight } from 'lucide-react';

interface SavedScansProps {
  scans: SavedScan[];
  onSelectScan: (scan: SavedScan) => void;
  onDeleteScan: (id: string) => void;
  onClearAll: () => void;
}

export default function SavedScans({ scans, onSelectScan, onDeleteScan, onClearAll }: SavedScansProps) {
  if (scans.length === 0) {
    return null;
  }

  // Format date correctly
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 md:p-6" id="history-section">
      <div className="flex items-center justify-between gap-2 mb-4 border-b border-slate-100 pb-3" id="history-header">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-slate-500" />
          <h3 className="text-base font-extrabold text-slate-800">
            आपका स्कैन इतिहास (Scan History - {scans.length})
          </h3>
        </div>
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded transition-colors cursor-pointer"
          id="btn-clear-history"
        >
          सभी मिटाएं (Clear All)
        </button>
      </div>

      <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1" id="history-list">
        {scans.map((scan) => {
          const isDisease = scan.result.category === 'Plant Disease';
          return (
            <div
              key={scan.id}
              className="group flex items-center justify-between border border-slate-150 hover:border-emerald-300 hover:bg-slate-50/50 rounded-xl p-3 transition-all cursor-pointer"
              onClick={() => onSelectScan(scan)}
              id={`history-item-${scan.id}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                  <img
                    src={scan.image}
                    alt={scan.result.commonName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                    {scan.result.commonName}
                  </h4>
                  <p className="text-xs text-slate-400 italic line-clamp-1">
                    {scan.result.scientificName}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      scan.result.category === 'Human Body Issue'
                        ? 'bg-indigo-100 text-indigo-800'
                        : isDisease 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {scan.result.category}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Calendar className="w-2.5 h-2.5" />
                      {formatDate(scan.timestamp)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  id={`delete-btn-${scan.id}`}
                  onClick={(e) => {
                    e.stopPropagation(); // Stop clicking row triggering open
                    onDeleteScan(scan.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="स्कैन हटाएँ (Delete Scan)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
