import axios from "axios";


/*
|--------------------------------------------------------------------------
| Axios API Client
|--------------------------------------------------------------------------
*/

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 6000,
  headers: {
    Accept: "application/json",
  },
});



export const submitIncident = async (incidentData) => {
  const response = await api.post("/incidents", incidentData);

  return response.data;
};


export const getIncidents = async () => {
  const response = await api.get("/incidents");

  return response.data;
};


export const getIncidentById = async (id) => {
  const response = await api.get(`/incidents/${id}`);

  return response.data;
};

export const getEvidenceUrl = (fileId) => {
  return `${api.defaults.baseURL}/incidents/evidence/${fileId}`;
};

export const updateIncidentStatus = async (id, status) => {
  const response = await api.patch(`/incidents/${id}`, {
    status,
  });

  return response.data;
};


/*
|--------------------------------------------------------------------------
| EARLY WARNING ALERT API
|--------------------------------------------------------------------------
*/

export const alertApi = {

  getAlerts: async () => {
    const response = await api.get("/alerts");

    return response.data;
  },

  getAlertById: async (id) => {
    const response =
      await api.get(`/alerts/${id}`);

    return response.data;
  },

  updateAlertStatus: async (id, status) => {
    const response =
      await api.patch(
        `/alerts/${id}/status`,
        { status }
      );

    return response.data;
  },

};


/*
|--------------------------------------------------------------------------
| NOTIFICATION API
|--------------------------------------------------------------------------
*/
export const notificationApi = {
  getNotifications: async () => {
    const response = await api.get("/notifications");
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch("/notifications/read-all");
    return response.data;
  },

  sendBroadcast: async (payload) => {
    const response = await api.post("/notifications/broadcast", payload);
    return response.data;
  },
};

/*
|--------------------------------------------------------------------------
| EMERGENCY RESPONSE API
|--------------------------------------------------------------------------
*/

export const emergencyApi = {
  /*
   * Get prioritised emergency areas
   */
  getPrioritisedAreas: async () => {
    const response = await api.get("/emergency-priority");

    return response.data;
  },

  /*
   * Dispatch emergency team
   */
  dispatchTeam: async (areaId, unitName) => {
    const response = await api.post(
      `/emergency-priority/${areaId}/dispatch`,
      {
        unitName,
      }
    );

    return response.data;
  },
};


/*
|--------------------------------------------------------------------------
| EMERGENCY RESOURCE API
|--------------------------------------------------------------------------
*/

export const resourcesApi = {
  getResources: async () => {
    const response = await api.get(
      "/resources"
    );

    return response.data;
  },

  createResource: async (payload) => {
    const response = await api.post(
      "/resources",
      payload
    );

    return response.data;
  },

  updateResource: async (id, payload) => {
    const response = await api.patch(
      `/resources/${id}`,
      payload
    );

    return response.data;
  }
};
/*
|--------------------------------------------------------------------------
| DEFAULT EXPORT
|--------------------------------------------------------------------------
*/

export default api;