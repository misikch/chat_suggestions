import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import ProductCard from './components/ProductCard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <ProductCard />
      </div>
    </ThemeProvider>
  );
}

export default App;
