import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import ReportingDashboard from '../components/ReportingDashboard';
import { getTasks } from '../services/TaskService';
import { getProjects } from '../services/ProjectService';
import { getUsers } from '../services/UserService';

function Reports() {
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  // Load report data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all required data in parallel
        const [tasksData, projectsData, usersData] = await Promise.all([
          getTasks(),
          getProjects(),
          getUsers()
        ]);
        
        setTasks(tasksData);
        setProjects(projectsData);
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching report data:", error);
        toast.error("Failed to load report data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const ChartIcon = getIcon('bar-chart-2');
  const RefreshCwIcon = getIcon('refresh-cw');
  const ArrowLeftIcon = getIcon('arrow-left');
  
  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <RefreshCwIcon className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.button
        onClick={handleBack}
        className="mb-4 flex items-center text-surface-600 hover:text-primary dark:text-surface-400 dark:hover:text-primary-light"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Go back"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-1" />
        <span>Back</span>
      </motion.button>
      <h1 className="text-2xl font-bold mb-2 flex items-center">
        <ChartIcon className="w-6 h-6 mr-2 text-primary" /> Task Analytics Dashboard
      </h1>
      <p className="text-surface-500 dark:text-surface-400 mb-6">Monitor task completion, track time spent, and analyze productivity trends.</p>
      <ReportingDashboard tasks={tasks} projects={projects} users={users} />
    </div>
  );
}

export default Reports;