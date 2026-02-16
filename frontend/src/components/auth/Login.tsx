import { Box, Typography, Container, Grid, styled, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Email, Lock, Visibility, VisibilityOff, Instagram, Facebook, YouTube, CheckCircle } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog as MUIDialog, DialogContent as MUIDialogContent } from '@mui/material';
import authService from '../../services/authService';

// Logo image import
import creatorLogo from '../../assets/creator-logo.png';

const SplitContainer = styled(Container)`
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  padding: 2rem;
`;

const LeftSection = styled(Box)`
  background: linear-gradient(135deg, rgba(108, 99, 255, 0.1), rgba(108, 99, 255, 0.05));
  border-radius: 24px;
  padding: 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('https://source.unsplash.com/random/800x600?math,equation') center/cover;
    opacity: 0.05;
    z-index: 0;
  }
`;

const LogoContainer = styled(Box)`
  position: relative;
  z-index: 1;
  width: 200px;
  height: 200px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const RightSection = styled(Box)`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const SignUpForm = styled(Box)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const StyledTextField = styled(TextField)`
  margin-bottom: 1rem;
  & .MuiOutlinedInput-root {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    
    /* Fix autofill white patch */
    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 100px rgba(255, 255, 255, 0.05) inset !important;
      -webkit-text-fill-color: inherit !important;
      background-color: rgba(255, 255, 255, 0.05) !important;
      transition: background-color 5000s ease-in-out 0s;
    }
  }

  & .MuiInputBase-input {
    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 100px rgba(255, 255, 255, 0.05) inset !important;
      -webkit-text-fill-color: inherit !important;
      background-color: rgba(255, 255, 255, 0.05) !important;
      transition: background-color 5000s ease-in-out 0s;
    }
  }
`;

const SignUpButton = styled(Button)`
  padding: 1rem;
  border-radius: 12px;
  text-transform: none;
  font-size: 1.1rem;
  width: 100%;
  margin-top: 1rem;
  background: #6C63FF;
  color: white;
  border: none;

  &:hover {
    background: #5A52D9;
  }
`;

const TopBar = styled(Box)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  z-index: 100;
  pointer-events: auto;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: blur(20px);
    z-index: -1;
  }
`;

const TopBarLogo = styled(Box)`
  display: flex;
  align-items: center;
  gap: 1rem;

  img {
    height: 40px;
    width: auto;
  }
`;

const MainContent = styled(Box)`
  padding-top: 80px;
  min-height: calc(100vh - 80px);
  position: relative;
  z-index: 1;
`;

const RootContainer = styled(Box)`
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(108, 99, 255, 0.05), rgba(108, 99, 255, 0.02));
  overflow-x: hidden;
  overflow-y: auto;

  /* Custom scrollbar styles */
  &::-webkit-scrollbar {
    width: 12px;
    background: transparent;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }

  &::-webkit-scrollbar-thumb {
    background: #6C63FF;
    border-radius: 6px;
    border: 3px solid transparent;
    background-clip: content-box;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #5A52D9;
  }
`;

const LoginDialog = styled(Dialog)`
  .MuiDialog-paper {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    padding: 16px;
  }
