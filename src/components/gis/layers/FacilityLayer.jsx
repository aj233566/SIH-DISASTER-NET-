import React, { memo } from 'react';
import { Tooltip } from 'react-leaflet';
import GisMarker from '../GisMarker';
import MapPopup from '../MapPopup';
import { shouldShowLabel, PRIORITY_WEIGHTS } from '../../../utils/gis/overlayPriority';

function FacilityLayer({
  hospitals = [],
  shelters = [],
  visibleHospitals = true,
  visibleShelters = true,
  selectedFacilityId = null,
  onSelectFacility,
  hudMode = 'tactical'
}) {
  return (
    <>
      {/* 1. Hospitals Layer */}
      {visibleHospitals &&
        hospitals.map((hospital) => {
          if (!hospital.location || typeof hospital.location.lat !== 'number') return null;

          const isSelected = selectedFacilityId === hospital.id;
          const isAccessBlocked = (hospital.roadAccess || '').toLowerCase() === 'blocked';
          const position = [hospital.location.lat, hospital.location.lng];

          const priority = isAccessBlocked
            ? PRIORITY_WEIGHTS.FACILITY_ALERT
            : PRIORITY_WEIGHTS.ROUTINE_FACILITY;

          const showLabel = shouldShowLabel(priority, hudMode, isSelected);

          return (
            <GisMarker
              key={hospital.id}
              kind="hospital"
              position={position}
              severity={isAccessBlocked ? 'Critical' : 'Operational'}
              isSelected={isSelected}
              onClick={onSelectFacility ? () => onSelectFacility(hospital) : undefined}
            >
              {showLabel && isSelected ? (
                <Tooltip
                  permanent
                  direction="left"
                  offset={[-16, 0]}
                  className={`gis-tactical-label-permanent ${isAccessBlocked ? 'blocked-road-label' : 'facility-label'}`}
                >
                  <span>[{hospital.id}] {isAccessBlocked ? 'ACCESS BLOCKED' : 'CLEAR'}</span>
                </Tooltip>
              ) : (
                <Tooltip direction="left" offset={[-14, 0]} className="gis-tactical-tooltip-contextual">
                  <span>[{hospital.id}] {hospital.name} ({hospital.availableBeds || 0} Beds)</span>
                </Tooltip>
              )}

              <MapPopup
                title={hospital.name}
                type="Medical Facility"
                severity={isAccessBlocked ? 'Critical' : 'Operational'}
                status={hospital.status || 'Operational'}
                location={hospital.location}
                metrics={[
                  { label: 'Facility ID', value: hospital.id },
                  { label: 'Road Access', value: hospital.roadAccess || 'Clear' },
                  { label: 'Available Beds', value: String(hospital.availableBeds || 0) }
                ]}
              />
            </GisMarker>
          );
        })}

      {/* 2. Relief Shelters Layer */}
      {visibleShelters &&
        shelters.map((shelter) => {
          if (!shelter.location || typeof shelter.location.lat !== 'number') return null;

          const isSelected = selectedFacilityId === shelter.id;
          const position = [shelter.location.lat, shelter.location.lng];

          return (
            <GisMarker
              key={shelter.id}
              kind="shelter"
              position={position}
              severity="Operational"
              isSelected={isSelected}
              onClick={onSelectFacility ? () => onSelectFacility(shelter) : undefined}
            >
              <Tooltip direction="top" offset={[0, -18]} className="gis-tactical-tooltip-contextual">
                <span>[{shelter.id}] {shelter.name} ({shelter.occupancy || 0}/{shelter.capacity || 0})</span>
              </Tooltip>

              <MapPopup
                title={shelter.name}
                type="Relief Shelter"
                severity="Operational"
                status={shelter.status || 'Operational'}
                location={shelter.location}
                metrics={[
                  { label: 'Shelter ID', value: shelter.id },
                  { label: 'Capacity', value: `${shelter.occupancy || 0} / ${shelter.capacity || 0}` }
                ]}
              />
            </GisMarker>
          );
        })}
    </>
  );
}

export default memo(FacilityLayer);
