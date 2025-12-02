import React, { useState } from 'react';
import { Plus, Check, CheckCircle2, Circle, Wand2, X } from 'lucide-react';
import { Task } from '../types';
import { generateTaskPlan } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface TasksViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TasksView: React.FC<TasksViewProps> = ({ tasks, setTasks }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
    };
    setTasks((prev) => [task, ...prev]);
    setNewTaskTitle('');
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const removeTask = (id: string) => {
      setTasks(prev => prev.filter(t => t.id !== id));
  }

  const handleGeneratePlan = async () => {
    if (!goalInput.trim()) return;
    setIsGenerating(true);
    setGeneratedPlan(null);
    try {
      const plan = await generateTaskPlan(goalInput);
      setGeneratedPlan(plan);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Manual Task Entry */}
        <section>
          <div className="mb-6">
             <h2 className="text-2xl font-bold text-white">Daily Tasks</h2>
             <p className="text-slate-400">Manage your to-do list manually</p>
          </div>
          
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              placeholder="Add a new task..."
              className="flex-1 bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              onClick={addTask}
              className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl transition-colors"
            >
              <Plus size={24} />
            </button>
          </div>

          <div className="space-y-3">
            {tasks.length === 0 && (
                <p className="text-slate-600 text-center py-4">No tasks pending. Enjoy your day!</p>
            )}
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  task.completed
                    ? 'bg-slate-900/50 border-slate-800 opacity-60'
                    : 'bg-slate-900 border-slate-700'
                }`}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`shrink-0 ${
                    task.completed ? 'text-emerald-500' : 'text-slate-500 hover:text-emerald-500'
                  }`}
                >
                  {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>
                <span
                  className={`flex-1 text-lg ${
                    task.completed ? 'text-slate-500 line-through' : 'text-slate-200'
                  }`}
                >
                  {task.title}
                </span>
                <button onClick={() => removeTask(task.id)} className="text-slate-600 hover:text-red-400 p-2">
                    <X size={18} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <hr className="border-slate-800" />

        {/* AI Generator Section */}
        <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
               <Wand2 size={120} />
           </div>
           
           <div className="relative z-10">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Wand2 size={24} className="text-purple-400" /> 
                  AI Task Planner
              </h2>
              <p className="text-slate-400 mb-6">Enter a goal (e.g., "Learn Python in 2 weeks" or "Plan a marketing launch"), and I'll generate a study plan or routine for you.</p>
              
              <div className="flex gap-3 mb-6">
                <input 
                    type="text" 
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    placeholder="Enter your goal here..."
                    className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button 
                    onClick={handleGeneratePlan}
                    disabled={isGenerating || !goalInput}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                    {isGenerating ? "Generating..." : "Generate Plan"}
                </button>
              </div>

              {generatedPlan && (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
                      <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                          <ReactMarkdown>{generatedPlan}</ReactMarkdown>
                      </div>
                      <div className="mt-4 flex justify-end">
                         <button 
                            onClick={() => {
                                const lines = generatedPlan.split('\n').filter(line => line.includes('- '));
                                const newTasks = lines.map((l, i) => ({
                                    id: Date.now().toString() + i,
                                    title: l.replace(/^[-\d*.]+\s/, '').replace(/\*\*/g, ''),
                                    completed: false
                                }));
                                setTasks(prev => [...newTasks, ...prev]);
                                setGeneratedPlan(null);
                                setGoalInput('');
                            }}
                            className="text-sm text-purple-400 hover:text-purple-300 font-medium"
                         >
                            + Add all to my tasks
                         </button>
                      </div>
                  </div>
              )}
           </div>
        </section>

      </div>
    </div>
  );
};

export default TasksView;
