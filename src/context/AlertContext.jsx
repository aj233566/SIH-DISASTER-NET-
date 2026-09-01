/**
 * ==============================================================================
 * CASCADE-NET | AlertContext.jsx
 * ==============================================================================
 * Central State Management for Early Warning Alerts, Live Telemetry Simulation,
 * Multi-Channel Notifications, and Emergency Response Prioritisation Queues.
 * 
 * Assigned Developer: Divya (Frontend Specialist)
 * Team Integration:
 * - Consumes Risk Engine telemetry (Rudra)
 * - Feeds GIS Map & spatial zones (Sampad)
 * - Connected to REST API service layer (Abhijett)
 * ==============================================================================
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialAlerts } from '../data/alerts';
import { initialNotifications } from '../data/notifications';
import { initialEmergencyAreas } from '../data/emergencyData';
import { initialResources } from '../data/resourcesData';
import { notificationService } from '../services/notificationService';
import { calculateRiskLevel, calculatePriorityScore, determinePriorityQueue } from '../services/riskEngine';
import { alertApi, notificationApi, emergencyApi, resourcesApi } from '../services/api';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  // Master state collections
  const [alerts, setAlerts] = useState(initialAlerts);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [emergencyAreas, setEmergencyAreas] = useState(initialEmergencyAreas);
  const [resources, setResources] = useState(initialResources);

  // Dynamic Risk Thresholds (Critical, High, Moderate)
  const [thresholds, setThresholds] = useState({
    critical: 80,
    high: 65,
    moderate: 40
  });

  // Simulation flags for real-time demonstration
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastSpikeMessage, setLastSpikeMessage] = useState(null);

  /**
   * Initial data synchronization from API service layer
   * (Falls back to mock data seamlessly if backend server is not yet reachable)
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alertsData, notifsData, areasData, resData] = await Promise.all([
          alertApi.getAlerts(),
          notificationApi.getNotifications(),
          emergencyApi.getPrioritisedAreas(),
          resourcesApi.getResources()
        ]);
        if (alertsData) setAlerts(alertsData);
        if (notifsData) setNotifications(notifsData);
        if (areasData) setEmergencyAreas(areasData);
        if (resData) setResources(resData);
      } catch (e) {
        console.warn('API fetch error; using local mock state:', e);
      }
    };
    fetchData();
  }, []);

  /**
   * Dynamic Threshold Calibration:
   * Recalculates risk levels (Low/Moderate/High/Critical) across all monitored zones
   * whenever thresholds are adjusted by the user in the ThresholdSimulator.
   */
  const updateThresholds = (newThresholds) => {
    setThresholds(newThresholds);
    setAlerts(prev =>
      prev.map(alert => {
        const newLevel = calculateRiskLevel(alert.riskScore, newThresholds);
        return { ...alert, riskLevel: newLevel };
      })
    );
  };

  /**
   * Acknowledge an active early warning alert (Field Officer / Authority action)
   */
  const acknowledgeAlert = (id) => {
    setAlerts(prev =>
      prev.map(a => (a.id === id ? { ...a, status: 'Acknowledged' } : a))
    );
    alertApi.updateAlertStatus(id, 'Acknowledged');
  };

  /**
   * Mark an alert as resolved when slope stability returns to safe baseline
   */
  const resolveAlert = (id) => {
    setAlerts(prev =>
      prev.map(a => (a.id === id ? { ...a, status: 'Resolved' } : a))
    );
    alertApi.updateAlertStatus(id, 'Resolved');
  };

  /**
   * Escalate an alert directly to Critical / Priority 1 (Authority Emergency Trigger)
   */
  const escalateAlert = (id) => {
    setAlerts(prev =>
      prev.map(a => {
        if (a.id === id) {
          return {
            ...a,
            riskScore: Math.max(a.riskScore, 92),
            riskLevel: 'Critical',
            status: 'Escalated',
            assignedPriority: 'Priority 1'
          };
        }
        return a;
      })
    );

    // Update corresponding emergency queue to Priority 1
    setEmergencyAreas(prev =>
      prev.map(area => {
        const match = alerts.find(a => a.id === id);
        if (match && area.location.includes(match.state || match.location)) {
          return {
            ...area,
            priorityQueue: 'Priority 1',
            riskLevel: 'Critical',
            riskScore: 95
          };
        }
        return area;
      })
    );
  };

  /**
   * Dispatch Emergency Quick Response Team:
   * Assigns rescue units (NDRF, SDRF, ALS ambulances, heavy earthmovers)
   * to target coordinates and updates status to 'In Transit'.
   */
  const dispatchEmergencyUnit = (areaId, unitName) => {
    setEmergencyAreas(prev =>
      prev.map(area => {
        if (area.id === areaId) {
          const currentTeams = area.availableResources?.assignedTeams || [];
          return {
            ...area,
            responseStatus: 'In Transit',
            availableResources: {
              ...area.availableResources,
              assignedTeams: [...currentTeams, unitName]
            },
            lastActionTimestamp: new Date().toISOString()
          };
        }
        return area;
      })
    );

    // Automatically generate an In-App notification event for the command center
    const newNotif = {
      id: `NOTIF-DISPATCH-${Date.now()}`,
      channel: 'in_app',
      type: 'info',
      title: {
        en: `Unit Dispatched: ${unitName}`,
        hi: `इकाई रवाना: ${unitName}`
      },
      message: {
        en: `Response unit ${unitName} deployed to target area coordinates. ETA: 25 mins.`,
        hi: `बचाव इकाई ${unitName} को लक्ष्य क्षेत्र में तैनात किया गया। अनुमानित समय: 25 मिनट।`
      },
      targetAudience: 'Incident Command Post',
      timestamp: new Date().toISOString(),
      read: false,
      delivered: true
    };
    setNotifications(prev => [newNotif, ...prev]);
    emergencyApi.dispatchTeam(areaId, unitName);
  };

  /**
   * Notification read/unread management
   */
  const markNotificationRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    notificationApi.markAsRead(id);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  /**
   * Compose and broadcast custom multi-channel notification
   */
  const sendCustomNotification = (payload) => {
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      channel: payload.channel || 'in_app',
      type: payload.type || 'info',
      title: {
        en: payload.titleEn || payload.title,
        hi: payload.titleHi || payload.title
      },
      message: {
        en: payload.messageEn || payload.message,
        hi: payload.messageHi || payload.message
      },
      targetAudience: payload.targetAudience || 'General Public',
      smsTemplateId: payload.channel === 'sms' ? 'DLT-NER-MANUAL-09' : undefined,
      emailSubject: payload.channel === 'email' ? payload.titleEn || payload.title : undefined,
      timestamp: new Date().toISOString(),
      read: false,
      delivered: true
    };

    setNotifications(prev => [newNotif, ...prev]);

    // Fire browser push notification if supported
    if (payload.channel === 'push' || payload.type === 'critical') {
      notificationService.sendBrowserNotification(payload.titleEn || payload.title, {
        body: payload.messageEn || payload.message,
        tag: 'cascade-custom'
      });
    }

    notificationApi.sendBroadcast(newNotif);
  };

  /**
   * DEMO FLOW SIMULATOR:
   * Simulates an unexpected cloudburst & rainfall risk spike in North Eastern Region.
   * Telemetry Ingestion -> Risk Threshold Crossed -> Critical Alert Created ->
   * Push Notification Triggered -> Promoted to Priority 1 Response Queue.
   */
  const triggerSpikeSimulation = (customDistrict = 'Mangan') => {
    setIsSimulating(true);

    setTimeout(() => {
      const spikeScore = Math.floor(Math.random() * 8) + 92; // 92 - 99% composite risk
      const rainfall = (Math.random() * 40 + 210).toFixed(1); // 210 - 250mm
      const soilMoist = (Math.random() * 3 + 95).toFixed(1); // 95 - 98% saturation

      const spikeAlert = {
        id: `ALT-NER-${Date.now().toString().slice(-4)}`,
        location: `${customDistrict} Sector, North Sikkim`,
        state: 'Sikkim',
        coordinates: [27.5029 + (Math.random() * 0.05 - 0.025), 88.5284 + (Math.random() * 0.05 - 0.025)],
        riskLevel: 'Critical',
        riskScore: spikeScore,
        rainfall72h: parseFloat(rainfall),
        soilMoisture: parseFloat(soilMoist),
        slopeAngle: 48.2,
        seismicActivity: 'Micro-tremor spike 2.8 Richter',
        contributingFactors: [
          {
            factor: 'Severe Cloudburst Telemetry',
            detail: `${rainfall}mm rainfall in last 6 hours exceeding threshold`,
            detailHi: `पिछले 6 घंटों में ${rainfall} मिमी मूसलाधार बारिश दर्ज`
          },
          {
            factor: 'Critical Slope Pore Pressure',
            detail: `Pore pressure saturation reached ${soilMoist}%`,
            detailHi: `मृदा नमी संतृप्ति ${soilMoist}% के गंभीर स्तर पर`
          },
          {
            factor: 'Immediate Road Disruption',
            detail: 'Debris blockage reported on vital evacuation bypass',
            detailHi: 'निकासी मार्ग पर भारी मलबा गिरने से सड़क बाधित'
          }
        ],
        timestamp: new Date().toISOString(),
        status: 'Active',
        affectedPopulation: 16500,
        roadStatus: 'Blocked',
        assignedPriority: 'Priority 1',
        recommendedAction: {
          en: `Mandatory evacuation initiated in ${customDistrict}. NDRF Special Quick Action Team dispatched.`,
          hi: `${customDistrict} में अनिवार्य निकासी शुरू। एनडीआरएफ त्वरित कार्रवाई दल रवाना।`
        },
        guidance: {
          citizen: {
            en: [
              'Move immediately to designated elevated relief camps.',
              'Stay away from swollen hill torrents and riverbanks.',
              'Call 1070 for emergency evacuation assistance.'
            ],
            hi: [
              'तुरंत ऊंचाई पर स्थित नामित राहत शिविरों में जाएं।',
              'उफनते पहाड़ी नालों और नदी तटों से दूर रहें।',
              'आपातकालीन सहायता के लिए 1070 पर संपर्क करें।'
            ]
          },
          fieldOfficer: {
            en: [
              'Deploy wireless repeater at nearest hill saddle.',
              'Broadcast live siren alert to downstream habitations.'
            ],
            hi: [
              'निकटतम पहाड़ी बिंदु पर वायरलेस रिपीटर चालू करें।',
              'निचली बस्तियों के लिए आपातकालीन सायरन बजाएं।'
            ]
          },
          authority: {
            en: [
              'Issue Red Code alert to State Disaster Executive Committee.',
              'Direct civil defense and earthmover taskforce to standby positions.'
            ],
            hi: [
              'राज्य आपदा प्रबंधन समिति को रेड कोड अलर्ट जारी करें।',
              'नागरिक सुरक्षा और जेसीबी टास्कफोर्स को तैनात करें।'
            ]
          }
        },
        nearbyShelter: {
          name: `${customDistrict} Primary Relief Shelter`,
          capacity: 1500,
          occupied: 520,
          distanceKm: 2.4
        },
        nearestHospital: {
          name: `${customDistrict} Emergency Hospital`,
          beds: 70,
          icuAvailable: 6,
          distanceKm: 3.1
        }
      };

      // 1. Add alert to master collection
      setAlerts(prev => [spikeAlert, ...prev]);

      // 2. Dispatch browser notification
      const notifTitle = `CRITICAL ALERT: Landslide Risk Spike in ${customDistrict} (${spikeScore}%)`;
      const notifBody = `Rainfall reached ${rainfall}mm. Road is Blocked. Immediate evacuation order issued.`;

      notificationService.sendBrowserNotification(notifTitle, {
        body: notifBody,
        tag: `spike-${Date.now()}`,
        requireInteraction: true
      });

      // 3. Dispatch In-App & Multi-channel notification
      const newNotif = {
        id: `NOTIF-SPIKE-${Date.now()}`,
        channel: 'push',
        type: 'critical',
        alertId: spikeAlert.id,
        title: {
          en: notifTitle,
          hi: `गंभीर अलर्ट: ${customDistrict} में भूस्खलन जोखिम में भारी वृद्धि (${spikeScore}%)`
        },
        message: {
          en: notifBody,
          hi: `वर्षा ${rainfall} मिमी तक पहुंच गई। मार्ग अवरुद्ध। तत्काल निकासी का आदेश।`
        },
        targetAudience: `Citizens & First Responders in ${customDistrict}`,
        timestamp: new Date().toISOString(),
        read: false,
        delivered: true
      };
      setNotifications(prev => [newNotif, ...prev]);

      // 4. Elevate zone into Priority 1 Emergency Response Queue
      const newEmergencyArea = {
        id: `EMP-${Date.now().toString().slice(-4)}`,
        location: `${customDistrict} High-Risk Valley Belt`,
        district: customDistrict,
        state: 'Sikkim',
        coordinates: spikeAlert.coordinates,
        priorityQueue: 'Priority 1',
        priorityRank: 1,
        riskScore: spikeScore,
        riskLevel: 'Critical',
        affectedPopulation: 16500,
        vulnerablePopulation: 4200,
        roadStatus: 'Blocked',
        roadDetails: {
          en: 'Main highway corridor cut off by major active debris slide',
          hi: 'सक्रिय मलबे के कारण मुख्य राजमार्ग पूरी तरह अवरुद्ध'
        },
        nearestHospital: spikeAlert.nearestHospital,
        nearestShelter: spikeAlert.nearbyShelter,
        availableResources: {
          assignedTeams: ['NDRF Special QRT 4'],
          ambulances: 5,
          earthmovers: 4,
          medicalOfficers: 6
        },
        responseStatus: 'In Transit',
        lastActionTimestamp: new Date().toISOString()
      };
      setEmergencyAreas(prev => [newEmergencyArea, ...prev]);

      setLastSpikeMessage({
        title: notifTitle,
        timestamp: new Date().toLocaleTimeString()
      });
      setIsSimulating(false);
    }, 900);
  };

  return (
    <AlertContext.Provider
      value={{
        alerts,
        notifications,
        emergencyAreas,
        resources,
        thresholds,
        isSimulating,
        lastSpikeMessage,
        updateThresholds,
        acknowledgeAlert,
        resolveAlert,
        escalateAlert,
        dispatchEmergencyUnit,
        markNotificationRead,
        markAllNotificationsRead,
        sendCustomNotification,
        triggerSpikeSimulation
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};
