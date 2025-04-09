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
  
    // --- Report Header ---
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
  
    // --- Waste Data Table ---
    const wasteData = [];
    const zoneWeights = {};
    let totalWaste = 0;
  
    wasteSnapshot.forEach((docSnap) => {
      const d = docSnap.data();
      const date = d.collection_date.toDate();
      if ((!startDate || date >= startDate) && (!endDate || date <= endDate)) {
        const weight = Number(d.collection_weight || 0);
        const zone = d.zone || "-";
  
        wasteData.push([
          zone,
          d.street || "-",
          weight,
          date.toLocaleDateString(),
          d.truck_id || "-"
        ]);
  
        zoneWeights[zone] = (zoneWeights[zone] || 0) + weight;
        totalWaste += weight;
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
  
    // --- Operational Cost Table ---
    finalY += 10;
    const costData = [];
    const costSummary = { Fuel: 0, Maintenance: 0, Labor: 0, Others: 0 };
    const operationCounts = {};
    let totalCost = 0;
  
    costSnapshot.forEach((docSnap) => {
      const d = docSnap.data();
      const date = d.operation_date.toDate();
      if ((!startDate || date >= startDate) && (!endDate || date <= endDate)) {
        const value = Number(d.cost || 0);
        const type = d.type || "Others";
  
        costData.push([
          type,
          pesoFormatter.format(value),
          date.toLocaleDateString(),
          d.truck_id || "-"
        ]);
  
        costSummary[type] = (costSummary[type] || 0) + value;
        operationCounts[type] = (operationCounts[type] || 0) + 1;
        totalCost += value;
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
    doc.text(`Total Operational Cost: ${pesoFormatter.format(totalCost)}`, 14, finalY);
  
    // --- Pie Chart Generation ---
    const pieData = Object.entries(costSummary).map(([name, value]) => ({ name, value }));
    const canvas = document.createElement("canvas");
    canvas.width = 240;
    canvas.height = 240;
    const ctx = canvas.getContext("2d");
  
    const pieChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: Object.keys(costSummary),
        datasets: [
          {
            data: Object.values(costSummary),
            backgroundColor: COLORS
          }
        ]
      },
      options: {
        responsive: false,
        animation: { duration: 0 },
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
              font: { size: 9 },
              usePointStyle: true,
              boxWidth: 10,
              padding: 8
            }
          }
        }
      }
    });
  
    // --- Wait for Chart Render then Export ---
    setTimeout(() => {
      try {
        const imgData = pieChart.toBase64Image("image/png");
  
        doc.addPage();
        doc.setFontSize(14);
        doc.text("Operational Cost Summary (Pie Chart)", 14, 20);
        doc.addImage(imgData, "PNG", 50, 30, 110, 110);
  
        // --- ANALYSIS SUMMARY ---
        doc.setFontSize(12);
        doc.text("Analysis Summary", 16, 150);
        doc.setFontSize(10);
  
        // 1. Operational Cost Breakdown
        const sortedCosts = pieData.sort((a, b) => b.value - a.value);
        sortedCosts.forEach((item, i) => {
          const percent = totalCost > 0 ? ((item.value / totalCost) * 100).toFixed(1) : 0;
          doc.text(
            `• ${item.name}: ${pesoFormatter.format(item.value)} (${percent}%)`,
            16,
            158 + i * 10
          );
        });
  
        // 2. Zone Waste Averages
        const zoneKeys = Object.keys(zoneWeights);
        const zoneAvgStartY = 158 + sortedCosts.length * 10 + 10;
        doc.setFontSize(11);
        doc.text("Zone Waste Averages:", 14, zoneAvgStartY);
        doc.setFontSize(10);
        let yOffset = zoneAvgStartY + 8;
  
        const zoneStats = zoneKeys.map((z) => {
          const records = wasteData.filter((w) => w[0] === z).length;
          const avg = records > 0 ? zoneWeights[z] / records : 0;
          return { zone: z, total: zoneWeights[z], avg, records };
        });
  
        zoneStats.forEach((z) => {
          doc.text(
            `• ${z.zone}: ${z.avg.toFixed(2)} kg avg (${z.total.toFixed(2)} kg total)`,
            16,
            yOffset
          );
          yOffset += 8;
        });
  
        // 3. Highest & Lowest Waste Zones
        const sortedZones = zoneStats.sort((a, b) => b.total - a.total);
        const highestZone = sortedZones[0];
        const lowestZone = sortedZones[sortedZones.length - 1];
  
        doc.setFontSize(11);
        doc.text("Zone Highlights:", 14, yOffset + 5);
        doc.setFontSize(10);
        yOffset += 13;
        doc.text(
          `• Highest waste zone: ${highestZone.zone} (${highestZone.total.toFixed(2)} kg)`,
          16,
          yOffset
        );
        yOffset += 8;
        doc.text(
          `• Lowest waste zone: ${lowestZone.zone} (${lowestZone.total.toFixed(2)} kg)`,
          16,
          yOffset
        );
  
        // 4. Most Frequent Operation Type
        const mostFrequentOp = Object.entries(operationCounts).sort((a, b) => b[1] - a[1])[0];
        const avgCostPerOp = costData.length > 0 ? totalCost / costData.length : 0;
  
        doc.setFontSize(11);
        doc.text("Operational Highlights:", 14, yOffset + 13);
        doc.setFontSize(10);
        doc.text(
          `• Most frequent operation type: ${mostFrequentOp[0]} (${mostFrequentOp[1]} entries)`,
          16,
          yOffset + 21
        );
        doc.text(
          `• Average cost per operation: ${pesoFormatter.format(avgCostPerOp)}`,
          16,
          yOffset + 29
        );
  
        // 5. Recommendations
        doc.setFontSize(11);
        doc.text("Recommendations:", 14, yOffset + 42);
        doc.setFontSize(10);
        doc.text(
          `• Investigate high ${sortedCosts[0].name} cost — optimize usage or sourcing.`,
          16,
          yOffset + 50
        );
        doc.text(
          `• Review collection routes in ${lowestZone.zone} to improve waste efficiency.`,
          16,
          yOffset + 58
        );
        doc.text(
          `• Consider scheduling ${mostFrequentOp[0]} tasks more strategically.`,
          16,
          yOffset + 66
        );
  
        doc.save("waste-operational-cost-report.pdf");
      } catch (err) {
        console.error("Chart export failed:", err);
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
