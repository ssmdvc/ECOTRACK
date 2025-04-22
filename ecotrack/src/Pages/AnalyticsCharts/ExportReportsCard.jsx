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
import brgyLogo from "../../Components/brgyLogo.jpg";

export default function ExportReportsCard({ onAddDataClick }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleExportPDF = async () => {
    const wasteSnapshot = await getDocs(collection(db, "wasteCollectionData"));
    const costSnapshot = await getDocs(collection(db, "operationalCostData"));
    const doc = new jsPDF();

    const formattedStart = startDate?.toLocaleDateString() || "Start Date";
    const formattedEnd = endDate?.toLocaleDateString() || "End Date";

    const logo = new Image();
    logo.src = brgyLogo;

    const addWatermarksToAllPages = () => {
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setGState(new doc.GState({ opacity: 0.1 }));
        doc.addImage(logo, "JPG", 45, 70, 120, 120); // Center watermark
        doc.setGState(new doc.GState({ opacity: 1 }));
      }
    };

    const drawLabelWithGreenDates = (labelStart, startDateStr, endDateStr, labelEnd, yPos) => {
      let x = 14;
      doc.setTextColor(0, 0, 0);
      doc.text(labelStart, x, yPos);
      x += doc.getTextWidth(labelStart);

      doc.setTextColor(67, 160, 71);
      doc.text(startDateStr, x, yPos);
      x += doc.getTextWidth(startDateStr);

      doc.setTextColor(0, 0, 0);
      doc.text(" to ", x, yPos);
      x += doc.getTextWidth(" to ");

      doc.setTextColor(67, 160, 71);
      doc.text(endDateStr, x, yPos);
      x += doc.getTextWidth(endDateStr);

      doc.setTextColor(0, 0, 0);
      doc.text(labelEnd, x, yPos);
    };

    // Page Header
    doc.addImage(logo, "JPG", 20, 10, 20, 20);
    doc.setFontSize(14);
    doc.text("Waste and Operational Cost Report", 105, 20, { align: "center" });
    doc.setFontSize(11);
    doc.text("Barangay Pamplona Uno, Las Piñas, Philippines", 105, 27, { align: "center" });

    const wasteData = [];
    let totalWaste = 0;
    wasteSnapshot.forEach((docSnap) => {
      const d = docSnap.data();
      const date = d.collection_date.toDate();
      if ((!startDate || date >= startDate) && (!endDate || date <= endDate)) {
        const weight = Number(d.collection_weight || 0);
        totalWaste += weight;
        wasteData.push([
          d.zone || "-",
          d.street || "-",
          weight,
          date.toLocaleDateString(),
          d.truck_id || "-"
        ]);
      }
    });

    let finalY = 40;
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text("Waste Collected Table:", 14, finalY);
    doc.autoTable({
      startY: finalY + 4,
      head: [["Zone", "Street", "Weight (kg)", "Date", "Truck"]],
      body: wasteData,
      theme: "grid",
      headStyles: { fillColor: [76, 175, 80] },
      styles: { fontSize: 9 }
    });
    finalY = doc.lastAutoTable.finalY + 6;

    drawLabelWithGreenDates(
      "Total Waste Collected as of ",
      formattedStart,
      formattedEnd,
      `: ${totalWaste.toFixed(2)} kg`,
      finalY
    );

    const costData = [];
    const costSummary = { Fuel: 0, Maintenance: 0, Labor: 0, Others: 0 };
    let totalCost = 0;
    costSnapshot.forEach((docSnap) => {
      const d = docSnap.data();
      const date = d.operation_date.toDate();
      if ((!startDate || date >= startDate) && (!endDate || date <= endDate)) {
        const value = Number(d.cost || 0);
        const type = d.type || "Others";
        totalCost += value;
        costSummary[type] = (costSummary[type] || 0) + value;
        costData.push([
          type,
          `Php ${value.toFixed(2)}`,
          date.toLocaleDateString(),
          d.truck_id || "-"
        ]);
      }
    });

    finalY += 20;
    doc.setTextColor(0);
    doc.text("Operational Costs Table:", 14, finalY);
    doc.autoTable({
      startY: finalY + 4,
      head: [["Operation Type", "Cost (Php)", "Date", "Truck"]],
      body: costData,
      theme: "grid",
      headStyles: { fillColor: [76, 175, 80] },
      styles: { fontSize: 9 }
    });
    finalY = doc.lastAutoTable.finalY + 6;

    drawLabelWithGreenDates(
      "Total Operational Costs as of ",
      formattedStart,
      formattedEnd,
      `: Php${totalCost.toFixed(2)}`,
      finalY
    );

    const zoneSummary = {};
    wasteData.forEach(([zone, , weight]) => {
      if (!zoneSummary[zone]) zoneSummary[zone] = 0;
      zoneSummary[zone] += weight;
    });
    const zoneTable = Object.entries(zoneSummary).map(([zone, weight]) => [zone, weight]);
    const totalPerZone = zoneTable.reduce((acc, row) => acc + row[1], 0);

    finalY += 20;
    doc.setTextColor(0);
    doc.text("Per Zones Collection Table:", 14, finalY);
    doc.autoTable({
      startY: finalY + 4,
      head: [["Zone", "Weight (kg)"]],
      body: zoneTable,
      theme: "grid",
      headStyles: { fillColor: [76, 175, 80] },
      styles: { fontSize: 9 }
    });
    finalY = doc.lastAutoTable.finalY + 6;

    drawLabelWithGreenDates(
      "Total Collection Per Zone as of ",
      formattedStart,
      formattedEnd,
      `: ${totalPerZone} kg`,
      finalY
    );

    // Page break check
    if (finalY + 40 > 270) {
      doc.addPage();
      finalY = 20;
    }

    // Summary Analysis
    finalY += 20;
    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.text("SUMMARY ANALYSIS:", 14, finalY);

    const summaryBlock = `This report provides an overview of collected waste and truck operational costs in Barangay Pamplona Uno. Between ${formattedStart} and ${formattedEnd}, a total of ${totalWaste.toFixed(2)} kg of waste was gathered. Total operational expenses amounted to Php${totalCost.toFixed(2)}. Cost breakdown: ${Object.entries(costSummary).map(([k, v]) => `${k}: Php${v.toFixed(2)}`).join(", ")}. Zone collections totaled ${totalPerZone} kg, reflecting waste distribution across the community.`;

    const blockText = doc.splitTextToSize(summaryBlock, 180);
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(blockText, 14, finalY + 8);

    // ✅ Apply watermark on every page
    addWatermarksToAllPages();

    doc.save("waste-operational-cost-report.pdf");
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" align="center" gutterBottom>
          Export Reports
        </Typography>
        <Box display="flex" gap={2} alignItems="center" justifyContent="center" mb={2}>
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
          <Button variant="outlined" color="primary" onClick={onAddDataClick}>
            Add Data
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
