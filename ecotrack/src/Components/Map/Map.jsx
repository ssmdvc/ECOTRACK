import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "./Map.scss";

console.log("Map component loaded");

// Add your Mapbox API key
mapboxgl.accessToken = "pk.eyJ1IjoianN0eWFuZ2ciLCJhIjoiY200cW9pZDU4MTNleDJqczVtcnFtbmpqZCJ9.u_lupmsSJXwSNfoOAC5MKg";

const Map = ({ routes = [] }) => { // Accept routes as a prop
  const mapContainerRef = useRef(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [120.9806, 14.4507], // Example coordinates
      zoom: 15,
      attributionControl: false, // Disable attribution control
    });

    // Add routes and stops to the map
    if (routes.length > 0) {
      routes.forEach((route, index) => {
        const coordinates = route.stops.map((stop) => [stop.lng, stop.lat]);

        // Add route line
        map.addLayer({
          id: `route-${index}`,
          type: "line",
          source: {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates,
              },
            },
          },
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": index % 2 === 0 ? "blue" : "red", // Alternate colors
            "line-width": 4,
          },
        });

        // Add markers for stops
        route.stops.forEach((stop, i) => {
          new mapboxgl.Marker({ color: i === 0 ? "red" : "blue" })
            .setLngLat([stop.lng, stop.lat])
            .setPopup(
              new mapboxgl.Popup().setHTML(
                `<p>${stop.street || `Lat: ${stop.lat}, Lng: ${stop.lng}`}</p>`
              )
            )
            .addTo(map);
        });
      });
    }

    return () => map.remove(); // Clean up the map on unmount
  }, [routes]); // Re-run effect if routes change

  return <div className="map-container" ref={mapContainerRef}></div>;
};

export default Map;
