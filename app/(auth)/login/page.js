'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, logoutUser } from '../../services/authServices';
import styles from '../../styles/Login.module.css'
import { useRouter } from 'next/navigation';
export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const { loading, error, user } = useSelector((state) => state.user);
    const router = useRouter();
    const handleLogin = (e) => {
        e.preventDefault();
        // dispatch(loginUser({ email, password }));
        router.push("/dashboard")
    };

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    return (
        <div>
            {user ? (
                <>
                    <h1>Welcome, {user.name}</h1>
                    <button onClick={handleLogout} button="true">Logout</button>
                </>
            ) : (
                <div className={styles.loginContainer}>
      <div className={styles.loginLeft}>
        <img src="/logo.png" alt="CIOptimize Logo" className={styles.logo} />
        <div className={styles.illustration}>
          <div className={styles.illustrationBox}>
            <img src="/illustration1.png" alt="Illustration 1" />
          </div>
          <div className={styles.illustrationBox}>
            <img src="/illustration2.png" alt="Illustration 2" />
          </div>
        </div>
      </div>
      <div className={styles.loginRight}>
        <h1>Welcome</h1>
        <p>Please enter your details</p>
        <form className={styles.loginForm} onSubmit={handleLogin}>
          <input type="email" placeholder="Email Id" className={styles.inputField}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" className={styles.inputField}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} />
          <div className={styles.options}>
            <a href="/forgot-password" className={styles.forgotPassword}>Forgot Password?</a>
          </div>
          <button type="submit" className={styles.loginButton} disabled={loading} button="true">
          {loading ? 'Signing in...' : 'Sign in'}</button>
          <div className={styles.orSection}>OR</div>
          <button type="button" className={styles.googleLogin}>Sign in with Google</button>
          <button type="button" className={styles.ssoLogin}>Sign in with SSO</button>
        </form>
        <p className={styles.signupText}>
          Don’t have an account? <a href="/signup">Sign up</a>
        </p>
      </div>
    </div>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}