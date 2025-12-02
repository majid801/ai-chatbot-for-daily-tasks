import React, { useState } from 'react';
import { Plus, Trash2, StickyNote, Save, X, Cpu } from 'lucide-react';
import { Note } from '../types';
import { summarizeText } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface NotesViewProps {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

const NotesView: React.FC<NotesViewProps> = ({ notes, setNotes }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleSave = () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    const newNote: Note = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      createdAt: Date.now(),
    };

    setNotes((prev) => [newNote, ...prev]);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const resetForm = () => {
    setIsCreating(false);
    setNewTitle('');
    setNewContent('');
  };

  const handleSummarizeAll = async () => {
    if (notes.length === 0) return;
    setIsSummarizing(true);
    try {
        const allText = notes.map(n => `Title: ${n.title}\nContent: ${n.content}`).join('\n\n---\n\n');
        const summary = await summarizeText(allText);
        setAiSummary(summary);
    } catch (e) {
        console.error(e);
    } finally {
        setIsSummarizing(false);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-950">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Notes Manager</h2>
            <p className="text-slate-400">Organize your thoughts and ideas</p>
          </div>
          <div className="flex gap-3">
            {notes.length > 0 && (
                <button
                onClick={handleSummarizeAll}
                disabled={isSummarizing}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-600/30 rounded-lg transition-all text-sm font-medium"
              >
                <Cpu size={16} />
                {isSummarizing ? "Thinking..." : "Summarize All Notes"}
              </button>
            )}
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-lg shadow-indigo-600/20"
            >
              <Plus size={18} />
              Add Note
            </button>
          </div>
        </div>

        {/* AI Summary Section */}
        {aiSummary && (
             <div className="mb-8 bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-6 relative group">
                <button 
                    onClick={() => setAiSummary(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                    <X size={16}/>
                </button>
                <h3 className="text-indigo-300 font-semibold mb-3 flex items-center gap-2">
                 <Cpu size={16} /> AI Insight & Summary
                </h3>
                <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                    <ReactMarkdown>{aiSummary}</ReactMarkdown>
                </div>
             </div>
        )}

        {/* Create Note Modal/Area */}
        {isCreating && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
            <input
              type="text"
              placeholder="Note Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-slate-950 text-white text-lg font-semibold px-4 py-3 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none mb-4"
            />
            <textarea
              placeholder="Write your note here..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full h-40 bg-slate-950 text-slate-300 px-4 py-3 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none resize-none mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!newTitle || !newContent}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Save size={18} />
                Save Note
              </button>
            </div>
          </div>
        )}

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.length === 0 && !isCreating && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-600">
              <StickyNote size={48} className="mb-4 opacity-50" />
              <p>No notes yet. Create one to get started.</p>
            </div>
          )}
          
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-600 transition-colors group flex flex-col h-64"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-white truncate pr-2">{note.title}</h3>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-slate-400 text-sm line-clamp-6 flex-1 whitespace-pre-line">
                {note.content}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-600">
                {new Date(note.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotesView;
