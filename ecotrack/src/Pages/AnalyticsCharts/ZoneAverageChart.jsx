// File: src/Components/Charts/ZoneAverageChart.jsx
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
import { format, startOfWeek, endOfWeek } from "date-fns";

const ZoneAverageChart = ({ data, period, setPeriod }) => {
  const formatPeriodText = () => {
    const now = new Date();
    if (period === "daily") return `— ${format(now, "EEEE")}`;
    if (period === "weekly") return `— ${format(startOfWeek(now, { weekStartsOn: 1 }), "MMM d")} to ${format(endOfWeek(now, { weekStartsOn: 1 }), "MMM d")}`;
    if (period === "monthly") return `— ${format(now, "MMMM yyyy")}`;
    if (period === "yearly") return `— ${format(now, "yyyy")}`;
    return "";
  };

  const zoneColors = {
    "Zone A": "#4C7C5B",
    "Zone B": "#ECEA63",
    "Zone C": "#5B3A5B",
  };

  return (
    <Card>
      <CardContent className="cardStyle">
         <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" gutterBottom>
          Average Waste Collection Per Point {formatPeriodText()}
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
          <InputLabel>Filter by Period</InputLabel>
          <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="yearly">Yearly</MenuItem>
          </Select>
        </FormControl>
        </Box>

        <Box display="flex" gap={5} alignItems="flex-start">
          <BarChart width={600} height={250} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="zone" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="weight" barSize={40}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={zoneColors[entry.zone] || "#ccc"} />
              ))}
            </Bar>
          </BarChart>

          <Box display="flex" gap={4}>
            {data.map((zone, index) => (
              <Box key={index}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{ width: 12, height: 12, backgroundColor: zoneColors[zone.zone], borderRadius: "2px" }}
                  />
                  <Typography variant="subtitle1" fontWeight="bold">
                    {zone.zone}
                  </Typography>
                </Box>
                <ul style={{ listStyle: "none", paddingLeft: 0, marginTop: 5 }}>
                  <li>Total: {zone.totalWeight.toFixed()} kg</li>
                  {zone.streets.map((street, i) => (
                    <li key={i} style={{ fontSize: "14px", color: "#555" }}>{street}</li>
                  ))}
                </ul>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ZoneAverageChart;
