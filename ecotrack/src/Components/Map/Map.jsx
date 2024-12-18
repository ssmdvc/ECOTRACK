import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "./Map.scss";



console.log("Map component loaded");

// Add your Mapbox API key
mapboxgl.accessToken = "pk.eyJ1IjoianN0eWFuZ2ciLCJhIjoiY200cW9pZDU4MTNleDJqczVtcnFtbmpqZCJ9.u_lupmsSJXwSNfoOAC5MKg";

const Map = () => {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [120.9806, 14.4507], // Example coordinates
      zoom: 15,
      attributionControl: false, // Disable attribution control
    });

    return () => map.remove(); // Clean up the map on unmount
  }, []);

  return <div className="map-container" ref={mapContainerRef}></div>;
};

export default Map;
