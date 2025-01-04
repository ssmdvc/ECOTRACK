import "./Tracking.scss"
import Navbar from "../../Components/Navbar/Navbar"
import Sidebar from "../../Components/Sidebar/Sidebar"
import React, { useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { db, collection, getDocs } from "../../firebase";
import Map from "../../Components/Map/Map";




mapboxgl.accessToken = "pk.eyJ1IjoianN0eWFuZ2ciLCJhIjoiY200cW9pZDU4MTNleDJqczVtcnFtbmpqZCJ9.u_lupmsSJXwSNfoOAC5MKg"


const Tracking = () => {
  const [routes, setRoutes] = useState([]);
  const mapContainerRef = React.useRef(null);
  useEffect(() => {
    const fetchRoutes = async () => {
      const querySnapshot = await getDocs(collection(db, "truckRoutes"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
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
      center: [120.9806, 14.4506], // Default center (Las Piñas)
      zoom: 14,
    });

    // Add routes to the map
    routes.forEach((route, index) => {
      const coordinates = route.stops.map((stop) => [stop.lng, stop.lat]);

      // Add line (route)
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

      // Add markers (stops)
      route.stops.forEach((stop, i) => {
        new mapboxgl.Marker({ color: i === 0 ? "red" : "blue" })
          .setLngLat([stop.lng, stop.lat])
          .setPopup(new mapboxgl.Popup().setHTML(`<p>${stop.street || `Stop ${i + 1}`}</p>`))
          .addTo(map);
      });
    });

    return () => map.remove(); // Cleanup map on component unmount
  }, [routes]);

  return (
    <div className="tracking">
        <Sidebar />
        <div className="trackingContainer">
            <Navbar />
        <div className="trackingTitle">
            Truck Tracking Management  
        </div>

        <div className="trackingdets">

        <div className="truck-routes-container">
      {/* Route Details */}
      <div className="routes-details">
        <h1>Trip Details</h1>
        {routes.map((route, index) => (
          <div key={route.id} className="route-section">
            <h2>Truck Number {index + 1}</h2>
            <p>{route.date}</p>
            <ul>
              {route.stops.map((stop, i) => (
                <li key={i}>
                  <span className={`dot ${i === 0 ? "start" : "stop"}`}></span>
                  {stop.street || `Lat: ${stop.lat}, Lng: ${stop.lng}`}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Map Section */}
      <div className="map-section">
      <Map/>
     </div>

        </div>

        </div>

        </div>
      
    </div>
  );
    
}
export default Tracking