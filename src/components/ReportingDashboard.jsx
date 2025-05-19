import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Chart from 'react-apexcharts';
import { format } from 'date-fns';
import { getIcon } from '../utils/iconUtils';
import { getUserFilterSettings, updateFilterSettings, createFilterSettings } from '../services/FilterSettingService';
import { useSelector } from 'react-redux';

const ReportingDashboard = ({ tasks, projects, users }) => {
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filters, setFilters] = useState({
    project: 'all',
    user: 'all',
    status: 'all',
    dateRange: 'all'
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Icons
  const FilterIcon = getIcon('filter');
  const DownloadIcon = getIcon('download');
  const BarChartIcon = getIcon('bar-chart');
  const PieChartIcon = getIcon('pie-chart');
  const UserIcon = getIcon('user');
  const ClockIcon = getIcon('clock');
  
  // Get current user from Redux store
  const userState = useSelector(state => state.user);
  
  // Load saved filter settings on initial render
  useEffect(() => {
    const loadFilterSettings = async () => {
      if (userState?.user?.Id) {
        try {
          const settings = await getUserFilterSettings(userState.user.Id);
          if (settings) {
            setFilters({
              project: settings.project || 'all',
              user: settings.user || 'all',
              status: settings.status || 'all',
              dateRange: settings.date_range || 'all'
            });
          }
        } catch (error) {
          console.error("Error loading filter settings:", error);
        }
      }
    };
    
    loadFilterSettings();
  }, [userState]);
  
  useEffect(() => {
    // Apply filters
    let result = [...tasks];
    
    if (filters.project !== 'all') {
      result = result.filter(task => task.projectId === filters.project);
    }
    
    if (filters.user !== 'all') {
      result = result.filter(task => task.assignedTo === filters.user);
    }
    
    if (filters.status !== 'all') {
      result = result.filter(task => task.status === filters.status);
    }
    
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const pastDate = new Date();
      
      switch(filters.dateRange) {
        case 'week':
          pastDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          pastDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          pastDate.setMonth(now.getMonth() - 3);
          break;
        default:
          break;
      }
      
      result = result.filter(task => new Date(task.dueDate) >= pastDate);
    }
    
    setFilteredTasks(result);
    setIsLoading(false);
  }, [tasks, filters]);
  
  const handleFilterChange = async (e) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value
    };
    
    setFilters(newFilters);
    
    // Save filter settings to database if user is authenticated
    if (userState?.user?.Id) {
      try {
        // Check if user already has filter settings
        const existingSettings = await getUserFilterSettings(userState.user.Id);
        
        if (existingSettings) {
          // Update existing settings
          await updateFilterSettings(existingSettings.Id, {
            project: newFilters.project,
            userId: userState.user.Id,
            status: newFilters.status,
            dateRange: newFilters.dateRange
          });
        } else {
          // Create new settings
          await createFilterSettings({
            userName: userState.user.Name || userState.user.emailAddress,
            userId: userState.user.Id,
            project: newFilters.project,
            status: newFilters.status,
            dateRange: newFilters.dateRange
          });
        }
      } catch (error) {
        console.error("Error saving filter settings:", error);
      }
    }
  };
  
  // Generate chart data based on filtered tasks
  const statusData = {
    series: [
      filteredTasks.filter(t => t.status === 'completed').length,
      filteredTasks.filter(t => t.status === 'in-progress').length,
      filteredTasks.filter(t => t.status === 'not-started').length,
      filteredTasks.filter(t => t.status === 'on-hold').length
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
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: '100%'
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    }
  };
  
  const priorityData = {
    series: [{
      data: [
        filteredTasks.filter(t => t.priority === 'low').length,
        filteredTasks.filter(t => t.priority === 'medium').length,
        filteredTasks.filter(t => t.priority === 'high').length,
        filteredTasks.filter(t => t.priority === 'urgent').length
      ]
    }],
    options: {
      chart: {
        type: 'bar',
        foreColor: '#64748b'
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: true,
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: ['Low', 'Medium', 'High', 'Urgent'],
      },
      colors: ['#10b981', '#4f46e5', '#f97316', '#ef4444']
    }
  };
  
  // Calculate time spent by project
  const timeSpentByProject = projects.map(project => {
    const projectTasks = filteredTasks.filter(t => t.project_id === project.Id);
    const totalTime = projectTasks.reduce((acc, task) => acc + (task.time_spent || 0), 0);
    return {
      x: project.Name,
      y: Math.round(totalTime / 60) // Convert seconds to minutes
    };
  });
  
  const timeData = {
    series: [{
      name: 'Time Spent (minutes)',
      data: timeSpentByProject
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
      dataLabels: {
        enabled: false
      },
      yaxis: {
        title: {
          text: 'Minutes'
        }
      }
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <FilterIcon className="w-5 h-5 mr-2 text-primary" />
            Filter Analytics
          </h3>
          <button className="btn-outline text-sm flex items-center gap-1">
            <DownloadIcon className="w-4 h-4" />
            Export
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="input-group mb-0">
            <label htmlFor="project" className="input-label">Project</label>
            <select
              id="project"
              name="project"
              className="w-full"
              value={filters.project}
              onChange={handleFilterChange}
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project.Id} value={project.Id}>{project.Name}</option>
              ))}
            </select>
          </div>
          
          <div className="input-group mb-0">
            <label htmlFor="user" className="input-label">User</label>
            <select
              id="user"
              name="user"
              className="w-full"
              value={filters.user}
              onChange={handleFilterChange}
            >
              <option value="all">All Users</option>
              {users.map(user => (
                <option key={user.Id} value={user.Id}>{user.Name}</option>
              ))}
            </select>
          </div>
          
          <div className="input-group mb-0">
            <label htmlFor="status" className="input-label">Status</label>
            <select
              id="status"
              name="status"
              className="w-full"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="all">All Statuses</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
            </select>
          </div>
          
          <div className="input-group mb-0">
            <label htmlFor="dateRange" className="input-label">Date Range</label>
            <select
              id="dateRange"
              name="dateRange"
              className="w-full"
              value={filters.dateRange}
              onChange={handleFilterChange}
            >
              <option value="all">All Time</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            {(() => {
              const LoaderIcon = getIcon('loader');
              return <LoaderIcon className="w-12 h-12 text-primary" />;
            })()}
          </motion.div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution Chart */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <PieChartIcon className="w-5 h-5 mr-2 text-primary" />
                Task Status Distribution
              </h3>
              <Chart
                options={statusData.options}
                series={statusData.series}
                type="donut"
                height={300}
              />
            </div>
            
            {/* Priority Distribution Chart */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BarChartIcon className="w-5 h-5 mr-2 text-primary" />
                Task Priority Distribution
              </h3>
              <Chart
                options={priorityData.options}
                series={priorityData.series}
                type="bar"
                height={300}
              />
            </div>
            
            {/* Time Spent Chart */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <ClockIcon className="w-5 h-5 mr-2 text-primary" />
                Time Spent by Project (minutes)
              </h3>
              <Chart
                options={timeData.options}
                series={timeData.series}
                type="bar"
                height={300}
              />
            </div>
            
            {/* Tasks Summary */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-primary" />
                Task Completion Summary
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 bg-surface-50 dark:bg-surface-800 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Task</th>
                      <th className="px-4 py-3 bg-surface-50 dark:bg-surface-800 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 bg-surface-50 dark:bg-surface-800 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Time Spent</th>
                      <th className="px-4 py-3 bg-surface-50 dark:bg-surface-800 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-surface-800 divide-y divide-surface-200 dark:divide-surface-700">
                    {filteredTasks.slice(0, 5).map(task => (
                      <tr key={task.Id}>
                        <td className="px-4 py-3 whitespace-nowrap">{task.title || task.Name}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
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
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {task.time_spent 
                            ? `${Math.floor(task.time_spent / 3600)}h ${Math.floor((task.time_spent % 3600) / 60)}m` 
                            : 'Not tracked'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : 'No date'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredTasks.length > 5 && (
                <div className="mt-4 text-right">
                  <button className="text-primary hover:text-primary-dark text-sm font-medium">
                    View all {filteredTasks.length} tasks
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportingDashboard;
      ...prev,
      [name]: value
    }));
  };
  
  // Generate chart data
  const statusData = {
    series: [
      filteredTasks.filter(t => t.status === 'completed').length,
      filteredTasks.filter(t => t.status === 'in-progress').length,
      filteredTasks.filter(t => t.status === 'not-started').length,
      filteredTasks.filter(t => t.status === 'on-hold').length
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
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: '100%'
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    }
  };
  
  const priorityData = {
    series: [{
      data: [
        filteredTasks.filter(t => t.priority === 'low').length,
        filteredTasks.filter(t => t.priority === 'medium').length,
        filteredTasks.filter(t => t.priority === 'high').length,
        filteredTasks.filter(t => t.priority === 'urgent').length
      ]
    }],
    options: {
      chart: {
        type: 'bar',
        foreColor: '#64748b'
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: true,
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: ['Low', 'Medium', 'High', 'Urgent'],
      },
      colors: ['#10b981', '#4f46e5', '#f97316', '#ef4444']
    }
  };
  
  const timeSpentByProject = projects.map(project => {
    const projectTasks = filteredTasks.filter(t => t.projectId === project.id);
    const totalTime = projectTasks.reduce((acc, task) => acc + (task.timeSpent || 0), 0);
    return {
      x: project.name,
      y: Math.round(totalTime / 60) // Convert seconds to minutes
    };
  });
  
  const timeData = {
    series: [{
      name: 'Time Spent (minutes)',
      data: timeSpentByProject
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
      dataLabels: {
        enabled: false
      },
      yaxis: {
        title: {
          text: 'Minutes'
        }
      }
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <FilterIcon className="w-5 h-5 mr-2 text-primary" />
            Filter Analytics
          </h3>
          <button className="btn-outline text-sm flex items-center gap-1">
            <DownloadIcon className="w-4 h-4" />
            Export
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="input-group mb-0">
            <label htmlFor="project" className="input-label">Project</label>
            <select
              id="project"
              name="project"
              className="w-full"
              value={filters.project}
              onChange={handleFilterChange}
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          
          <div className="input-group mb-0">
            <label htmlFor="user" className="input-label">User</label>
            <select
              id="user"
              name="user"
              className="w-full"
              value={filters.user}
              onChange={handleFilterChange}
            >
              <option value="all">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          
          <div className="input-group mb-0">
            <label htmlFor="status" className="input-label">Status</label>
            <select
              id="status"
              name="status"
              className="w-full"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="all">All Statuses</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
            </select>
          </div>
          
          <div className="input-group mb-0">
            <label htmlFor="dateRange" className="input-label">Date Range</label>
            <select
              id="dateRange"
              name="dateRange"
              className="w-full"
              value={filters.dateRange}
              onChange={handleFilterChange}
            >
              <option value="all">All Time</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            {(() => {
              const LoaderIcon = getIcon('loader');
              return <LoaderIcon className="w-12 h-12 text-primary" />;
            })()}
          </motion.div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution Chart */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <PieChartIcon className="w-5 h-5 mr-2 text-primary" />
                Task Status Distribution
              </h3>
              <Chart
                options={statusData.options}
                series={statusData.series}
                type="donut"
                height={300}
              />
            </div>
            
            {/* Priority Distribution Chart */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BarChartIcon className="w-5 h-5 mr-2 text-primary" />
                Task Priority Distribution
              </h3>
              <Chart
                options={priorityData.options}
                series={priorityData.series}
                type="bar"
                height={300}
              />
            </div>
            
            {/* Time Spent Chart */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <ClockIcon className="w-5 h-5 mr-2 text-primary" />
                Time Spent by Project (minutes)
              </h3>
              <Chart
                options={timeData.options}
                series={timeData.series}
                type="bar"
                height={300}
              />
            </div>
            
            {/* Tasks Summary */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-primary" />
                Task Completion Summary
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 bg-surface-50 dark:bg-surface-800 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Task</th>
                      <th className="px-4 py-3 bg-surface-50 dark:bg-surface-800 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 bg-surface-50 dark:bg-surface-800 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Time Spent</th>
                      <th className="px-4 py-3 bg-surface-50 dark:bg-surface-800 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-surface-800 divide-y divide-surface-200 dark:divide-surface-700">
                    {filteredTasks.slice(0, 5).map(task => (
                      <tr key={task.id}>
                        <td className="px-4 py-3 whitespace-nowrap">{task.title}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
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
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {task.timeSpent 
                            ? `${Math.floor(task.timeSpent / 3600)}h ${Math.floor((task.timeSpent % 3600) / 60)}m` 
                            : 'Not tracked'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredTasks.length > 5 && (
                <div className="mt-4 text-right">
                  <button className="text-primary hover:text-primary-dark text-sm font-medium">
                    View all {filteredTasks.length} tasks
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportingDashboard;