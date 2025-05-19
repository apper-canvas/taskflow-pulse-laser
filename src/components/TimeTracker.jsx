import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';

function TimeTracker({ onTimeUpdate, initialTime = 0, isRunning = false }) {
  const [time, setTime] = useState(initialTime);
  const [timerRunning, setTimerRunning] = useState(isRunning);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Get icons
  const PlayIcon = getIcon('play');
  const PauseIcon = getIcon('pause');
  const ClockIcon = getIcon('clock');
  const RefreshIcon = getIcon('refresh-cw');

  useEffect(() => {
    if (timerRunning) {
      startTimeRef.current = Date.now() - time;
      timerRef.current = setInterval(() => {
        const elapsedTime = Date.now() - startTimeRef.current;
        setTime(elapsedTime);
        onTimeUpdate && onTimeUpdate(elapsedTime);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => {
      clearInterval(timerRef.current);
    };
  }, [timerRunning, onTimeUpdate]);

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

  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
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
            className={`timer-button ${
              timerRunning 
                ? 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:hover:bg-orange-900/40' 
                : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-200 dark:hover:bg-green-900/40'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
          >
            {timerRunning ? (
              <>
                <PauseIcon className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <PlayIcon className="w-4 h-4" />
                <span>Start</span>
              </>
            )}
          </motion.button>
          
          <motion.button
            onClick={resetTimer}
            className="timer-button bg-surface-100 text-surface-700 hover:bg-surface-200 dark:bg-surface-700 dark:text-surface-300 dark:hover:bg-surface-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
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