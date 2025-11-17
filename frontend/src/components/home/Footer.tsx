import { Box, Typography, Container, Grid, Link, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FooterContainer = styled(Box)`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: white;
  padding: 5rem 2rem 2rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.5), transparent);
  }
`;

const FooterContent = styled(Container)`
  padding-bottom: 2rem;
  position: relative;
  z-index: 1;
`;

const FooterSection = styled(motion.div)`
  margin-bottom: 2rem;
`;

const FooterTitle = styled(Typography)`
  font-size: 1.2rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: white;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const FooterLink = styled(motion.div)`
  display: block;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  margin-bottom: 0.75rem;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  position: relative;
  padding-left: 0;
  
  &::before {
    content: '→';
    position: absolute;
    left: -20px;
    opacity: 0;
    transition: all 0.3s ease;
    color: #667eea;
  }
  
  &:hover {
    color: #667eea;
    padding-left: 20px;
    transform: translateX(5px);
    
    &::before {
      opacity: 1;
      left: 0;
    }
  }
`;

const Copyright = styled(Box)`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 2rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  position: relative;
  z-index: 1;
`;

const LogoText = styled(motion.div)`
  font-size: 2rem;
  font-weight: 900;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #667eea, #f093fb, #4facfe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% 200%;
  animation: gradient 5s ease infinite;
  
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

export const Footer = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <FooterContainer>
      <FooterContent>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <FooterSection variants={itemVariants}>
                <LogoText
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  Creator
                </LogoText>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.8, mb: 2, fontSize: '1rem' }}>
                  Empowering educators to build thriving online businesses. Transform your expertise into a sustainable income stream with our comprehensive platform.
                </Typography>
              </FooterSection>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FooterSection variants={itemVariants}>
                <FooterTitle>Platform</FooterTitle>
                <FooterLink whileHover={{ x: 5 }} onClick={() => navigate('/')}>Home</FooterLink>
                <FooterLink whileHover={{ x: 5 }} onClick={() => navigate('/')}>Features</FooterLink>
                <FooterLink whileHover={{ x: 5 }} onClick={() => navigate('/')}>Pricing</FooterLink>
                <FooterLink whileHover={{ x: 5 }} onClick={() => navigate('/login')}>Login</FooterLink>
              </FooterSection>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FooterSection variants={itemVariants}>
                <FooterTitle>Resources</FooterTitle>
                <FooterLink whileHover={{ x: 5 }} onClick={(e) => e.preventDefault()}>Documentation</FooterLink>
                <FooterLink whileHover={{ x: 5 }} onClick={(e) => e.preventDefault()}>Blog</FooterLink>
                <FooterLink whileHover={{ x: 5 }} onClick={(e) => e.preventDefault()}>Tutorials</FooterLink>
                <FooterLink whileHover={{ x: 5 }} onClick={(e) => e.preventDefault()}>Community</FooterLink>
              </FooterSection>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FooterSection variants={itemVariants}>
                <FooterTitle>Support</FooterTitle>
                <FooterLink whileHover={{ x: 5 }} onClick={(e) => e.preventDefault()}>Help Center</FooterLink>
                <FooterLink whileHover={{ x: 5 }} onClick={(e) => e.preventDefault()}>Contact Us</FooterLink>
                <FooterLink whileHover={{ x: 5 }} onClick={(e) => e.preventDefault()}>Live Chat</FooterLink>
                <FooterLink whileHover={{ x: 5 }} onClick={(e) => e.preventDefault()}>Status</FooterLink>
              </FooterSection>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FooterSection variants={itemVariants}>
                <FooterTitle>Legal</FooterTitle>
                <FooterLink whileHover={{ x: 5 }} onClick={(e) => e.preventDefault()}>Privacy Policy</FooterLink>
                <FooterLink whileHover={{ x: 5 }} onClick={(e) => e.preventDefault()}>Terms of Service</FooterLink>
                <FooterLink whileHover={{ x: 5 }} onClick={(e) => e.preventDefault()}>Cookie Policy</FooterLink>
                <FooterLink whileHover={{ x: 5 }} onClick={(e) => e.preventDefault()}>Refund Policy</FooterLink>
              </FooterSection>
            </Grid>
          </Grid>
        </motion.div>
      </FooterContent>

      <Copyright>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Typography>
            © {new Date().getFullYear()} Creator Platform. All rights reserved.
          </Typography>
        </motion.div>
      </Copyright>
    </FooterContainer>
  );
};
