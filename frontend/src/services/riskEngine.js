/**
 * ==============================================================================
 * CASCADE-NET | riskEngine.js
 * ==============================================================================
 * Priority & Risk Mathematical Calculation Engine
 * 
 * Implements the official weighting formula for ranking disaster-impacted zones:
 * - Risk Severity: 40%
 * - Population Impact: 25% (normalized against max sector density)
 * - Road Isolation Factor: 20% (Blocked = 100, Partial = 60, Open = 20)
 * - Resource Proximity / Deficit: 15% (Deficit penalty if no teams assigned)
 * ==============================================================================
 */

/**
 * Classifies composite numerical risk score into standardized severity categories
 * @param {number} score - 0 to 100 composite risk score
 * @param {Object} thresholds - Calibrated trigger levels
 * @returns {'Critical' | 'High' | 'Moderate' | 'Low'}
 */
export const calculateRiskLevel = (score, thresholds = { critical: 80, high: 65, moderate: 40 }) => {
  if (score >= thresholds.critical) return 'Critical';
  if (score >= thresholds.high) return 'High';
  if (score >= thresholds.moderate) return 'Moderate';
  return 'Low';
};

/**
 * Computes the Multi-Factor Emergency Prioritisation Score (0 to 100)
 * @param {Object} area - Impacted area object with telemetry, population, and road status
 * @returns {number} - Composite Priority Score
 */
export const calculatePriorityScore = (area) => {
  const riskWeight = 0.40;
  const popWeight = 0.25;
  const roadWeight = 0.20;
  const resourceWeight = 0.15;

  const riskComponent = area.riskScore || 50;

  // Normalize population (up to 15,000 max scale for hill districts)
  const popComponent = Math.min(100, ((area.affectedPopulation || 1000) / 15000) * 100);

  // Road Connectivity isolation penalty
  let roadComponent = 20;
  if (area.roadStatus === 'Blocked') roadComponent = 100;
  else if (area.roadStatus === 'Partially Obstructed') roadComponent = 60;

  // Resource availability deficit factor (higher score = greater urgency)
  const teamsCount = area.availableResources?.assignedTeams?.length || 0;
  const ambulanceCount = area.availableResources?.ambulances || 0;
  let resourceDeficit = 50;
  if (teamsCount === 0 || ambulanceCount === 0) resourceDeficit = 95;
  else if (teamsCount >= 2 && ambulanceCount >= 4) resourceDeficit = 25;

  const totalScore = (
    riskComponent * riskWeight +
    popComponent * popWeight +
    roadComponent * roadWeight +
    resourceDeficit * resourceWeight
  );

  return Math.round(totalScore);
};

/**
 * Maps calculated priority score and road status to Priority 1, 2, or 3 queues
 * @param {number} priorityScore - 0-100 score
 * @param {string} riskLevel - Critical | High | Moderate | Low
 * @param {string} roadStatus - Blocked | Partially Obstructed | Open
 * @returns {'Priority 1' | 'Priority 2' | 'Priority 3'}
 */
export const determinePriorityQueue = (priorityScore, riskLevel, roadStatus) => {
  if (riskLevel === 'Critical' || priorityScore >= 75 || roadStatus === 'Blocked') {
    return 'Priority 1';
  }
  if (riskLevel === 'High' || priorityScore >= 55) {
    return 'Priority 2';
  }
  return 'Priority 3';
};
