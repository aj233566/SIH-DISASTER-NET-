import React, { useState } from 'react';
import { Sliders, Zap, CloudRain, CheckCircle2, RotateCcw } from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';
import { useLanguage } from '../../context/LanguageContext';

export const ThresholdSimulator = () => {
  const { thresholds, updateThresholds, triggerSpikeSimulation, isSimulating, lastSpikeMessage } = useAlerts();
  const { t } = useLanguage();
  const [selectedDistrict, setSelectedDistrict] = useState('Mangan');

  const handleCriticalChange = (e) => {
    const val = Number(e.target.value);
    updateThresholds({ ...thresholds, critical: val });
  };

  const handleHighChange = (e) => {
    const val = Number(e.target.value);
    updateThresholds({ ...thresholds, high: val });
  };

  const handleModerateChange = (e) => {
    const val = Number(e.target.value);
    updateThresholds({ ...thresholds, moderate: val });
  };

  const resetThresholds = () => {
    updateThresholds({ critical: 80, high: 65, moderate: 40 });
  };

  return (
    <div className="simulator-panel">
      <div className="simulator-header">
        <div className="simulator-title">
          <Sliders size={18} color="var(--info)" />
          <span>{t('alerts.thresholdSimulator')}</span>
        </div>
        <button
          className="btn-ops btn-ops-sm"
          onClick={resetThresholds}
          title="Reset thresholds to defaults"
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </button>
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
        {t('alerts.thresholdDescription')}
      </p>

      <div className="simulator-controls-row">
        {/* Moderate Threshold */}
        <div className="slider-group">
          <div className="slider-label">
            <span>{t('common.moderate')} Threshold</span>
            <span className="val" style={{ color: 'var(--warning)' }}>&ge; {thresholds.moderate}%</span>
          </div>
          <input
            type="range"
            min="20"
            max="60"
            value={thresholds.moderate}
            onChange={handleModerateChange}
            className="ops-range-input"
          />
        </div>

        {/* High Risk Threshold */}
        <div className="slider-group">
          <div className="slider-label">
            <span>{t('common.high')} Threshold</span>
            <span className="val" style={{ color: 'var(--high-risk)' }}>&ge; {thresholds.high}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="80"
            value={thresholds.high}
            onChange={handleHighChange}
            className="ops-range-input"
          />
        </div>

        {/* Critical Threshold */}
        <div className="slider-group">
          <div className="slider-label">
            <span>{t('common.critical')} Threshold</span>
            <span className="val" style={{ color: 'var(--critical)' }}>&ge; {thresholds.critical}%</span>
          </div>
          <input
            type="range"
            min="70"
            max="95"
            value={thresholds.critical}
            onChange={handleCriticalChange}
            className="ops-range-input"
          />
        </div>

        {/* Ingestion Trigger Button */}
        <div className="simulator-trigger-group">
          <select
            className="ops-select"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            style={{ height: '36px' }}
          >
            <option value="Mangan">Mangan, Sikkim</option>
            <option value="Haflong">Haflong, Assam</option>
            <option value="Aizawl">Aizawl, Mizoram</option>
            <option value="Kohima">Kohima, Nagaland</option>
            <option value="Tupul">Tupul, Manipur</option>
          </select>

          <button
            className="btn-ops btn-ops-critical"
            style={{ height: '36px' }}
            onClick={() => triggerSpikeSimulation(selectedDistrict)}
            disabled={isSimulating}
          >
            {isSimulating ? (
              <>
                <CloudRain size={15} className="spinner-border spinner-border-sm" />
                <span>{t('common.simulatingSpike')}</span>
              </>
            ) : (
              <>
                <Zap size={15} />
                <span>{t('common.triggerSpike')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {lastSpikeMessage && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '4px',
          borderLeft: '3px solid var(--critical)',
          fontSize: '0.78rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text-secondary)'
        }}>
          <CheckCircle2 size={14} color="var(--safe)" />
          <span>
            <strong>Simulation Telemetry Broadcast:</strong> {lastSpikeMessage.title} at {lastSpikeMessage.timestamp}
          </span>
        </div>
      )}
    </div>
  );
};

export default ThresholdSimulator;
