import Sidebar from '../../Components/Sidebar/Sidebar';
import  "../Analy/Analytics.scss"
import InputForm from '../Analy/InputForm'
import React, { useState, useEffect } from 'react';
import {FormControl,InputLabel, Select, Card, CardContent, Typography, MenuItem} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { db } from '../../firebase';
import { collection, getDocs,query, where, } from 'firebase/firestore';





export default function Analytics() {

    const [weeklyWasteData, setWeeklyWasteData] = useState([]);
    const [avgWasteData, setAvgWasteData] = useState([]);
    const [costData, setCostData] = useState([]);
    const [currentMonth, setCurrentMonth] = useState('');
    const [period, setPeriod] = useState('');


    useEffect(() => {

         // Get the current month name
         const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const today = new Date();
        setCurrentMonth(monthNames[today.getMonth()]);

        const fetchData = async () => {
        
          await fetchWeeklyWasteData();
          await fetchAvgWasteData();
          await fetchCostData();
        };
        fetchData();
      }, [period]);
        const fetchWeeklyWasteData = async () => {
            try {
            const wasteRef = collection(db, 'wasteData');
            let dataQuery;
        
            if (period === 'monthly') {
                // Fetch data for the current month and year
                const currentDate = new Date();
                const currentMonth = currentDate.getMonth() + 1;
                const currentYear = currentDate.getFullYear();
        
                dataQuery = query(
                wasteRef,
                where('month', '==', currentMonth),
                where('year', '==', currentYear)
                );
            } else if (period === 'yearly') {
                // Fetch data for the entire current year
                const currentYear = new Date().getFullYear();
                dataQuery = query(
                wasteRef, where('year', '==', currentYear)
                );
            }
        
            if (!dataQuery) return;
        
            const querySnapshot = await getDocs(dataQuery);
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            const formattedData = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                if (data.month) {
                    data.monthName = monthNames[data.month - 1];  // Convert month number to name
                }
                return data;
            });

                 setWeeklyWasteData(formattedData);
                } catch (error) {
                    console.error("Error fetching waste data:", error);
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

  

    return(
    <div className='sidebarParentContainer'>
        <Sidebar />

        <div className='subContainer'>
            <div className='detailContainer'>
                
                <div className='inputFormContainer'> 
                 <InputForm /> 
                </div>

                <div className='cardsContainer'> 
                        {/* Total Waste Collected */}
                        <Card>
                        <CardContent className='cardStyle'>
                        <Typography variant="h6" gutterBottom>
                        {period === "monthly"
                            ? `Monthly Waste Collected - (${currentMonth})`
                            : period === "yearly"
                            ? `Yearly Waste Collected - (${new Date().getFullYear()})`
                            : `Weekly Waste Collected - (${currentMonth})`
                        }
                        </Typography>

                            <FormControl fullWidth margin="normal" 
                            
                            sx={{
                                position: 'absolute',
                                top: '60px',       // Adjust as necessary
                                right: '200px',     // Adjust as necessary
                                borderRadius: '8px',
                                padding: '10px',
                                width: '150px',    // Adjust width if needed
                                height:'40px',
                                '& .MuiInputLabel-root': {
                                    color: 'gray',
                                    fontSize: '0.90rem',
                                    left: '2px',
                                    paddingTop:'11px',
                                },
                                '& .MuiSelect-root': {
                                    color: '#555',
                                    display: 'flex',
                                    justifyContent: 'center', // Center the selected text
                                    alignItems: 'center',
            
                                   
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#888',
                                    height:'50px',
                                    textAlign: 'center',
                                    
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#444',
                                },
                            }}
                            
                            >
                                    <InputLabel>Filter by Period</InputLabel>
                                    <Select value={period} onChange={handlePeriodChange}   sx={{
                                            textAlign: 'center', // Center selected text
                                            display: 'flex',
                                            justifyContent: 'center', // Align content to the center
                                            alignItems: 'center',
                                         
                                        }}> 
                                        <MenuItem value="weekly">Weekly</MenuItem>
                                        <MenuItem value="monthly">Monthly</MenuItem>
                                        <MenuItem value="yearly">Yearly</MenuItem>
                                    </Select>
                            </FormControl>


                            <BarChart width={600} height={200} data={weeklyWasteData}>
                            <XAxis dataKey={period === 'monthly' ? 'monthName' : period === 'yearly' ? 'year' : 'week'} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="volume" fill="#8884d8" barSize={40}/>
                            </BarChart>
                        </CardContent>
                        </Card>

                        {/* Average Waste per Collection Point */}
                        <Card>
                        <CardContent className='cardStyle'>
                            <Typography variant="h6" gutterBottom>Average Waste per Collection Point</Typography>
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
