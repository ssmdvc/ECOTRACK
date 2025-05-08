
import React from "react";
import {
  Modal, Box, Typography, FormControl, InputLabel,
  Select, MenuItem, TextField, Button
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const DataEntryModal = ({
  open, handleClose, handleSubmit, zoneStreetsMap,
  inputType, setInputType, date, setDate,
  zone, setZone, street, setStreet, weight, setWeight,
  truckId, setTruckId, truck, setTruck,
  operationType, setOperationType, cost, setCost,
  showSuccess
}) => {
  const getStreetOptions = () => zoneStreetsMap[zone] || [];

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 400,
        bgcolor: "background.paper",
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
      }}>
        {showSuccess && (
          <Typography color="success.main" textAlign="center" mb={2}>
            Data added successfully!
          </Typography>
        )}
        <Typography variant="h6" gutterBottom>Add New Data</Typography>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Data Type</InputLabel>
            <Select value={inputType} onChange={(e) => setInputType(e.target.value)}>
              <MenuItem value="wasteData">Waste Collection Entry</MenuItem>
              <MenuItem value="costData">Truck Operational Cost Entry</MenuItem>
            </Select>
          </FormControl>

          {inputType === "wasteData" && (
            <>
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Zone</InputLabel>
                <Select value={zone} onChange={(e) => setZone(e.target.value)}>
                  {Object.keys(zoneStreetsMap).map((z) => (
                    <MenuItem key={z} value={z}>{z}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Street</InputLabel>
                <Select value={street} onChange={(e) => setStreet(e.target.value)}>
                  {getStreetOptions().map((s, i) => (
                    <MenuItem key={i} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField label="Weight (kg)" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} fullWidth margin="normal" />
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Truck</InputLabel>
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

          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button onClick={handleClose} color="secondary" sx={{ mr: 1 }}>
              Cancel
            </Button>
            {inputType && (
              <Button type="submit" variant="contained" color="primary" disabled={showSuccess}>
                Submit
              </Button>
            )}
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default DataEntryModal;
