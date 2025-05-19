import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import MainFeature from '../components/MainFeature';

function Home({ tasks, setTasks, projects, users }) {
  const [activeProject, setActiveProject] = useState('p1');
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Function to handle adding a new task
  const handleAddTask = (task) => {
    const newTask = {
      id: `t${Date.now()}`,
      ...task,
      projectId: activeProject,
      assignedTo: 'u1', // Default assignment
      timeSpent: 0
    };
    
    setTasks([...tasks, newTask]);
    
    // Update project task count
    setProjects(projects.map(project => 
      project.id === activeProject 
        ? { ...project, taskCount: project.taskCount + 1 } 
        : project
    ));
    
    toast.success("Task created successfully!");
  };

  // Function to handle updating task status
  const handleUpdateTaskStatus = (taskId, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus } 
        : task
    ));
    
    toast.info("Task status updated!");
  };

  // Function to handle deleting a task
  const handleDeleteTask = (taskId) => {
    const taskToDelete = tasks.find(task => task.id === taskId);
    
    if (taskToDelete) {
      setTasks(tasks.filter(task => task.id !== taskId));
      
      // Update project task count
      setProjects(projects.map(project => 
        project.id === taskToDelete.projectId 
          ? { ...project, taskCount: project.taskCount - 1 } 
          : project
      ));
      
      toast.success("Task deleted successfully!");
    }
  };

  // Get current project's tasks
  const filteredTasks = tasks.filter(task => task.projectId === activeProject);
  const completedTasks = tasks.filter(task => task.status === 'completed');

  // Get icons
  const CheckCircleIcon = getIcon('check-circle');
  const Clock3Icon = getIcon('clock-3');
  const PauseCircleIcon = getIcon('pause-circle');
  const PlusCircleIcon = getIcon('plus-circle');
  const RefreshCwIcon = getIcon('refresh-cw');
  const ListTodoIcon = getIcon('list-todo');
  const BarChart2Icon = getIcon('bar-chart-2');
  const ArrowRightIcon = getIcon('arrow-right');
  const UserIcon = getIcon('user');
  const FolderIcon = getIcon('folder');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <RefreshCwIcon className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
              <Link to="/reports" className="block p-4 bg-white dark:bg-surface-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Sidebar - Projects */}
        <div className="w-full md:w-64 lg:w-72">
          <div className="card mb-4">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              </Link>
              Projects
            </h2>
            
            <ul className="space-y-2">
              {projects.map(project => (
                <motion.li 
                  key={project.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    className={`w-full text-left py-2 px-3 rounded-lg flex items-center justify-between ${
                      activeProject === project.id 
                        ? 'bg-primary text-white' 
                        : 'bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700'
                    } transition-colors`}
                    onClick={() => setActiveProject(project.id)}
                  >
                    <div className="flex items-center">
                      <span 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: project.color }}
                      ></span>
                      <span>{project.name}</span>
                    </div>
                    <span className="bg-white/20 dark:bg-black/20 px-2 py-0.5 rounded-full text-xs">
                      {project.taskCount}
                    </span>
                  </button>
                </motion.li>
              ))}
            </ul>
            
            <button className="w-full mt-3 btn-outline flex items-center justify-center gap-1">
              <PlusCircleIcon className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="card mb-4">
            <h3 className="text-lg font-bold mb-3">Navigation</h3>
            <ul className="space-y-2">
              <li className="hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg">
                <a href="/" className="block px-3 py-2 text-surface-800 dark:text-surface-200">Dashboard</a>
              </li>
              <li className="bg-primary text-white rounded-lg">
                <Link to="/reports" className="block px-3 py-2 flex items-center justify-between">
                  <span className="flex items-center"><BarChart2Icon className="w-4 h-4 mr-2" /> Reports</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Quick Stats */}
          <div className="card mb-4">
            <h3 className="text-lg font-bold mb-3">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-surface-100 dark:bg-surface-800 p-3 rounded-lg">
                <p className="text-xs text-surface-500 dark:text-surface-400">Total Tasks</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
              <div className="bg-surface-100 dark:bg-surface-800 p-3 rounded-lg">
                <p className="text-xs text-surface-500 dark:text-surface-400">Completed</p>
                <p className="text-2xl font-bold">
                  {completedTasks.length}
                </p>
              </div>
            </div>
          </div>
          
          {/* Assigned Users */}
          <div className="card">
            <h3 className="text-lg font-bold mb-3 flex items-center">
              <UserIcon className="w-4 h-4 mr-2" /> Team Members
            </h3>
            <ul className="space-y-2">
              {users.map(user => (
                <li key={user.id} className="flex items-center gap-2 p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                    {user.name.charAt(0)}
                  </div>
                  <span>{user.name}</span>
                </li>
              ))}
            </ul>
            </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1">
          <div className="card mb-6">
            <h1 className="text-2xl font-bold mb-6 flex items-center">
              <ListTodoIcon className="w-6 h-6 mr-2 text-primary" />
              TaskFlow
            </h1>
            
            {/* Active Project Header */}
            <div className="mb-4">
              <h2 className="text-xl font-bold">
                {projects.find(p => p.id === activeProject)?.name} Tasks
              </h2>
              <p className="text-surface-500 dark:text-surface-400">
                Manage your tasks for this project
              </p>
            </div>
            
            {/* Task Creation */}
            <MainFeature 
              onAddTask={handleAddTask} 
              projectId={activeProject}
            />
          </div>
          
          {/* Task List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Your Tasks</h3>
              <div className="flex gap-2">
                <button className="btn-outline text-sm py-1 px-3">
                  Filter
                </button>
                <button className="btn-outline text-sm py-1 px-3">
                  Sort
                </button>
              </div>
            </div>
            
            {filteredTasks.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-surface-500 dark:text-surface-400">
                  No tasks found for this project. Create a new task to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTasks.map(task => {
                  // Determine status icon
                  let StatusIcon;
                  switch(task.status) {
                    case 'completed':
                      StatusIcon = CheckCircleIcon;
                      break;
                    case 'in-progress':
                      StatusIcon = Clock3Icon;
                      break;
                    case 'on-hold':
                      StatusIcon = PauseCircleIcon;
                      break;
                    default:
                      StatusIcon = ListTodoIcon;
                  }
                  
                  // Format due date
                  const dueDate = new Date(task.dueDate);
                  const today = new Date();
                  const tomorrow = new Date(today);
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  
                  let dueDateText;
                  if (dueDate.toDateString() === today.toDateString()) {
                    dueDateText = 'Today';
                  } else if (dueDate.toDateString() === tomorrow.toDateString()) {
                    dueDateText = 'Tomorrow';
                  } else {
                    dueDateText = dueDate.toLocaleDateString();
                  }
                  
                  return (
                    <motion.div 
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <button 
                            onClick={() => handleUpdateTaskStatus(
                              task.id, 
                              task.status === 'completed' ? 'not-started' : 'completed'
                            )}
                            className={`mt-1 p-1 rounded-full ${
                              task.status === 'completed' 
                                ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
                                : 'bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-300'
                            }`}
                          >
                            <StatusIcon className="w-5 h-5" />
                          </button>
                          
                          <div>
                            <h3 className={`font-medium ${
                              task.status === 'completed' ? 'line-through text-surface-400' : ''
                            }`}>
                              {task.title}
                            </h3>
                            
                            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                              {task.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full ${
                                task.status === 'completed' 
                                  ? 'status-completed' 
                                  : task.status === 'in-progress' 
                                    ? 'status-in-progress' 
                                    : task.status === 'on-hold' 
                                      ? 'status-on-hold' 
                                      : 'status-not-started'
                              }`}>
                                {task.status.replace('-', ' ')}
                              </span>
                              
                              <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full ${
                                task.priority === 'low' 
                                  ? 'priority-low' 
                                  : task.priority === 'medium' 
                                    ? 'priority-medium' 
                                    : task.priority === 'high' 
                                      ? 'priority-high' 
                                      : 'priority-urgent'
                              }`}>
                                {task.priority}
                              </span>
                              
                              <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-surface-100 dark:bg-surface-700">
                                Due: {dueDateText}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <button 
                            className="p-1 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            {(() => {
                              const TrashIcon = getIcon('trash-2');
                              return <TrashIcon className="w-4 h-4" />;
                            })()}
                          </button>
                          
                          <button className="p-1 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300">
                            {(() => {
                              const EditIcon = getIcon('edit');
                              return <EditIcon className="w-4 h-4" />;
                            })()}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;