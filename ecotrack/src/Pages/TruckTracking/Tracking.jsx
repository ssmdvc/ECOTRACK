import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import Sidebar from "../../Components/Sidebar/Sidebar";
import "./Tracking.scss";
import { db, collection, getDocs, realtimeDb, ref, onValue } from "../../firebase.js";
import "mapbox-gl/dist/mapbox-gl.css";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { createRoot } from "react-dom/client";
import Map from "../../Components/Map/Map";

mapboxgl.accessToken =
  "pk.eyJ1IjoianN0eWFuZ2ciLCJhIjoiY200cW9pZDU4MTNleDJqczVtcnFtbmpqZCJ9.u_lupmsSJXwSNfoOAC5MKg";

const DEFAULT_COORDS = { latitude: 14.5929, longitude: 120.12345 };

const Tracking = () => {
  const [schedules, setSchedules] = useState([]);
  const [gpsData, setGpsData] = useState(DEFAULT_COORDS);
  const [isLoading, setIsLoading] = useState(true);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // 🔵 Fetching trip schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const snapshot = await getDocs(collection(db, "schedules"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSchedules(data);
      } catch (error) {
        console.error("Error fetching schedules:", error);
      }
    };

    fetchSchedules();
  }, []);

  // 🔵 Fetch live GPS Data
  useEffect(() => {
    const gpsRef = ref(realtimeDb, "GPSData");

    const unsubscribe = onValue(gpsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);

        if (!isNaN(lat) && !isNaN(lng)) {
          setGpsData({ latitude: lat, longitude: lng });
        } else {
          console.warn("Invalid GPS data received:", data);
        }
      } else {
        console.warn("No GPS data available.");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔵 Initialize the Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [gpsData.longitude, gpsData.latitude],
      zoom: 14,
    });

    return () => mapRef.current?.remove();
  }, []);

  // 🔵 Update marker based on GPS changes
  useEffect(() => {
    if (
      !gpsData ||
      !mapRef.current ||
      !mapRef.current.isStyleLoaded() ||
      !gpsData.latitude ||
      !gpsData.longitude
    )
      return;

    const iconEl = createTruckIcon();
    if (!iconEl) return;

    const { latitude, longitude } = gpsData;

    if (!markerRef.current) {
      markerRef.current = new mapboxgl.Marker({ element: iconEl })
        .setLngLat([longitude, latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`<p>Live Truck Location</p>`))
        .addTo(mapRef.current);
    } else {
      markerRef.current.setLngLat([longitude, latitude]);
    }

    const currentCenter = mapRef.current.getCenter();
    if (
      Math.abs(currentCenter.lat - latitude) > 0.0001 ||
      Math.abs(currentCenter.lng - longitude) > 0.0001
    ) {
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: 14,
        essential: true,
      });
    }
  }, [gpsData.latitude, gpsData.longitude]);

  const createTruckIcon = () => {
    const container = document.createElement("div");
    container.style.width = "48px";
    container.style.height = "48px";
    container.style.borderRadius = "50%";
    container.style.backgroundColor = "#fff";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.boxShadow = "0 0 12px 4px rgba(76, 175, 80, 0.4)";
    container.style.transform = "translate(-50%, -50%)";
    container.title = "Live Truck";

    const root = createRoot(container);
    root.render(<LocalShippingIcon style={{ color: "#4CAF50", fontSize: "28px" }} />);

    return container;
  };

  return (
    <div className="tracking">
      <Sidebar />
      <div className="trackingContainer">
        <h1 className="trackingTitle">Truck Route</h1>
        <div className="trackingContent">
          {/* 🔵 Trip Details Section */}
          <div className="routesDetails">
            <h2 className="routesHeader">Trip Details</h2>
            {schedules.length > 0 ? (
              schedules.map((trip, index) => (
                <div key={trip.id} className="routeSection">
                  <h3>Truck ID: {trip.truckId}</h3>
                  <p><strong>Driver:</strong> {trip.driver}</p>
                  <p><strong>Route:</strong> {trip.route}</p>
                  <p><strong>Estimated Time:</strong> {trip.estimatedTime}</p>
                  <p><strong>Status:</strong> {trip.status}</p>
                  <p><strong>Date:</strong> {trip.date}</p>
                </div>
              ))
            ) : (
              <p>No trip details available.</p>
            )}
          </div>

          {/* 🔵 Map Section */}
          <div className="mapContainer">
            <Map />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
