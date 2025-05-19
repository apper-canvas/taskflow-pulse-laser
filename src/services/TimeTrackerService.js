/**
 * Time Tracker Service for handling time tracking operations
 * Based on the time_tracker table from the Apper database
 */

/**
 * Get all time tracking records
 * @param {Object} filters - Optional filters for the query
 * @returns {Promise<Array>} Array of time tracking records
 */
export const getTimeTrackers = async (filters = {}) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Build query parameters
    let queryParams = {
      fields: [
        "Id", "Name", "task_id", "start_time", "end_time", 
        "duration", "is_running", "CreatedOn", "CreatedBy"
      ],
    };

    // Add task filter if provided
    if (filters.taskId) {
      queryParams.where = [
        {
          fieldName: "task_id",
          operator: "ExactMatch",
          values: [filters.taskId]
        }
      ];
    }

    // Add user filter if provided
    if (filters.userId) {
      queryParams.where = [
        ...(queryParams.where || []),
        {
          fieldName: "CreatedBy",
          operator: "ExactMatch",
          values: [filters.userId]
        }
      ];
    }

    const response = await apperClient.fetchRecords("time_tracker", queryParams);

    if (response && response.data) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching time tracking records:", error);
    throw error;
  }
};

/**
 * Start tracking time for a task
 * @param {Object} data - Data for the time tracking record
 * @returns {Promise<Object>} Created time tracking record
 */
export const startTimeTracking = async (data) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const now = new Date();
    
    // Filter out read-only or system fields
    const createParams = {
      records: [{
        // Include only Updateable fields
        Name: `Time tracking: ${data.taskName || 'Task'}`,
        task_id: data.taskId,
        start_time: now.toISOString(),
        is_running: true,
        duration: 0, // Will be updated when stopped
      }]
    };

    const response = await apperClient.createRecord("time_tracker", createParams);

    if (response && response.success && response.results && response.results.length > 0) {
      return response.results[0].data;
    }

    throw new Error("Failed to start time tracking");
  } catch (error) {
    console.error("Error starting time tracking:", error);
    throw error;
  }
};

/**
 * Stop tracking time for a task
 * @param {string} trackerId - ID of the time tracking record to stop
 * @returns {Promise<Object>} Updated time tracking record
 */
export const stopTimeTracking = async (trackerId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // First get the current tracker to calculate duration
    const tracker = await apperClient.getRecordById("time_tracker", trackerId);
    
    if (!tracker || !tracker.data) {
      throw new Error("Time tracker not found");
    }

    const startTime = new Date(tracker.data.start_time);
    const endTime = new Date();
    const durationInSeconds = Math.floor((endTime - startTime) / 1000);

    // Update the tracker with end time and duration
    const updateParams = {
      records: [{
        Id: trackerId,
        end_time: endTime.toISOString(),
        duration: durationInSeconds,
        is_running: false
      }]
    };

    const response = await apperClient.updateRecord("time_tracker", updateParams);

    if (response && response.success && response.results && response.results.length > 0) {
      return response.results[0].data;
    }

    throw new Error("Failed to stop time tracking");
  } catch (error) {
    console.error(`Error stopping time tracking with ID ${trackerId}:`, error);
    throw error;
  }
};

/**
 * Get the total time spent on a task
 * @param {string} taskId - ID of the task
 * @returns {Promise<number>} Total duration in seconds
 */
export const getTaskTotalTime = async (taskId) => {
  try {
    // Get all time records for this task
    const records = await getTimeTrackers({ taskId });
    
    if (!records || records.length === 0) {
      return 0;
    }
    
    // Sum up all duration values
    const totalSeconds = records.reduce((total, record) => {
      return total + (record.duration || 0);
    }, 0);
    
    return totalSeconds;
  } catch (error) {
    console.error(`Error calculating total time for task ${taskId}:`, error);
    throw error;
  }
};