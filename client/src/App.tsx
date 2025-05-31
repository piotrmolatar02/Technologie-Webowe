import { useState } from 'react';
import Navbar from './components/Navbar';
import DeviceStatus from './components/DeviceStatus';
import Charts from './components/Charts';
import { Box, Grid } from '@mui/material';

const App = () => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);

  const devices = [
    { id: 0, data: null },
    { id: 1, data: null },
    { id: 2, data: null },
    { id: 3, data: { temperature: 23.5, pressure: 1013.25, humidity: 45 } },
    { id: 4, data: { temperature: 24.5, pressure: 990.4, humidity: 40.3 } },
  ];

  const selectedDevice = devices.find(d => d.id === selectedDeviceId);

  return (
    <>
      <Navbar />
      <Box sx={{ display: 'flex', p: 2 }}>
        {selectedDevice && selectedDevice.data && (
          <Box sx={{ mr: 4 }}>
            <DeviceStatus
              deviceId={selectedDevice.id}
              data={selectedDevice.data}
              onSelect={() => {}} 
            />
          </Box>
        )}
        <Charts selectedDevice={selectedDevice} />
      </Box>

      <Grid container spacing={2} sx={{ p: 2 }}>
        {devices.map((device) => (
          <Grid item key={device.id}>
            <DeviceStatus
              deviceId={device.id}
              data={device.data}
              onSelect={(id) => setSelectedDeviceId(id)}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default App;
