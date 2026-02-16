import { Box, Typography, Container, styled, keyframes } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
`;

const gradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const HeroContainer = styled(Box)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-size: 400% 400%;
  animation: ${gradient} 15s ease infinite;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
    pointer-events: none;
    animation: ${pulse} 4s ease-in-out infinite;
  }
`;

const Particle = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  pointer-events: none;
`;

const FloatingShape = styled(motion.div)`
  position: absolute;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  animation: ${float} 6s ease-in-out infinite;
`;

const ContentContainer = styled(Container)`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 8rem 2rem 4rem;
  position: relative;
  z-index: 1;
`;

const MainHeading = styled(motion.h1)`
  font-size: 5rem;
  font-weight: 900;
  color: white;
  margin-bottom: 1.5rem;
  line-height: 1.1;
  text-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 2.8rem;
  }
`;

const SubHeading = styled(motion.p)`
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 3rem;
  max-width: 800px;
  line-height: 1.7;
  font-weight: 400;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 2rem;
  }
`;

const CTAButton = styled(motion.button)`
  padding: 1.2rem 3.5rem;
  font-size: 1.2rem;
  font-weight: 700;
  border-radius: 50px;
  border: none;
  background: white;
  color: #667eea;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  cursor: pointer;
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

const StatsContainer = styled(Box)`
  display: flex;
  gap: 5rem;
  margin-top: 5rem;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 768px) {
    gap: 2.5rem;
    margin-top: 3rem;
  }
`;

const StatItem = styled(motion.div)`
  text-align: center;
  position: relative;
`;

const StatNumber = styled(motion.div)`
  font-size: 3.5rem;
  font-weight: 900;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const StatLabel = styled(Typography)`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const CreatorAvatars = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4rem;
  gap: -1rem;
  flex-wrap: wrap;
  position: relative;
`;

const Avatar = styled(motion.div)`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 4px solid white;
  background: linear-gradient(135deg, #FF6B6B, #FF8E53, #FFD93D);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.4rem;
  margin-left: -15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  cursor: pointer;

  &:first-child {
    margin-left: 0;
  }
`;

const AnimatedCounter = ({ value }: { value: string }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const animateValue = () => {
      // Extract number and suffix/prefix
      const match = value.match(/([₹$]?)(\d+)([KMB]?[Cr]?\+?)/);
      if (!match) {
        setDisplayValue(value);
        return;
      }

      const prefix = match[1] || '';
      const num = parseInt(match[2]);
      const suffix = match[3] || '';

      let multiplier = 1;
      if (suffix.includes('K')) multiplier = 1000;
      else if (suffix.includes('M')) multiplier = 1000000;
      else if (suffix.includes('Cr')) multiplier = 10000000;

      const targetValue = num * multiplier;
      const duration = 2000;
      const steps = 60;
      const increment = targetValue / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= targetValue) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          const displayNum = Math.floor(current);
          let formatted = '';
          if (suffix.includes('Cr')) {
            formatted = `${prefix}${(displayNum / 10000000).toFixed(0)}Cr${suffix.includes('+') ? '+' : ''}`;
          } else if (suffix.includes('M')) {
            formatted = `${prefix}${(displayNum / 1000000).toFixed(0)}M${suffix.includes('+') ? '+' : ''}`;
          } else if (suffix.includes('K')) {
            formatted = `${prefix}${(displayNum / 1000).toFixed(0)}K${suffix.includes('+') ? '+' : ''}`;
          } else {
            formatted = `${prefix}${displayNum.toLocaleString()}${suffix}`;
          }
          setDisplayValue(formatted);
        }
      }, duration / steps);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateValue();
        }
      },
      { threshold: 0.5 }
    );

    const node = ref.current;
    if (node) {
      observer.observe(node);
    }

    return () => {
      if (node) {
        observer.unobserve(node);
      }
    };
  }, [value, hasAnimated]);

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
    >
      <StatNumber>{displayValue}</StatNumber>
    </motion.div>
  );
};

export const HeroSection = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const stats = [
    { number: '5000+', label: 'Active Educators', suffix: '+' },
    { number: '₹500Cr+', label: 'Annual Revenue', suffix: '+' },
    { number: '5M+', label: 'Learners Enrolled', suffix: '+' },
  ];

  const avatars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];

  // Generate particles
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 3 + 2,
  }));

  // Generate floating shapes
  const shapes = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    width: Math.random() * 200 + 100,
    height: Math.random() * 200 + 100,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
  }));

  return (
    <HeroContainer>
      {/* Animated Particles */}
      {particles.map((particle) => (
        <Particle
          key={particle.id}
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Floating Shapes */}
      {shapes.map((shape) => (
        <FloatingShape
          key={shape.id}
          style={{
            width: shape.width,
            height: shape.height,
            left: `${shape.x}%`,
            top: `${shape.y}%`,
          }}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10 + shape.delay,
            repeat: Infinity,
            ease: 'linear',
            delay: shape.delay,
          }}
        />
      ))}

      <motion.div style={{ y, opacity }}>
        <ContentContainer>
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <MainHeading
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              Transform Your Expertise Into a Thriving Digital Business
            </MainHeading>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <SubHeading>
              Build, teach, and monetize your knowledge with powerful tools for online courses, live sessions, community building, and interactive learning experiences - all with complete brand control.
            </SubHeading>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <CTAButton
              onClick={() => navigate('/login')}
              whileHover={{ 
                boxShadow: '0 15px 50px rgba(0, 0, 0, 0.4)',
                y: -5,
              }}
            >
              <span>Get Started for FREE</span>
            </CTAButton>
          </motion.div>

          <StatsContainer>
            {stats.map((stat, index) => (
              <StatItem
                key={stat.label}
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.7 + index * 0.2 }}
                whileHover={{ scale: 1.15, y: -8 }}
              >
                <AnimatedCounter value={stat.number} />
                <StatLabel>{stat.label}</StatLabel>
              </StatItem>
            ))}
          </StatsContainer>

          <CreatorAvatars>
            {avatars.slice(0, 15).map((letter, index) => (
              <Avatar
                key={index}
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 1.2 + index * 0.05,
                  type: 'spring',
                  stiffness: 200,
                }}
                whileHover={{ 
                  scale: 1.3, 
                  zIndex: 100,
                  rotate: 360,
                  transition: { duration: 0.5 }
                }}
                whileTap={{ scale: 0.9 }}
              >
                {letter}
              </Avatar>
            ))}
          </CreatorAvatars>
        </ContentContainer>
      </motion.div>
    </HeroContainer>
  );
};
