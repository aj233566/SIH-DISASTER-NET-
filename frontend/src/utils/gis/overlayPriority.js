/**
 * ============================================================================
 * OVERLAY PRIORITY ENGINE — CASCADE-NET GIS MODULE
 * ============================================================================
 * 
 * DETERMINISTIC COLLISION AVOIDANCE & SPATIAL HIERARCHY:
 * Level 1 (Weight 100): Critical Incidents (Direction: 'top', Offset: [0, -22])
 * Level 2 (Weight 90):  Blocked Mountain Roads (Direction: 'right', Offset: [16, 0])
 * Level 3 (Weight 75):  Primary Evacuation Route (Direction: 'bottom', Offset: [0, 16])
 * Level 4 (Weight 70):  Hospital & Emergency Care Access (Direction: 'left', Offset: [-16, 0])
 * Level 5 (Weight 50):  Isolated Mountain Villages (On Selection/Hover)
 * Level 6 (Weight 40):  Relief Assets & Earthmovers (On Selection/Hover)
 * 
 * SPATIAL COLLISION RULE:
 * In default 'tactical' mode, only Level 1 and Level 2 render persistent badges
 * at opposing vectors (top and right) to prevent any label stacking at Singtam.
 * Secondary labels reveal dynamically on hover or selection.
 * ============================================================================
 */

export const PRIORITY_WEIGHTS = {
  CRITICAL_INCIDENT: 100,
  BLOCKED_ROAD: 90,
  PRIMARY_ROUTE: 75,
  FACILITY_ALERT: 70,
  SIMULATION_TARGET: 65,
  SELECTED_ENTITY: 60,
  ISOLATED_VILLAGE: 50,
  WARNING_INCIDENT: 45,
  ROUTINE_RESOURCE: 40,
  ROUTINE_FACILITY: 30,
  ROUTINE_ROAD: 20
};

/**
 * Evaluates whether a tactical label should be permanently visible on the map.
 * 
 * @param {number} priority - The item's priority score (0-100)
 * @param {string} hudMode - Current HUD mode ('tactical' | 'operator' | 'minimal')
 * @param {boolean} isSelected - Whether the feature is currently selected by user
 * @param {boolean} isHovered - Whether user is currently hovering over feature
 * @returns {boolean} Whether to show the permanent badge
 */
export function shouldShowLabel(priority, hudMode = 'tactical', isSelected = false, isHovered = false) {
  // If explicitly selected or hovered, always render label
  if (isSelected || isHovered) return true;

  if (hudMode === 'minimal') {
    // In minimal mode, only display highest severity (score >= 95)
    return priority >= 95;
  }

  if (hudMode === 'operator') {
    // In operator mode, display high-value items (score >= 85)
    return priority >= 85;
  }

  // In tactical mode: Only Critical Incidents (100) and Blocked Roads (90) render permanently
  // to avoid label stacking at clustered disaster coordinates.
  return priority >= 90;
}
