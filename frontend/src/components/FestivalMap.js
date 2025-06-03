import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

function FestivalMap({ festivals }) {
  const center = [47.5162, 11.0835]; // Center on Tirol
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-AT', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Create custom icons for different regions
  const tirolIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const bayernIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <div className="map-container">
      <MapContainer center={center} zoom={8} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {festivals.map((festival) => {
          if (festival.latitude && festival.longitude) {
            return (
              <Marker 
                key={festival.id} 
                position={[festival.latitude, festival.longitude]}
                icon={festival.region === 'tirol' ? tirolIcon : bayernIcon}
              >
                <Popup>
                  <div className="popup-content">
                    <h3>{festival.name}</h3>
                    <p><strong>Ort:</strong> {festival.location}</p>
                    <p><strong>Datum:</strong> {formatDate(festival.start_date)} - {formatDate(festival.end_date)}</p>
                    {festival.description && <p>{festival.description}</p>}
                    {festival.website && (
                      <p>
                        <a href={festival.website} target="_blank" rel="noopener noreferrer">
                          Website besuchen
                        </a>
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
}

export default FestivalMap;
