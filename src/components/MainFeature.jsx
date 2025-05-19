import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import TimeTracker from './TimeTracker';
import { createTask } from '../services/TaskService';

const MainFeature = ({ projectId, onTaskAdded }) => {
  const defaultFormData = {
    title: '',
    description: '',
    status: 'not-started',
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    timeSpent: 0,
    timerRunning: false
  };

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [validationErrors, setValidationErrors] = useState({});
  const [showTimeTracker, setShowTimeTracker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get icons
  const PlusIcon = getIcon('plus');
  const XIcon = getIcon('x');
  const CalendarIcon = getIcon('calendar');
  const AlertCircleIcon = getIcon('alert-circle');
  const CheckIcon = getIcon('check');
  const InfoIcon = getIcon('info');
  const TimerIcon = getIcon('timer');
  const ClockIcon = getIcon('clock');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error for this field when user types
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Task title is required';
    } else if (formData.title.length < 3) {
      errors.title = 'Title must be at least 3 characters long';
    }
    
    if (!formData.dueDate) {
      errors.dueDate = 'Due date is required';
    } else {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.dueDate = 'Due date cannot be in the past';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        if (!projectId) {
          toast.error("Please select a project first");
          return;
        }
        
        // Prepare task data for API
        const taskData = {
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          dueDate: formData.dueDate, // API expects a date string
          timeSpent: formData.timeSpent,
          projectId: projectId // Use the selected project ID
        };
        
        // Create the task in the database
        await createTask(taskData);
        
        // Show success message
        toast.success("Task created successfully!");
        
        // Reset form data
        setFormData(defaultFormData);
        
        // Reset errors
        setValidationErrors({});
        
        // Close the form
        setIsFormOpen(false);
        
        // Refresh the task list in the parent component
        if (onTaskAdded) onTaskAdded();
      } catch (error) {
        console.error("Error creating task:", error);
        toast.error("Failed to create task");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleTimeUpdate = (newTime) => {
    setFormData({...formData, timeSpent: newTime});
  };

  return (
    <div className="mb-6">
      {!isFormOpen ? (
        <motion.button
          className="w-full py-3 px-4 rounded-lg border-2 border-dashed border-surface-300 dark:border-surface-700 
                    flex items-center justify-center gap-2 text-surface-600 dark:text-surface-400 
                    hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          onClick={() => setIsFormOpen(true)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add New Task</span>
        </motion.button>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-surface-100 dark:bg-surface-800 rounded-lg p-4 sm:p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Create New Task</h3>
              <motion.button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <XIcon className="w-5 h-5" />
              </motion.button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="input-group">
                  <label htmlFor="title" className="input-label">
                    Task Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="What needs to be done?"
                    className={`w-full ${
                      validationErrors.title ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {validationErrors.title && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircleIcon className="w-4 h-4" />
                      {validationErrors.title}
                    </p>
                  )}
                </div>
                
                <div className="input-group">
                  <label htmlFor="description" className="input-label">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Add details about this task..."
                    rows="3"
                    className="w-full"
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="input-group">
                    <label htmlFor="status" className="input-label">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full"
                    >
                      <option value="not-started">Not Started</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="on-hold">On Hold</option>
                    </select>
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="priority" className="input-label">
                      Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                
                <div className="input-group">
                  <label htmlFor="dueDate" className="input-label flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className={`w-full ${
                      validationErrors.dueDate ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {validationErrors.dueDate && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircleIcon className="w-4 h-4" />
                      {validationErrors.dueDate}
                    </p>
                  )}
                </div>
                
                <div className="mt-4 border-t pt-4 border-surface-200 dark:border-surface-700">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-5 h-5 text-primary" />
                      <h4 className="font-medium text-sm sm:text-base">Time Tracking</h4>
                    </div>
                    
                    {!showTimeTracker ? (
                      <motion.button
                        type="button"
                        onClick={() => setShowTimeTracker(true)}
                        className="btn-outline flex items-center gap-1 text-sm py-1 px-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <TimerIcon className="w-4 h-4" />
                        <span>Show Timer</span>
                      </motion.button>
                    ) : null}
                  </div>
                  
                  {showTimeTracker && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-3"
                    >
                      <TimeTracker 
                        onTimeUpdate={handleTimeUpdate}
                        initialTime={formData.timeSpent} 
                      />
                    </motion.div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400 mt-4 mb-2">
                  <InfoIcon className="w-4 h-4" />
                  <span>Task will be added to your current project.</span>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <motion.button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="btn-outline"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  
                  <motion.button
                    type="submit"
                    className={`btn-primary flex items-center gap-2 ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2"><RefreshCwIcon className="w-4 h-4 animate-spin" /> Creating...</span>
                    ) : (
                      <span className="flex items-center gap-2"><CheckIcon className="w-4 h-4" /> Create Task</span>
                    )}
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

export default MainFeature;