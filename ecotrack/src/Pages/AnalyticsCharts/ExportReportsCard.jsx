import { useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../firebase";
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Chart from "chart.js/auto";

export default function ExportReportsCard({ onAddDataClick }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  const pesoFormatter = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP"
  });

  const handleExportPDF = async () => {
    const wasteSnapshot = await getDocs(collection(db, "wasteCollectionData"));
    const costSnapshot = await getDocs(collection(db, "operationalCostData"));
    const doc = new jsPDF();

    // Report Header
    doc.setFontSize(16);
    doc.text("Waste & Operational Cost Report (All Trucks)", 14, 20);
    doc.setFontSize(10);
    if (startDate && endDate) {
      doc.text(
        `Date Range: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
        14,
        28
      );
    }

    // Waste Data Table
    const wasteData = [];
    let totalWaste = 0;
    wasteSnapshot.forEach((docSnap) => {
      const d = docSnap.data();
      const date = d.collection_date.toDate();
      if (
        (!startDate || date >= startDate) &&
        (!endDate || date <= endDate)
      ) {
        wasteData.push([
          d.zone || "-",
          d.street || "-",
          d.collection_weight || 0,
          date.toLocaleDateString(),
          d.truck_id || "-"
        ]);
        totalWaste += Number(d.collection_weight || 0);
      }
    });

    doc.autoTable({
      startY: 40,
      head: [["Zone", "Street", "Weight (kg)", "Date", "Truck"]],
      body: wasteData,
      theme: "striped",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [22, 160, 133] }
    });

    let finalY = doc.lastAutoTable.finalY + 5;
    doc.setFontSize(11);
    doc.text(`Total Waste Collected: ${totalWaste.toFixed(2)} kg`, 14, finalY);

    // Cost Data Table
    finalY += 10;
    const costData = [];
    const costSummary = { Fuel: 0, Maintenance: 0, Labor: 0, Others: 0 };
    let totalCost = 0;

    costSnapshot.forEach((docSnap) => {
      const d = docSnap.data();
      const date = d.operation_date.toDate();
      if (
        (!startDate || date >= startDate) &&
        (!endDate || date <= endDate)
      ) {
        const costValue = Number(d.cost || 0);
        const type = d.type || "Others";

        costData.push([
          type,
          pesoFormatter.format(costValue),
          date.toLocaleDateString(),
          d.truck_id || "-"
        ]);

        costSummary[type] = (costSummary[type] || 0) + costValue;
        totalCost += costValue;
      }
    });

    doc.autoTable({
      startY: finalY,
      head: [["Operation Type", "Cost", "Date", "Truck"]],
      body: costData,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [52, 152, 219] }
    });

    finalY = doc.lastAutoTable.finalY + 5;
    doc.setFontSize(11);
    doc.text(
      `Total Operational Cost: ${pesoFormatter.format(totalCost)}`,
      14,
      finalY
    );

    // Pie Chart
    const pieData = Object.entries(costSummary).map(([key, value]) => ({
      name: key,
      value
    }));

    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");

    const pieChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: pieData.map(
          (d) => `${d.name}: ${pesoFormatter.format(d.value)}`
        ),
        datasets: [
          {
            data: pieData.map((d) => d.value),
            backgroundColor: COLORS
          }
        ]
      },
      options: {
        responsive: false,
        animation: {
          duration: 0
        },
        plugins: {
          legend: {
            display: true,
            position: "bottom"
          }
        }
      }
    });

    // Ensure chart renders before exporting to image
    setTimeout(() => {
      try {
        const imgData = pieChart.toBase64Image("image/png");
        doc.addPage();
        doc.setFontSize(14);
        doc.text("Operational Cost Summary (Pie Chart)", 14, 20);
        doc.addImage(imgData, "PNG", 30, 30, 150, 150);
        doc.save("waste-operational-cost-report.pdf");
      } catch (err) {
        console.error("Failed to export pie chart:", err);
        alert("Chart export failed. Please try again.");
        doc.save("waste-operational-cost-report.pdf");
      }
    }, 500);
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Export Reports
        </Typography>
        <Box display="flex" gap={2} alignItems="center" mb={2}>
  <LocalizationProvider dateAdapter={AdapterDateFns}>
    <DatePicker
      label="Start Date"
      value={startDate}
      onChange={setStartDate}
      renderInput={(params) => <TextField {...params} />}
    />
    <DatePicker
      label="End Date"
      value={endDate}
      onChange={setEndDate}
      renderInput={(params) => <TextField {...params} />}
    />
  </LocalizationProvider>

  <Button variant="outlined" color="primary" onClick={handleExportPDF}>
    Export All Data (PDF)
  </Button>

  <Button
    variant="outlined"
    color="primary"
    onClick={onAddDataClick}
    sx={{
      whiteSpace: 'nowrap'
    }}
  >
    Add Data
  </Button>
</Box>

      </CardContent>
    </Card>
  );
}
