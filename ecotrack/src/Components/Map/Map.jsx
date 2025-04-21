import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../../firebase";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { createRoot } from "react-dom/client";
import "./Map.scss";

mapboxgl.accessToken =
  "pk.eyJ1IjoianN0eWFuZ2ciLCJhIjoiY200cW9pZDU4MTNleDJqczVtcnFtbmpqZCJ9.u_lupmsSJXwSNfoOAC5MKg";

const Map = () => {
  const mapContainerRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [gpsMarkers, setGpsMarkers] = useState({});

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [120.9806, 14.4507], // Initial center
      zoom: 12,
      attributionControl: false,
    });

    setMapInstance(map);

    return () => map.remove();
  }, []);

  useEffect(() => {
    if (!mapInstance) return;

    const db = getDatabase(app);
    const gpsRef = ref(db);

    const unsubscribe = onValue(gpsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const bounds = new mapboxgl.LngLatBounds();

      Object.entries(data).forEach(([deviceKey, gpsData]) => {
        const lat = gpsData.lat || gpsData.latitude;
        const lng = gpsData.lng || gpsData.longitude;

        if (!lat || !lng) return;

        // Include this point in the map bounds
        bounds.extend([lng, lat]);

        const isGPSData = deviceKey === "GPSData";
        const truckColor = isGPSData ? "#4CAF50" : "#2196F3"; // Green or Blue
        const glowColor = "rgba(76, 175, 80, 0.4)"; // Soft green glow

        const markerContainer = document.createElement("div");
        markerContainer.style.width = "48px";
        markerContainer.style.height = "48px";
        markerContainer.style.borderRadius = "50%";
        markerContainer.style.backgroundColor = "#ffffff"; // White background
        markerContainer.style.display = "flex";
        markerContainer.style.alignItems = "center";
        markerContainer.style.justifyContent = "center";
        markerContainer.style.transform = "translate(-50%, -50%)";
        markerContainer.style.boxShadow = `0 0 12px 4px ${glowColor}`;
        markerContainer.title = `Device: ${deviceKey}`;

        const root = createRoot(markerContainer);
        root.render(<LocalShippingIcon style={{ color: truckColor, fontSize: "28px" }} />);

        if (gpsMarkers[deviceKey]) {
          gpsMarkers[deviceKey].setLngLat([lng, lat]);
        } else {
          const marker = new mapboxgl.Marker({ element: markerContainer })
            .setLngLat([lng, lat])
            .setPopup(new mapboxgl.Popup().setText(`Truck: ${deviceKey}`))
            .addTo(mapInstance);

          setGpsMarkers((prev) => ({ ...prev, [deviceKey]: marker }));
        }
      });

      // Fit map view to all markers
      if (!bounds.isEmpty()) {
        mapInstance.fitBounds(bounds, {
          padding: 60,
          maxZoom: 15,
          duration: 1000,
        });
      }
    });

    return () => unsubscribe();
  }, [mapInstance, gpsMarkers]);

  return <div className="map-container" ref={mapContainerRef}></div>;
};

export default Map;
