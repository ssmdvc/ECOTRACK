import React, { useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import Navbar from "../../Components/Navbar/Navbar";
import Sidebar from "../../Components/Sidebar/Sidebar";
import "./Tracking.scss";
import { db, collection, getDocs } from "../../firebase";
import "mapbox-gl/dist/mapbox-gl.css";
import Map from "../../Components/Map/Map";

mapboxgl.accessToken = "pk.eyJ1IjoianN0eWFuZ2ciLCJhIjoiY200cW9pZDU4MTNleDJqczVtcnFtbmpqZCJ9.u_lupmsSJXwSNfoOAC5MKg";

const Tracking = () => {
  const [routes, setRoutes] = useState([]);
  const mapContainerRef = React.useRef(null);

  // Fetch routes from Firestore
  useEffect(() => {
    const fetchRoutes = async () => {
      const querySnapshot = await getDocs(collection(db, "truckRoutes"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Fetched routes:", data); // Debug fetched data
      setRoutes(data);
    };

    fetchRoutes();
  }, []);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainerRef.current || routes.length === 0) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [120.9806, 14.4506], // Default center
      zoom: 14,
    });

    map.on("load", () => {
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
            "line-color": index % 2 === 0 ? "blue" : "red",
            "line-width": 4,
          },
        });

        // Add markers
        route.stops.forEach((stop, i) => {
          new mapboxgl.Marker({ color: i === 0 ? "red" : "blue" })
            .setLngLat([stop.lng, stop.lat])
            .setPopup(new mapboxgl.Popup().setHTML(`<p>${stop.street || `Stop ${i + 1}`}</p>`))
            .addTo(map);
        });
      });
    });

    return () => map.remove(); // Cleanup map on unmount
  }, [routes]);

  return (
    <div className="tracking">
      <Sidebar />
      <div className="trackingContainer">
        <Navbar />
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
          <div className="mapContainer" ref={mapContainerRef}>
          <Map />
          </div>
        
        </div>
      </div>
    </div>
  );
};

export default Tracking;
