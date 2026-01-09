// Centralized API Configuration
// This file provides the API base URL for all frontend components

// Get API URL from environment variable, with fallback for local development
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper to construct full API endpoint URLs
export const getApiUrl = (endpoint) => {
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
};

// Helper to get upload/static file URLs
export const getUploadUrl = (path) => {
  if (!path) return null;
  
  // If it's a data URI, return as-is
  if (path.startsWith('data:')) return path;
  
  // If it's already a full URL, return it
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  
  // If path starts with /uploads/, use it directly
  if (path.startsWith('/uploads/')) {
    return `${base}${path}`;
  }
  
  // Remove leading 'uploads/' if present since backend serves at /uploads
  const cleanPath = path.startsWith('uploads/') ? path.substring(8) : path;
  
  return `${base}/uploads/${cleanPath}`;
};

// Helper specifically for employee photos
export const getEmployeePhotoUrl = (photograph) => {
  if (!photograph) return null;
  
  if (photograph.startsWith('data:')) return photograph;
  if (photograph.startsWith('http://') || photograph.startsWith('https://')) return photograph;
  
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  
  if (photograph.startsWith('/uploads/')) {
    return `${base}${photograph}`;
  }
  
  return `${base}/uploads/employees/${photograph}`;
};

// Helper for attendance photos
export const getAttendancePhotoUrl = (photoPath) => {
  if (!photoPath) return null;
  
  if (photoPath.startsWith('http')) return photoPath;
  
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  
  // Extract clean path from various formats
  let cleanPath = photoPath;
  if (cleanPath.includes('uploads/attendance/')) {
    cleanPath = cleanPath.split('uploads/attendance/').pop();
  } else if (cleanPath.includes('attendance/')) {
    cleanPath = cleanPath.split('attendance/').pop();
  }
  
  return `${base}/uploads/attendance/${cleanPath}`;
};

export default {
  API_BASE_URL,
  getApiUrl,
  getUploadUrl,
  getEmployeePhotoUrl,
  getAttendancePhotoUrl
};
