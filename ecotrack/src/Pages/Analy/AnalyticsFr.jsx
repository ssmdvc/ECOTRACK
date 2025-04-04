import Sidebar from '../../Components/Sidebar/Sidebar';
import "../Analy/AnalyticsFr.scss";
import InputData from '../Analy/InputData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, Card, CardContent, Typography, MenuItem } from '@mui/material';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase'; // Removed unused imports

const zoneData = [
    { zone: "Zone A", weight: 120, streets: ["Florante", "Selya", "Antenor", "Monark", "Criseta", "Fracena"] },
    { zone: "Zone B", weight: 200, streets: ["Burgos", "Bonifoc", "Zamora", "RFM", "Floresca"] },
    { zone: "Zone C", weight: 150, streets: ["Centraza", "Mangahan", "Salvador Compd.", "Balagtas", "Puhora"] }
];

const costData = [
    { costType: "Fuel", expenses: 120 },
    { costType: "Maintenance", expenses: 200 },
    { costType: "Labor", expenses: 150 }
];

export default function AnalyticsFr() {
    const [periodWaste, setPeriodWaste] = useState('');
    const [periodZone, setPeriodZone] = useState('');
    const [costType, setCostType] = useState('');
    const [dailyData, setDailyData] = useState([]); // State for daily waste data
    const [weeklyZoneData, setWeeklyZoneData] = useState([]); // State for zone data
    const [operationalCostData, setOperationalCostData] = useState([]); // State for cost data

    const handlePeriodChange = (setter) => (event) => setter(event.target.value);

    const getWeekBoundaries = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return { startOfWeek };
    };

    useEffect(() => {
        const fetchWeeklyData = () => {
            const { startOfWeek } = getWeekBoundaries();
            const wasteCollectionRef = collection(db, 'wasteCollectionData');
            const q = query(
                wasteCollectionRef,
                where('collection_date', '>=', startOfWeek)
            );

            onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map((doc) => ({
                    date: doc.data().collection_date.toDate(),
                    volume: doc.data().collection_weight,
                }));
                setDailyData(data); // Update state with fetched data
                console.log('Daily Data:', data); // Debugging
            });
        };

        const fetchZoneData = () => {
            // Simulate fetching zone data
            setWeeklyZoneData(zoneData); // Use static zoneData for now
        };

        const fetchCostData = () => {
            // Simulate fetching operational cost data
            setOperationalCostData(costData); // Use static costData for now
        };

        fetchWeeklyData();
        fetchZoneData();
        fetchCostData();
    }, []);

    return (
        <div className='sidebarParentContainer'>
            <Sidebar />
            <InputData />
            <div className='subContainer'>
                <div className='detailContainer'>
                    <div className='cardsContainer'>

                        {/* Daily Collection Section */}
                        <Card>
                            <CardContent className='cardStyle'>
                                <Typography variant="h6" gutterBottom>
                                    {periodWaste || "Daily Waste Collected"}
                                </Typography>
                                <FormControl fullWidth margin="normal" sx={{ position: 'absolute', top: '70px', right: '60px', width: '150px' }}>
                                    <InputLabel>Filter by Period</InputLabel>
                                    <Select value={periodWaste} onChange={handlePeriodChange(setPeriodWaste)}>
                                        <MenuItem value="Daily Waste Collection">Daily</MenuItem>
                                        <MenuItem value="Weekly Average Waste Collection">Weekly</MenuItem>
                                        <MenuItem value="Monthly Average Waste Collection">Monthly</MenuItem>
                                        <MenuItem value="Yearly Average Waste Collection">Yearly</MenuItem>
                                    </Select>
                                </FormControl>
                                <BarChart width={600} height={200} data={dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="data" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="volume" fill="#8884d8" barSize={40} />
                                </BarChart>
                            </CardContent>
                        </Card>

                        {/* Per Point Section */}
                        <Card>
                            <CardContent className='cardStyle'>
                                <Typography variant="h6" gutterBottom>
                                    Average Waste Collection Per Point
                                </Typography>
                                <FormControl fullWidth margin="normal" sx={{ position: 'absolute', top: '355px', right: '60px', width: '150px' }}>
                                    <InputLabel>Filter by Period</InputLabel>
                                    <Select value={periodZone} onChange={handlePeriodChange(setPeriodZone)}>
                                        <MenuItem value="daily">Daily</MenuItem>
                                        <MenuItem value="weekly">Weekly</MenuItem>
                                        <MenuItem value="monthly">Monthly</MenuItem>
                                        <MenuItem value="yearly">Yearly</MenuItem>
                                    </Select>
                                </FormControl>
                                <div style={{ display: "flex", alignItems: "start", gap: "50px" }}>
                                    <BarChart width={600} height={250} data={weeklyZoneData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="zone" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="weight" fill="#ffc658" barSize={40} />
                                    </BarChart>
                                    <div style={{ padding: "10px", display: "flex", gap: "20px" }}>
                                        {zoneData.map((zone, index) => (
                                            <div key={index} style={{ textAlign: "left" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                    <div style={{
                                                        width: "12px",
                                                        height: "12px",
                                                        backgroundColor: index === 0 ? "#4C7C5B" : index === 1 ? "#ECEA63" : "#5B3A5B",
                                                        borderRadius: "2px"
                                                    }}></div>
                                                    <Typography variant="h8" style={{ color: "#333", fontWeight: "bold" }}>
                                                        {zone.zone}
                                                    </Typography>
                                                </div>
                                                <ul style={{ paddingLeft: "20px", marginTop: "5px", listStyleType: "none" }}>
                                                    {zone.streets.map((street, i) => (
                                                        <li key={i} style={{ fontSize: "14px", color: "#555" }}>{street}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Operational Cost Section */}
                        <Card>
                            <CardContent className='cardStyle'>
                                <Typography variant="h6" gutterBottom>Average Truck Operational Cost</Typography>
                                <FormControl fullWidth margin="normal" sx={{ position: 'absolute', top: '685px', right: '60px', width: '150px' }}>
                                    <InputLabel>Operational</InputLabel>
                                    <Select value={costType} onChange={handlePeriodChange(setCostType)}>
                                        <MenuItem value="all">All Types</MenuItem>
                                        <MenuItem value="Fuel">Fuel</MenuItem>
                                        <MenuItem value="Maintenance">Maintenance</MenuItem>
                                        <MenuItem value="Labor">Labor</MenuItem>
                                    </Select>
                                </FormControl>
                                <BarChart width={600} height={200} data={operationalCostData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="costType" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="expenses" fill="#888" barSize={40} />
                                </BarChart>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </div>
    );
}