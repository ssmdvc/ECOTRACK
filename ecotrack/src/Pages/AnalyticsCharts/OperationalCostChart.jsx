import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { Card, Box, CardContent, Typography, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

export default function OperationalCostChart({ data, selectedTruck, setSelectedTruck }) {
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" gutterBottom>
          Average Truck Operational Cost ({selectedTruck === "all" ? "All Trucks" : selectedTruck})
        </Typography>

        <FormControl fullWidth margin="normal" sx={{
            position: 'sticky',
            top: '500px',
            right: '5px',
            borderRadius: '8px',
            padding: '10px',
            width: '150px',
            height: '40px',
            '& .MuiInputLabel-root': { color: 'gray', fontSize: '0.90rem', left: '2px', paddingTop: '11px' },
            '& .MuiSelect-root': { color: '#555', display: 'flex', justifyContent: 'center', alignItems: 'center' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#888', height: '50px', textAlign: 'center' },
        }}>
          <InputLabel>Truck</InputLabel>
          <Select value={selectedTruck} onChange={(e) => setSelectedTruck(e.target.value)}>
            <MenuItem value="all">All Trucks</MenuItem>
            <MenuItem value="Truck 1">Truck 1</MenuItem>
            <MenuItem value="Truck 2">Truck 2</MenuItem>
          </Select>
        </FormControl>
        </Box>

        <BarChart width={600} height={200} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="type" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="expenses" barSize={40}>
            {data.map((entry, index) => (
              <Cell key={index} fill={index % 2 === 0 ? "#8884d8" : "#82ca9d"} />
            ))}
          </Bar>
        </BarChart>
      </CardContent>
    </Card>
  );
}
