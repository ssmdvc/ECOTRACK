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
  const [routes, setRoutes] = useState([]);
  const [gpsData, setGpsData] = useState(DEFAULT_COORDS);
  const [isLoading, setIsLoading] = useState(true);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

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

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [gpsData.longitude, gpsData.latitude],
      zoom: 14,
    });

    mapRef.current.on("load", () => {
      if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;

      routes.forEach((route, index) => {
        if (!route.stops || route.stops.length === 0) return;

        const coordinates = route.stops.map((stop) => [stop.lng, stop.lat]);

        if (mapRef.current.getSource(`route-${index}`)) return;

        mapRef.current.addSource(`route-${index}`, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates,
            },
          },
        });

        mapRef.current.addLayer({
          id: `route-${index}`,
          type: "line",
          source: `route-${index}`,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": index % 2 === 0 ? "blue" : "red",
            "line-width": 4,
          },
        });
      });
    });

    return () => mapRef.current?.remove();
  }, [routes]);

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

  // Create a custom marker using MUI truck icon
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
          <Map />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
