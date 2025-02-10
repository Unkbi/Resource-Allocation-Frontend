'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../services/authServices';
import { useRouter } from 'next/navigation';
import {
    Box,
    Typography,
    TextField,
    Button,
    Link,
    InputAdornment,
    IconButton,
    CircularProgress,
    styled,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Image from 'next/image';
import { performForgotPassword } from '@/app/redux/actions/authActions';

const MainBox = styled(Box)(({ theme }) => ({
    "& .loginLeft": {
        width: "45%",
        backgroundImage: "linear-gradient(180deg, #FFFDF9 0%, #FFFAEF 100%);",
        textAlign: "left",
        padding: "30px 90px",
        "& img": {
            maxWidth: "100%"
        }
    },
    "& .loginRight": {
        width: "55%",
        display: "flex",
        alignItems: "center",
        backgroundColor: "#fff",
        "& .formBox": {
            width: "360px",
            margin: "0 auto",
            "& h4": {
                fontFamily: "'Manrope', serif",
                color: "#000",
                fontSize: "32px",
                fontWeight: "800",
                marginBottom: "4px"
            },
            "& .subHeadingText": {
                color: "#757575",
                fontSize: "15px",
                fontWeight: "400",
                marginBottom: "20px",
                fontFamily: "'Manrope', serif",
            }
        },
        "& .forgot": {
            textAlign: "right",
            fontFamily: "'Manrope', serif",
            fontWeight: "600",
            fontSize: "14px",
            lineHeight: "17px",
            "& a": {
                color: "#1567CA",
            }
        },
        "& .signInButton": {
            backgroundColor: "#1567CA",
            borderRadius: "4px",
            height: "48px",
            color: "#FFFFFF",
            fontFamily: "'Manrope', serif",
            fontWeight: "700",
            fontSize: "15px",
            lineHeight: "18px",
            textTransform: "none",
            boxShadow: "none",
            marginBottom: "20px"
        },
        "& .googleButton": {
            backgroundColor: "#FFFFFF",
            border: "1px solid #E0E0E0",
            borderRadius: "3px",
            boxShadow: "0 6px 20px 0 rgba(0, 0, 0, 0.04)",
            height: "48px",
            color: "#424242",
            fontFamily: "'Manrope', serif",
            fontWeight: "600",
            fontSize: "15px",
            lineHeight: "18px",
            gap: "10px",
            marginBottom: "20px",
            textTransform: "none"
        },
        "& .signWithSSO": {
            backgroundColor: "#F2F5FA",
            borderRadius: "3px",
            border: "none",
            color: "#142B51",
            fontFamily: "'Manrope', serif",
            fontWeight: "600",
            fontSize: "15px",
            lineHeight: "18px",
            height: "48px",
            marginBottom: "20px",
            textTransform: "none"
        },
        "& .noAccount": {
            color: "#142B51",
            fontFamily: "'Manrope', serif",
            fontWeight: "500",
            fontSize: "14px",
            lineHeight: "17px",
            textAlign: "center",
            "& a": {
                color: "#1567CA",
                fontWeight: "600"
            }
        },
        "& .orText": {
            fontFamily: "'Manrope', serif",
            fontWeight: "700",
            color: "#757575",
            fontSize: "15px",
            fontWeight: "700",
            marginBottom: "20px",
            textAlign: "center",
            position: "relative",
            "& span": {
                position: "relative",
                zIndex: "1",
                background: "#fff"
            },
            "&::before": {
                background: "rgb(255,255,255)",
                background: "linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(224,224,224,1) 15%, rgba(255,255,255,1) 50%, rgba(224,224,224,1) 85%, rgba(255,255,255,1) 100%)",
                width: "100%",
                height: "1px",
                content: "''",
                position: "absolute",
                left: "0",
                top: "50%",
                zIndex: "0",
                marginTop: "-1px"
            }
        },
        "& .textField": {
            width: "100%",
            marginBottom: "22px",
            "& .MuiOutlinedInput-input": {
                height: "46px",
                lineHeight: "40px",
                background: "#FFFFFF 0% 0% no-repeat padding-box",
                padding: "2px 12px 3px 12px",
                borderRadius: "5px",
                fontFamily: "'Manrope', serif",
                fontSize: "14px",
                fontWeight: "normal",
                color: "#212121",
                boxSizing: "border-box",
                "&::placeholder": {
                    color: "#424242",
                    opacity: 1,
                    fontFamily: "'Manrope', serif",
                    fontSize: "14px"
                },
            },
            "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                border: "1px solid #E0E0E0",
            },
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                border: "1px solid #E0E0E0",
                borderRadius: "5px"
            }
        }
    }
}));

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const dispatch = useDispatch();
    const { loading, error, user } = useSelector((state) => state.user);
    // const router = useRouter();


    const handleForgotPassword = (e) => {
        e.preventDefault();
        dispatch(performForgotPassword({
            'Agentlang.Kernel.Identity/ForgotPassword': {
                Username: email
            }
        }));
    };

    return (
        <MainBox sx={{ display: 'flex', minHeight: '100vh' }}>
            <Box display={"flex"} width={'100%'}>
                {/* Left Section */}
                <Box className='loginLeft'>
                    <img src={"/images/coi-logo.png"} alt='COI' width={280} />
                    <Box mt={12}>
                        <img src={"/images/login-left-img.png"} alt='login-left-img' width={'480px'} />
                    </Box>
                </Box>

                {/* Right Section */}
                <Box className='loginRight'>
                    <Box className='formBox'>
                        <Typography variant="h4">
                            Forgot Password
                        </Typography>
                        <Typography className='subHeadingText'>
                            We will send you an otp to reset your password
                        </Typography>
                        <Box
                            component="form"
                            onSubmit={handleForgotPassword}
                        >
                            <TextField
                                className='textField'
                                id="outlined-basic"
                                placeholder="Email Id"
                                InputLabelProps={{
                                    shrink: false
                                }}
                                variant="outlined"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={loading}
                                sx={{ mt: 2 }}
                                className='signInButton'
                            >
                                {loading ? <CircularProgress size={24} /> : 'Send OTP'}
                            </Button>
                        </Box>
                        <Typography className='noAccount'>
                            Back to {""}
                            <Link href="/signup" underline="hover" color="primary">
                                Sign up
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Box>
            {error && (
                <Typography
                    variant="body2"
                    color="error"
                    sx={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)' }}
                >
                    {error}
                </Typography>
            )}
        </MainBox>
    );
}
