import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, query, where, getDocs,doc, updateDoc } from 'firebase/firestore';
import { TextField, Button, MenuItem, Select, FormControl, InputLabel, Modal, Box, Typography } from '@mui/material';
import "../Analy/Analytics.scss";
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';

export default function InputForm() {
  const [open, setOpen] = useState(false);
  const [inputType, setInputType] = useState('');
  const [dateRecord, setDateRecorded] = useState('');
  

  // Waste Collection Metrics
  const [week, setWeek] = useState('');
  const [volume, setVolume] = useState(0);

  // Average Waste per Collection Point
  const [area, setArea] = useState('');
  const [avgWaste, setAvgWaste] = useState(0);

  // Operational Costs
  const [costType, setCostType] = useState('');
  const [cost, setCost] = useState(0);

  useEffect(() => {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;
    setDateRecorded(formattedDate);
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setInputType('');
    setWeek('');
    setVolume(0);
    setArea('');
    setAvgWaste(0);
    setCostType('');
    setCost(0);
  };

    const checkAndUpdateMonthlyTotal = async () => {
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth() + 1;
          const currentYear = currentDate.getFullYear();
      
          // Query all weekly entries for this month
          const q = query(
              collection(db, 'wasteData'),
              where('month', '==', currentMonth),
              where('year', '==', currentYear)
          );
      
          const querySnapshot = await getDocs(q);
          const weekData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
          // If 4 weeks exist, calculate the total volume
          if (weekData.length === 4) {
              const totalVolume = weekData.reduce((sum, entry) => sum + entry.volume, 0);
      
              // Get the last week's document (Week 4)
              const lastWeekDoc = weekData.find(entry => entry.week === 'Week 4');
              if (lastWeekDoc) {
                  await updateDoc(doc(db, 'wasteData', lastWeekDoc.id), {
                      monthlyTotal: totalVolume
                  });
                  console.log(`✅ Monthly total updated: ${totalVolume}`);
              }
          }
      };
      
    

      const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Get the current date in MM/DD/YYYY format
        const currentDate = new Date();
        const formattedDate = `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;
        
        try {
            const currentMonth = currentDate.getMonth() + 1;
            const currentYear = currentDate.getFullYear();
    
            // ✅ Check if the selected week already exists for the current month
            const q = query(
                collection(db, 'wasteData'),
                where('week', '==', week),
                where('month', '==', currentMonth),
                where('year', '==', currentYear)
            );
    
            const querySnapshot = await getDocs(q);
    
            if (!querySnapshot.empty) {
                alert(`⚠️ Data for ${week} already exists for the current month!`);
                return;
            }
    
            if (inputType === 'waste') {
                const wasteRef = await addDoc(collection(db, 'wasteData'), {
                    week,
                    volume: Number(volume),
                    dateRecord: formattedDate,
                    month: currentMonth,
                    year: currentYear,
                    timestamp: new Date()
                });
    
                console.log('✅ Waste data added:', wasteRef.id);
    
                // ✅ Call checkAndUpdateMonthlyTotal **after** adding the waste entry
                await checkAndUpdateMonthlyTotal();
            } else if (inputType === 'averageWaste') {
                await addDoc(collection(db, 'collectionData'), {
                    area,
                    avgWaste: Number(avgWaste)
                });
            } else if (inputType === 'cost') {
                await addDoc(collection(db, 'costData'), {
                    type: costType,
                    cost: Number(cost)
                });
            }
    
            alert('✅ Data added successfully!');
            handleClose();
        } catch (error) {
            console.error('❌ Error adding data: ', error);
        }
    };

       // Function to Download PDF
    //   const downloadPDF = () => {
    //       const input = document.getElementById('analyticsContent');
    //       html2canvas(input, { scale: 2 }).then(canvas => {
    //           const imgData = canvas.toDataURL('image/png');
    //           const pdf = new jsPDF('p', 'mm', 'a4');
    //           const imgWidth = 210;
    //           const imgHeight = (canvas.height * imgWidth) / canvas.width;
    //           pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    //           pdf.save('analytics_report.pdf');
    //       });
    //   };

  return (
    <>
        
      <Button onClick={handleOpen}>
        Add Data
      </Button>

      {/* <Button  onClick={downloadPDF}>
        Download as PDF
      </Button> */}

      <Modal open={open} onClose={handleClose} aria-labelledby="modal-title" aria-describedby="modal-description">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2
          }}
        >
          <Typography id="modal-title" variant="h6" gutterBottom>
            Add Data
          </Typography>

          <form onSubmit={handleSubmit}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Data Type</InputLabel>
              <Select
                value={inputType}
                onChange={(e) => setInputType(e.target.value)}
              >
                <MenuItem value="waste">Waste Collection Metrics</MenuItem>
                <MenuItem value="averageWaste">Average Waste per Collection Point</MenuItem>
                <MenuItem value="cost">Operational Costs</MenuItem>
              </Select>
            </FormControl>

            {inputType === 'waste' && (
              <>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Select Week</InputLabel>
                        <Select value={week} onChange={(e) => setWeek(e.target.value)}>
                            <MenuItem value="Week 1">Week 1</MenuItem>
                            <MenuItem value="Week 2">Week 2</MenuItem>
                            <MenuItem value="Week 3">Week 3</MenuItem>
                            <MenuItem value="Week 4">Week 4</MenuItem>
                        </Select>
                </FormControl>


                <TextField
                  label="Volume Collected (kg)"
                  type="number"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  fullWidth
                  margin="normal"
                />
              </>
            )}

            {inputType === 'averageWaste' && (
              <>
                <TextField
                  label="Area (e.g., Zone A, Zone B)"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Average Waste Collected"
                  type="number"
                  value={avgWaste}
                  onChange={(e) => setAvgWaste(e.target.value)}
                  fullWidth
                  margin="normal"
                />
              </>
            )}

            {inputType === 'cost' && (
              <>
                <TextField
                  label="Cost Type (e.g., Fuel, Maintenance)"
                  value={costType}
                  onChange={(e) => setCostType(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Cost Amount"
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  fullWidth
                  margin="normal"
                />
              </>
            )}

            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button onClick={handleClose} color="secondary" style={{ marginRight: '10px' }}>
                Cancel
              </Button>
              {inputType && (
                <Button variant="contained" color="primary" type="submit">
                  Submit
                </Button>
              )}
            </Box>
          </form>
        </Box>
      </Modal>
    </>
  );
}
