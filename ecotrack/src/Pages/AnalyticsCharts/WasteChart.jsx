import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card, CardContent, Typography, Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

export default function WasteChart({ data, title, period, setPeriod, className = "" }) {
  const barColor = {
    daily: "#42a5f5",
    weekly: "#66bb6a",
    monthly: "#ffa726",
    yearly: "#ab47bc"
  }[period];

  return (
    <Card
    
          className={className}
          sx={{
            borderRadius: "12px",
            boxShadow: "0 6px 24px rgba(0, 0, 0, 0.05)",
            border: "1px solid #e0e0e0",
          }}

        >
      <CardContent >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{title}</Typography>
          <FormControl sx={{ width: 150 }}>
            <InputLabel>Filter by Period</InputLabel>
            <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <BarChart width={600} height={200} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="volume" fill={barColor} barSize={40} />
        </BarChart>
      </CardContent>
    </Card>
  );
}
