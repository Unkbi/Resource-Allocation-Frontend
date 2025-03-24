'use client';

import React, { Suspense, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Box,
    Typography,
    TextField,
    Button,
    Link,
    CircularProgress,
    styled,
    InputAdornment,
    IconButton
} from '@mui/material';
import { performResetPassword } from '@/app/redux/actions/authActions';

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

export default function ResetPasswordPageWrapper() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RestPasswordPage />
        </Suspense>
    );
}

function RestPasswordPage() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();
    const dispatch = useDispatch();
    const { loading, error, resetPasswordMessage } = useSelector((state) => state.user);
    const searchParams = useSearchParams();
    const username = searchParams.get('username');
    const code = searchParams.get('code');

    const handleResetPassword = (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }
        dispatch(performResetPassword({
            'Agentlang.Kernel.Identity/ConfirmForgotPassword': {
                Password: newPassword,
                Username: username,
                ConfirmationCode: code
            }
        })).then((response) => {
            console.log('Password reset successful:', response);
        });

        setNewPassword('');
        setConfirmPassword('');
        setErrorMessage('');
    };

    const handleToggleNewPassword = () => setShowNewPassword((prev) => !prev);
    const handleToggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

    if (resetPasswordMessage && !error) {
        router.push('/login');
    }

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
                            Reset Password
                        </Typography>
                        <Typography className='subHeadingText' whiteSpace={'nowrap'}>
                            Your new password must be different from previous one
                        </Typography>
                        <Box
                            component="form"
                            onSubmit={handleResetPassword}
                        >
                            <TextField
                                className='textField'
                                variant="outlined"
                                placeholder="New Password"
                                type={showNewPassword ? "text" : "password"}
                                fullWidth
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={handleToggleNewPassword} edge="end">
                                                {showNewPassword ? (
                                                    <img src={"/images/icons/eye-on.svg"} alt='eye-on' />
                                                ) : (
                                                    <img src={"/images/icons/eye-off.svg"} alt='eye-off' />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                className='textField'
                                variant="outlined"
                                placeholder="Confirm Password"
                                type={showConfirmPassword ? "text" : "password"}
                                fullWidth
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={handleToggleConfirmPassword} edge="end">
                                                {showConfirmPassword ? (
                                                    <img src={"/images/icons/eye-on.svg"} alt='eye-on' />
                                                ) : (
                                                    <img src={"/images/icons/eye-off.svg"} alt='eye-off' />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            {errorMessage && (
                                <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                                    {errorMessage}
                                </Typography>
                            )}
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={loading}
                                sx={{ mt: 2 }}
                                className='signInButton'
                            >
                                {loading ? <CircularProgress size={24} /> : 'Reset Password'}
                            </Button>
                        </Box>

                    </Box>
                </Box>
            </Box>
            {resetPasswordMessage && !error && (
                <Typography
                    variant="body2"
                    color="success"
                    sx={{ position: 'absolute', bottom: '150px', left: '50%', transform: 'translateX(-50%)' }}
                >
                    Password reset successfully! You can now log in with your new password.
                </Typography>
            )}
            {error && (
                <Typography
                    variant="body2"
                    color="error"
                    sx={{ position: 'absolute', bottom: '150px', left: '50%', transform: 'translateX(-50%)' }}
                >
                    {error}
                </Typography>
            )}
        </MainBox>
    );
}
