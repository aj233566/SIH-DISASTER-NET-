import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { notificationService } from "../services/notificationService";

import { calculateRiskLevel } from "../services/riskEngine";

import {
  alertApi,
  notificationApi,
  emergencyApi,
  resourcesApi,
} from "../services/api";

// ============================================================
// CONTEXT
// ============================================================

const AlertContext = createContext(null);

// ============================================================
// PROVIDER
// ============================================================

export const AlertProvider = ({ children }) => {
  // ==========================================================
  // STATE
  // ==========================================================

  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState("");
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [emergencyAreasLoading, setEmergencyAreasLoading] = useState(true);
  const [emergencyAreasError, setEmergencyAreasError] = useState("");
  const [emergencyAreas, setEmergencyAreas] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [resourcesError, setResourcesError] = useState("");
  const [resources, setResources] = useState([]);

  const [thresholds, setThresholds] = useState({
    critical: 80,
    high: 65,
    moderate: 40,
  });

  // ==========================================================
  // RESPONSE NORMALIZER
  // ==========================================================

  const extractData = useCallback((response) => {
    if (response && Array.isArray(response.data)) {
      return response.data;
    }

    if (Array.isArray(response)) {
      return response;
    }

    return [];
  }, []);

  // ==========================================================
  // LOAD ALERTS
  // ==========================================================

  const loadAlerts = useCallback(async () => {
    setAlertsLoading(true);
    setAlertsError("");
    try {
      const response = await alertApi.getAlerts();

      const data = extractData(response);

      console.log("[AlertContext] Alerts loaded:", data);

      setAlerts(data);
    } catch (error) {
      console.error("[AlertContext] Failed to load alerts:", error);
      setAlerts([]);
      setAlertsError(error.message || "Unable to load alerts.");
    } finally {
      setAlertsLoading(false);
    }
  }, [extractData]);

  // ==========================================================
  // LOAD NOTIFICATIONS
  // ==========================================================

  const loadNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    setNotificationsError("");
    try {
      const response = await notificationApi.getNotifications();

      const data = extractData(response);

      setNotifications(data);
    } catch (error) {
      console.error("[AlertContext] Failed to load notifications:", error);
      setNotifications([]);
      setNotificationsError(error.message || "Unable to load notifications.");
    } finally {
      setNotificationsLoading(false);
    }
  }, [extractData]);

  // ==========================================================
  // LOAD EMERGENCY AREAS
  // ==========================================================

  const loadEmergencyAreas = useCallback(async () => {
    setEmergencyAreasLoading(true);
    setEmergencyAreasError("");
    try {
      const response = await emergencyApi.getPrioritisedAreas();

      const data = extractData(response);

      console.log("[AlertContext] Emergency areas:", data);

      setEmergencyAreas(data);
    } catch (error) {
      console.error("[AlertContext] Failed to load emergency areas:", error);
      setEmergencyAreas([]);
      setEmergencyAreasError(error.message || "Unable to load emergency response areas.");
    } finally {
      setEmergencyAreasLoading(false);
    }
  }, [extractData]);

  // ==========================================================
  // LOAD RESOURCES
  // ==========================================================

  const loadResources = useCallback(async () => {
    setResourcesLoading(true);
    setResourcesError("");
    try {
      const response = await resourcesApi.getResources();

      const data = extractData(response);

      console.log("[AlertContext] Resources:", data);

      setResources(data);
    } catch (error) {
      console.error("[AlertContext] Failed to load resources:", error);
      setResources([]);
      setResourcesError(error.message || "Unable to load resources.");
    } finally {
      setResourcesLoading(false);
    }
  }, [extractData]);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadAlerts();

    loadNotifications();

    loadEmergencyAreas();

    loadResources();
  }, [loadAlerts, loadNotifications, loadEmergencyAreas, loadResources]);

  // ==========================================================
  // ALERT STATUS ACTIONS
  // ==========================================================

  const updateAlertStatus = async (id, status) => {
    if (!id) {
      return;
    }

    try {
      await alertApi.updateAlertStatus(id, status);

      setAlerts((previousAlerts) =>
        previousAlerts.map((alert) =>
          alert._id === id || alert.id === id
            ? {
                ...alert,
                status,
              }
            : alert,
        ),
      );
    } catch (error) {
      console.error(`Failed to update alert to ${status}:`, error);

      throw error;
    }
  };

  // ==========================================================
  // ACKNOWLEDGE
  // ==========================================================

  const acknowledgeAlert = async (id) => {
    await updateAlertStatus(id, "Acknowledged");
  };

  // ==========================================================
  // RESOLVE
  // ==========================================================

  const resolveAlert = async (id) => {
    await updateAlertStatus(id, "Resolved");
  };

  // ==========================================================
  // ESCALATE
  // ==========================================================

  const escalateAlert = async (id) => {
    await updateAlertStatus(id, "Escalated");
  };

  // ==========================================================
  // UPDATE THRESHOLDS
  // ==========================================================

  const updateThresholds = (newThresholds) => {
    setThresholds(newThresholds);

    setAlerts((previousAlerts) =>
      previousAlerts.map((alert) => {
        if (typeof alert.riskScore !== "number") {
          return alert;
        }

        return {
          ...alert,

          riskLevel: calculateRiskLevel(alert.riskScore, newThresholds),
        };
      }),
    );
  };

  // ==========================================================
  // DISPATCH EMERGENCY TEAM
  // ==========================================================

  const dispatchEmergencyUnit = async (areaId, unitName) => {
    if (!areaId) {
      throw new Error("Emergency area ID is required.");
    }

    if (!unitName || !unitName.trim()) {
      throw new Error("Response unit is required.");
    }

    try {
      console.log("[AlertContext] Dispatching:", {
        areaId,
        unitName,
      });

      const response = await emergencyApi.dispatchTeam(areaId, unitName.trim());

      console.log("[AlertContext] Dispatch successful:", response);

      // Refresh emergency data

      await loadEmergencyAreas();

      // Refresh resources

      await loadResources();

      return response;
    } catch (error) {
      console.error("[AlertContext] Dispatch failed:", error);

      throw error;
    }
  };

  // ==========================================================
  // MARK NOTIFICATION READ
  // ==========================================================

  const markNotificationRead = async (id) => {
    if (!id) {
      return;
    }

    try {
      await notificationApi.markAsRead(id);

      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) =>
          notification._id === id || notification.id === id
            ? {
                ...notification,
                read: true,
              }
            : notification,
        ),
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);

      throw error;
    }
  };

  // ==========================================================
  // MARK ALL NOTIFICATIONS READ
  // ==========================================================

  const markAllNotificationsRead = () => {
    setNotifications((previousNotifications) =>
      previousNotifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    );
  };

  // ==========================================================
  // SEND CUSTOM NOTIFICATION
  // ==========================================================

  const sendCustomNotification = async (payload = {}) => {
    try {
      const response = await notificationApi.sendBroadcast({
        channel: payload.channel || "in_app",

        type: payload.type || "info",

        title: {
          en: payload.titleEn || payload.title || "Notification",

          hi: payload.titleHi || payload.titleEn || payload.title || "सूचना",
        },

        message: {
          en: payload.messageEn || payload.message || "",

          hi: payload.messageHi || payload.messageEn || payload.message || "",
        },

        targetAudience: payload.targetAudience || "General Public",
      });

      const savedNotification = response?.data;

      if (savedNotification) {
        setNotifications((previousNotifications) => [
          savedNotification,
          ...previousNotifications,
        ]);
      }

      // Browser notification

      if (payload.channel === "browser" || payload.type === "critical") {
        try {
          await notificationService.sendBrowserNotification(
            payload.titleEn || payload.title || "SENTRY · SIH26191 Alert",

            {
              body: payload.messageEn || payload.message || "",

              tag: "cascade-custom",
            },
          );
        } catch (browserError) {
          console.warn("Browser notification unavailable:", browserError);
        }
      }

      return savedNotification;
    } catch (error) {
      console.error("Failed to send notification:", error);

      throw error;
    }
  };

  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const contextValue = {
    // Alerts

    alerts,
    alertsLoading,
    alertsError,
    loadAlerts,

    acknowledgeAlert,

    resolveAlert,

    escalateAlert,

    // Notifications

    notifications,
    notificationsLoading,
    notificationsError,
    loadNotifications,

    markNotificationRead,

    markAllNotificationsRead,

    sendCustomNotification,

    // Emergency

    emergencyAreas,
    emergencyAreasLoading,
    emergencyAreasError,
    loadEmergencyAreas,

    dispatchEmergencyUnit,

    // Resources

    resources,
    resourcesLoading,
    resourcesError,
    loadResources,

    // Risk

    thresholds,

    updateThresholds,
  };

  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
    </AlertContext.Provider>
  );
};

// ============================================================
// HOOK
// ============================================================

export const useAlerts = () => {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error("useAlerts must be used within AlertProvider");
  }

  return context;
};

export default AlertContext;
