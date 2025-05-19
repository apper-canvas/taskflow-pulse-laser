/**
 * Task Service for handling task-related operations
 * Based on the task30 table from the Apper database
 */

/**
 * Get all tasks from the database
 * @param {Object} filters - Optional filters for the query
 * @returns {Promise<Array>} Array of task objects
 */
export const getTasks = async (filters = {}) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Build query parameters
    let queryParams = {
      fields: [
        "Id", "Name", "Tags", "title", "description", "status", 
        "priority", "due_date", "time_spent", "project_id", 
        "assigned_to", "CreatedOn", "CreatedBy"
      ],
    };

    // Add expands to get related records
    queryParams.expands = [
      {
        name: "project_id",
        alias: "project"
      },
      {
        name: "assigned_to",
        alias: "assignee"
      }
    ];

    // Add any specific filters
    if (filters.project) {
      queryParams.where = [
        {
          fieldName: "project_id",
          operator: "ExactMatch",
          values: [filters.project]
        }
      ];
    }

    if (filters.status) {
      queryParams.where = [
        ...(queryParams.where || []),
        {
          fieldName: "status",
          operator: "ExactMatch",
          values: [filters.status]
        }
      ];
    }

    // Add sorting if specified
    if (filters.orderBy) {
      queryParams.orderBy = filters.orderBy;
    }

    const response = await apperClient.fetchRecords("task30", queryParams);

    if (response && response.data) {
      return response.data.map(task => ({
        ...task,
        // Format date fields to be ISO strings
        dueDate: task.due_date ? new Date(task.due_date).toISOString() : null,
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

/**
 * Get a task by its ID
 * @param {string} taskId - The ID of the task to retrieve
 * @returns {Promise<Object|null>} Task object or null if not found
 */
export const getTaskById = async (taskId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const response = await apperClient.getRecordById("task30", taskId);

    if (response && response.data) {
      const task = response.data;
      return {
        ...task,
        dueDate: task.due_date ? new Date(task.due_date).toISOString() : null,
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching task with ID ${taskId}:`, error);
    throw error;
  }
};

/**
 * Create a new task
 * @param {Object} taskData - Task data to create
 * @returns {Promise<Object>} Created task object
 */
export const createTask = async (taskData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Filter out read-only or system fields and map to database field names
    const createParams = {
      records: [{
        // Include only Updateable fields
        Name: taskData.title,
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        due_date: taskData.dueDate,
        time_spent: taskData.timeSpent || 0,
        project_id: taskData.projectId,
        assigned_to: taskData.assignedTo,
        Tags: taskData.tags || []
      }]
    };

    const response = await apperClient.createRecord("task30", createParams);

    if (response && response.success && response.results && response.results.length > 0) {
      const createdTask = response.results[0].data;
      return {
        ...createdTask,
        dueDate: createdTask.due_date ? new Date(createdTask.due_date).toISOString() : null,
      };
    }

    throw new Error("Failed to create task");
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

/**
 * Update an existing task
 * @param {string} taskId - ID of the task to update
 * @param {Object} taskData - New task data
 * @returns {Promise<Object>} Updated task object
 */
export const updateTask = async (taskId, taskData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Include only Updateable fields and the ID
    const updateParams = {
      records: [{
        Id: taskId,
        Name: taskData.title,
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        due_date: taskData.dueDate,
        time_spent: taskData.timeSpent,
        project_id: taskData.projectId,
        assigned_to: taskData.assignedTo,
        Tags: taskData.tags || []
      }]
    };

    const response = await apperClient.updateRecord("task30", updateParams);

    if (response && response.success && response.results && response.results.length > 0) {
      const updatedTask = response.results[0].data;
      return updatedTask;
    }

    throw new Error("Failed to update task");
  } catch (error) {
    console.error(`Error updating task with ID ${taskId}:`, error);
    throw error;
  }
};

/**
 * Delete a task
 * @param {string} taskId - ID of the task to delete
 * @returns {Promise<boolean>} True if deletion was successful
 */
export const deleteTask = async (taskId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const deleteParams = {
      RecordIds: [taskId]
    };

    const response = await apperClient.deleteRecord("task30", deleteParams);

    return response && response.success;
  } catch (error) {
    console.error(`Error deleting task with ID ${taskId}:`, error);
    throw error;
  }
};