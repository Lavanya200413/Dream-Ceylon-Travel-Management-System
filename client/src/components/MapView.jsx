import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Star } from 'lucide-react';

const defaultCenter = [7.8731, 80.7718]; // Sri Lanka center

const MapView = ({ destinations, routeCoordinates }) => {
  const mapCenter = destinations && destinations.length === 1 && destinations[0].latitude && destinations[0].longitude
    ? [destinations[0].latitude, destinations[0].longitude]
    : defaultCenter;
    
  const zoomLevel = destinations && destinations.length === 1 ? 12 : 7;

  return (
    <div style={{ minHeight: '500px', height: '100%', width: '100%', zIndex: 1 }}>
      <MapContainer center={mapCenter} zoom={zoomLevel} style={{ minHeight: '500px', height: '100%', width: '100%', borderRadius: '0.75rem' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Destination Markers */}
        {destinations && destinations.map((dest, idx) => (
          dest.latitude && dest.longitude ? (
            <Marker key={idx} position={[dest.latitude, dest.longitude]}>
              <Popup>
                <div>
                  <h3 className="font-bold text-gray-800">{idx + 1}. {dest.name}</h3>
                  <p className="text-xs text-gray-500">{dest.district} • {dest.category}</p>
                  <div className="flex items-center text-yellow-500 text-xs mt-1">
                    <Star size={12} className="fill-current mr-1" /> {dest.rating || 'N/A'}
                  </div>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}

        {/* Route Line */}
        {routeCoordinates && routeCoordinates.length > 0 && (
          <Polyline 
            positions={routeCoordinates} 
            color="#2563eb" 
            weight={5}
            opacity={0.8}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default React.memo(MapView);
