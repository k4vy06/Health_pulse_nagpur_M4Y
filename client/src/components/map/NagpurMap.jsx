import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getRiskColor, getMapColor, formatNumber } from '../../utils/helpers';
import { RiskBadge, StatusBadge } from '../common/Badge';
import { Link } from 'react-router-dom';
import { Building2, Hospital, AlertTriangle, ArrowRight, Layers, Eye } from 'lucide-react';

// Custom facility divIcon generator
function createFacilityIcon(type, status) {
  const isPressure = status === 'PRESSURE' || status === 'CRITICAL';
  const bgClass = isPressure ? '#ef4444' : '#3b82f6';
  
  return L.divIcon({
    className: 'custom-facility-pin',
    html: `
      <div style="
        background: ${bgClass};
        width: 26px;
        height: 26px;
        border-radius: 8px;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        color: white;
        font-size: 13px;
        font-weight: bold;
      ">
        🏥
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13]
  });
}

function ChangeMapView({ coords, zoom }) {
  const map = useMap();
  if (coords) {
    map.setView(coords, zoom || map.getZoom());
  }
  return null;
}

export default function NagpurMap({
  wards = [],
  facilities = [],
  selectedWardId,
  onSelectWard,
  height = '500px',
  showFacilities = true,
  showWardCentroids = true
}) {
  const [mapLayer, setMapLayer] = useState('dark'); // 'dark' or 'street'
  const nagpurCenter = [21.1458, 79.0882]; // Central Nagpur Coordinates

  const tileUrls = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  };

  const selectedWard = wards.find(w => w.wardId === selectedWardId);
  const mapCenter = selectedWard?.centroid 
    ? [selectedWard.centroid.lat, selectedWard.centroid.lng] 
    : nagpurCenter;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-surface-600 shadow-2xl" style={{ height }}>
      {/* Layer Switcher */}
      <div className="absolute top-4 right-4 z-[400] flex items-center gap-2 bg-surface-900/90 backdrop-blur border border-surface-700 rounded-xl p-1.5 shadow-lg">
        <button
          onClick={() => setMapLayer('dark')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
            mapLayer === 'dark'
              ? 'bg-primary-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Dark Matrix
        </button>
        <button
          onClick={() => setMapLayer('street')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
            mapLayer === 'street'
              ? 'bg-primary-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Standard
        </button>
      </div>

      <MapContainer
        center={nagpurCenter}
        zoom={12}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap'
          url={tileUrls[mapLayer]}
          maxZoom={18}
        />

        {selectedWard?.centroid && (
          <ChangeMapView coords={[selectedWard.centroid.lat, selectedWard.centroid.lng]} zoom={13} />
        )}

        {/* Ward Circle Markers */}
        {showWardCentroids && wards.map((ward) => {
          if (!ward.centroid?.lat || !ward.centroid?.lng) return null;
          const isSelected = ward.wardId === selectedWardId;
          const fillColor = getMapColor(ward.currentRiskScore || 0);
          const radius = Math.max(16, Math.min(32, (ward.currentRiskScore || 20) / 3));

          return (
            <React.Fragment key={ward.wardId}>
              {/* Outer pulsing ring for critical/high risk */}
              {(ward.currentRiskLevel === 'CRITICAL' || ward.currentRiskLevel === 'HIGH') && (
                <CircleMarker
                  center={[ward.centroid.lat, ward.centroid.lng]}
                  radius={radius + 8}
                  pathOptions={{
                    color: fillColor,
                    weight: 1.5,
                    opacity: 0.4,
                    fillColor: fillColor,
                    fillOpacity: 0.15,
                    dashArray: '4, 4'
                  }}
                />
              )}

              {/* Core Centroid Marker */}
              <CircleMarker
                center={[ward.centroid.lat, ward.centroid.lng]}
                radius={radius}
                pathOptions={{
                  color: isSelected ? '#ffffff' : fillColor,
                  weight: isSelected ? 3 : 2,
                  fillColor: fillColor,
                  fillOpacity: isSelected ? 0.9 : 0.75,
                }}
                eventHandlers={{
                  click: () => {
                    if (onSelectWard) onSelectWard(ward);
                  }
                }}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-1 space-y-2 text-gray-100 min-w-[200px]">
                    <div className="flex items-center justify-between gap-2 border-b border-surface-700 pb-1.5">
                      <div>
                        <span className="text-[10px] font-mono text-gray-400">{ward.wardId}</span>
                        <h4 className="font-bold text-white text-sm leading-tight">{ward.name}</h4>
                      </div>
                      <RiskBadge level={ward.currentRiskLevel} size="xs" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs py-1">
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase block">Risk Score</span>
                        <span className="font-extrabold text-sm text-white">{ward.currentRiskScore}/100</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase block">Zone</span>
                        <span className="font-semibold text-gray-200">{ward.zone || 'Central'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase block">Population</span>
                        <span className="font-semibold text-gray-200">{formatNumber(ward.population)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase block">Status</span>
                        <span className="font-semibold text-amber-400">Surveillance Active</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-surface-700 flex items-center justify-between">
                      <Link
                        to={`/wards/${ward.wardId}`}
                        className="btn-primary text-xs w-full py-1.5 text-center flex items-center justify-center gap-1.5"
                      >
                        <span>Full Ward Dossier</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            </React.Fragment>
          );
        })}

        {/* Health Facilities Markers */}
        {showFacilities && facilities.map((fac) => {
          // Approximate coordinate placement based on parent ward or default
          const parentWard = wards.find(w => w.wardId === fac.wardId);
          if (!parentWard?.centroid) return null;
          
          // Slight jitter offset for visual clarity if multiple facilities in same ward
          const offsetLat = parentWard.centroid.lat + 0.003;
          const offsetLng = parentWard.centroid.lng + 0.003;

          return (
            <Marker
              key={fac._id}
              position={[offsetLat, offsetLng]}
              icon={createFacilityIcon(fac.type, fac.status)}
            >
              <Popup>
                <div className="p-1 space-y-2 text-gray-100 min-w-[210px]">
                  <div className="flex items-start justify-between gap-2 border-b border-surface-700 pb-1.5">
                    <div>
                      <span className="text-[10px] font-bold text-primary-400 uppercase">{fac.type?.replace('_', ' ')}</span>
                      <h4 className="font-bold text-white text-xs sm:text-sm">{fac.name}</h4>
                    </div>
                    <StatusBadge status={fac.status} size="xs" />
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-gray-300">
                      <span>Bed Availability:</span>
                      <span className="font-bold text-white">{fac.availableBeds} / {fac.beds} free</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Doctor Staff:</span>
                      <span className="font-semibold text-white">{fac.doctors || '3'} on duty</span>
                    </div>
                    <div className="text-[11px] text-gray-400 pt-1">
                      📍 {fac.address || 'Nagpur'}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
