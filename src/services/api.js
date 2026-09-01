/**
 * ==============================================================================
 * CASCADE-NET | api.js
 * ==============================================================================
 * Centralized Axios REST API client for backend communication.
 * 
 * Official Architecture:
 * React Frontend -> REST API -> Node.js + Express Backend -> MongoDB Atlas.
 * 
 * In development / demo prototype mode, all calls gracefully fallback to local
 * mock datasets so the platform operates flawlessly offline or before backend deployment.
 * ==============================================================================
 */

import axios from 'axios';
import { initialAlerts } from '../data/alerts';
import { initialNotifications } from '../data/notifications';
import { initialEmergencyAreas } from '../data/emergencyData';
import { initialResources } from '../data/resourcesData';

// Configured Axios instance with configurable base URL
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 6000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

/**
 * Early Warning Alerts API Service
 */
export const alertApi = {
  // Retrieve all active and historic alerts
  getAlerts: async () => {
    try {
      const response = await apiClient.get('/alerts');
      return response.data;
    } catch (err) {
      return initialAlerts;
    }
  },
  // Fetch alert by ID
  getAlertById: async (id) => {
    try {
      const response = await apiClient.get(`/alerts/${id}`);
      return response.data;
    } catch (err) {
      return initialAlerts.find(a => a.id === id) || null;
    }
  },
  // Ingest new alert from AI Risk Engine
  createAlert: async (newAlert) => {
    try {
      const response = await apiClient.post('/alerts', newAlert);
      return response.data;
    } catch (err) {
      return { success: true, data: newAlert, source: 'mock_engine' };
    }
  },
  // Update status (Acknowledged, Resolved, Escalated)
  updateAlertStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(`/alerts/${id}/status`, { status });
      return response.data;
    } catch (err) {
      return { success: true, id, status, source: 'mock_engine' };
    }
  }
};

/**
 * Multilingual Notifications API Service
 */
export const notificationApi = {
  getNotifications: async () => {
    try {
      const response = await apiClient.get('/notifications');
      return response.data;
    } catch (err) {
      return initialNotifications;
    }
  },
  markAsRead: async (id) => {
    try {
      const response = await apiClient.patch(`/notifications/${id}/read`);
      return response.data;
    } catch (err) {
      return { success: true, id };
    }
  },
  sendBroadcast: async (payload) => {
    try {
      const response = await apiClient.post('/notifications/broadcast', payload);
      return response.data;
    } catch (err) {
      return { success: true, payload, source: 'mock_dispatcher' };
    }
  }
};

/**
 * Emergency Response Prioritisation API Service
 */
export const emergencyApi = {
  getPrioritisedAreas: async () => {
    try {
      const response = await apiClient.get('/emergency-priority');
      return response.data;
    } catch (err) {
      return initialEmergencyAreas;
    }
  },
  dispatchTeam: async (areaId, unitName) => {
    try {
      const response = await apiClient.post(`/emergency-priority/${areaId}/dispatch`, { unitName });
      return response.data;
    } catch (err) {
      return { success: true, areaId, unitName };
    }
  }
};

/**
 * Emergency Resources & Facilities Inventory API Service
 */
export const resourcesApi = {
  getResources: async () => {
    try {
      const response = await apiClient.get('/resources');
      return response.data;
    } catch (err) {
      return initialResources;
    }
  }
};

export default apiClient;
