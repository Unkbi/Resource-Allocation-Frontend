"use client";

import { Box, Typography, Button, IconButton } from '@mui/material';
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
    <Box  px={{ xs: 2, sm: 2}} py={2} height="100%"
    sx={{
      maxWidth: '100vw', 
      boxSizing: 'border-box',
    }}
    >
    <Typography variant="body1" mb={2} sx={{ textAlign: 'left',fontSize:'14px', }}>
        It’s time to wrap up this week! Did you stick to your planned allocation?
     </Typography>

       <Box className="tableWithArrow" display="flex" alignItems="center" justifyContent="center">
        <IconButton sx={{ borderRadius: "4px" }}>
           <img src="images/icons/leftArrow.svg" alt="Left Arrow" width={46} height={46} />
        </IconButton>
        <Box mx={2} width="100%" maxWidth={580} minHeight={350}>
          <ActualTable/>
         <Box  display="flex" justifyContent="flex-end">
         <Button
          variant="contained"
          sx={{
          bgcolor: '#1C2D5F',
          px: 2,
          width: '192px',
          height: '36px',
          borderRadius: '5px',
        }}
         onClick={handleNext}
         >
       <Typography
        sx={{
          color: '#FFF',
          textAlign: 'center',
          fontFamily: 'Open Sans',
          fontSize: 14,
          fontWeight: 600,
          textTransform: 'none',
        }}
        >
        {step < 4 ? 'Next' : 'Confirm'}
      </Typography>
        </Button>
        </Box>
       </Box>
        <IconButton sx={{ borderRadius: "4px" }}>
        <img src="images/icons/rightArrow.svg" alt="Left Arrow" width={48} height={48} />
        </IconButton>
      </Box>
    </Box>
  );
}