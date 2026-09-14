import React from 'react';
import { Marker } from 'react-leaflet';
import {
  createIncidentIcon,
  createHospitalIcon,
  createShelterIcon,
  createResourceIcon,
  createWaypointIcon,
  createVillageIcon
} from './gisIcons';

/**
 * GisMarker — Reusable Leaflet Marker Component for CASCADE-NET
 * 
 * Props:
 * - position: [lat, lng] (Required)
 * - kind: 'incident' | 'hospital' | 'shelter' | 'resource' | 'waypoint'
 * - severity: 'Critical' | 'High' | 'Warning' | 'Operational'
 * - roadAccess: 'Open' | 'Blocked'
 * - status: 'Available' | 'Deployed' | 'Active'
 * - resourceType: 'Rescue Team' | 'Ambulance' | 'Generator'
 * - waypointLabel: 'A' | 'B'
 * - isDestination: boolean
 * - isSelected: boolean
 * - onClick: callback
 * - children: Optional Popup / Tooltip component
 */
export default function GisMarker({
  position,
  kind = 'incident',
  severity = 'Warning',
  riskLevel,
  connectivityStatus = 'Connected',
  roadAccess = 'Open',
  status = 'Active',
  resourceType = 'Rescue Team',
  waypointLabel = 'A',
  isDestination = false,
  isSelected = false,
  onClick,
  children
}) {
  if (!position || typeof position[0] !== 'number' || typeof position[1] !== 'number') {
    return null;
  }

  let icon;
  switch (kind) {
    case 'village':
      icon = createVillageIcon(riskLevel || severity, connectivityStatus, isSelected);
      break;
    case 'waypoint':
      icon = createWaypointIcon(waypointLabel, isDestination);
      break;
    case 'hospital':
      icon = createHospitalIcon(roadAccess, isSelected);
      break;
    case 'shelter':
      icon = createShelterIcon(isSelected);
      break;
    case 'resource':
      icon = createResourceIcon(resourceType, status, isSelected);
      break;
    case 'incident':
    default:
      icon = createIncidentIcon(severity, isSelected);
      break;
  }

  return (
    <Marker
      position={position}
      icon={icon}
      eventHandlers={onClick ? { click: onClick } : undefined}
    >
      {children}
    </Marker>
  );
}
