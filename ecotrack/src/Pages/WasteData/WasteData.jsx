import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Tab, 
  Tabs, 
  Typography, 
  Alert, 
  CircularProgress, 
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Popover,
  IconButton,
  Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import WasteDataForm from '../../Components/WasteDataForm/WasteDataForm';
import { WeeklyGraph, MonthlyGraph, YearlyGraph } from '../../Components/WasteGraphs/WasteGraphs';
import { WasteDataService } from '../../services/wasteDataService';
import Sidebar from '../../Components/Sidebar/Sidebar';
import Navbar from '../../Components/Navbar/Navbar';
import { useTheme } from '@mui/material/styles';
import './WasteData.scss';

const WasteData = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [openForm, setOpenForm] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedZone, setSelectedZone] = useState('Zone A');
  const [wasteData, setWasteData] = useState([]);
  const [aggregatedData, setAggregatedData] = useState({
    weekly: [],
    monthly: [],
    yearly: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Period filter state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [availableWeeks, setAvailableWeeks] = useState([]);

  const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];
  const periods = ['Weekly', 'Monthly', 'Yearly'];
  
  // Generate weeks 1-52
  const weeks = Array.from({ length: 52 }, (_, i) => i + 1);
  // Generate months
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  // Generate years (current year ± 2 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  useEffect(() => {
    loadWasteData();
  }, [selectedZone, selectedPeriod, selectedWeek, selectedMonth, selectedYear]);

  const loadWasteData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Determine which period to filter by
      let period = null;
      let specificFilter = null;
      
      if (selectedPeriod === 'Weekly' && selectedWeek) {
        period = 'weekly';
        specificFilter = selectedWeek;
      } else if (selectedPeriod === 'Monthly' && selectedMonth) {
        period = 'monthly';
        specificFilter = months.indexOf(selectedMonth) + 1;
      } else if (selectedPeriod === 'Yearly' && selectedYear) {
        period = 'yearly';
        specificFilter = selectedYear;
      }
      
      const data = await WasteDataService.getWasteData(selectedZone, period, specificFilter);
      setWasteData(data);

      if (data.length > 0) {
        const weeklyData = WasteDataService.aggregateWeeklyData(
          data, 
          selectedPeriod === 'Weekly' ? selectedWeek : null
        );
        
        const monthlyData = WasteDataService.aggregateMonthlyData(
          weeklyData, 
          selectedPeriod === 'Monthly' ? months.indexOf(selectedMonth) + 1 : null
        );
        
        const yearlyData = WasteDataService.aggregateYearlyData(
          monthlyData, 
          selectedPeriod === 'Yearly' ? selectedYear : null
        );

        setAggregatedData({
          weekly: Object.values(weeklyData).sort((a, b) => a.week - b.week),
          monthly: Object.entries(monthlyData).map(([key, value]) => ({
            month: key.split('-')[1],
            total: value
          })).sort((a, b) => parseInt(a.month) - parseInt(b.month)),
          yearly: Object.entries(yearlyData).map(([key, value]) => ({
            year: key,
            total: value
          })).sort((a, b) => parseInt(a.year) - parseInt(b.year))
        });
        
        // Extract available weeks from the data for the filter dropdown
        const uniqueWeeks = [...new Set(data.map(item => item.week))].sort((a, b) => a - b);
        setAvailableWeeks(uniqueWeeks);
      } else {
        setAggregatedData({
          weekly: [],
          monthly: [],
          yearly: []
        });
        setAvailableWeeks([]);
      }
    } catch (err) {
      setError('Failed to load waste data. Please try again later.');
      console.error('Error loading waste data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      await loadWasteData();
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };
  
  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleFilterClose = () => {
    setAnchorEl(null);
  };
  
  const handlePeriodChange = (event) => {
    setSelectedPeriod(event.target.value);
    // Reset specific filters when changing period
    setSelectedWeek(null);
    setSelectedMonth(null);
    setSelectedYear(null);
  };
  
  const handleSpecificFilterChange = (event) => {
    const value = event.target.value;
    
    if (selectedPeriod === 'Weekly') {
      setSelectedWeek(value);
    } else if (selectedPeriod === 'Monthly') {
      setSelectedMonth(value);
    } else if (selectedPeriod === 'Yearly') {
      setSelectedYear(value);
    }
  };
  
  const resetFilters = () => {
    setSelectedPeriod('');
    setSelectedWeek(null);
    setSelectedMonth(null);
    setSelectedYear(null);
    handleFilterClose();
  };
  
  const filterOpen = Boolean(anchorEl);

  return (
    <div className="wasteData">
      <Sidebar />
      <div className="wasteDataContainer">
        <Navbar />
        <div className="wasteDataContent">
          <Box sx={{ 
            p: isMobile ? 2 : 3,
            transition: 'padding 0.3s ease'
          }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: isTablet ? 'column' : 'row',
              justifyContent: 'space-between', 
              alignItems: isTablet ? 'stretch' : 'center',
              mb: 3,
              gap: isTablet ? 2 : 0
            }}>
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                component="h2"
                sx={{ fontWeight: 600 }}
              >
                Waste Collection Data
              </Typography>
              
              {isTablet ? (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl 
                    size={isMobile ? "small" : "medium"}
                    fullWidth
                  >
                    <InputLabel>Zone</InputLabel>
                    <Select
                      value={selectedZone}
                      onChange={(e) => setSelectedZone(e.target.value)}
                      label="Zone"
                    >
                      {zones.map((zone) => (
                        <MenuItem key={zone} value={zone}>{zone}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Button 
                    variant="outlined"
                    onClick={handleFilterClick}
                    startIcon={<FilterListIcon />}
                    size={isMobile ? "small" : "medium"}
                    sx={{ minWidth: 0, px: isMobile ? 1 : 2 }}
                  >
                    {!isMobile && "Filter"}
                  </Button>
                  
                  <Button 
                    variant="contained" 
                    onClick={() => setOpenForm(true)}
                    startIcon={<AddIcon />}
                    size={isMobile ? "small" : "medium"}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    {isMobile ? 'Add' : 'Add Data'}
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FormControl 
                    size="medium"
                    sx={{ minWidth: 120 }}
                  >
                    <InputLabel>Zone</InputLabel>
                    <Select
                      value={selectedZone}
                      onChange={(e) => setSelectedZone(e.target.value)}
                      label="Zone"
                    >
                      {zones.map((zone) => (
                        <MenuItem key={zone} value={zone}>{zone}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Button 
                    variant="outlined"
                    onClick={handleFilterClick}
                    startIcon={<FilterListIcon />}
                  >
                    Filter by Period
                  </Button>
                
                  <Button 
                    variant="contained" 
                    onClick={() => setOpenForm(true)}
                    startIcon={<AddIcon />}
                  >
                    Add Waste Data
                  </Button>
                </Box>
              )}
            </Box>
            
            {/* Period Filter Popover */}
            <Popover
              open={filterOpen}
              anchorEl={anchorEl}
              onClose={handleFilterClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                sx: { width: 250, p: 2 }
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Filter by Period
              </Typography>
              
              <FormControl fullWidth size="small" sx={{ mt: 1, mb: 2 }}>
                <InputLabel>Period</InputLabel>
                <Select
                  value={selectedPeriod}
                  onChange={handlePeriodChange}
                  label="Period"
                >
                  {periods.map((period) => (
                    <MenuItem key={period} value={period}>{period}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {selectedPeriod === 'Weekly' && (
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Week</InputLabel>
                  <Select
                    value={selectedWeek || ''}
                    onChange={handleSpecificFilterChange}
                    label="Week"
                  >
                    {availableWeeks.length > 0 ? (
                      availableWeeks.map((week) => (
                        <MenuItem key={week} value={week}>Week {week}</MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No data available</MenuItem>
                    )}
                  </Select>
                </FormControl>
              )}
              
              {selectedPeriod === 'Monthly' && (
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Month</InputLabel>
                  <Select
                    value={selectedMonth || ''}
                    onChange={handleSpecificFilterChange}
                    label="Month"
                  >
                    {months.map((month) => (
                      <MenuItem key={month} value={month}>{month}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              {selectedPeriod === 'Yearly' && (
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={selectedYear || ''}
                    onChange={handleSpecificFilterChange}
                    label="Year"
                  >
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button size="small" onClick={resetFilters}>
                  Reset
                </Button>
                <Button size="small" variant="contained" onClick={handleFilterClose}>
                  Apply
                </Button>
              </Box>
            </Popover>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {/* Active filter display */}
            {selectedPeriod && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 1, 
                  mb: 2,
                  backgroundColor: theme.palette.primary.light + '20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: 1
                }}
              >
                <Typography variant="body2">
                  Filtering by: {selectedPeriod}
                  {selectedWeek && ` - Week ${selectedWeek}`}
                  {selectedMonth && ` - ${selectedMonth}`}
                  {selectedYear && ` - ${selectedYear}`}
                </Typography>
                <IconButton size="small" onClick={resetFilters}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Paper>
            )}

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs 
                value={activeTab} 
                onChange={(_, newValue) => setActiveTab(newValue)}
                variant={isMobile ? "fullWidth" : "standard"}
                centered={!isMobile}
              >
                <Tab label="Weekly" />
                <Tab label="Monthly" />
                <Tab label="Yearly" />
              </Tabs>
            </Box>

            <Box sx={{ mt: 2 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {activeTab === 0 && (
                    <WeeklyGraph 
                      data={aggregatedData.weekly} 
                      loading={loading}
                    />
                  )}
                  {activeTab === 1 && (
                    <MonthlyGraph 
                      data={aggregatedData.monthly} 
                      loading={loading}
                    />
                  )}
                  {activeTab === 2 && (
                    <YearlyGraph 
                      data={aggregatedData.yearly} 
                      loading={loading}
                    />
                  )}
                </>
              )}
            </Box>

            {wasteData?.length === 0 && !loading && (
              <Box sx={{ 
                mt: 4, 
                textAlign: 'center', 
                p: 3, 
                bgcolor: 'background.paper',
                borderRadius: 1
              }}>
                <Typography variant="body1" color="text.secondary">
                  No waste data available for {selectedZone}
                  {selectedPeriod && ` in the selected ${selectedPeriod.toLowerCase()} period`}.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Click the "Add Waste Data" button to add your first entry.
                </Typography>
              </Box>
            )}

            <WasteDataForm 
              open={openForm}
              onClose={() => setOpenForm(false)}
              onSubmit={handleSubmit}
            />
          </Box>
        </div>
      </div>
    </div>
  );
};

export default WasteData; 