// File: src/Analy/AnalyticsFr.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { startOfWeek, endOfWeek } from "date-fns";
import Sidebar from "../../Components/Sidebar/Sidebar";
import ExportReportsCard from "../AnalyticsCharts/ExportReportsCard";
import WasteChart from "../AnalyticsCharts/WasteChart";
import OperationalCostChart from "../AnalyticsCharts/OperationalCostChart";
import ZoneAverageChart from "../AnalyticsCharts/ZoneAverageChart";
import DataEntryModal from "../AnalyticsCharts/DataEntryModal";
import { db } from "../../firebase";
import { getChartTitle, getWasteDataByPeriod } from "../../Components/Utils/chartHelpers";
import { Card, CardContent, Box} from "@mui/material";
import "./AnalyticsFr.scss";

export default function AnalyticsFr() {

  const [rawWasteData, setRawWasteData] = useState([]);
  const [operationalCostData, setOperationalCostData] = useState([]);
  const [periodWaste, setPeriodWaste] = useState("daily");
  const [periodZone, setPeriodZone] = useState("daily");
  const [selectedTruck, setSelectedTruck] = useState("Truck 1");
  const [zoneData, setZoneData] = useState([]);
  const [open, setOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [inputType, setInputType] = useState("");
  const [date, setDate] = useState(null);
  const [zone, setZone] = useState("");
  const [street, setStreet] = useState("");
  const [weight, setWeight] = useState(0);
  const [truckId, setTruckId] = useState("");
  const [truck, setTruck] = useState("");
  const [operationType, setOperationType] = useState("");
  const [cost, setCost] = useState(0);

  const zoneStreetsMap = useMemo(() => ({
    "Zone A": ["Monark", "Cristeta", "Facoma", "Florante", "Selya", "Antenor"],
    "Zone B": ["Burgos", "Bondoc", "Zamora", "RMF", "Floresca"],
    "Zone C": ["Centraza", "Manggahan", "Salvador Comp.", "Balagtas", "Puhora"]
  }), []);

  const fetchWasteData = useCallback(async () => {
    const snapshot = await getDocs(collection(db, "wasteCollectionData"));
    const raw = snapshot.docs.map(doc => {
      const d = doc.data();
      return {
        date: d.collection_date.toDate(),
        weight: d.collection_weight,
        zone: d.zone,
        street: d.street
      };
    });
    setRawWasteData(raw);
  }, []);

  const fetchOperationalCostData = useCallback(async () => {
    const snapshot = await getDocs(collection(db, "operationalCostData"));
    const grouped = { Fuel: 0, Maintenance: 0, Labor: 0, Others: 0 };

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (selectedTruck !== "all" && data.truck_id !== selectedTruck) return;
      const type = data.type || "Others";
      grouped[type] += data.cost;
    });

    const chartData = Object.entries(grouped).map(([type, expenses]) => ({ type, expenses }));
    setOperationalCostData(chartData);
  }, [selectedTruck]);

  const computeAveragePerPoint = useCallback((rawData, period) => {
    const now = new Date();
    const grouped = {};

    rawData.forEach(({ date, weight, zone, street }) => {
      const include = (() => {
        if (period === "daily") return date >= startOfWeek(now, { weekStartsOn: 1 }) && date <= endOfWeek(now, { weekStartsOn: 1 });
        if (period === "weekly") return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        if (period === "monthly") return date.getFullYear() === now.getFullYear();
        return true;
      })();

      if (!include) return;

      grouped[zone] = grouped[zone] || { total: 0, streets: {} };
      grouped[zone].total += weight;
      grouped[zone].streets[street] = (grouped[zone].streets[street] || 0) + weight;
    });

    return Object.entries(zoneStreetsMap).map(([zone, streets]) => {
      const zoneData = grouped[zone] || { total: 0, streets: {} };
      const numPoints = Object.keys(zoneData.streets).length || streets.length || 1;
    
      return {
        zone,
        totalWeight: zoneData.total || 0,
        weight: (zoneData.total || 0) / numPoints,
        streets,
      };
    }).sort((a, b) => a.zone.localeCompare(b.zone));
    
  }, [zoneStreetsMap]);

  useEffect(() => {
    fetchWasteData();
    fetchOperationalCostData();
  }, [fetchWasteData, fetchOperationalCostData]);

  useEffect(() => {
    setZoneData(computeAveragePerPoint(rawWasteData, periodZone));
  }, [rawWasteData, periodZone, computeAveragePerPoint]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setInputType("");
    setZone("");
    setStreet("");
    setWeight(0);
    setTruckId("");
    setTruck("");
    setOperationType("");
    setCost(0);
    setDate(null);
    setShowSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });
    if (!date || date < start || date > end) {
      alert("Date must be within the current week (Monday to Sunday).");
      return;
    }
    try {
      if (inputType === "wasteData") {
        await addDoc(collection(db, "wasteCollectionData"), {
          collection_date: Timestamp.fromDate(date),
          collection_weight: Number(weight),
          street,
          truck_id: truckId,
          zone,
        });
      } else if (inputType === "costData") {
        await addDoc(collection(db, "operationalCostData"), {
          truck_id: truck,
          type: operationType,
          cost: Number(cost),
          operation_date: Timestamp.fromDate(date),
        });
      }
      await fetchWasteData();
      await fetchOperationalCostData();
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        handleClose();
      }, 1500);
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const wasteChartData = useMemo(() => getWasteDataByPeriod(rawWasteData, periodWaste), [rawWasteData, periodWaste]);
  const wasteChartTitle = useMemo(() => getChartTitle(periodWaste), [periodWaste]);

  return (
    <Box className="sidebarParentContainer" >
      <Box className="sidebar">
        <Sidebar />
      </Box>

      <DataEntryModal
        open={open}
        handleClose={handleClose}
        handleSubmit={handleSubmit}
        inputType={inputType}
        setInputType={setInputType}
        date={date}
        setDate={setDate}
        zone={zone}
        setZone={setZone}
        street={street}
        setStreet={setStreet}
        weight={weight}
        setWeight={setWeight}
        truckId={truckId}
        setTruckId={setTruckId}
        truck={truck}
        setTruck={setTruck}
        operationType={operationType}
        setOperationType={setOperationType}
        cost={cost}
        setCost={setCost}
        zoneStreetsMap={zoneStreetsMap}
        showSuccess={showSuccess}
      />

      <Box className="subContainer">
      <div
        style={{
          fontFamily: "Raleway, sans-serif",
          fontOpticalSizing: "auto",
          fontWeight: 500,
          fontStyle: "normal",
          width: "100%",
          fontSize: "24px",
          color: "rgba(43, 54, 116, 1)",
          marginBottom: "25px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        Analytics
      </div>
        <Box className="detailContainer">
          <Box className="cardsContainer">
          <ExportReportsCard onAddDataClick={handleOpen} />


            <Card>
              <CardContent>
                <WasteChart data={wasteChartData} title={wasteChartTitle} period={periodWaste} setPeriod={setPeriodWaste} />
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <ZoneAverageChart data={zoneData} period={periodZone} setPeriod={setPeriodZone} />
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <OperationalCostChart data={operationalCostData} selectedTruck={selectedTruck} setSelectedTruck={setSelectedTruck} />
              </CardContent>
            </Card>

          </Box>
        </Box>
      </Box>
    </Box>
  );
}