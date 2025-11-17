import { Box, Typography, Container, Grid, styled, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Email, Lock, Visibility, VisibilityOff, Instagram, Facebook, YouTube, CheckCircle } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
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
  }

  & .MuiInputBase-input:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 100px transparent inset;
    -webkit-text-fill-color: inherit;
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
  console.log('Login component (Login/Signup Page) is rendering');
  const { login } = useAuth();
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
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    console.log('Login component mounted');
    // Preload the logo
    const img = new Image();
    img.src = creatorLogo;
    img.onerror = () => {
      console.error('Failed to load logo');
      setLogoError(true);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (usernameError || phoneError) {
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
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Sign up failed');
      }
      setSuccessDialogOpen(true);
      setFormData({ name: '', email: '', username: '', phoneNumber: '', password: '', instagram: '', facebook: '', youtube: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to sign up. Please try again.');
      console.error('Signup error:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const token = await authService.login(loginFormData.email, loginFormData.password);
      await login(token);
      setLoginDialogOpen(false);
      // Fetch user profile to determine role
      const userProfile = await authService.getProfile();
      if (userProfile?.role?.name === 'Creator' || userProfile?.role?.name === 'Learner') {
        navigate('/get-to-know');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  const handleClickShowPassword = () => {
    setLoginFormData({
      ...loginFormData,
      showPassword: !loginFormData.showPassword,
    });
  };

  const handleUsernameBlur = async () => {
    if (!formData.username) return;
    try {
      const res = await fetch(`/api/users/check-username?username=${encodeURIComponent(formData.username)}`);
      if (res.status === 304) {
        setUsernameError('');
        return;
      }
      if (!res.ok) {
        setUsernameError('Could not validate username (server error)');
        console.error('Username check failed: HTTP', res.status);
        return;
      }
      const text = await res.text();
      if (!text) {
        setUsernameError('');
        return;
      }
      const data = JSON.parse(text);
      if (data.taken) {
        setUsernameError('Username is already taken');
      } else {
        setUsernameError('');
      }
    } catch (err) {
      setUsernameError('Could not validate username (network error)');
      console.error('Username check error:', err);
    }
  };

  const handlePhoneBlur = async () => {
    if (!formData.phoneNumber) return;
    try {
      const res = await fetch(`/api/users/check-phone?phoneNumber=${encodeURIComponent(formData.phoneNumber)}`);
      if (res.status === 304) {
        setPhoneError('');
        return;
      }
      if (!res.ok) {
        setPhoneError('Could not validate phone number (server error)');
        console.error('Phone check failed: HTTP', res.status);
        return;
      }
      const text = await res.text();
      if (!text) {
        setPhoneError('');
        return;
      }
      const data = JSON.parse(text);
      if (data.taken) {
        setPhoneError('Phone number is already registered');
      } else {
        setPhoneError('');
      }
    } catch (err) {
      setPhoneError('Could not validate phone number (network error)');
      console.error('Phone check error:', err);
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
                      required
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
                      helperText={usernameError}
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
                    />
                    <StyledTextField
                      fullWidth
                      label="Password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
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
            <Typography variant="body1" align="center" sx={{ opacity: 0.8 }}>
              You will be notified once your request is reviewed.
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 3, background: '#6C63FF', color: 'white', borderRadius: '12px', px: 4 }}
              onClick={() => setSuccessDialogOpen(false)}
            >
              Close
            </Button>
          </motion.div>
        </MUIDialogContent>
      </MUIDialog>
    </RootContainer>
  );
};

