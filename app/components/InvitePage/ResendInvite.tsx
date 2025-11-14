'use client';
import { Box, Button, InputAdornment, styled, TextField, Typography } from "@mui/material"


export const StyledTextField = styled(TextField)(({ theme }) => ({
  width: '398px',
  marginBottom: '12px',
  marginLeft: '30px',
  marginTop: '20px',
  height :'48px',
  '& .MuiOutlinedInput-input': {
    height: '46px',
    lineHeight: '40px',
    background: '#FFFFFF',
    padding: '2px 12px 3px 12px',
    borderRadius: '5px',
    fontSize: '14px',
    fontFamily: theme.typography.fontFamily,
    color: '#212121',
    '&::placeholder': {
      color: '#424242',
      opacity: 1,
      fontSize: '14px',
      fontFamily: theme.typography.fontFamily,
    },
  },
  '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
    border: '1px solid #E0E0E0',
  },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    border: '1px solid #E0E0E0',
    borderRadius: '5px',
  },
}));

function ResendInvite() {
    return (
        <>
           <Box className='parentContainer'
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                flexDirection="column">
            <Box className = 'TopLogo' display={"flex"} justifyContent={'center'} alignContent={'center'} >
                <img src='/images/icons/CIOptimizeImg.svg' alt="CIO" />
            </Box>
            <Box className='ContentContainer' display={"flex"} justifyContent={'center'} alignItems={'center'} mt={3}>
                <Box className='ContexBox' display={'flex'} flexDirection={'column'} justifyContent={'center'} alignItems={'center'} mt={4}>
                    <Box className='img'>
                        <img src='/images/icons/Background.svg' alt="CIO" />
                    </Box>
                    <Box mt={1}>
                    <Typography sx={{
                        fontWeight: '700',
                        fontSize: '22.5px',
                        lineHeight :'32px'
                    }} >
                        Invitation Link Expired
                        </Typography>
                    </Box>
                    <Box sx={{
                        width: '398px',
                        height: '100px',
                        borderRadius: '10.4px'
                    }} mt={1.5} ml={3.5} bgcolor={'rgba(235, 241, 247, 1)'}>
                        <Typography sx={{fontSize:'13.8px', marginLeft: '10px', marginTop :  '10px',fontWeight :600 ,color :'rgba(110, 96, 90, 1)'}}>
                        What happened?
                    </Typography>
                        <Typography style={{ marginLeft: '10px', marginTop : '8px',fontWeight :400 ,fontSize:'13.6px',color:'rgba(110, 96, 90, 1)'}}>The invitation link you clicked has expired. This is a
                        <br/>security measure to protect your account.</Typography>
                    </Box>
                    <StyledTextField
                        placeholder="Enter Email"
                        type="text"
                        InputProps={{
                            endAdornment:
                                <InputAdornment
                                    position="end">
                                </InputAdornment>,
                        }}
                    />  
                    <Box className='submit' width={398} ml={3.5}>
                        <Button
                            fullWidth
                            variant="contained"
                            sx={{
                                mt: 0.5,
                                backgroundColor: '#1567CA',
                                height: '40px',
                                fontWeight: 600,
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: '#0042a8',
                                },
                            }}
                            onClick={() => console.log("ok")}
                        >
                            <Typography
                                sx={{
                                    fontSize: '15px',
                                    fontFamily: 'Open-Sans',
                                    fontWeight: 700,
                                }}>
                                Resend Invitation
                            </Typography>
                        </Button>
                    </Box>
                </Box>
            </Box> 
            </Box>
            </>
    )
}


export default ResendInvite