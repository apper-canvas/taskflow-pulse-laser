/**
 * User Service for handling user-related operations
 * Based on the User2 table from the Apper database
 */

// Cache for users to reduce API calls
let userCache = [];

/**
 * Get all users from the database
 * @param {Object} filters - Optional filters for the query
 * @returns {Promise<Array>} Array of user objects
 */
export const getUsers = async (filters = {}) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Build query parameters
    let queryParams = {
      fields: ["Id", "Name", "email", "CreatedOn"],
    };

    // Add any filters if provided
    if (filters.where) {
      queryParams.where = filters.where;
    }

    // Add any sorting if provided
    if (filters.orderBy) {
      queryParams.orderBy = filters.orderBy;
    }

    const response = await apperClient.fetchRecords("User2", queryParams);

    if (response && response.data) {
      userCache = response.data;
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

/**
 * Get a user by their ID
 * @param {string} userId - The ID of the user to retrieve
 * @returns {Promise<Object|null>} User object or null if not found
 */
export const getUserById = async (userId) => {
  try {
    // Check cache first
    const cachedUser = userCache.find(user => user.Id === userId);
    if (cachedUser) {
      return cachedUser;
    }

    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const response = await apperClient.getRecordById("User2", userId);

    if (response && response.data) {
      // Update cache
      const userIndex = userCache.findIndex(user => user.Id === userId);
      if (userIndex >= 0) {
        userCache[userIndex] = response.data;
      } else {
        userCache.push(response.data);
      }
      return response.data;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error);
    throw error;
  }
};

/**
 * Create a new user
 * @param {Object} userData - User data to create
 * @returns {Promise<Object>} Created user object
 */
export const createUser = async (userData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Filter out read-only or system fields
    const createParams = {
      records: [{
        Name: userData.name,
        email: userData.email,
        // Only include Updateable fields
        Tags: userData.tags || [],
      }]
    };

    const response = await apperClient.createRecord("User2", createParams);

    if (response && response.success && response.results && response.results.length > 0) {
      const createdUser = response.results[0].data;
      // Update cache
      userCache.push(createdUser);
      return createdUser;
    }

    throw new Error("Failed to create user");
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

/**
 * Check if a user is currently authenticated via the Apper SDK
 * @returns {boolean} True if user is authenticated
 */
export const isAuthenticated = () => {
  // Uses the Redux store to determine if user is authenticated
  // This is set in App.jsx when ApperUI.setup() calls onSuccess
  return true; // Placeholder, actual auth is handled by Redux
};