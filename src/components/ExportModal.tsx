import React, { useState } from 'react';
import { 
  FileCode2, 
  Download, 
  Copy, 
  Check, 
  X, 
  Globe, 
  CheckCircle2, 
  Layers
} from 'lucide-react';
import { generateStandaloneHtml } from '../services/standaloneHtmlGenerator';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const htmlContent = generateStandaloneHtml();

  const handleDownload = () => {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'live_weather_radar.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(htmlContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm pointer-events-auto">
      <div className="bg-slate-900 border border-white/20 rounded-2xl shadow-2xl w-full max-w-2xl text-slate-100 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Standalone Weather Radar HTML File</h3>
              <p className="text-xs text-slate-400">Zero dependencies required • Runs natively in any browser</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-800/60 border border-white/10 rounded-xl p-4 space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Self-Contained & Complete</span>
            </div>
            <p>
              This standalone HTML document includes the full Leaflet mapping engine, RainViewer HD radar API connector (Past 2 hours, Present live frame, and Future nowcast), base map selector, speed scrubber, color palettes, and location search in a <strong>single portable file</strong>.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1 pt-1">
              <li>Open directly in Chrome, Firefox, Safari, or Edge</li>
              <li>Embed in any dashboard, portal, or website via an iframe</li>
              <li>No build tools, Node.js, or backend servers required</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download live_weather_radar.html</span>
            </button>

            <button
              onClick={handleCopy}
              className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm flex items-center justify-center gap-2 border border-white/10 transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* HTML Preview Code Block */}
          <div className="relative mt-2">
            <div className="text-[11px] font-mono text-slate-400 mb-1 flex justify-between">
              <span>Preview HTML snippet</span>
              <span>{htmlContent.length.toLocaleString()} characters</span>
            </div>
            <pre className="bg-slate-950 p-3 rounded-xl border border-white/10 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-36 overflow-y-auto">
              {htmlContent.slice(0, 800)}
              {'\n... [Full Leaflet Map & Radar Engine JS Code] ...'}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/60 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
