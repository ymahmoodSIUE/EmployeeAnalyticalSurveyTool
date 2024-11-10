import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { PieChart } from '@mui/x-charts/PieChart';
import Link from '@mui/material/Link';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import DateRange from './daterange';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

// Define ExpandableCell component here
function ExpandableCell({ value }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      {expanded ? value : value.slice(0, 200)}&nbsp;
      {value && value.length > 200 && (
        <Link
          component="button"
          sx={{ fontSize: 'inherit', letterSpacing: 'inherit' }}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'view less' : 'view more'}
        </Link>
      )}
    </div>
  );
}

function DataDisplay({ view, data: initialData }) {
  const [displayData, setDisplayData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedRatings, setSelectedRatings] = useState({ 1: true, 2: true, 3: true, 4: true, 5: true });

  const processData = (data) => {
    if (data && data.length > 0) {
      const cols = [
        { field: 'id', headerName: 'ID', width: 70 },
        ...Object.keys(data[0])
          .filter(key => !['UploadedAt', 'LastUpdatedAt', 'UploadID', 'id'].includes(key))
          .map(key => ({
            field: key,
            headerName: key,
            width: key === 'Comments' ? 400 : 150,
            editable: true,
            renderCell: key === 'Comments' ? (params) => <ExpandableCell {...params} /> : undefined
          }))
      ];
      setColumns(cols);

      const rowsWithId = data.map((row, index) => ({
        id: row.id || index + 1,
        ...row,
        'Recorded Date': formatDate(row['Recorded Date'])
      }));
      setDisplayData(rowsWithId);
      setFilteredData(rowsWithId); 
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toISOString().split('T')[0];
  };

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/data');
      processData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchAllData = async () => {
    try {
      const response = await axios.get('/api/allData');
      processData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (view === 'single' && initialData) {
      processData(initialData);
    } else if (view === 'all') {
      fetchAllData();
    } else if (view === 'single' && !initialData) {
      fetchData();
    }
  }, [view, initialData]);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = displayData;

      if (dateRange[0] && dateRange[1]) {
        const [start, end] = dateRange;
        filtered = filtered.filter(row => {
          const date = new Date(row['Recorded Date']);
          return date >= start.toDate() && date <= end.toDate();
        });
      }

      // Filter by selected ratings
      filtered = filtered.filter(row => selectedRatings[row['Satisfaction Rating']]);
      
      setFilteredData(filtered);
    };

    applyFilters();
  }, [dateRange, displayData, selectedRatings]);

  const handleRatingChange = (event) => {
    setSelectedRatings({
      ...selectedRatings,
      [event.target.name]: event.target.checked
    });
  };

  const pieData = useMemo(() => {
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    filteredData.forEach(row => {
      const rating = row['Satisfaction Rating'];
      if (ratingCounts[rating] !== undefined) {
        ratingCounts[rating] += 1;
      }
    });
    return Object.entries(ratingCounts)
      .map(([rating, count]) => ({
        id: rating,
        value: count,
        label: `Rating ${rating}`,
      }))
      .filter(item => item.value > 0); 
  }, [filteredData]);

  return (
    <div className="data-container">
      <DateRange dateRange={dateRange} setDateRange={setDateRange} />

      {/* DataGrid */}
      <div style={{ height: 400, width: '100%', marginTop: '20px' }}>
        <DataGrid
          rows={filteredData}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </div>

      {/* Rating Filters and PieChart */}
      <div style={{ display: 'flex', marginTop: '20px', alignItems: 'flex-start' }}>
        {/* Checkbox Filter */}
        <Paper elevation={3} sx={{ padding: 2, marginRight: 2, width: '20%' }}>
          <FormGroup>
            {[1, 2, 3, 4, 5].map(rating => (
              <FormControlLabel
                key={rating}
                control={
                  <Checkbox
                    checked={selectedRatings[rating]}
                    onChange={event => setSelectedRatings({ ...selectedRatings, [event.target.name]: event.target.checked })}
                    name={String(rating)}
                  />
                }
                label={`Rating ${rating}`}
              />
            ))}
          </FormGroup>
        </Paper>

        {/* PieChart with Legend */}
        {/* PieChart with Legend */}
        <Paper elevation={3} sx={{ padding: 2, width: '75%' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center', // Aligns legend vertically with the chart
              justifyContent: 'center',
              border: '2px solid black', // Black border
              borderRadius: '8px', // Rounded corners
              padding: '8px', // Adjust padding for a tighter fit
              width: 'fit-content',
              maxWidth: '600px', // Restrict maximum width for better alignment
              margin: 'auto', // Center the container
              backgroundColor: 'white', // Ensure a clean background
            }}
          >
            <PieChart
              series={[
                {

                  data: pieData,
                },
              ]}
              width={400} // Adjust to fit the content better
              height={275}
              sx={{
                '& .MuiChartLegend-root': {
                  marginLeft: '8px', // Slight spacing from chart to legend
                },
              }}
            />
          </Box>
        </Paper>
      </div> 
    </div>
  );
}

export default DataDisplay;
