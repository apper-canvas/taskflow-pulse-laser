/**
 * Filter Setting Service for handling user filter preferences
 * Based on the filter_setting table from the Apper database
 */

/**
 * Get filter settings for a user
 * @param {string} userId - User ID to get settings for
 * @returns {Promise<Object|null>} Filter settings or null if not found
 */
export const getUserFilterSettings = async (userId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const queryParams = {
      fields: ["Id", "Name", "project", "user", "status", "date_range"],
      where: [
        {
          fieldName: "user",
          operator: "ExactMatch",
          values: [userId]
        }
      ]
    };

    const response = await apperClient.fetchRecords("filter_setting", queryParams);

    if (response && response.data && response.data.length > 0) {
      return response.data[0];
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching filter settings for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Create filter settings for a user
 * @param {Object} filterData - Filter settings data
 * @returns {Promise<Object>} Created filter settings
 */
export const createFilterSettings = async (filterData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const createParams = {
      records: [{
        // Include only Updateable fields
        Name: `Filter settings for ${filterData.userName || 'user'}`,
        project: filterData.project || 'all',
        user: filterData.userId,
        status: filterData.status || 'all',
        date_range: filterData.dateRange || 'all'
      }]
    };

    const response = await apperClient.createRecord("filter_setting", createParams);

    if (response && response.success && response.results && response.results.length > 0) {
      return response.results[0].data;
    }

    throw new Error("Failed to create filter settings");
  } catch (error) {
    console.error("Error creating filter settings:", error);
    throw error;
  }
};

/**
 * Update filter settings for a user
 * @param {string} settingId - ID of the filter settings to update
 * @param {Object} filterData - New filter settings data
 * @returns {Promise<Object>} Updated filter settings
 */
export const updateFilterSettings = async (settingId, filterData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Include only Updateable fields and the ID
    const updateParams = {
      records: [{
        Id: settingId,
        project: filterData.project,
        status: filterData.status,
        date_range: filterData.dateRange
      }]
    };

    // Only include the user ID if it's changing
    if (filterData.userId) {
      updateParams.records[0].user = filterData.userId;
    }

    // Only include name if it's changing
    if (filterData.name) {
      updateParams.records[0].Name = filterData.name;
    }

    const response = await apperClient.updateRecord("filter_setting", updateParams);

    if (response && response.success && response.results && response.results.length > 0) {
      return response.results[0].data;
    }

    throw new Error("Failed to update filter settings");
  } catch (error) {
    console.error(`Error updating filter settings with ID ${settingId}:`, error);
    throw error;
  }
};