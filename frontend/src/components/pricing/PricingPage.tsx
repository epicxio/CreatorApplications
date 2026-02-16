import React, { useState } from 'react';
import { Box, Typography, Container, Grid, Chip, AppBar, Toolbar, styled } from '@mui/material';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import creatorLogo from '../../assets/creator-logo.png';
import { 
  CheckCircle, 
  WorkspacePremium, 
  Star, 
  Diamond, 
  EmojiEvents,
} from '@mui/icons-material';

const Navbar = styled(motion(AppBar))`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  z-index: 1000;
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
  color: #1a1a1a;
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
    background: #667eea;
    transform: translateX(-50%);
    transition: width 0.3s ease;
  }
  
  &:hover::before {
    width: 80%;
  }
`;

const LoginButton = styled(motion.button)`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 0.8rem 2.5rem;
  border-radius: 30px;
  border: none;
  text-transform: none;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
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
    background: rgba(255, 255, 255, 0.1);
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

const PageContainer = styled(Box)`
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
  padding-top: 80px;
`;

const SectionContainer = styled(Container)`
  padding: 4rem 2rem;
`;

const SectionTitle = styled(motion.h2)`
  font-size: 3rem;
  font-weight: 900;
  text-align: center;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ToggleContainer = styled(Box)`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 3rem 0;
`;

const ToggleButton = styled(motion.button)<{ active?: boolean }>`
  padding: 1rem 3rem;
  border-radius: 50px;
  border: 2px solid ${props => props.active ? '#667eea' : '#ddd'};
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.active ? '0 8px 25px rgba(102, 126, 234, 0.3)' : 'none'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }
`;

const SetupCard = styled(motion.div)`
  background: white;
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  margin: 2rem auto;
  max-width: 600px;
  border: 2px solid transparent;
  transition: all 0.4s ease;
  
  &:hover {
    border-color: #667eea;
    transform: translateY(-5px);
    box-shadow: 0 15px 50px rgba(102, 126, 234, 0.2);
  }
`;

const PriceText = styled(Typography)`
  font-size: 2.5rem;
  font-weight: 900;
  color: #667eea;
  margin: 1rem 0;
`;

const PlanCard = styled(motion.div)<{ featured?: boolean; color: string }>`
  background: white;
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  border: 3px solid ${props => props.featured ? props.color : 'transparent'};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, ${props => props.color}, ${props => props.color}dd);
    transform: scaleX(${props => props.featured ? 1 : 0});
    transition: transform 0.4s;
  }
  
  &:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    border-color: ${props => props.color};
    
    &::before {
      transform: scaleX(1);
    }
  }
`;

const PlanHeader = styled(Box)`
  text-align: center;
  margin-bottom: 2rem;
`;

const PlanIcon = styled(Box)<{ color: string }>`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, ${props => props.color}, ${props => props.color}dd);
  color: white;
  box-shadow: 0 8px 25px ${props => props.color}40;
`;

const PlanTitle = styled(Typography)`
  font-size: 2rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
  color: #1a1a1a;
`;

const PlanPrice = styled(Typography)`
  font-size: 2.5rem;
  font-weight: 900;
  color: #667eea;
  margin: 1rem 0;
`;

const CommissionText = styled(Typography)`
  font-size: 1rem;
  color: #666;
  margin-bottom: 2rem;
  font-weight: 600;
`;

const FeatureList = styled(Box)`
  flex: 1;
  margin-bottom: 2rem;
`;

const FeatureItem = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  color: #333;
`;

const CTAButton = styled(motion.button)<{ color: string }>`
  width: 100%;
  padding: 1rem 2rem;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, ${props => props.color}, ${props => props.color}dd);
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: auto;
  box-shadow: 0 4px 15px ${props => props.color}40;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px ${props => props.color}60;
  }
`;

const PromoBanner = styled(motion.div)`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: white;
  padding: 4rem 2rem;
  margin-top: 4rem;
  border-radius: 24px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(102, 126, 234, 0.2) 0%, transparent 70%);
    border-radius: 50%;
  }