`;

interface SignUpFormData {
  name: string;
  email: string;
  username: string;
  phoneNumber: string;
  password: string;
  instagram: string;
  facebook: string;
  youtube: string;
}

interface LoginFormData {
  email: string;
  password: string;
  showPassword: boolean;
}

export const Login = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignUpFormData>({
    name: '',
    email: '',
    username: '',
    phoneNumber: '',
    password: '',
    instagram: '',
    facebook: '',
    youtube: '',
  });
  const [loginFormData, setLoginFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    showPassword: false,
  });
  const [error, setError] = useState('');
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || '').trim());

  useEffect(() => {
    // Preload the logo
    const img = new Image();
    img.src = creatorLogo;
    img.onerror = () => {
      setLogoError(true);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.email && !isValidEmail(formData.email)) {
      setEmailError('Not a valid email address.');
      setError('Please enter a valid email address.');
      return;
    }
    if (formData.phoneNumber && !isValidPhone(formData.phoneNumber)) {
      setPhoneError('Please enter a valid 10-digit phone number.');
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    if (emailError || usernameError || phoneError) {
      setError('Please fix the errors before submitting.');
      return;
    }
    try {
      const response = await fetch('/api/users/creator-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          username: formData.username,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          instagram: formData.instagram,
          facebook: formData.facebook,
          youtube: formData.youtube,
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const msg = data.message || (Array.isArray(data.errors) && data.errors[0]?.msg) || 'Sign up failed';
        throw new Error(msg);
      }
      setSuccessDialogOpen(true);
      setFormData({ name: '', email: '', username: '', phoneNumber: '', password: '', instagram: '', facebook: '', youtube: '' });
      setEmailError('');
      setUsernameError('');
      setPhoneError('');
      setShowSignupPassword(false);
    } catch (err: any) {
      setError(err.message || 'Failed to sign up. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: digitsOnly });
      setPhoneError('');
      return;
    }
    if (name === 'email') setEmailError('');
    if (name === 'username') setUsernameError('');
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Show login animation
    setIsLoggingIn(true);
    setLoginSuccess(false);
    
    // Optimize: Close dialog immediately for better UX
    setLoginDialogOpen(false);
    
    try {
      // Get token and complete user data in a single call (optimized backend)
      const { token, user: userProfile } = await authService.login(loginFormData.email, loginFormData.password);
      localStorage.setItem('token', token);
      
      // Update user context immediately with profile data
      setUser(userProfile);
      
      // Show success animation
      setLoginSuccess(true);
      setIsLoggingIn(false);
      
      // Wait a bit for success animation, then navigate
      setTimeout(() => {
        // Navigate based on role - do this immediately for seamless experience
        if (userProfile?.role?.name === 'Creator' || userProfile?.role?.name === 'Learner') {
          navigate('/get-to-know', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }, 800);
    } catch (err: any) {
      // Hide animation on error
      setIsLoggingIn(false);
      setLoginSuccess(false);
      // Re-open dialog on error
      setLoginDialogOpen(true);
      setError(err.response?.data?.message || 'Invalid email or password');
    }
  };

  const handleClickShowPassword = () => {
    setLoginFormData({
      ...loginFormData,
      showPassword: !loginFormData.showPassword,
    });
  };

  const handleEmailBlur = () => {
    if (!formData.email) {
      setEmailError('');
      return;
    }
    if (!isValidEmail(formData.email)) {
      setEmailError('Not a valid email address.');
    } else {
      setEmailError('');
    }
  };

  const handleUsernameBlur = async () => {
    if (!formData.username || !formData.username.trim()) {
      setUsernameError('');
      return;
    }
    setUsernameChecking(true);
    setUsernameError('');
    try {
      const res = await fetch(`/api/users/check-username?username=${encodeURIComponent(formData.username.trim())}`);
      if (res.status === 304) {
        setUsernameError('');
        return;
      }
      if (!res.ok) {
        setUsernameError('Could not check username (server error)');
        return;
      }
      const text = await res.text();
      if (!text) {
        setUsernameError('');
        return;
      }
      const data = JSON.parse(text);
      if (data.taken) {
        setUsernameError('This username already exists.');
      } else {
        setUsernameError('');
      }
    } catch (err) {
      setUsernameError('Could not check username (network error)');
    } finally {
      setUsernameChecking(false);
    }
  };

  const isValidPhone = (value: string) => /^\d{10}$/.test((value || '').trim());

  const handlePhoneBlur = async () => {
    const value = (formData.phoneNumber || '').trim();
    if (!value) {
      setPhoneError('');
      return;
    }
    if (value.length !== 10 || !/^\d+$/.test(value)) {
      setPhoneError('Please enter a valid 10-digit phone number.');
      return;
    }
    try {
      const res = await fetch(`/api/users/check-phone?phoneNumber=${encodeURIComponent(value)}`);
      if (res.status === 304) {
        setPhoneError('');
        return;
      }
      if (!res.ok) {
        setPhoneError('Could not validate phone number (server error)');
        return;
      }
      const text = await res.text();
      if (!text) {
        setPhoneError('');
        return;
      }
      const data = JSON.parse(text);
      if (data.taken) {
        setPhoneError('Phone number is already registered.');
      } else {
        setPhoneError('');
      }
    } catch (err) {
      setPhoneError('Could not validate phone number (network error)');
    }
  };

  return (
    <RootContainer>
      <TopBar>
        <TopBarLogo onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>
          {!logoError ? (
            <img src={creatorLogo} alt="Creator Logo" onError={() => setLogoError(true)} />
          ) : (
            <Typography variant="h5" sx={{ color: '#FF4081' }}>C</Typography>
          )}
          <Typography variant="h6">Creator</Typography>
        </TopBarLogo>
        <Button
          onClick={() => setLoginDialogOpen(true)}
          sx={{
            background: '#6C63FF',
            color: 'white',
            padding: '0.8rem 2rem',
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 'bold',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: '#5A52D9',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 20px rgba(108, 99, 255, 0.4)',
            },
          }}
        >
          Sign In
        </Button>
      </TopBar>

      <MainContent>
        <SplitContainer>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <LeftSection>
                <LogoContainer>
                  {!logoError ? (
                    <img src={creatorLogo} alt="Creator Logo" onError={() => setLogoError(true)} />
                  ) : (
                    <Typography variant="h1" sx={{ color: '#FF4081' }}>C</Typography>
                  )}
                </LogoContainer>
                <Typography variant="h3" component="h1" align="center" gutterBottom sx={{ position: 'relative', zIndex: 1 }}>
                  Welcome to Creator
                </Typography>
                <Typography variant="h6" align="center" sx={{ position: 'relative', zIndex: 1, opacity: 0.8 }}>
                  Create. Collaborate. Conquer.
                </Typography>
              </LeftSection>
            </Grid>

            <Grid item xs={12} md={6}>
              <RightSection>
                <SignUpForm>
                  <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', color: '#6C63FF' }}>
                    Creator Sign Up
                  </Typography>
                  {error && (
                    <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
                      {error}
                    </Typography>
                  )}
                  <form onSubmit={handleSubmit}>
                    <StyledTextField
                      fullWidth
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                    <StyledTextField
                      fullWidth
                      label="Email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleEmailBlur}
                      required
                      error={!!emailError}
                      helperText={emailError}
                    />
                    <StyledTextField
                      fullWidth
                      label="Username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      onBlur={handleUsernameBlur}
                      required
                      error={!!usernameError}
                      helperText={usernameChecking ? 'Checking...' : usernameError}
                    />
                    <StyledTextField
                      fullWidth
                      label="Phone Number"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      onBlur={handlePhoneBlur}
                      required
                      error={!!phoneError}
                      helperText={phoneError}
                      inputProps={{ maxLength: 10, inputMode: 'numeric' }}
                      placeholder="10 digits"
                    />
                    <StyledTextField
                      fullWidth
                      label="Password"
                      type={showSignupPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: '#6C63FF' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowSignupPassword(!showSignupPassword)}
                              onMouseDown={(e) => e.preventDefault()}
                              edge="end"
                              size="small"
                              aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                            >
                              {showSignupPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Grid container spacing={2} sx={{ width: '100%', mt: 1 }}>
                      <Grid item xs={12} sm={4}>
                        <StyledTextField
                          fullWidth
                          label="Instagram Account"
                          name="instagram"
                          value={formData.instagram || ''}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Instagram sx={{ color: '#E1306C' }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <StyledTextField
                          fullWidth
                          label="Facebook Account"
                          name="facebook"
                          value={formData.facebook || ''}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Facebook sx={{ color: '#1877F3' }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <StyledTextField
                          fullWidth
                          label="YouTube Account"
                          name="youtube"
                          value={formData.youtube || ''}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <YouTube sx={{ color: '#FF0000' }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                    <SignUpButton type="submit" variant="contained">
                      Sign Up as Creator
                    </SignUpButton>
                  </form>
                </SignUpForm>
              </RightSection>
            </Grid>
          </Grid>
        </SplitContainer>
      </MainContent>

      <LoginDialog
        open={loginDialogOpen}
        onClose={() => setLoginDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <form onSubmit={handleLogin}>
          <DialogTitle>
            <Typography variant="h5" align="center" sx={{ color: '#6C63FF', fontWeight: 'bold' }}>
              Welcome Back
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <StyledTextField
                fullWidth
                label="Email"
                type="email"
                value={loginFormData.email}
                onChange={(e) => setLoginFormData({ ...loginFormData, email: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    // Focus password field if empty, otherwise submit
                    if (!loginFormData.password) {
                      const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
                      passwordInput?.focus();
                    } else {
                      handleLogin(e as any);
                    }
                  }
                }}
                required
                error={!!error}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#6C63FF' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <StyledTextField
                fullWidth
                label="Password"
                type={loginFormData.showPassword ? 'text' : 'password'}
                value={loginFormData.password}
                onChange={(e) => setLoginFormData({ ...loginFormData, password: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleLogin(e as any);
                  }
                }}
                required
                error={!!error}
                helperText={error}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#6C63FF' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowPassword}
                        edge="end"
                        type="button"
                      >
                        {loginFormData.showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{
                background: '#6C63FF',
                color: 'white',
                borderRadius: '12px',
                padding: '12px',
                '&:hover': {
                  background: '#5A52D9',
                },
              }}
            >
              Sign In
            </Button>
          </DialogActions>
        </form>
      </LoginDialog>

      <MUIDialog open={successDialogOpen} onClose={() => setSuccessDialogOpen(false)} maxWidth="xs" fullWidth>
        <MUIDialogContent>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 0' }}
          >
            <CheckCircle sx={{ fontSize: 64, color: '#6C63FF', mb: 2 }} />
            <Typography variant="h5" align="center" sx={{ color: '#6C63FF', fontWeight: 'bold', mb: 1 }}>
              Your Request is Sent to Creator Admin
            </Typography>
            <Typography variant="body1" align="center" sx={{ opacity: 0.8, mb: 1 }}>
              Now login to the portal and upload the KYC - to proceed further.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 3, alignItems: 'center' }}>
              <Button
                variant="contained"
                sx={{ background: '#6C63FF', color: 'white', borderRadius: '12px', px: 3 }}
                onClick={() => {
                  setSuccessDialogOpen(false);
                  setLoginDialogOpen(true);
                }}
              >
                Login
              </Button>
              <Button
                variant="outlined"
                sx={{ borderColor: '#6C63FF', color: '#6C63FF', borderRadius: '12px', px: 3 }}
                onClick={() => setSuccessDialogOpen(false)}
              >
                Close
              </Button>
            </Box>
          </motion.div>
        </MUIDialogContent>
      </MUIDialog>

      {/* Sign In Animation Overlay */}
      <AnimatePresence>
        {(isLoggingIn || loginSuccess) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.95), rgba(108, 99, 255, 0.85))',
              backdropFilter: 'blur(20px)',
            }}
          >
            {isLoggingIn && (
              <motion.div
                key="loading"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {/* Container for spinner and rings */}
                <Box
                  sx={{
                    position: 'relative',
                    width: 200,
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Pulsing Rings */}
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0.8, opacity: 0.8 }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.8, 0, 0.8],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeOut',
                        delay: i * 0.3,
                      }}
                      style={{
                        position: 'absolute',
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        border: '3px solid rgba(108, 99, 255, 0.5)',
                        pointerEvents: 'none',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  ))}

                  {/* Animated Spinner */}
                  <motion.div
                    animate={{
                      rotate: 360,
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      rotate: {
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      },
                      scale: {
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      },
                    }}
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      background: 'conic-gradient(from 0deg, #6C63FF, #00FFC6, #00F5FF, #6C63FF)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      boxShadow: '0 0 40px rgba(108, 99, 255, 0.5)',
                      zIndex: 1,
                    }}
                  >
                    <motion.div
                      animate={{
                        rotate: -360,
                        scale: [1, 0.9, 1],
                      }}
                      transition={{
                        rotate: {
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear',
                        },
                        scale: {
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        },
                      }}
                      style={{
                        width: 90,
                        height: 90,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #6C63FF, #00FFC6)',
                          boxShadow: '0 0 20px rgba(108, 99, 255, 0.8)',
                        }}
                      />
                    </motion.div>
                  </motion.div>
                </Box>

                {/* Loading Text */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  style={{ marginTop: 40, textAlign: 'center' }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      mb: 1,
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    Signing you in...
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      textShadow: '0 1px 5px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    Creating your seamless experience
                  </Typography>
                </motion.div>
              </motion.div>
            )}

            {loginSuccess && (
              <motion.div
                key="success"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Success Circle */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                    delay: 0.1,
                  }}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00FFC6, #00F5FF)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 40px rgba(0, 255, 198, 0.6)',
                    position: 'relative',
                  }}
                >
                  {/* Checkmark */}
                  <motion.svg
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.3,
                      ease: 'easeOut',
                    }}
                    width="60"
                    height="60"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <motion.path
                      d="M5 13l4 4L19 7"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.3,
                        ease: 'easeOut',
                      }}
                    />
                  </motion.svg>

                  {/* Success Rings */}
                  {[0, 1].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 1, opacity: 0.6 }}
                      animate={{
                        scale: [1, 1.8, 1.8],
                        opacity: [0.6, 0, 0],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'easeOut',
                        delay: i * 0.5,
                      }}
                      style={{
                        position: 'absolute',
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        border: '3px solid rgba(0, 255, 198, 0.5)',
                        pointerEvents: 'none',
                      }}
                    />
                  ))}
                </motion.div>

                {/* Success Text */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  style={{ marginTop: 40, textAlign: 'center' }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      mb: 1,
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    Welcome back, Creator!
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      textShadow: '0 1px 5px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    Redirecting you now...
                  </Typography>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </RootContainer>
  );
};

