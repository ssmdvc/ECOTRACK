import "../Analy/AnalyticsFr.scss";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import React, { useState,useEffect,Cell,useCallback, useMemo  } from "react";
import Sidebar from '../../Components/Sidebar/Sidebar';
import {FormControl,InputLabel,Select,Card,CardContent,Typography,MenuItem,TextField,Button,Modal,Box,} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { getDocs,collection,  addDoc,Timestamp  } from 'firebase/firestore';
import { db } from '../../firebase';
import {startOfWeek, endOfWeek, format,getYear, isSameWeek} from "date-fns";
import ExportReportsCard from '../Analy/ExportReportsCard'



export default function AnalyticsFr() {
    
    const [periodWaste, setPeriodWaste] = useState("daily");
    const [dailyData, setDailyData] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [yearlyData, setYearlyData] = useState([]);
    const [showSuccess, setShowSuccess] = useState(false);


    const zoneStreetsMap = useMemo(() => ({
        "Zone A": ["Monark", "Cristeta", "Facoma", "Florante", "Selya", "Antenor"],
        "Zone B": ["Burgos", "Bondoc", "Zamora", "RMF", "Floresca"],
        "Zone C": ["Centraza", "Manggahan", "Salvador Comp.", "Balagtas", "Puhora"]
      }), []);
      

    const [zoneData, setZoneData] = useState([]);
    const [periodZone, setPeriodZone] = useState("daily");

    const handlePeriodZoneChange = (e) => {
    setPeriodZone(e.target.value);
    };

    const [operationalCostData, setOperationalCostData] = useState([]);
    const [selectedTruck, setSelectedTruck] = useState("Truck 1");
  
    const fetchOperationalCostData = useCallback(async () => {
        const snapshot = await getDocs(collection(db, "operationalCostData"));
        const grouped = {
          Fuel: 0,
          Maintenance: 0,
          Labor: 0,
          Others: 0,
        };
    
  
      snapshot.forEach((doc) => {
        const data = doc.data();
        const truck = data.truck_id;
        const type = data.type || "Others";
  
        if (selectedTruck !== "all" && truck !== selectedTruck) return;
        if (!grouped[type]) grouped[type] = 0;

        grouped[type] += data.cost;
        });

        const chartData = Object.entries(grouped).map(([type, expenses]) => ({
        type,
        expenses,
        }));
  
      setOperationalCostData(chartData);
    }, [selectedTruck]);
  
    useEffect(() => {
      fetchOperationalCostData();
    }, [fetchOperationalCostData]);
      
      


    const fetchData = useCallback(async () => {
        const computeAveragePerPoint = (rawData, period) => {
            const now = new Date();
            const grouped = {};
          
            rawData.forEach(({ date, weight, zone, street }) => {
              const include = (() => {
                if (period === "daily") return isSameWeek(date, now, { weekStartsOn: 1 });
                if (period === "weekly") return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                if (period === "monthly") return getYear(date) === getYear(now);
                if (period === "yearly") return true;
              })();
          
              if (!include) return;
          
              if (!grouped[zone]) {
                grouped[zone] = { total: 0, streets: {} };
              }
          
              grouped[zone].total += weight;
          
              if (!grouped[zone].streets[street]) {
                grouped[zone].streets[street] = 0;
              }
          
              grouped[zone].streets[street] += weight;
            });
          
            const output = Object.entries(grouped)
              .map(([zone, data]) => {
                const numPoints = Object.keys(data.streets).length || 1;
                return {
                  zone,
                  totalWeight: data.total,
                  weight: data.total / numPoints, // average per street
                  streets: zoneStreetsMap[zone] || Object.keys(data.streets),
                };
              })
              .filter((entry) => entry.totalWeight > 0) // ⬅️ Hide zones with no data
              .sort((a, b) => b.weight - a.weight);     // Highest average first
          
            return output;
          };

      
        const snapshot = await getDocs(collection(db, "wasteCollectionData"));
        const rawData = [];
      
        snapshot.forEach((doc) => {
          const data = doc.data();
          rawData.push({
            date: data.collection_date.toDate(),
            weight: data.collection_weight,
            zone: data.zone,
            street: data.street,
          });
        });
      
        const weekdayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const now = new Date();
        const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
        const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
      
        const dailyMap = {};
        rawData.forEach(({ date, weight }) => {
          if (date >= thisWeekStart && date <= thisWeekEnd) {
            const day = weekdayMap[date.getDay()];
            dailyMap[day] = (dailyMap[day] || 0) + weight;
          }
        });
      
        const dailyArr = weekdayMap.map((day) => ({
          day,
          volume: dailyMap[day] || 0,
        }));
      
        const weeklyBins = {
          "Week 1": 0,
          "Week 2": 0,
          "Week 3": 0,
          "Week 4": 0,
        };
      
        rawData.forEach(({ date, weight }) => {
          if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
            const dayOfMonth = date.getDate();
            const weekLabel =
              dayOfMonth <= 7
                ? "Week 1"
                : dayOfMonth <= 14
                ? "Week 2"
                : dayOfMonth <= 21
                ? "Week 3"
                : "Week 4";
            weeklyBins[weekLabel] += weight;
          }
        });
      
        const weeklyArr = Object.entries(weeklyBins).map(([week, volume]) => ({
          day: week,
          volume,
        }));
      
        const monthlyMap = {};
        rawData.forEach(({ date, weight }) => {
          const month = format(date, "MMM");
          monthlyMap[month] = (monthlyMap[month] || 0) + weight;
        });
      
        const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyArr = allMonths.map((month) => ({
          day: month,
          volume: monthlyMap[month] || 0,
        }));
      
        const yearlyMap = {};
        rawData.forEach(({ date, weight }) => {
          const year = getYear(date);
          yearlyMap[year] = (yearlyMap[year] || 0) + weight;
        });
      
        const yearlyArr = Object.entries(yearlyMap).map(([year, volume]) => ({
          day: year.toString(),
          volume,
        }));
      
        setDailyData(dailyArr);
        setWeeklyData(weeklyArr);
        setMonthlyData(monthlyArr);
        setYearlyData(yearlyArr);
      
        const zoneAvg = computeAveragePerPoint(rawData, periodZone);
        setZoneData(zoneAvg);
      }, [periodZone, zoneStreetsMap]); // ✅ fixed: added both dependencies
      
      


      // Fetch initially
      useEffect(() => {
        fetchData();
      }, [fetchData, periodWaste]);

      
      

  const getChartData = () => {
    switch (periodWaste) {
      case "weekly":
        return weeklyData;
      case "monthly":
        return monthlyData;
      case "yearly":
        return yearlyData;
      case "daily":
      default:
        return dailyData;
    }
  };
  

  const getChartTitle = () => {
    const now = new Date();
  
    switch (periodWaste) {
      case "weekly": {
        const start = format(startOfWeek(now, { weekStartsOn: 1 }), "MMM d");
        const end = format(endOfWeek(now, { weekStartsOn: 1 }), "MMM d");
        return `Weekly Waste Collected (${start} - ${end})`;
      }
      case "monthly": {
        const month = format(now, "MMMM yyyy");
        return `Monthly Waste Collected (${month})`;
      }
      case "yearly": {
        const year = format(now, "yyyy");
        return `Yearly Waste Collected (${year})`;
      }
      case "daily":
      default: {
        const fullDayName = format(now, "EEEE"); // e.g., "Monday"
        return `Daily Waste Collected (${fullDayName})`;
      }
    }
  };

  // Modal and form state
  const [open, setOpen] = useState(false);
  const [inputType, setInputType] = useState("");
  const [date, setDate] = useState(null);
  const [zone, setZone] = useState("");
  const [street, setStreet] = useState("");
  const [weight, setWeight] = useState(0);
  const [truckId, setTruckId] = useState("");
  const [truck, setTruck] = useState("");
  const [operationType, setOperationType] = useState("");
  const [cost, setCost] = useState(0);

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

    const getStreetOptions = () => {
    return zoneStreetsMap[zone] || [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!date) {
        alert("Please select a date before submitting.");
        return;
      }
      
      // Validate date is within this week (Mon–Sun)
      const startOfWeekDate = startOfWeek(new Date(), { weekStartsOn: 1 });
      const endOfWeekDate = endOfWeek(new Date(), { weekStartsOn: 1 });
      
      if (date < startOfWeekDate || date > endOfWeekDate) {
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
          console.log("Waste data submitted successfully.");
        } else if (inputType === "costData") {
          await addDoc(collection(db, "operationalCostData"), {
            truck_id: truck,
            type: operationType,
            cost: Number(cost),
            operation_date: Timestamp.fromDate(date),
          });
          console.log("Operational cost data submitted successfully.");
        }
      
        await fetchData(); // Refresh chart
      
        // ✅ Show success message
        setShowSuccess(true);
      
        // ✅ Hide message and close modal after delay
        setTimeout(() => {
          setShowSuccess(false);
          handleClose();
        }, 1500);
      
      } catch (error) {
        console.error("Error submitting form data:", error);
      }
      
  };

  return (
    <div id="dashboardContent" 
    className="sidebarParentContainer">
      <div className="sidebar">
        <Sidebar />
      </div>

      {/* Action Buttons */}
      <Button
        onClick={handleOpen}
        sx={{
          backgroundColor: "primary.main",
          color: "white",
          "&:hover": { backgroundColor: "primary.dark" },
          padding: "6px 20px",
          borderRadius: "5px",
          position: "absolute",
          top: "156px",
          right: "370px",
        }}
      >
        Add Data
      </Button>
      

      {/* Input Form Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        > 
        {showSuccess && (
          <Typography color="success.main" sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            Data added successfully!
          </Typography>
        )}
          <Typography id="modal-title" variant="h6" component="h2" gutterBottom>
            Add New Data
          </Typography>

          <form onSubmit={handleSubmit}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Data Type</InputLabel>
              <Select
                value={inputType}
                onChange={(e) => setInputType(e.target.value)}
              >
                <MenuItem value="wasteData">Waste Collection Entry</MenuItem>
                <MenuItem value="costData">
                  Truck Operational Cost Entry
                </MenuItem>
              </Select>
            </FormControl>

            {/* Waste Collection Form Fields */}
            {inputType === "wasteData" && (
              <>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Select Zone</InputLabel>
                  <Select value={zone} onChange={(e) => setZone(e.target.value)}>
                    <MenuItem value="Zone A">Zone A</MenuItem>
                    <MenuItem value="Zone B">Zone B</MenuItem>
                    <MenuItem value="Zone C">Zone C</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                <InputLabel>Select a Street</InputLabel>
                <Select
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    disabled={!zone} // this disables it if no zone is selected
                >
                    {getStreetOptions().map((streetOption, idx) => (
                    <MenuItem key={idx} value={streetOption}>
                        {streetOption}
                    </MenuItem>
                    ))}
                </Select>
                </FormControl>

                <TextField
                  label="Weight Collected (kg)"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  fullWidth
                  margin="normal"
                />

                <FormControl fullWidth margin="normal">
                  <InputLabel>Select Truck Assigned</InputLabel>
                  <Select
                    value={truckId}
                    onChange={(e) => setTruckId(e.target.value)}
                  >
                    <MenuItem value="Truck 1">Truck 1</MenuItem>
                    <MenuItem value="Truck 2">Truck 2</MenuItem>
                  </Select>
                </FormControl>

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                    label="Collection Date"
                    value={date}
                    onChange={(newDate) => setDate(newDate)}
                    renderInput={(params) => (
                    <TextField {...params} fullWidth margin="normal" />
                    )}
                />
                </LocalizationProvider>
                {showSuccess && (
                    <Typography color="green" sx={{ mt: 2 }}>
                        ✅ Data successfully added!
                    </Typography>
                    )}

              </>
            )}

            {/* Operational Cost Form Fields */}
            {inputType === "costData" && (
              <>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Select Truck</InputLabel>
                  <Select value={truck} onChange={(e) => setTruck(e.target.value)}>
                    <MenuItem value="Truck 1">Truck 1</MenuItem>
                    <MenuItem value="Truck 2">Truck 2</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Operational Type</InputLabel>
                  <Select
                    value={operationType}
                    onChange={(e) => setOperationType(e.target.value)}
                  >
                    <MenuItem value="Fuel">Fuel</MenuItem>
                    <MenuItem value="Maintenance">Maintenance</MenuItem>
                    <MenuItem value="Labor">Labor</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Cost Amount"
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  fullWidth
                  margin="normal"
                />

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Operation Date"
                    value={date}
                    onChange={(newDate) => setDate(newDate)}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth margin="normal" />
                    )}
                  />
                </LocalizationProvider>
              </>
            )}

            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button onClick={handleClose} color="secondary" sx={{ mr: 1 }}>
                Cancel
              </Button>
              {inputType && (
                <Button variant="contained" color="primary" type="submit"  disabled={showSuccess}>
                  Submit
                </Button>
              )}
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Main Analytics Dashboard */}
      <div className="subContainer">
        <div className="detailContainer">
        
          <div className="cardsContainer">
          <ExportReportsCard />
            {/* Waste Collection Chart Card */}
            <Card>
              <CardContent className="cardStyle">
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">
                    {getChartTitle()}
                  </Typography>
                  <FormControl sx={{ width: 150 }}>
                    <InputLabel>Filter by Period</InputLabel>
                    <Select
                      value={periodWaste}
                      onChange={(e) => setPeriodWaste(e.target.value)}
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="yearly">Yearly</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <BarChart width={600} height={200} data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar
                    dataKey="volume"
                    barSize={40}
                    fill={
                    periodWaste === "daily" ? "#42a5f5" :
                    periodWaste === "weekly" ? "#66bb6a" :
                    periodWaste === "monthly" ? "#ffa726" :
                    "#ab47bc"
                    }
                />
                </BarChart>
              </CardContent>
            </Card>

                        {/* Per Point Section */}
                        <Card>
                            <CardContent className='cardStyle'>
                            <Typography variant="h6" gutterBottom>
                            {`Average Waste Collection Per Point`}{" "}
                            {periodZone === "daily"
                                ? `— ${format(new Date(), "EEEE")}`
                                : periodZone === "weekly"
                                ? `— ${format(startOfWeek(new Date(), { weekStartsOn: 1 }), "MMM d")} to ${format(endOfWeek(new Date(), { weekStartsOn: 1 }), "MMM d")}`
                                : periodZone === "monthly"
                                ? `— ${format(new Date(), "MMMM yyyy")}`
                                : periodZone === "yearly"
                                ? `— ${format(new Date(), "yyyy")}`
                                : ""}
                            </Typography>
                                
                                {/* Period Filter Dropdown */}
                                <FormControl fullWidth margin="normal" sx={{
                                    position: 'absolute',
                                    top: '560px',
                                    right: '60px',
                                    borderRadius: '8px',
                                    padding: '10px',
                                    width: '150px',
                                    height: '40px',
                                    '& .MuiInputLabel-root': { color: 'gray', fontSize: '0.90rem', left: '2px', paddingTop: '11px' },
                                    '& .MuiSelect-root': { color: '#555', display: 'flex', justifyContent: 'center', alignItems: 'center' },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#888', height: '50px', textAlign: 'center' },
                                }}>
                                    <InputLabel>Filter by Period</InputLabel>
                                    <Select value={periodZone} onChange={handlePeriodZoneChange} sx={{
                                        textAlign: 'center',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                        <MenuItem value="daily">Daily</MenuItem>
                                        <MenuItem value="weekly">Weekly</MenuItem>
                                        <MenuItem value="monthly">Monthly</MenuItem>
                                        <MenuItem value="yearly">Yearly</MenuItem>
                                    </Select>
                                </FormControl>

                                {/* Container to align BarChart and Zone Legend */}
                                <div style={{ display: "flex", alignItems: "start", gap: "50px" }}>
                                    {/* BarChart for Zone Data */}
                                    <BarChart width={600} height={250} data={zoneData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="zone" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="weight" barSize={40}>
                                        {zoneData.map((entry, index) => {
                                          const zoneColors = {
                                            "Zone A": "#4C7C5B",
                                            "Zone B": "#ECEA63",
                                            "Zone C": "#5B3A5B"
                                          };
                                          const fillColor = zoneColors[entry.zone] || "#ccc"; // fallback
                                          return <Cell key={`cell-${index}`} fill={fillColor} />;
                                        })}
                                      </Bar>


                                    </BarChart>

                                    {/* Zone Legend */}
                                    <div style={{
                                        padding: "10px",
                                        display: "flex",
                                        justifyContent: "center",
                                        gap: "20px"
                                        }}>
                                        {zoneData.map((zone, index) => (
                                            <div key={index} style={{ textAlign: "left" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                <div style={{
                                                width: "12px",
                                                height: "12px",
                                                backgroundColor:
                                                  zone.zone === "Zone A" ? "#4C7C5B" :
                                                  zone.zone === "Zone B" ? "#ECEA63" :
                                                  zone.zone === "Zone C" ? "#5B3A5B" :
                                                  "#ccc", // fallback color                         
                                                borderRadius: "2px"
                                                }}></div>
                                                <Typography variant="subtitle1" style={{ color: "#333", fontWeight: "bold" }}>
                                                {zone.zone}
                                                </Typography>
                                            </div>

                                            <ul style={{ paddingLeft: "20px", marginTop: "5px", listStyleType: "none" }}>
                                                <li style={{ fontWeight: "SemiBold", color: "#444",  marginBottom: "10px" }}>
                                                Total: {zone.totalWeight.toFixed()} kg
                                                </li>
                                                {zone.streets.map((street, i) => (
                                                <li key={i} style={{ fontSize: "14px", color: "#555" }}>
                                                    {street}
                                                </li>
                                                ))}
                                            </ul>
                                            </div>
                                        ))}
                                        </div>

                                </div>
                            </CardContent>
                        </Card>

                        {/* Operational Section */}
                        <Card>
                            <CardContent className='cardStyle'>
                                <Typography variant="h6" gutterBottom>
                                    Average Truck Operational Cost ({selectedTruck === "all" ? "All Trucks" : selectedTruck})
                                </Typography>
                                
                                <FormControl fullWidth margin="normal" sx={{
                                    position: 'absolute',
                                    top: '885px',
                                    right: '60px',
                                    borderRadius: '8px',
                                    padding: '10px',
                                    width: '150px',
                                    height: '40px',
                                    '& .MuiInputLabel-root': { color: 'gray', fontSize: '0.90rem', left: '2px', paddingTop: '11px' },
                                    '& .MuiSelect-root': { color: '#555', display: 'flex', justifyContent: 'center', alignItems: 'center' },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#888', height: '50px', textAlign: 'center' },
                                }}>
                                    <InputLabel>Truck</InputLabel>
                                    <Select value={selectedTruck} onChange={(e)=>setSelectedTruck(e.target.value)} sx={{
                                        textAlign: 'center',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                        <MenuItem value="all">All Trucks</MenuItem>
                                        <MenuItem value="Truck 1">Truck 1</MenuItem>
                                        <MenuItem value="Truck 2">Truck 2</MenuItem>
                                    </Select>
                                </FormControl>

                                
                                {/* BarChart for Operational Cost Data */}
                                <BarChart width={600} height={200} data={operationalCostData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="type" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="expenses" fill="#8884d8">
                                        {operationalCostData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#8884d8" : "#82ca9d"} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </CardContent>
                        </Card>
          </div>
          
        </div>
      </div>
    </div>
  );
}
