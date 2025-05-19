import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import MainFeature from '../components/MainFeature';
import { getTasks, updateTask, deleteTask } from '../services/TaskService';
import { getProjects, updateProject, createProject } from '../services/ProjectService';
import { getUsers } from '../services/UserService';

function Home() {
  const [activeProject, setActiveProject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const userState = useSelector((state) => state.user);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch projects first
        const projectsData = await getProjects();
        setProjects(projectsData);
        
        // Set the first project as active if available
        if (projectsData.length > 0) {
          setActiveProject(projectsData[0].Id);
        }
        
        const usersData = await getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Failed to load projects and users");
      }
    };

    fetchData();
  }, []);

  // Load tasks whenever the active project changes
  useEffect(() => {
    const loadTasks = async () => {
      if (!activeProject) return;
      
      setIsLoading(true);
      try {
        const tasksData = await getTasks({ project: activeProject });
        setTasks(tasksData);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Failed to load tasks");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTasks();
  }, [activeProject]);

  // Function to handle adding a new task is implemented in MainFeature.jsx
  // We'll pass a callback to refresh the task list
  const refreshTasks = async () => {
    if (!activeProject) return;
    
    try {
      const tasksData = await getTasks({ project: activeProject });
      setTasks(tasksData);
      
      // Also refresh the project to get updated task count
      const projectsData = await getProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };
  
  // Function to handle updating task status
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      // First get the task to update
      const taskToUpdate = tasks.find(task => task.Id === taskId);
      if (!taskToUpdate) return;
      
      // Update with new status
      await updateTask(taskId, {
        ...taskToUpdate,
        status: newStatus
      });
      
      // Update local state
      setTasks(tasks.map(task => 
        task.Id === taskId 
          ? { ...task, status: newStatus } 
          : task
      ));
      
      toast.info("Task status updated!");
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status");
    }
  };
  
  // Function to handle deleting a task
  const handleDeleteTask = (taskId) => {
    const taskToDelete = tasks.find(task => task.Id === taskId);
    
    if (taskToDelete) {
      // Confirm before deleting
      if (confirm('Are you sure you want to delete this task?')) {
        deleteTask(taskId)
          .then(() => {
            // Remove from local state
            setTasks(tasks.filter(task => task.Id !== taskId));
            
            // Update project task count
            const project = projects.find(p => p.Id === taskToDelete.project_id);
            if (project) {
              updateProject(project.Id, {
                ...project,
                taskCount: Math.max(0, project.taskCount - 1)
              });
              
              // Update projects in state
              setProjects(projects.map(p => 
                p.Id === taskToDelete.project_id
                  ? { ...p, taskCount: Math.max(0, p.taskCount - 1) }
                  : p
              ));
            }
            
            toast.success("Task deleted successfully!");
          })
          .catch(error => {
            console.error("Error deleting task:", error);
            toast.error("Failed to delete task");
          });
      }
    }
  };
  
  // Project Form Modal Component
  const ProjectFormModal = () => {
    const [projectData, setProjectData] = useState({
      name: '',
      color: '#4f46e5' // Default color - primary
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const ModalXIcon = getIcon('x');
    const RefreshCwIcon = getIcon('refresh-cw');
    
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setProjectData(prev => ({
        ...prev,
        [name]: value
      }));
      // Clear error for this field when user types
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    };
    
    const validateForm = () => {
      const newErrors = {};
      if (!projectData.name.trim()) {
        newErrors.name = 'Project name is required';
      } else if (projectData.name.length < 3) {
        newErrors.name = 'Project name must be at least 3 characters';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (validateForm()) {
        setIsSubmitting(true);
        try {
          const newProject = await createProject({
            name: projectData.name,
            color: projectData.color
          });
          
          // Refresh projects list
          const projectsData = await getProjects();
          setProjects(projectsData);
          
          // Set the new project as active
          setActiveProject(newProject.Id);
          
          toast.success('Project created successfully!');
          setIsProjectModalOpen(false);
        } catch (error) {
          console.error('Error creating project:', error);
          toast.error('Failed to create project');
        } finally {
          setIsSubmitting(false);
        }
      }
    };
    
    const colorOptions = [
      '#4f46e5', // Indigo (primary)
      '#10b981', // Emerald (secondary)
      '#f97316', // Orange (accent)
      '#ef4444', // Red
      '#f59e0b', // Amber
      '#3b82f6', // Blue
      '#8b5cf6', // Violet
      '#ec4899', // Pink
      '#6366f1'  // Indigo alternative
    ];
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-surface-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Create New Project</h3>
            <button 
              className="p-1 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
              onClick={() => setIsProjectModalOpen(false)}
            >
              <ModalXIcon className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="project-name" className="input-label">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="project-name"
                name="name"
                value={projectData.name}
                onChange={handleInputChange}
                placeholder="Enter project name"
                className={`w-full ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            
            <div className="input-group mt-4">
              <label className="input-label">Project Color</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full ${projectData.color === color ? 'ring-2 ring-offset-2 ring-surface-400 dark:ring-surface-500' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleInputChange({ target: { name: 'color', value: color } })}
                  ></button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(false)}
                className="btn-outline"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className={`btn-primary flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <RefreshCwIcon className="w-4 h-4 animate-spin" /> Creating...
                  </span>
                ) : (
                  'Create Project'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Get current project's tasks
  const filteredTasks = tasks.filter(task => task.project_id === activeProject);
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
      <div className="flex items-center justify-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <RefreshCwIcon className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }
  
  // Show project modal if it's open
  const projectModal = isProjectModalOpen ? <ProjectFormModal /> : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Sidebar - Projects */}
        <div className="w-full md:w-64 lg:w-72">
          <div className="card mb-4">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              Projects
            </h2>
            
            <ul className="space-y-2">
              {projects.map(project => (
                <motion.li 
                  key={project.Id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    className={`w-full text-left py-2 px-3 rounded-lg flex items-center justify-between ${
                      activeProject === project.Id 
                        ? 'bg-primary text-white' 
                        : 'bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700'
                    } transition-colors`}
                    onClick={() => setActiveProject(project.Id)}
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
            
            <button 
              className="w-full mt-3 btn-outline flex items-center justify-center gap-1"
              onClick={() => setIsProjectModalOpen(true)}
            >
              <PlusCircleIcon className="w-4 h-4" />
              <span>New Project</span>
            </button>
            
            </button>
          </div>

          {/* Navigation Links */}
          <div className="card mb-4">
            <h3 className="text-lg font-bold mb-3">Navigation</h3>
            {/* Reports Quick Access */}
            
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
                <li key={user.Id} className="flex items-center gap-2 p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                    {user.Name.charAt(0)}
                  </div>
                  <span>{user.Name}</span>
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
                {projects.find(p => p.Id === activeProject)?.Name || 'All'} Tasks
              </h2>
              <p className="text-surface-500 dark:text-surface-400">
                Manage your tasks for this project
              </p>
            </div>
            
            {/* Task Creation */}
            <MainFeature 
              onTaskAdded={refreshTasks} 
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
                  const dueDate = new Date(task.due_date);
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
                      key={task.Id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <button 
                            onClick={() => handleUpdateTaskStatus(
                              task.Id, 
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
                              {task.title || task.Name}
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
                            onClick={() => handleDeleteTask(task.Id)}
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
      
      {/* Project creation modal */}
      {projectModal}
      </div>
    </div>
  );
}

export default Home;