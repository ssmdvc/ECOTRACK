import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import Sidebar from "../../Components/Sidebar/Sidebar";
import "./Tracking.scss";
import { db, collection, getDocs, realtimeDb, ref, onValue } from "../../firebase.js"; 
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = "pk.eyJ1IjoianN0eWFuZ2ciLCJhIjoiY200cW9pZDU4MTNleDJqczVtcnFtbmpqZCJ9.u_lupmsSJXwSNfoOAC5MKg";

const DEFAULT_COORDS = { latitude: 14.5929, longitude: 120.12345 }; // Manila fallback

const Tracking = () => {
  const [routes, setRoutes] = useState([]);
  const [gpsData, setGpsData] = useState(DEFAULT_COORDS);
  const [isLoading, setIsLoading] = useState(true);
  
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  console.log("Received GPS Data:", gpsData);

  // Fetch routes from Firestore
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "truckRoutes"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRoutes(data);
      } catch (error) {
        console.error("Error fetching routes:", error);
      }
    };

    fetchRoutes();
  }, []);

  // Fetch live GPS data from Firebase Realtime Database
  useEffect(() => {
    const gpsRef = ref(realtimeDb, "GPSData");

    const unsubscribe = onValue(gpsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log("Received GPS Data:", data);

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

  // Initialize Mapbox map (Runs once when the component mounts)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [gpsData.longitude, gpsData.latitude], // Default GPS location
      zoom: 14,
    });

    mapRef.current.on("load", () => {
      console.log("Mapbox loaded successfully!");

      routes.forEach((route, index) => {
        if (!route.stops || route.stops.length === 0) return;

        const coordinates = route.stops.map((stop) => [stop.lng, stop.lat]);

        mapRef.current.addLayer({
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
            "line-color": index % 2 === 0 ? "blue" : "red",
            "line-width": 4,
          },
        });

        // Removed logic for adding route markers
      });
    });

    return () => mapRef.current?.remove();
  }, [routes]);

  // Update truck marker and follow truck movement
  useEffect(() => {
    if (!gpsData || !mapRef.current) return;

    if (!markerRef.current) {
      markerRef.current = new mapboxgl.Marker({
        element: createTruckIcon(), // Use truck.png as the icon
      })
        .setLngLat([gpsData.longitude, gpsData.latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`<p>Live Truck Location</p>`))
        .addTo(mapRef.current);
    } else {
      markerRef.current.setLngLat([gpsData.longitude, gpsData.latitude]);
    }

    // Move camera to follow truck
    mapRef.current.flyTo({
      center: [gpsData.longitude, gpsData.latitude],
      zoom: 14,
      essential: true,
    });
  }, [gpsData.latitude, gpsData.longitude]);

  // Create a custom truck icon using truck.png
  const createTruckIcon = () => {
    const icon = document.createElement("div");
    icon.style.width = "40px"; // Adjusted size for better visibility
    icon.style.height = "40px";
    icon.style.backgroundImage = "url('/truck.png')"; // Path to truck.png in the public folder
    icon.style.backgroundSize = "contain"; // Ensure the image fits within the element
    icon.style.backgroundRepeat = "no-repeat";
    icon.style.backgroundPosition = "center"; // Center the image
    icon.style.borderRadius = "50%";
    icon.style.boxShadow = "0 0 5px rgba(0, 0, 0, 0.5)";
    return icon; // Ensure a valid DOM element is returned
  };

  return (
    <div className="tracking">
      <Sidebar />
      <div className="trackingContainer">
        <h1 className="trackingTitle">Truck Route</h1>
        <div className="trackingContent">
          <div className="routesDetails">
            <h2 className="routesHeader">Trip Details</h2>
            {routes.length > 0 ? (
              routes.map((route, index) => (
                <div key={route.id} className="routeSection">
                  <h3>Truck Number {index + 1}</h3>
                  <p>{route.date}</p>
                  <ul>
                    {route.stops.map((stop, i) => (
                      <li key={i} className="stopItem">
                        <span className={`dot ${i === 0 ? "start" : "stop"}`}></span>
                        {stop.street || `Lat: ${stop.lat}, Lng: ${stop.lng}`}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <p>No routes available</p>
            )}
          </div>

          {/* Map Section */}
          <div className="mapContainer">
            {isLoading ? (
              <div className="loadingContainer">
                <div className="spinner"></div>
                <p>Loading map data...</p>
              </div>
            ) : (
              <div
                ref={mapContainerRef}
                className="mapboxMap"
                style={{ width: "100%", height: "500px" }} // Ensure the map container has dimensions
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
