import { Box, AppBar, Toolbar, Typography, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { InfluencerShowcase } from './InfluencerShowcase';
import { HowItWorksSection } from './HowItWorksSection';
import { BenefitsSection } from './BenefitsSection';
import { TestimonialsSection } from './TestimonialsSection';
import { FAQSection } from './FAQSection';
import { CTASection } from './CTASection';
import { Footer } from './Footer';
import creatorLogo from '../../assets/creator-logo.png';

const Navbar = styled(motion(AppBar))`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  box-shadow: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: fixed;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
`;

const NavContainer = styled(Toolbar)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
`;

const LogoContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  
  img {
    height: 45px;
    width: auto;
    transition: transform 0.3s ease;
  }
  
  &:hover img {
    transform: scale(1.1) rotate(5deg);
  }
`;

const NavLinks = styled(Box)`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const NavLink = styled(motion.button)`
  background: transparent;
  border: none;
  color: white;
  text-transform: none;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background: white;
    transform: translateX(-50%);
    transition: width 0.3s ease;
  }
  
  &:hover::before {
    width: 80%;
  }
`;

const LoginButton = styled(motion.button)`
  background: white;
  color: #667eea;
  padding: 0.8rem 2.5rem;
  border-radius: 30px;
  border: none;
  text-transform: none;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(102, 126, 234, 0.1);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  
  &:hover::before {
    width: 300px;
    height: 300px;
  }
  
  span {
    position: relative;
    z-index: 1;
  }
`;

export const Home = () => {
  const navigate = useNavigate();
  const [logoError, setLogoError] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const _navbarBackground = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.95)']
  );
  const _navbarColor = useTransform(
    scrollY,
    [0, 100],
    ['white', '#1a1a1a']
  );

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      setScrolled(latest > 50);
    });
    return () => unsubscribe();
  }, [scrollY]);

  return (
    <Box sx={{ minHeight: '100vh', background: '#ffffff' }}>
      <Navbar
        style={{
          background: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.05)',
          boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.1)' : 'none',
        }}
      >
        <NavContainer>
          <LogoContainer
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {!logoError ? (
              <img 
                src={creatorLogo} 
                alt="Creator Logo" 
                onError={() => setLogoError(true)} 
              />
            ) : (
              <Typography variant="h5" sx={{ color: scrolled ? '#667eea' : 'white', fontWeight: 'bold' }}>
                C
              </Typography>
            )}
            <Typography 
              variant="h6" 
              sx={{ 
                color: scrolled ? '#667eea' : 'white', 
                fontWeight: 'bold',
                transition: 'color 0.3s ease',
              }}
            >
              Creator
            </Typography>
          </LogoContainer>

          <NavLinks>
            <NavLink
              onClick={() => navigate('/')}
              whileHover={{ y: -2 }}
              style={{ color: scrolled ? '#1a1a1a' : 'white' }}
            >
              Home
            </NavLink>
            <NavLink
              onClick={() => navigate('/')}
              whileHover={{ y: -2 }}
              style={{ color: scrolled ? '#1a1a1a' : 'white' }}
            >
              Features
            </NavLink>
            <NavLink
              onClick={() => navigate('/pricing')}
              whileHover={{ y: -2 }}
              style={{ color: scrolled ? '#1a1a1a' : 'white' }}
            >
              Pricing
            </NavLink>
            <LoginButton
              onClick={() => navigate('/login')}
              whileHover={{ 
                scale: 1.05,
                y: -2,
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
              }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: scrolled ? '#667eea' : 'white',
                color: scrolled ? 'white' : '#667eea',
              }}
            >
              <span>Login</span>
            </LoginButton>
          </NavLinks>
        </NavContainer>
      </Navbar>

      <HeroSection />
      <FeaturesSection />
      <InfluencerShowcase />
      <HowItWorksSection />
      <BenefitsSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </Box>
  );
};
