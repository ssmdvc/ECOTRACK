import React, { useState } from 'react';
import { db } from '../../firebase';
import { TextField, Button, MenuItem, Select, FormControl, InputLabel, Modal, Box, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { collection, addDoc } from 'firebase/firestore';

export default function InputData() {
    const [open, setOpen] = useState(false);
    const [inputType, setInputType] = useState('');
    const [date, setDate] = useState(null);
    const [zone, setZone] = useState('');
    const [street, setStreet] = useState('');
    const [weight, setWeight] = useState(0);
    const [truckId, setTruckId] = useState('');
    const [truck, setTruck] = useState('');
    const [operationType, setOperationType] = useState('');
    const [cost, setCost] = useState(0);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setInputType('');
        setZone('');
        setStreet('');
        setWeight(0);
        setTruckId('');
        setTruck('');
        setOperationType('');
        setCost(0);
        setDate(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const currentDate = date || new Date();
            const timestamp = new Date();

            if (inputType === 'wasteData') {
                await addDoc(collection(db, 'wasteCollectionData'), {
                    collection_date: currentDate,
                    collection_weight: Number(weight),
                    zone,
                    street,
                    truck_id: truckId
                });
            } else if (inputType === 'costData') {
                await addDoc(collection(db, 'operationalCostData'), {
                    truck_id: truck,
                    operation_type: operationType,
                    cost: Number(cost),
                    operation_date: currentDate,
                    timestamp
                });
            }
            alert('✅ Data added successfully!');
            handleClose();
        } catch (error) {
            console.error('❌ Error adding data: ', error);
            alert('Error adding data: ' + error.message);
        }
    };

    return (
        <>
            <Button onClick={handleOpen} sx={{ backgroundColor: "primary.main", color: "white", padding: "10px 20px", borderRadius: "8px", position: "absolute", top: "20px", right: "150px" }}>
                Add Data
            </Button>
            <Button sx={{ backgroundColor: "primary.main", color: "white", padding: "10px 20px", borderRadius: "8px", position: "absolute", top: "20px", right: "30px" }}>
                Save PDF
            </Button>
            <Modal open={open} onClose={handleClose}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>Add New Data</Typography>
                    <form onSubmit={handleSubmit}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Select Data Type</InputLabel>
                            <Select value={inputType} onChange={(e) => setInputType(e.target.value)}>
                                <MenuItem value="wasteData">Waste Collection Entry</MenuItem>
                                <MenuItem value="costData">Truck Operational Cost Entry</MenuItem>
                            </Select>
                        </FormControl>
                        {inputType === 'wasteData' && (
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
                                    <Select value={street} onChange={(e) => setStreet(e.target.value)}>
                                        <MenuItem value="Monark">Monark</MenuItem>
                                        <MenuItem value="Cristeta">Cristeta</MenuItem>
                                        <MenuItem value="Facoma">Facoma</MenuItem>
                                        <MenuItem value="Burgos">Burgos</MenuItem>
                                        <MenuItem value="Manggahan">Manggahan</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField label="Weight Collected (kg)" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} fullWidth margin="normal" />
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Select Truck Assigned</InputLabel>
                                    <Select value={truckId} onChange={(e) => setTruckId(e.target.value)}>
                                        <MenuItem value="Truck 1">Truck 1</MenuItem>
                                        <MenuItem value="Truck 2">Truck 2</MenuItem>
                                    </Select>
                                </FormControl>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DatePicker label="Collection Date" value={date} onChange={(newDate) => setDate(newDate)} renderInput={(params) => <TextField {...params} fullWidth margin="normal" />} />
                                </LocalizationProvider>
                            </>
                        )}
                        {inputType === 'costData' && (
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
                                    <Select value={operationType} onChange={(e) => setOperationType(e.target.value)}>
                                        <MenuItem value="Fuel">Fuel</MenuItem>
                                        <MenuItem value="Maintenance">Maintenance</MenuItem>
                                        <MenuItem value="Labor">Labor</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField label="Cost Amount" type="number" value={cost} onChange={(e) => setCost(e.target.value)} fullWidth margin="normal" />
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DatePicker label="Operation Date" value={date} onChange={(newDate) => setDate(newDate)} renderInput={(params) => <TextField {...params} fullWidth margin="normal" />} />
                                </LocalizationProvider>
                            </>
                        )}
                        <Box display="flex" justifyContent="flex-end" mt={2}>
                            <Button onClick={handleClose} color="secondary" style={{ marginRight: '10px' }}>Cancel</Button>
                            {inputType && <Button variant="contained" color="primary" type="submit">Submit</Button>}
                        </Box>
                    </form>
                </Box>
            </Modal>
        </>
    );
}