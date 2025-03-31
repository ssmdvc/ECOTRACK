import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Alert,
  Grid,
  useMediaQuery,
  IconButton
} from '@mui/material';
import { WasteDataService } from '../../services/wasteDataService';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';

const WasteDataForm = ({ open, onClose, onSubmit }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [formData, setFormData] = useState({
    dataType: '',
    collectionPoint: '',
    zone: '',
    wasteAmount: '',
    week: WasteDataService.getWeekNumber(new Date()),
    month: new Date().getMonth() + 1, // Current month (1-12)
    year: new Date().getFullYear() // Current year
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [maxWeeks, setMaxWeeks] = useState(52);

  const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Calculate available weeks based on selected month and year
  useEffect(() => {
    const daysInMonth = new Date(formData.year, formData.month, 0).getDate();
    const firstDay = new Date(formData.year, formData.month - 1, 1);
    const lastDay = new Date(formData.year, formData.month - 1, daysInMonth);
    
    const firstWeek = WasteDataService.getWeekNumber(firstDay);
    const lastWeek = WasteDataService.getWeekNumber(lastDay);
    
    // If the month spans across year boundary
    if (firstWeek > lastWeek) {
      setMaxWeeks(lastWeek + (52 - firstWeek) + 1);
    } else {
      setMaxWeeks(lastWeek - firstWeek + 1);
    }
    
    // Set week to the first week of the month if current selection is invalid
    if (formData.week < firstWeek || formData.week > lastWeek) {
      setFormData(prev => ({ ...prev, week: firstWeek }));
    }
  }, [formData.year, formData.month]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.dataType || !formData.zone || !formData.wasteAmount || !formData.week) {
        throw new Error('Please fill in all required fields');
      }

      if (isNaN(formData.wasteAmount) || Number(formData.wasteAmount) <= 0) {
        throw new Error('Please enter a valid waste amount');
      }

      const data = {
        ...formData,
        wasteAmount: Number(formData.wasteAmount),
        timestamp: new Date(formData.year, formData.month - 1, 1).getTime(),
        week: Number(formData.week)
      };

      await WasteDataService.addWasteData(data);
      onSubmit(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get available weeks for the selected month/year
  const getAvailableWeeks = () => {
    const daysInMonth = new Date(formData.year, formData.month, 0).getDate();
    const firstDay = new Date(formData.year, formData.month - 1, 1);
    const lastDay = new Date(formData.year, formData.month - 1, daysInMonth);
    
    const firstWeek = WasteDataService.getWeekNumber(firstDay);
    const lastWeek = WasteDataService.getWeekNumber(lastDay);
    
    const weeks = [];
    
    if (firstWeek > lastWeek) {
      // Month spans across year boundary
      for (let w = firstWeek; w <= 52; w++) {
        weeks.push(w);
      }
      for (let w = 1; w <= lastWeek; w++) {
        weeks.push(w);
      }
    } else {
      // Normal case
      for (let w = firstWeek; w <= lastWeek; w++) {
        weeks.push(w);
      }
    }
    
    return weeks;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          m: isMobile ? 0 : 2
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: isMobile ? 2 : 3
      }}>
        <Typography variant={isMobile ? "h6" : "h5"}>
          Add Waste Collection Data
        </Typography>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 1.5 : 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: isMobile ? 1 : 2 }}>
              {error}
            </Alert>
          )}

          <FormControl fullWidth required size={isMobile ? "small" : "medium"}>
            <InputLabel>Data Type</InputLabel>
            <Select
              value={formData.dataType}
              onChange={(e) => setFormData({ ...formData, dataType: e.target.value })}
            >
              <MenuItem value="averageWaste">Average Waste per Collection Point</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth required size={isMobile ? "small" : "medium"}>
            <InputLabel>Zone</InputLabel>
            <Select
              value={formData.zone}
              onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
            >
              {zones.map((zone) => (
                <MenuItem key={zone} value={zone}>{zone}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Grid container spacing={isMobile ? 1 : 2}>
            <Grid item xs={6}>
              <FormControl fullWidth required size={isMobile ? "small" : "medium"}>
                <InputLabel>Month</InputLabel>
                <Select
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                >
                  {months.map((month, index) => (
                    <MenuItem key={month} value={index + 1}>
                      {isMobile ? month.substring(0, 3) : month}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth required size={isMobile ? "small" : "medium"}>
                <InputLabel>Year</InputLabel>
                <Select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <FormControl fullWidth required size={isMobile ? "small" : "medium"}>
            <InputLabel>Week</InputLabel>
            <Select
              value={formData.week}
              onChange={(e) => setFormData({ ...formData, week: e.target.value })}
            >
              {getAvailableWeeks().map((week) => (
                <MenuItem key={week} value={week}>
                  Week {week}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            required
            label="Waste Amount (kg)"
            type="number"
            value={formData.wasteAmount}
            onChange={(e) => setFormData({ ...formData, wasteAmount: e.target.value })}
            inputProps={{ min: 0, step: 0.01 }}
            size={isMobile ? "small" : "medium"}
          />

          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ fontSize: isMobile ? 11 : 12 }}
          >
            Note: Data will be aggregated according to the selected week, month, and year.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ 
        p: isMobile ? 2 : 3,
        pt: isMobile ? 1 : 2
      }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          size={isMobile ? "small" : "medium"}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
          size={isMobile ? "small" : "medium"}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WasteDataForm; 