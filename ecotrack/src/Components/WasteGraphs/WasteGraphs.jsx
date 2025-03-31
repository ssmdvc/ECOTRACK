import React from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  useMediaQuery
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useTheme } from '@mui/material/styles';

// Create wrapper components with default parameters
const XAxis = ({
  allowDataOverflow = false,
  allowDecimals = true,
  allowDuplicatedCategory = true,
  axisLine = true,
  domain = ['auto', 'auto'],
  height = 30,
  hide = false,
  mirror = false,
  orientation = 'bottom',
  padding = { left: 0, right: 0 },
  reversed = false,
  scale = 'auto',
  tickCount = 5,
  tickLine = true,
  tickSize = 6,
  width = 0,
  ...props
}) => <RechartsXAxis 
  allowDataOverflow={allowDataOverflow}
  allowDecimals={allowDecimals}
  allowDuplicatedCategory={allowDuplicatedCategory}
  axisLine={axisLine}
  domain={domain}
  height={height}
  hide={hide}
  mirror={mirror}
  orientation={orientation}
  padding={padding}
  reversed={reversed}
  scale={scale}
  tickCount={tickCount}
  tickLine={tickLine}
  tickSize={tickSize}
  width={width}
  {...props}
/>;

const YAxis = ({
  allowDataOverflow = false,
  allowDecimals = true,
  allowDuplicatedCategory = true,
  axisLine = true,
  domain = ['auto', 'auto'],
  height = 0,
  hide = false,
  mirror = false,
  orientation = 'left',
  padding = { top: 0, bottom: 0 },
  reversed = false,
  scale = 'auto',
  tickCount = 5,
  tickLine = true,
  tickSize = 6,
  width = 60,
  yAxisId = 0,
  ...props
}) => <RechartsYAxis 
  allowDataOverflow={allowDataOverflow}
  allowDecimals={allowDecimals}
  allowDuplicatedCategory={allowDuplicatedCategory}
  axisLine={axisLine}
  domain={domain}
  height={height}
  hide={hide}
  mirror={mirror}
  orientation={orientation}
  padding={padding}
  reversed={reversed}
  scale={scale}
  tickCount={tickCount}
  tickLine={tickLine}
  tickSize={tickSize}
  width={width}
  yAxisId={yAxisId}
  {...props}
/>;

const validateData = (data) => {
  if (!Array.isArray(data)) return false;
  return data.every(item => 
    typeof item === 'object' && 
    'total' in item && 
    typeof item.total === 'number'
  );
};

const GraphContainer = ({ title, children, error }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Paper sx={{ 
      p: isMobile ? 1.5 : 2,
      transition: 'padding 0.3s ease'
    }}>
      <Typography 
        variant={isMobile ? "subtitle1" : "h6"} 
        gutterBottom
        sx={{ fontWeight: isMobile ? 500 : 600 }}
      >
        {title}
      </Typography>
      {error ? (
        <Typography color="error">
          {error}
        </Typography>
      ) : (
        <Box sx={{ 
          width: '100%', 
          height: isMobile ? 250 : 300,
          transition: 'height 0.3s ease'
        }}>
          {children}
        </Box>
      )}
    </Paper>
  );
};

export const WeeklyGraph = ({ data, loading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isValidData = validateData(data);

  return (
    <GraphContainer 
      title="Weekly Waste Collection" 
      error={!isValidData && "Invalid data format. Please check your data source."}
    >
      {isValidData && (
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis 
              dataKey="week" 
              stroke={theme.palette.text.secondary}
              tickFormatter={(value) => isMobile ? `W${value}` : `Week ${value}`}
              interval={isMobile ? 'preserveStartEnd' : 0}
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <YAxis 
              stroke={theme.palette.text.secondary}
              tickFormatter={(value) => isMobile ? `${value}` : `${value}kg`}
              domain={['dataMin', 'dataMax']}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 30 : 45}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '8px',
                fontSize: isMobile ? 12 : 14
              }}
              formatter={(value) => [`${value}kg`, 'Waste Amount']}
              labelFormatter={(label) => `Week ${label}`}
            />
            <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 14 }} />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke={theme.palette.primary.main}
              strokeWidth={isMobile ? 1.5 : 2}
              dot={{ r: isMobile ? 3 : 4 }}
              activeDot={{ r: isMobile ? 5 : 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </GraphContainer>
  );
};

export const MonthlyGraph = ({ data, loading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isValidData = validateData(data);

  return (
    <GraphContainer 
      title="Monthly Waste Collection" 
      error={!isValidData && "Invalid data format. Please check your data source."}
    >
      {isValidData && (
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis 
              dataKey="month" 
              stroke={theme.palette.text.secondary}
              tickFormatter={(value) => isMobile ? `M${value}` : `Month ${value}`}
              interval={isMobile ? 'preserveStartEnd' : 0}
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <YAxis 
              stroke={theme.palette.text.secondary}
              tickFormatter={(value) => isMobile ? `${value}` : `${value}kg`}
              domain={['dataMin', 'dataMax']}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 30 : 45}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '8px',
                fontSize: isMobile ? 12 : 14
              }}
              formatter={(value) => [`${value}kg`, 'Waste Amount']}
              labelFormatter={(label) => `Month ${label}`}
            />
            <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 14 }} />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke={theme.palette.secondary.main}
              strokeWidth={isMobile ? 1.5 : 2}
              dot={{ r: isMobile ? 3 : 4 }}
              activeDot={{ r: isMobile ? 5 : 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </GraphContainer>
  );
};

export const YearlyGraph = ({ data, loading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isValidData = validateData(data);

  return (
    <GraphContainer 
      title="Yearly Waste Collection" 
      error={!isValidData && "Invalid data format. Please check your data source."}
    >
      {isValidData && (
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis 
              dataKey="year" 
              stroke={theme.palette.text.secondary}
              tickFormatter={(value) => `${value}`}
              interval={isMobile ? 'preserveStartEnd' : 0}
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <YAxis 
              stroke={theme.palette.text.secondary}
              tickFormatter={(value) => isMobile ? `${value}` : `${value}kg`}
              domain={['dataMin', 'dataMax']}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 30 : 45}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '8px',
                fontSize: isMobile ? 12 : 14
              }}
              formatter={(value) => [`${value}kg`, 'Waste Amount']}
              labelFormatter={(label) => `Year ${label}`}
            />
            <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 14 }} />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke={theme.palette.success.main}
              strokeWidth={isMobile ? 1.5 : 2}
              dot={{ r: isMobile ? 3 : 4 }}
              activeDot={{ r: isMobile ? 5 : 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </GraphContainer>
  );
}; 