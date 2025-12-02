import React from 'react';
import { View } from '../types';
import { MessageSquare, FileText, CheckSquare, StickyNote, Settings } from 'lucide-react';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const menuItems = [
    { id: View.CHAT, label: 'Chat Assistant', icon: <MessageSquare size={20} /> },
    { id: View.FILES, label: 'File Reader', icon: <FileText size={20} /> },
    { id: View.NOTES, label: 'Notes Manager', icon: <StickyNote size={20} /> },
    { id: View.TASKS, label: 'Task Automation', icon: <CheckSquare size={20} /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0 transition-all duration-300">
      <div className="p-6">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          TaskAI
        </h1>
        <p className="text-xs text-slate-500 mt-1">Your Digital Employee</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium
              ${activeView === item.id 
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3 text-slate-500 text-sm">
          <Settings size={18} />
          <span>v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
