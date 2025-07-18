import api from './api';

/**
 * Get homepage content
 * @returns {Promise} Promise with homepage content data
 */
export const getHomepageContent = async () => {
  try {
    const response = await api.get('/homepage');
    return response.data;
  } catch (error) {
    console.error('Error fetching homepage content:', error);
    throw error;
  }
};

/**
 * Update a specific section of the homepage
 * @param {string} section - Section name (e.g., 'heroSection', 'categoryShowcase')
 * @param {object} data - Section data to update
 * @returns {Promise} Promise with updated section data
 */
export const updateHomepageSection = async (section, data) => {
  try {
    const response = await api.put(`/homepage/${section}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating ${section}:`, error);
    throw error;
  }
};

/**
 * Upload an image for the homepage
 * @param {File} imageFile - Image file to upload
 * @returns {Promise} Promise with uploaded image URL
 */
export const uploadHomepageImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post('/homepage/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Update the order of sections on the homepage
 * @param {Array} sectionsOrder - Array of section names in desired order
 * @returns {Promise} Promise with updated sections order
 */
export const updateSectionsOrder = async (sectionsOrder) => {
  try {
    const response = await api.put('/homepage/sections/order', { sectionsOrder });
    return response.data;
  } catch (error) {
    console.error('Error updating sections order:', error);
    throw error;
  }
};

/**
 * Toggle visibility of a homepage section
 * @param {string} section - Section name
 * @param {boolean} enabled - Whether the section should be visible
 * @returns {Promise} Promise with updated visibility status
 */
export const toggleSectionVisibility = async (section, enabled) => {
  try {
    const response = await api.put(`/homepage/sections/${section}/visibility`, { enabled });
    return response.data;
  } catch (error) {
    console.error(`Error toggling ${section} visibility:`, error);
    throw error;
  }
};

const homepageService = {
  getHomepageContent,
  updateHomepageSection,
  uploadHomepageImage,
  updateSectionsOrder,
  toggleSectionVisibility
};

export default homepageService;