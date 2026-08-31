/**
 * Overlay Priority Engine for CASCADE-NET GIS
 * Deterministically controls in-map tactical label visibility based on priority,
 * HUD mode ('tactical' | 'operator' | 'minimal'), and zoom level.
 */

export const PRIORITY_WEIGHTS = {
  CRITICAL_INCIDENT: 100,
  BLOCKED_ROAD: 90,
  PRIMARY_ROUTE: 80,
  SIMULATION_TARGET: 75,
  SELECTED_ENTITY: 60,
  WARNING_INCIDENT: 40,
  FACILITY_ACCESS_ALERT: 50,
  ROUTINE_FACILITY: 20,
  ROUTINE_RESOURCE: 15,
  ROUTINE_ROAD: 10
};

/**
 * Evaluates whether a tactical label should be rendered on the map.
 * 
 * @param {number} priority - The item's priority score (0-100)
 * @param {string} hudMode - Current HUD mode ('tactical' | 'operator' | 'minimal')
 * @param {boolean} isSelected - Whether the feature is currently selected by user
 * @param {boolean} isHovered - Whether user is currently hovering over feature
 * @returns {boolean} Whether to show the label
 */
export function shouldShowLabel(priority, hudMode = 'tactical', isSelected = false, isHovered = false) {
  // If user explicitly hovered or selected, always display
  if (isSelected || isHovered) return true;

  if (hudMode === 'minimal') {
    // In minimal mode, only display critical alerts (score >= 90)
    return priority >= 90;
  }

  if (hudMode === 'operator') {
    // In operator mode, display high-value items (score >= 80)
    return priority >= 80;
  }

  // In tactical mode, display priority >= 75
  return priority >= 75;
}
