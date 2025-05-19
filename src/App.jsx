import { createContext, useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import { getIcon } from './utils/iconUtils';
import { setUser, clearUser } from './store/userSlice';

// Pages
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Callback from './pages/Callback';
import ErrorPage from './pages/ErrorPage';

// Create auth context
export const AuthContext = createContext(null);

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true' || 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  // Get authentication status
  const userState = useSelector((state) => state.user);
  const isAuthenticated = userState?.isAuthenticated || false;

  // Effect for dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);
  
  // Initialize ApperUI once when the app loads
  useEffect(() => {
    let initTimeoutId;
    
    // Initialize ApperUI but don't show login yet
    try {
      const { ApperClient, ApperUI } = window.ApperSDK;
      
      // Set a timeout to prevent infinite loading
      initTimeoutId = setTimeout(() => {
        console.log("SDK initialization timeout reached, proceeding with application");
        setIsInitialized(true);
      }, 10000); // 10 seconds timeout
      
      const client = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      ApperUI.setup(client, {
        target: '#authentication',
        clientId: import.meta.env.VITE_APPER_PROJECT_ID,
        view: 'both',
        onSuccess: function (user) {
          clearTimeout(initTimeoutId); // Clear the timeout
          setIsInitialized(true); // Set initialization complete
          // CRITICAL: This exact currentPath logic must be preserved in all implementations
          // DO NOT simplify or modify this pattern as it ensures proper redirection flow
          let currentPath = window.location.pathname + window.location.search;
          let redirectPath = new URLSearchParams(window.location.search).get('redirect');
          const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup') || currentPath.includes(
              '/callback') || currentPath.includes('/error');
          if (user) {
            // User is authenticated
            if (redirectPath) {
              navigate(redirectPath);
            } else if (!isAuthPage) {
              if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
                navigate(currentPath);
              } else {
                navigate('/');
              }
            } else {
              navigate('/');
            }
            // Store user information in Redux
            dispatch(setUser(JSON.parse(JSON.stringify(user))));
          } else {
            // User is not authenticated
            if (!isAuthPage) {
              navigate(
                currentPath.includes('/signup')
                 ? `/signup?redirect=${currentPath}`
                 : currentPath.includes('/login')
                 ? `/login?redirect=${currentPath}`
                 : '/login');
            } else if (redirectPath) {
              if (
                ![
                  'error',
                  'signup',
                  'login',
                  'callback'
                ].some((path) => currentPath.includes(path)))
                navigate(`/login?redirect=${redirectPath}`);
              else {
                navigate(currentPath);
              }
            } else if (isAuthPage) {
              navigate(currentPath);
            } else {
              navigate('/login');
            }
            dispatch(clearUser());
          }
        },
        onError: function(error) {
          clearTimeout(initTimeoutId); // Clear the timeout
          console.error("Authentication failed:", error);
          setInitializationError("Authentication failed: " + (error.message || "Unknown error"));
          setIsInitialized(true); // Continue to render the app even with error
        }
      });
    } catch (error) {
      console.error("Failed to initialize ApperSDK:", error);
      setInitializationError("Failed to initialize ApperSDK: " + (error.message || "Unknown error"));
      setIsInitialized(true); // Continue to render the app even with error
    }
    
    // Clean up the timeout if component unmounts
    return () => {
      if (initTimeoutId) {
        clearTimeout(initTimeoutId);
      }
    };
  }, [dispatch, navigate]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const MoonIcon = getIcon('moon');
  const SunIcon = getIcon('sun');
  
  // Authentication methods to share via context
  const authMethods = {
    isInitialized,
    isAuthenticated,
    logout: async () => {
      dispatch(clearUser()); // Clear user state immediately for better UX
      try {
        const { ApperUI } = window.ApperSDK;
        await ApperUI.logout();
        dispatch(clearUser());
        navigate('/login');
      } catch (error) {
        console.error("Logout failed:", error);
        navigate('/login'); // Redirect to login even on error
      }
    }
  };

  // Don't render routes until initialization is complete
  if (!isInitialized) {
    return <div className="flex items-center justify-center min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="text-lg text-surface-800 dark:text-surface-200">
        Initializing application...
        <div className="mt-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto">
          </div>
        </div>
      </div>
    </div>;
  }

  return (
    <AuthContext.Provider value={authMethods}>
      <div className="flex min-h-screen bg-surface-50 dark:bg-surface-900 transition-colors duration-300">
        {/* Dark Mode Toggle Button */}
        <motion.button
          onClick={toggleDarkMode}
          className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-surface-200 dark:bg-surface-700 shadow-md hover:shadow-lg transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? <SunIcon className="h-5 w-5 text-yellow-400" /> : <MoonIcon className="h-5 w-5 text-surface-600" />}
        </motion.button>

        {/* Display initialization error if any */}
        {initializationError && (
          <div className="fixed top-4 right-4 z-50 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg shadow-md">
            <p className="font-medium">Error</p>
            <p className="text-sm">{initializationError}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1">
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/callback" element={<Callback />} />
              <Route path="/error" element={<ErrorPage />} />
              
              {/* Protected Routes - only accessible when authenticated */}
              <Route path="/" element={isAuthenticated ? <Home /> : <Login />} />
              <Route path="/reports" element={isAuthenticated ? <Reports /> : <Login />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>

        {/* Toast Container Configuration */}
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={isDarkMode ? "dark" : "light"}
          toastClassName="shadow-md"
        />
      </div>
    </AuthContext.Provider>
  );
}

export default App;