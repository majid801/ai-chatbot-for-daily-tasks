import React, { useState } from 'react';
import { Upload, FileText, Trash2, Eye, Cpu } from 'lucide-react';
import { UploadedFile } from '../types';
import { summarizeText } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface FileViewProps {
  activeFile: UploadedFile | null;
  setActiveFile: (file: UploadedFile | null) => void;
}

const FileView: React.FC<FileViewProps> = ({ activeFile, setActiveFile }) => {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const uploadedFile: UploadedFile = {
        name: file.name,
        type: file.type,
        size: file.size,
        content: content,
      };
      setActiveFile(uploadedFile);
      setSummary(null); // Reset summary on new file
    };
    reader.readAsText(file);
  };

  const handleSummarize = async () => {
    if (!activeFile) return;
    setIsSummarizing(true);
    try {
      const result = await summarizeText(activeFile.content.substring(0, 30000)); // Limit to avoid token issues in this demo
      setSummary(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-950">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">File Analyzer</h2>
          <p className="text-slate-400">Upload text-based files (TXT, MD, CSV, JSON, Code) to analyze, summarize, or chat about them.</p>
        </div>

        {/* Upload Area */}
        {!activeFile ? (
          <div className="border-2 border-dashed border-slate-700 rounded-2xl p-12 flex flex-col items-center justify-center text-center hover:bg-slate-900 transition-colors bg-slate-900/30">
            <div className="w-16 h-16 bg-indigo-600/20 text-indigo-400 rounded-full flex items-center justify-center mb-4">
              <Upload size={32} />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">Click to upload a file</h3>
            <p className="text-slate-500 text-sm mb-4">Support for .txt, .md, .csv, .json, .py, .js</p>
            <input
              type="file"
              onChange={handleFileUpload}
              className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
            />
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600/20 text-indigo-400 rounded-lg flex items-center justify-center">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{activeFile.name}</h3>
                  <p className="text-xs text-slate-500">{(activeFile.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <div className="flex gap-2">
                 <button
                  onClick={handleSummarize}
                  disabled={isSummarizing}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-600/30 rounded-lg transition-all text-sm font-medium disabled:opacity-50"
                >
                  <Cpu size={16} />
                  {isSummarizing ? "Analyzing..." : "AI Summarize"}
                </button>
                <button
                  onClick={() => setActiveFile(null)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 bg-slate-950/50">
              {summary ? (
                <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-6 mb-6">
                   <h4 className="text-indigo-300 font-semibold mb-3 flex items-center gap-2">
                    <Cpu size={16} /> AI Analysis
                   </h4>
                   <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                     <ReactMarkdown>{summary}</ReactMarkdown>
                   </div>
                </div>
              ) : null}

              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">File Preview</h4>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-sm text-slate-400 overflow-x-auto max-h-[400px]">
                <pre>{activeFile.content.substring(0, 5000)}{activeFile.content.length > 5000 && "..."}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileView;
