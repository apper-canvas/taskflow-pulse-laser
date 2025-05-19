import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';
import ReportingDashboard from '../components/ReportingDashboard';

function Reports({ tasks, projects, users }) {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const ChartIcon = getIcon('bar-chart-2');
  const RefreshCwIcon = getIcon('refresh-cw');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <RefreshCwIcon className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2 flex items-center">
        <ChartIcon className="w-6 h-6 mr-2 text-primary" /> Task Analytics Dashboard
      </h1>
      <p className="text-surface-500 dark:text-surface-400 mb-6">Monitor task completion, track time spent, and analyze productivity trends.</p>
      <ReportingDashboard tasks={tasks} projects={projects} users={users} />
    </div>
  );
}

export default Reports;