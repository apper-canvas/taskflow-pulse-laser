/**
 * Project Service for handling project-related operations
 * Based on the project8 table from the Apper database
 */

/**
 * Get all projects from the database
 * @param {Object} filters - Optional filters for the query
 * @returns {Promise<Array>} Array of project objects
 */
export const getProjects = async (filters = {}) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Build query parameters
    let queryParams = {
      fields: ["Id", "Name", "Tags", "color", "task_count", "CreatedOn", "CreatedBy"],
    };

    // Add user filter if provided
    if (filters.userId) {
      queryParams.where = [
        {
          fieldName: "CreatedBy",
          operator: "ExactMatch",
          values: [filters.userId]
        }
      ];
    }

    // Add sorting if provided
    if (filters.orderBy) {
      queryParams.orderBy = filters.orderBy;
    }

    const response = await apperClient.fetchRecords("project8", queryParams);

    if (response && response.data) {
      return response.data.map(project => ({
        ...project,
        id: project.Id,
        name: project.Name,
        color: project.color || '#4f46e5',
        taskCount: project.task_count || 0
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

/**
 * Get a project by its ID
 * @param {string} projectId - The ID of the project to retrieve
 * @returns {Promise<Object|null>} Project object or null if not found
 */
export const getProjectById = async (projectId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const response = await apperClient.getRecordById("project8", projectId);

    if (response && response.data) {
      const project = response.data;
      return {
        ...project,
        id: project.Id,
        name: project.Name,
        color: project.color || '#4f46e5',
        taskCount: project.task_count || 0
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching project with ID ${projectId}:`, error);
    throw error;
  }
};

/**
 * Create a new project
 * @param {Object} projectData - Project data to create
 * @returns {Promise<Object>} Created project object
 */
export const createProject = async (projectData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Filter out read-only or system fields
    const createParams = {
      records: [{
        // Include only Updateable fields
        Name: projectData.name,
        color: projectData.color || '#4f46e5',
        task_count: 0, // New projects start with 0 tasks
        Tags: projectData.tags || []
      }]
    };

    const response = await apperClient.createRecord("project8", createParams);

    if (response && response.success && response.results && response.results.length > 0) {
      const createdProject = response.results[0].data;
      return {
        ...createdProject,
        id: createdProject.Id,
        name: createdProject.Name,
        color: createdProject.color || '#4f46e5',
        taskCount: createdProject.task_count || 0
      };
    }

    throw new Error("Failed to create project");
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

/**
 * Update an existing project
 * @param {string} projectId - ID of the project to update
 * @param {Object} projectData - New project data
 * @returns {Promise<Object>} Updated project object
 */
export const updateProject = async (projectId, projectData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Include only Updateable fields and the ID
    const updateParams = {
      records: [{
        Id: projectId,
        Name: projectData.name,
        color: projectData.color,
        task_count: projectData.taskCount,
        Tags: projectData.tags || []
      }]
    };

    const response = await apperClient.updateRecord("project8", updateParams);

    if (response && response.success && response.results && response.results.length > 0) {
      const updatedProject = response.results[0].data;
      return {
        ...updatedProject,
        id: updatedProject.Id,
        name: updatedProject.Name,
        color: updatedProject.color || '#4f46e5',
        taskCount: updatedProject.task_count || 0
      };
    }

    throw new Error("Failed to update project");
  } catch (error) {
    console.error(`Error updating project with ID ${projectId}:`, error);
    throw error;
  }
};

/**
 * Delete a project
 * @param {string} projectId - ID of the project to delete
 * @returns {Promise<boolean>} True if deletion was successful
 */
export const deleteProject = async (projectId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const deleteParams = {
      RecordIds: [projectId]
    };

    const response = await apperClient.deleteRecord("project8", deleteParams);

    return response && response.success;
  } catch (error) {
    console.error(`Error deleting project with ID ${projectId}:`, error);
    throw error;
  }
};