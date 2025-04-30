"use client";

import { Box, Typography, Button, IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ActualTable from '@/app/components/Actuals/ActualTable';
import { useState } from 'react';

export default function ActualsPage() {
  const [step, setStep] = useState(1);  

  const handleNext = () => {
    if (step < 4) {
      setStep(prevStep => prevStep + 1);  
    } else {
      alert("Confirmed!"); 
    }
  };

  
  return (
    <Box px={{ xs: 2, sm: 4 }} py={4} height="66vw" > 
      <Typography variant="body1" mb={4}>
        It’s time to wrap up this week! Did you stick to your planned allocation?
      </Typography>

       <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
        <IconButton>
          <ArrowBackIosNewIcon />
        </IconButton>
        <Box mx={2} width="100%" maxWidth={580} position="relative">
          <ActualTable/>
          
          <Box
            position="absolute"
            bottom={-50} 
            right={0}
            zIndex={10}
          >
            <Button
              variant="contained"
              sx={{ 
                bgcolor: '#1C2D5F', 
                px: 2 ,
                width: '192px',
                height: '38px',
                flexShrink: '0',
                borderRadius :'5px',
                alignItems:'center',
                justifyContent:'center'
                
            }}
              onClick={handleNext}
            >
            <Typography
            sx={{
                color: '#FFF',
                textAlign: 'center',
                fontFamily: 'Open Sans',
                fontSize: 14,
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: 'normal',
                textTransform :'none',
                }} 
            >
            {step < 4 ? "Next" : "Confirm"}
            </Typography>
            </Button>
          </Box>
        </Box>
        <IconButton>
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>
    </Box>
  );
}