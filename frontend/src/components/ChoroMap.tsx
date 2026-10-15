"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface ChoroMapProps {
  governorateStats: any[];
}

export default function ChoroMap({ governorateStats }: ChoroMapProps) {
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    // In a real scenario, this would load the actual tunisia-governorates.geojson
    // For MVP demonstration, we handle the state but the map will show OSM tiles
    fetch('/tunisia-governorates.geojson')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.log("GeoJSON not available yet, using basemap only", err));
  }, []);

  const getColor = (intensity: number) => {
    return intensity > 0.8 ? '#800026' :
           intensity > 0.6 ? '#BD0026' :
           intensity > 0.4 ? '#E31A1C' :
           intensity > 0.2 ? '#FC4E2A' :
           intensity > 0.1 ? '#FD8D3C' : '#FFEDA0';
  };

  const style = (feature: any) => {
    const govName = feature.properties.name;
    const stat = governorateStats.find(s => s.governorate === govName);
    const intensity = stat ? stat.epidemiological_intensity : 0;
    
    return {
      fillColor: getColor(intensity),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  };

  return (
    <MapContainer 
      center={[34.0, 9.0]} // Center of Tunisia
      zoom={6} 
      scrollWheelZoom={true}
      className="w-full h-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {geoData && <GeoJSON data={geoData} style={style} />}
    </MapContainer>
  );
}
