/**
 * Generates data for a donut chart showing task statuses
 * @param {Array} tasks - Array of task objects
 * @returns {Object} Chart configuration object
 */
export const generateStatusChartData = (tasks) => {
  const statusCounts = {
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    notStarted: tasks.filter(t => t.status === 'not-started').length,
    onHold: tasks.filter(t => t.status === 'on-hold').length
  };
  
  return {
    series: [
      statusCounts.completed,
      statusCounts.inProgress,
      statusCounts.notStarted,
      statusCounts.onHold
    ],
    options: {
      chart: {
        type: 'donut',
        foreColor: '#64748b'
      },
      labels: ['Completed', 'In Progress', 'Not Started', 'On Hold'],
      colors: ['#10b981', '#4f46e5', '#94a3b8', '#f97316'],
      legend: {
        position: 'bottom'
      }
    }
  };
};

/**
 * Generates data for time tracking chart by project
 * @param {Array} tasks - Array of task objects
 * @param {Array} projects - Array of project objects
 * @returns {Object} Chart configuration object
 */
export const generateTimeTrackingData = (tasks, projects) => {
  const timeByProject = projects.map(project => {
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    const totalTime = projectTasks.reduce((acc, task) => acc + (task.timeSpent || 0), 0);
    return {
      x: project.name,
      y: Math.round(totalTime / 60) // Convert seconds to minutes
    };
  });
  
  return {
    series: [{
      name: 'Time Spent (minutes)',
      data: timeByProject
    }],
    options: {
      chart: {
        type: 'bar',
        foreColor: '#64748b'
      },
      plotOptions: {
        bar: {
          borderRadius: 4
        }
      },
      dataLabels: { enabled: false }
    }
  };
};