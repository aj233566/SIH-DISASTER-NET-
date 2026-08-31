import React from 'react';
import { Tooltip } from 'react-leaflet';
import GisMarker from '../GisMarker';
import MapPopup from '../MapPopup';

export default function FacilityLayer({
  hospitals = [],
  shelters = [],
  selectedFacilityId = null,
  onSelectFacility
}) {
  const filterValidLocations = (items) =>
    Array.isArray(items)
      ? items.filter(
          (item) =>
            item &&
            item.location &&
            typeof item.location.lat === 'number' &&
            !isNaN(item.location.lat) &&
            typeof item.location.lng === 'number' &&
            !isNaN(item.location.lng)
        )
      : [];

  const validHospitals = filterValidLocations(hospitals);
  const validShelters = filterValidLocations(shelters);

  return (
    <>
      {/* 1. Hospital Markers */}
      {validHospitals.map((hospital) => {
        const isSelected = selectedFacilityId === hospital.id;
        const position = [hospital.location.lat, hospital.location.lng];
        const isAccessBlocked = hospital.roadAccess === 'Blocked';

        return (
          <GisMarker
            key={hospital.id}
            kind="hospital"
            position={position}
            roadAccess={hospital.roadAccess}
            isSelected={isSelected}
            onClick={onSelectFacility ? () => onSelectFacility(hospital) : undefined}
          >
            {isAccessBlocked ? (
              <Tooltip
                permanent
                direction="top"
                offset={[0, -18]}
                className="gis-tactical-label-permanent critical-label"
              >
                <span>[{hospital.id}] ACCESS BLOCKED</span>
              </Tooltip>
            ) : (
              <Tooltip direction="top" offset={[0, -18]} className="gis-tactical-tooltip-contextual">
                <span>{hospital.name} [ACCESS OPEN]</span>
              </Tooltip>
            )}

            <MapPopup
              title={hospital.name}
              type="Emergency Hospital"
              severity={isAccessBlocked ? 'Critical' : 'Operational'}
              status={hospital.status || 'Operational'}
              location={hospital.location}
              description={hospital.contact ? `Emergency Contact: ${hospital.contact}` : null}
              metrics={[
                { label: 'Total Capacity', value: `${hospital.totalBeds} Beds` },
                { label: 'Available Beds', value: `${hospital.availableBeds} Available` },
                {
                  label: 'Road Access',
                  value: isAccessBlocked ? 'BLOCKED (R17)' : 'OPEN'
                }
              ]}
            />
          </GisMarker>
        );
      })}

      {/* 2. Shelter Markers */}
      {validShelters.map((shelter) => {
        const isSelected = selectedFacilityId === shelter.id;
        const position = [shelter.location.lat, shelter.location.lng];
        const occupancyPct =
          shelter.totalCapacity > 0
            ? Math.round((shelter.currentOccupancy / shelter.totalCapacity) * 100)
            : 0;
        const isNearCapacity = occupancyPct >= 80;

        return (
          <GisMarker
            key={shelter.id}
            kind="shelter"
            position={position}
            isSelected={isSelected}
            onClick={onSelectFacility ? () => onSelectFacility(shelter) : undefined}
          >
            <Tooltip direction="top" offset={[0, -18]} className="gis-tactical-tooltip-contextual">
              <span>{shelter.name} ({occupancyPct}% Occ)</span>
            </Tooltip>
            <MapPopup
              title={shelter.name}
              type="Relief Shelter"
              severity={isNearCapacity ? 'High' : 'Operational'}
              status={shelter.status || 'Operational'}
              location={shelter.location}
              description={`Supplies: ${shelter.foodStatus || 'Adequate'} | Power: ${shelter.powerStatus || 'Normal'}`}
              metrics={[
                { label: 'Total Capacity', value: `${shelter.totalCapacity} People` },
                { label: 'Current Occupancy', value: `${shelter.currentOccupancy} (${occupancyPct}%)` },
                {
                  label: 'Available Space',
                  value: `${Math.max(0, shelter.totalCapacity - shelter.currentOccupancy)} slots`
                }
              ]}
            />
          </GisMarker>
        );
      })}
    </>
  );
}
