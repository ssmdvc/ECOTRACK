import Sidebar from '../../Components/Sidebar/Sidebar';
import "../Analy/Analytics.scss";
import InputForm from '../Analy/InputForm';
import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, Card, CardContent, Typography, MenuItem } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { db } from '../../firebase';
import { collection, setDoc, doc, getDocs, query, where } from 'firebase/firestore';

export default function Analytics() {
    const [weeklyWasteData, setWeeklyWasteData] = useState([]);
    const [monthlyWasteData, setMonthlyWasteData] = useState([]);
    const [yearlyTotal, setYearlyTotal] = useState(0);
    const [avgWasteData, setAvgWasteData] = useState([]);
    const [costData, setCostData] = useState([]);
    const [currentMonth, setCurrentMonth] = useState('');
    const [period, setPeriod] = useState('weekly');
    const [avgWastePeriod, setAvgWastePeriod] = useState('weekly');

    useEffect(() => {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const today = new Date();
        setCurrentMonth(monthNames[today.getMonth()]);

        const fetchData = async () => {
            await fetchWeeklyWasteData();
            await fetchMonthlyWasteData();
            await fetchYearlyTotal();
            await fetchAvgWasteData();
            await fetchCostData();
        };
        fetchData();
    }, [period]);

    const fetchWeeklyWasteData = async () => {
        try {
            const wasteRef = collection(db, 'wasteData');
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;
            const currentYear = currentDate.getFullYear();
            let dataQuery;

            if (period === 'monthly') {
                dataQuery = query(
                    wasteRef,
                    where('month', '==', currentMonth),
                    where('year', '==', currentYear),
                    where('week', '==', 'Week 4')
                );
            } else if (period === 'yearly') {
                dataQuery = query(
                    wasteRef,
                    where('year', '==', currentYear)
                );
            } else {
                dataQuery = query(
                    wasteRef,
                    where('month', '==', currentMonth), 
                    where('year', '==', currentYear)
                );
            }

            if (!dataQuery) return;
            const querySnapshot = await getDocs(dataQuery);
            const formattedData = querySnapshot.docs.map(doc => doc.data());


            setWeeklyWasteData(formattedData);
        } catch (error) {
            console.error("Error fetching weekly waste data:", error);
        }
    };

    const fetchMonthlyWasteData = async () => {
        try {
            const wasteRef = collection(db, 'wasteData');
            const currentYear = new Date().getFullYear();
            
            const dataQuery = query(
                wasteRef,
                where('year', '==', currentYear),
                where('week', '==', 'Week 4') // Only fetch last week's data per month
            );

            const querySnapshot = await getDocs(dataQuery);
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            const formattedData = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    monthName: monthNames[data.month - 1], 
                    totalVolume: data.monthlyTotal || 0
                };
            });

            setMonthlyWasteData(formattedData);
        } catch (error) {
            console.error("Error fetching monthly waste data:", error);
        }
    };

    const fetchYearlyTotal = async () => {
        try {
            const wasteRef = collection(db, 'wasteData');
    
            // Fetch all years instead of only the current year
            const querySnapshot = await getDocs(wasteRef);
    
            // Organize data by year
            const yearlyDataMap = {};
            querySnapshot.docs.forEach(doc => {
                const data = doc.data();
                const year = data.year;
    
                if (!yearlyDataMap[year]) {
                    yearlyDataMap[year] = { year, totalVolume: 0 };
                }
    
                yearlyDataMap[year].totalVolume += data.monthlyTotal || 0;
            });
    
            // Convert object to array
            const formattedYearlyData = Object.values(yearlyDataMap);
    
            // Save yearly totals in Firestore (Optional)
            for (const yearlyRecord of formattedYearlyData) {
                const yearlyDocRef = doc(db, "yearlyData", `year_${yearlyRecord.year}`);
                await setDoc(yearlyDocRef, yearlyRecord, { merge: true });
            }
    
            setYearlyTotal(formattedYearlyData);
        } catch (error) {
            console.error("Error fetching yearly total waste:", error);
        }
    };
    

    const fetchAvgWasteData = async () => {
        const querySnapshot = await getDocs(collection(db, 'collectionData'));
        setAvgWasteData(querySnapshot.docs.map(doc => doc.data()));
    };

    const fetchCostData = async () => {
        const querySnapshot = await getDocs(collection(db, 'costData'));
        setCostData(querySnapshot.docs.map(doc => doc.data()));
    };

    const handlePeriodChange = (event) => {
        setPeriod(event.target.value);
    };

    const handleAvgWastePeriodChange = (event) => {
        setAvgWastePeriod(event.target.value);
    };


    return (
        <div className='sidebarParentContainer'>
            <Sidebar />
            <div className='subContainer'>
                <div className='detailContainer'>
                    <div className='inputFormContainer'>
                        <InputForm />
                    </div>

                    <div className='cardsContainer'>
                        {/* Waste Collected Card */}
                        <Card>
                            <CardContent className='cardStyle'>
                                <Typography variant="h6" gutterBottom>
                                    {period === "monthly"
                                        ? `Monthly Waste Collected`
                                        : period === "yearly"
                                        ? `Yearly Waste Collected`
                                        : `Weekly Waste Collected - (${currentMonth})`
                                    }
                                </Typography>

                                {/* Period Filter Dropdown */}
                                <FormControl fullWidth margin="normal" sx={{
                                    position: 'absolute',
                                    top: '60px',
                                    right: '200px',
                                    borderRadius: '8px',
                                    padding: '10px',
                                    width: '150px',
                                    height: '40px',
                                    '& .MuiInputLabel-root': { color: 'gray', fontSize: '0.90rem', left: '2px', paddingTop: '11px' },
                                    '& .MuiSelect-root': { color: '#555', display: 'flex', justifyContent: 'center', alignItems: 'center' },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#888', height: '50px', textAlign: 'center' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                                }}>
                                    <InputLabel>Filter by Period</InputLabel>
                                    <Select value={period} onChange={handlePeriodChange} sx={{
                                        textAlign: 'center',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                        <MenuItem value="weekly">Weekly</MenuItem>
                                        <MenuItem value="monthly">Monthly</MenuItem>
                                        <MenuItem value="yearly">Yearly</MenuItem>
                                    </Select>
                                </FormControl>

                                {/* BarChart for Waste Data */}
                                <BarChart width={600} height={200} data={period === 'yearly' ? yearlyTotal : period === 'monthly' ? monthlyWasteData : weeklyWasteData}>
                                    <XAxis dataKey={period === 'yearly' ? 'year' : period === 'monthly' ? 'monthName' : 'week'} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    {period === 'weekly' && <Bar dataKey="volume" fill="#8884d8" barSize={40} />}
                                    {period === 'monthly' && <Bar dataKey="totalVolume" fill="#48A6A7" barSize={40} />}
                                    {period === 'yearly' && <Bar dataKey="totalVolume" fill="#ff5733" barSize={40} />}
                                </BarChart>

                            </CardContent>
                        </Card>

                        {/* Average Waste Per Collection Point */}
                       <Card>
                            <CardContent className='cardStyle'>
                                <Typography variant="h6" gutterBottom>Average Waste per Collection Point</Typography>
                                <FormControl fullWidth margin="normal" sx={{
                                    position: 'absolute',
                                    top: '360px',
                                    right: '200px',
                                    borderRadius: '8px',
                                    padding: '10px',
                                    width: '150px',
                                    height: '40px',
                                    '& .MuiInputLabel-root': { color: 'gray', fontSize: '0.90rem', left: '2px', paddingTop: '11px' },
                                    '& .MuiSelect-root': { color: '#555', display: 'flex', justifyContent: 'center', alignItems: 'center' },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#888', height: '50px', textAlign: 'center' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                                }}>
                                    <InputLabel>Filter by Period</InputLabel>
                                    <Select value={avgWastePeriod} onChange={handleAvgWastePeriodChange} sx={{
                                        textAlign: 'center',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                
                                        <MenuItem value="weekly">Weekly</MenuItem>
                                        <MenuItem value="monthly">Monthly</MenuItem>
                                        <MenuItem value="yearly">Yearly</MenuItem>
                                    </Select>
                                </FormControl>

                                 {/* BarChart for Average Waste Data point */}
                                <BarChart width={600} height={200} data={avgWasteData}>
                                    <XAxis dataKey="area" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="avgWaste" fill="#82ca9d" barSize={40} />
                                </BarChart>
                            </CardContent>
                        </Card>

                         {/* Operational Costs */}
                        <Card>
                        <CardContent className='cardStyle'>
                            <Typography variant="h6" gutterBottom>Operational Costs</Typography>
                            <BarChart width={600} height={200} data={costData}>
                            <XAxis dataKey="type" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="cost" fill="#ffc658"  barSize={40}/>
                            </BarChart>
                        </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
