import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import FileView from './components/FileView';
import NotesView from './components/NotesView';
import TasksView from './components/TasksView';
import { View, Message, Note, Task, UploadedFile } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.CHAT);
  
  // App State
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeFile, setActiveFile] = useState<UploadedFile | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Conditional Rendering of Views
  const renderContent = () => {
    switch (activeView) {
      case View.CHAT:
        return <ChatView messages={messages} setMessages={setMessages} activeFile={activeFile} />;
      case View.FILES:
        return <FileView activeFile={activeFile} setActiveFile={setActiveFile} />;
      case View.NOTES:
        return <NotesView notes={notes} setNotes={setNotes} />;
      case View.TASKS:
        return <TasksView tasks={tasks} setTasks={setTasks} />;
      default:
        return <ChatView messages={messages} setMessages={setMessages} activeFile={activeFile} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 h-full relative">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
