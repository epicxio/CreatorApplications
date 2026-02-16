import React, { useRef, useState } from 'react';
import { Box, Typography, Container, styled, keyframes } from '@mui/material';
import { motion, useInView } from 'framer-motion';
import { ExpandMore, HelpOutline } from '@mui/icons-material';

const _pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const SectionContainer = styled(Container)`
  padding: 8rem 2rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%);
  position: relative;
  overflow: hidden;
`;

const SectionTitle = styled(motion.h2)`
  font-size: 3.5rem;
  font-weight: 900;
  text-align: center;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const StyledAccordion = styled(motion.div)`
  border-radius: 16px !important;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  background: white;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    border-color: #667eea;
    box-shadow: 0 8px 30px rgba(102, 126, 234, 0.15);
    transform: translateX(10px);
  }
`;

const AccordionHeader = styled(Box)`
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  background: white;
  transition: background 0.3s;
  
  &:hover {
    background: linear-gradient(90deg, rgba(102, 126, 234, 0.05), transparent);
  }
`;

const QuestionText = styled(Typography)`
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const AnswerText = styled(motion.div)`
  font-size: 1rem;
  color: #666;
  line-height: 1.8;
  padding: 0 2rem 2rem;
`;

const ExpandIcon = styled(motion.div)`
  color: #667eea;
  transition: transform 0.3s;
`;

export const FAQSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [expanded, setExpanded] = useState<number | false>(false);

  const faqs = [
    {
      question: 'How do I get started as an educator?',
      answer: 'Getting started is simple! Sign up for a free account, complete your profile, and you can immediately begin creating your first course or workshop. Our step-by-step guides and support team are here to help you every step of the way.',
    },
    {
      question: 'What are the pricing options available?',
      answer: 'We offer flexible pricing plans to suit educators at every stage. Start with our free tier to test the platform, then choose from our affordable monthly plans that scale with your business. All plans include essential features, with premium options for advanced needs.',
    },
    {
      question: 'Do I need a large following to be successful?',
      answer: 'Not at all! Our platform is designed to help educators at any stage. Whether you have 100 followers or 100,000, you can build a successful educational business. Quality content and engagement matter more than follower count.',
    },
    {
      question: 'Can I use my own branding?',
      answer: 'Absolutely! We believe your brand is important. Our platform allows you to customize your profile, course pages, and even use your own domain name. Make it truly yours with complete brand control.',
    },
    {
      question: 'How do I get paid?',
      answer: 'We offer multiple payment options and support various payment gateways. You can set your own pricing, and payments are processed securely. We provide transparent reporting so you always know your earnings.',
    },
    {
      question: 'What kind of support do you provide?',
      answer: 'Our support team is available 24/7 to help with any questions or issues. We also provide extensive documentation, video tutorials, and a community forum where educators share tips and best practices.',
    },
  ];

  const handleChange = (panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
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
          Frequently Asked Questions
        </SectionTitle>
        <Typography
          sx={{
            fontSize: '1.3rem',
            textAlign: 'center',
            color: '#666',
            marginBottom: '4rem',
            maxWidth: '700px',
            margin: '0 auto 4rem',
          }}
        >
          Everything you need to know about getting started and growing your educational business
        </Typography>
      </motion.div>

      <Box sx={{ maxWidth: 900, margin: '0 auto', mt: 4 }}>
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ 
              duration: 0.6, 
              delay: index * 0.1,
              type: 'spring',
              stiffness: 100,
            }}
            whileHover={{ x: 5 }}
          >
            <StyledAccordion
              whileHover={{ scale: 1.01 }}
            >
              <AccordionHeader onClick={(e) => handleChange(index)(e, expanded !== index)}>
                <QuestionText>
                  <HelpOutline sx={{ color: '#667eea', fontSize: 28 }} />
                  {faq.question}
                </QuestionText>
                <ExpandIcon
                  animate={{ rotate: expanded === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ExpandMore sx={{ fontSize: 32 }} />
                </ExpandIcon>
              </AccordionHeader>
              {expanded === index && (
                <AnswerText
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {faq.answer}
                </AnswerText>
              )}
            </StyledAccordion>
          </motion.div>
        ))}
      </Box>
    </SectionContainer>
  );
};
