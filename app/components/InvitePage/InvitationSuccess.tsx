'use client';
import { Box, Button, Typography } from '@mui/material';

interface InvitationSuccessProps {
  setPageType?: (pageType: 'resend' | 'setPassword' | 'success') => void;
}
function InvitationSuccess({ setPageType }: InvitationSuccessProps) {
  return (
    <Box
      className="parentContainer"
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      flexDirection="column"
    >
      <Box
        className="TopLogo"
        display="flex"
        justifyContent="center"
        alignItems="center"
        mb={2}
      >
        <img src="/images/icons/CIOptimizeImg.svg" alt="CIO" />
      </Box>

      <Box
        className="container"
        display="flex"
        justifyContent="center"
        alignItems="center"
        mt={4}
      >
        <Box
          className="content"
          display="flex"
          flexDirection="column"
          alignItems="center"
          mt={2}
        >
          <img
            src="/images/icons/success.svg"
            alt="success"
            style={{ width: '64px', height: '64px', objectFit: 'contain' }}
          />
          <Typography variant="h6" fontWeight={700} fontSize={22.5} mt={2}>
            Thank You !
          </Typography>
          <Box
            sx={{
              width: '626px',
              height: '110px',
              borderRadius: '10.4px',
            }}
            mt={1.5}
            ml={3.5}
            bgcolor={'rgba(235, 241, 247, 1)'}
          >
            <Typography
              sx={{
                fontSize: '13.6px',
                marginLeft: '10px',
                marginTop: '10px',
                fontWeight: 400,
                color: 'rgba(110, 96, 90, 1)',
              }}
            >
              We've sent a the invite email to the address provided. Please
              check your inbox (and spam <br /> folder, just in case) to verify
              your account.
              <br />
              <br />
              Once confirmed, you can Log In to Your Account.
            </Typography>
          </Box>
          {/* <Button
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              backgroundColor: '#1567CA',
              height: '40px',
              width: '220px',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#0042a8',
              },
            }}
            onClick={() => {}}
          >
            <Typography
              sx={{
                fontSize: '15px',
                fontFamily: 'Open-Sans',
                fontWeight: 600,
              }}
            >
              Close
            </Typography>
          </Button> */}
        </Box>
      </Box>
    </Box>
  );
}

export default InvitationSuccess;
