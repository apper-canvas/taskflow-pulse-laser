import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';

function NotFound() {
  const AlertTriangleIcon = getIcon('alert-triangle');
  const HomeIcon = getIcon('home');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="mb-6 flex justify-center">
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 2
            }}
          >
            <AlertTriangleIcon className="w-24 h-24 text-accent" />
          </motion.div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-surface-600 dark:text-surface-400 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link 
            to="/"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-lg"
          >
            <HomeIcon className="w-5 h-5" />
            Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default NotFound;