`;

export const PricingPage = () => {
  const navigate = useNavigate();
  const [setupType, setSetupType] = useState<'FREEDOM' | 'ENTERPRISE'>('FREEDOM');
  const [logoError, setLogoError] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const plans = [
    {
      id: 'basic',
      name: 'BASIC',
      icon: <WorkspacePremium sx={{ fontSize: 40 }} />,
      color: '#4caf50',
      price: 'Zero Fixed Fee',
      commission: '10% Commissions (including payment gateway charges)',
      featured: false,
      features: [
        'Unlimited Landing Pages (3 templates)',
        'LMS Storage upto 20 GB media upload',
        'Team Management',
        'Advanced Analytics',
        'Chat Rooms',
        'WhatsApp Integration (Automations & Broadcast)',
        'Email Broadcasting (10 email credits/ user) & Automations',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: <Star sx={{ fontSize: 40 }} />,
      color: '#e91e63',
      price: '₹5,000/month',
      commission: '5% Commissions (including payment gateway charges)',
      featured: false,
      features: [
        'Everything in Basic +',
        'Unlimited Storage',
        'Refund Automation',
        'Free Products using 100% OFF coupons',
        '50K email/month for broadcast',
        'Exclusive Landing Page templates',
        'Build Custom Certificates',
      ],
    },
    {
      id: 'advanced',
      name: 'Advanced',
      icon: <Diamond sx={{ fontSize: 40 }} />,
      color: '#2196f3',
      price: '₹15,000/month',
      commission: '2.5% Commissions (including payment gateway charges)*',
      featured: true,
      features: [
        'Everything in Pro +',
        'Affiliate',
        'Gamification',
        'No Cost EMI',
        'Forums and Peer to Peer connection',
        'Zoom Webinar - 500 people',
        'Up-Sell on Check-Out',
        'User Addition',
      ],
    },
    {
      id: 'ultimate',
      name: 'Ultimate',
      icon: <EmojiEvents sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      price: '₹30,000/month',
      commission: 'Zero Commissions (lowest Indian gateway charge: 1.5%)*',
      featured: false,
      features: [
        'Everything in Advanced +',
        'Level-Up',
        'Habit tracker',
        'Challenges',
        'Task to-dos',
        'Achievements',
        'Certifications',
        'Link-Up',
      ],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <Box>
      <Navbar>
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
              <Typography variant="h5" sx={{ color: '#667eea', fontWeight: 'bold' }}>
                C
              </Typography>
            )}
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#667eea', 
                fontWeight: 'bold',
              }}
            >
              Creator
            </Typography>
          </LogoContainer>

          <NavLinks>
            <NavLink
              onClick={() => navigate('/')}
              whileHover={{ y: -2 }}
            >
              Home
            </NavLink>
            <NavLink
              onClick={() => navigate('/')}
              whileHover={{ y: -2 }}
            >
              Features
            </NavLink>
            <NavLink
              onClick={() => navigate('/pricing')}
              whileHover={{ y: -2 }}
              style={{ color: '#667eea', fontWeight: 700 }}
            >
              Pricing
            </NavLink>
            <LoginButton
              onClick={() => navigate('/login')}
              whileHover={{ 
                scale: 1.05,
                y: -2,
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Login</span>
            </LoginButton>
          </NavLinks>
        </NavContainer>
      </Navbar>

      <PageContainer>
      <SectionContainer>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <SectionTitle
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            Choose Your Setup
          </SectionTitle>
        </motion.div>

        <ToggleContainer>
          <ToggleButton
            active={setupType === 'FREEDOM'}
            onClick={() => setSetupType('FREEDOM')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            FREEDOM
          </ToggleButton>
          <ToggleButton
            active={setupType === 'ENTERPRISE'}
            onClick={() => setSetupType('ENTERPRISE')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ENTERPRISE
          </ToggleButton>
        </ToggleContainer>

        <SetupCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.02 }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            {setupType === 'FREEDOM' ? 'Freedom Setup (DIY)' : 'Enterprise Setup'}
          </Typography>
          <PriceText>
            {setupType === 'FREEDOM' ? '₹24,999 + GST/ year' : 'Contact Sales'}
          </PriceText>
          <Typography sx={{ color: '#666', mb: 3, fontSize: '1.1rem' }}>
            {setupType === 'FREEDOM' 
              ? 'to unlock your own branding (custom domain).'
              : 'Custom enterprise solutions tailored to your needs.'}
          </Typography>
          <CTAButton
            color="#667eea"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {setupType === 'FREEDOM' ? 'Buy Now' : 'Contact Sales'}
          </CTAButton>
        </SetupCard>
      </SectionContainer>

      <SectionContainer ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <SectionTitle
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            Platform Charges
          </SectionTitle>
          <Typography
            sx={{
              fontSize: '1.2rem',
              textAlign: 'center',
              color: '#666',
              marginBottom: '3rem',
              maxWidth: '800px',
              margin: '0 auto 3rem',
            }}
          >
            Mandatory selection of one among 4 plans to use the Creator platform
          </Typography>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <Grid container spacing={4}>
            {plans.map((plan, index) => (
              <Grid item xs={12} sm={6} lg={3} key={plan.id}>
                <motion.div variants={itemVariants}>
                  <PlanCard
                    color={plan.color}
                    featured={plan.featured}
                    whileHover={{ 
                      rotateY: plan.featured ? 0 : 5,
                      rotateX: plan.featured ? 0 : 5,
                    }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {plan.featured && (
                      <Chip
                        label="POPULAR"
                        sx={{
                          position: 'absolute',
                          top: 20,
                          right: 20,
                          background: `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)`,
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      />
                    )}
                    <PlanHeader>
                      <PlanIcon color={plan.color}>
                        {plan.icon}
                      </PlanIcon>
                      <PlanTitle>{plan.name}</PlanTitle>
                      <PlanPrice>{plan.price}</PlanPrice>
                      <CommissionText>{plan.commission}</CommissionText>
                    </PlanHeader>
                    <FeatureList>
                      {plan.features.map((feature, idx) => (
                        <FeatureItem
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={isInView ? { opacity: 1, x: 0 } : {}}
                          transition={{ delay: index * 0.1 + idx * 0.05 }}
                        >
                          <CheckCircle sx={{ color: plan.color, fontSize: 20, flexShrink: 0, mt: 0.25 }} />
                          <Typography sx={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                            {feature}
                          </Typography>
                        </FeatureItem>
                      ))}
                    </FeatureList>
                    <CTAButton
                      color={plan.color}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Get Started
                    </CTAButton>
                  </PlanCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </SectionContainer>

      <SectionContainer>
        <PromoBanner
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography
                sx={{
                  fontSize: '4rem',
                  fontWeight: 900,
                  mb: 2,
                  background: 'linear-gradient(135deg, #ffffff, #f0f0f0)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                SPECIAL OFFER
              </Typography>
              <Typography sx={{ fontSize: '1.5rem', mb: 2, color: 'rgba(255, 255, 255, 0.9)' }}>
                Limited Time Deal - Act Fast!
              </Typography>
              <Typography sx={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
                Early Access Opportunity - Limited Seats Available!
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
              <CTAButton
                color="#ff6b35"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
                  padding: '1.2rem 3rem',
                  fontSize: '1.2rem',
                }}
              >
                CHECK OFFERS!
              </CTAButton>
            </Grid>
          </Grid>
        </PromoBanner>
      </SectionContainer>
      </PageContainer>
    </Box>
  );
};

