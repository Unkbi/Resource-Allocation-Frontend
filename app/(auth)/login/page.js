'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, logoutUser } from '../../services/authServices';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  CircularProgress,
  Grid,
} from '@mui/material';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const { loading, error, user } = useSelector((state) => state.user);
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    // dispatch(loginUser({ email, password }));
    router.push('/dashboard');
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {user ? (
        <Box sx={{ mx: 'auto', textAlign: 'center', mt: 8 }}>
          <Typography variant="h4" gutterBottom>
            Welcome, {user.name}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      ) : (
        <Grid container>
          {/* Left Section */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f5f5f5',
              p: 4,
            }}
          >
            <Image src="/logo.png" alt="Logo" width={120} height={50} />
            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Image src="/illustration1.png" alt="Illustration 1" width={100} height={100} />
              <Image src="/illustration2.png" alt="Illustration 2" width={100} height={100} />
            </Box>
          </Grid>

          {/* Right Section */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              p: 4,
            }}
          >
            <Typography variant="h4" gutterBottom>
              Welcome
            </Typography>
            <Typography variant="body1" gutterBottom>
              Please enter your details
            </Typography>
            <Box
              component="form"
              onSubmit={handleLogin}
              sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/forgot-password" underline="hover" color="primary">
                  Forgot Password?
                </Link>
              </Box>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign in'}
              </Button>
              <Typography
                variant="body2"
                color="textSecondary"
                align="center"
                sx={{ mt: 2 }}
              >
                OR
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 1 }}
              >
                Sign in with Google
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 1 }}
              >
                Sign in with SSO
              </Button>
            </Box>
            <Typography
              variant="body2"
              sx={{ mt: 3, textAlign: 'center' }}
            >
              Don’t have an account?{' '}
              <Link href="/signup" underline="hover" color="primary">
                Sign up
              </Link>
            </Typography>
          </Grid>
        </Grid>
      )}
      {error && (
        <Typography
          variant="body2"
          color="error"
          sx={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)' }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
}
