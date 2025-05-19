import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import { getIcon } from './utils/iconUtils';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Reports from './pages/Reports';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true' || 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  // Sample tasks data
  const [tasks, setTasks] = useState([
    {
      id: 't1',
      title: 'Complete React project',
      description: 'Finish the TaskFlow MVP implementation',
      status: 'in-progress',
      priority: 'high',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      projectId: 'p1',
      assignedTo: 'u1',
      timeSpent: 4500
    },
    {
      id: 't2',
      title: 'Buy groceries',
      description: 'Milk, eggs, bread, and vegetables',
      status: 'not-started',
      priority: 'medium',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      projectId: 'p1',
      assignedTo: 'u1',
      timeSpent: 0
    },
    {
      id: 't3',
      title: 'Plan weekend trip',
      description: 'Research destinations and accommodation',
      status: 'completed',
      priority: 'low',
      dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      projectId: 'p2',
      assignedTo: 'u2',
      timeSpent: 7200
    }
  ]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Get the appropriate icons based on mode
  const MoonIcon = getIcon('moon');
  const SunIcon = getIcon('sun');
  
  // Sample projects data
  const projects = [
    { id: 'p1', name: 'Personal', color: '#4f46e5', taskCount: 5 },
    { id: 'p2', name: 'Work', color: '#10b981', taskCount: 3 },
    { id: 'p3', name: 'Study', color: '#f97316', taskCount: 2 }
  ];
  
  // Sample users data
  const users = [
    { id: 'u1', name: 'John Doe', email: 'john@example.com' },
    { id: 'u2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: 'u3', name: 'Alex Johnson', email: 'alex@example.com' }
  ];

  return (
    <div className="flex min-h-screen bg-surface-50 dark:bg-surface-900 transition-colors duration-300">
      {/* Dark Mode Toggle Button */}
      <motion.button
        onClick={toggleDarkMode}
        className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-surface-200 dark:bg-surface-700 shadow-md hover:shadow-lg transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDarkMode ? <SunIcon className="h-5 w-5 text-yellow-400" /> : <MoonIcon className="h-5 w-5 text-surface-600" />}
      </motion.button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home tasks={tasks} setTasks={setTasks} projects={projects} users={users} />} />
            <Route path="/reports" element={<Reports tasks={tasks} projects={projects} users={users} />} />
            <Route path="*" element={<NotFound tasks={tasks} />} />
          </Routes>
        </main>
      </div>

      {/* Toast Container Configuration */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDarkMode ? "dark" : "light"}
        toastClassName="shadow-md"
      />
    </div>
  );
}

export default App;