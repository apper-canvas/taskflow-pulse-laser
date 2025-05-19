import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import { startTimeTracking, stopTimeTracking } from '../services/TimeTrackerService';

function TimeTracker({ onTimeUpdate, initialTime = 0, isRunning = false, taskId = null, taskName = '' }) {
  const [time, setTime] = useState(initialTime);
  const [timerRunning, setTimerRunning] = useState(isRunning);
  const [isLoading, setIsLoading] = useState(false);
  const [trackerId, setTrackerId] = useState(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Get icons
  const PlayIcon = getIcon('play');
  const PauseIcon = getIcon('pause');
  const ClockIcon = getIcon('clock');
  const RefreshCwIcon = getIcon('refresh-cw');
  
  // Format time in HH:MM:SS
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };
  
  // Array to store time updates
  useEffect(() => {
    setTimerRunning(isRunning);
  }, [isRunning]);
  const RefreshIcon = getIcon('refresh-cw');

  useEffect(() => {
    if (timerRunning) {
      startTimeRef.current = Date.now() - time;
      timerRef.current = setInterval(() => {
        const elapsedTime = Date.now() - startTimeRef.current;
        setTime(elapsedTime);
        onTimeUpdate && onTimeUpdate(elapsedTime);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerRunning, onTimeUpdate]);

  const toggleTimer = async () => {
    try {
      setIsLoading(true);
      
      if (timerRunning) {
        // Stop the timer in the UI
        clearInterval(timerRef.current);
        timerRef.current = null;
        
        // If we have a trackerId, stop the tracking in the database
        if (trackerId) {
          await stopTimeTracking(trackerId);
          setTrackerId(null);
        }
        
        toast.info("Timer stopped");
      } else {
        // Start the timer in the UI
        timerRef.current = setInterval(() => {
          setTime(prevTime => {
            const newTime = prevTime + 1;
            if (onTimeUpdate) onTimeUpdate(newTime);
            return newTime;
          });
        }, 1000);
        
        // Start tracking in the database if taskId is provided
        if (taskId) {
          const response = await startTimeTracking({
            taskId: taskId,
            taskName: taskName || 'Task'
          });
          
          if (response && response.Id) {
            setTrackerId(response.Id);
          }
        }
        
        toast.info("Timer started");
      }
      
      // Toggle the running state
      setTimerRunning(!timerRunning);
    } catch (error) {
      console.error("Error toggling timer:", error);
      toast.error("Failed to update timer");
      
      // Reset timer state if there was an error
      clearInterval(timerRef.current);
      timerRef.current = null;
      setTimerRunning(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetTimer = async () => {
    setTimerRunning(false);
    setTime(0);
    onTimeUpdate && onTimeUpdate(0);
  };

  return (
    <div className="time-tracker-container">
      <div className="flex flex-col sm:flex-row items-center gap-2 p-3 bg-surface-50 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700">
        <div className="flex items-center gap-2 flex-grow mb-2 sm:mb-0">
          <motion.div
            animate={timerRunning ? { scale: [1, 1.1, 1] } : {}}
            transition={timerRunning ? { repeat: Infinity, duration: 2 } : {}}
            className={`timer-icon-wrapper ${timerRunning ? 'text-primary' : 'text-surface-500 dark:text-surface-400'}`}
          >
            <ClockIcon className="w-5 h-5" />
          </motion.div>
          <div className="time-display text-lg font-mono font-semibold">
            {formatTime(time)}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button
            onClick={toggleTimer}
            disabled={isLoading}
            className={`timer-button ${
              timerRunning 
                ? 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:hover:bg-orange-900/40' 
                : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-200 dark:hover:bg-green-900/40'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? (
              <><RefreshCwIcon className="w-4 h-4 animate-spin" /> Loading...</>
            ) : timerRunning ? (
              <><PauseIcon className="w-4 h-4" /> Stop</>
            ) : (
              <><PlayIcon className="w-4 h-4" /> Start</>
            )}
          </motion.button>
          
          <motion.button
            onClick={resetTimer}
            className="timer-button bg-surface-100 text-surface-700 hover:bg-surface-200 dark:bg-surface-700 dark:text-surface-300 dark:hover:bg-surface-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={time === 0}
          >
            <RefreshIcon className="w-4 h-4" />
            <span>Reset</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default TimeTracker;