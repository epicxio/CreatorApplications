import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Switch,
  TextField,
  Button,
  Paper,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  MonetizationOn as MonetizationOnIcon,
  QuestionAnswer as QuestionAnswerIcon,
  WaterDrop as WaterDropIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

/** Payload returned by getAdditionalDetails for draft save / Save Additional Settings */
export interface AdditionalDetailsPayload {
  faqs: Array<{ question: string; answer: string }>;
  affiliateActive: boolean;
  affiliateRewardPercentage: number;
  watermarkRemovalEnabled: boolean;
}

export interface AdditionalDetailsStepRef {
  getAdditionalDetails: () => AdditionalDetailsPayload;
}

export interface AdditionalDetailsInitialData {
  faqs?: Array<{ question: string; answer: string }>;
  affiliateRewardEnabled?: boolean;
  affiliateRewardPercentage?: string;
  watermarkRemovalEnabled?: boolean;
}

interface AdditionalDetailsStepProps {
  lastSaved?: Date | null;
  initialData?: AdditionalDetailsInitialData | null;
  additionalDetailsRef?: React.RefObject<AdditionalDetailsStepRef | null>;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

const AdditionalDetailsStep: React.FC<AdditionalDetailsStepProps> = React.memo(({ lastSaved: _lastSaved, initialData, additionalDetailsRef }) => {
  // Affiliate Reward State
  const [affiliateRewardEnabled, setAffiliateRewardEnabled] = React.useState(false);
  const [affiliateRewardPercentage, setAffiliateRewardPercentage] = React.useState('10');

  // Watermark Removal State
  const [watermarkRemovalEnabled, setWatermarkRemovalEnabled] = React.useState(false);

  // FAQ State (local ids for list keys; payload strips to question/answer only)
  const [faqs, setFaqs] = React.useState<FAQ[]>([
    { id: 1, question: '', answer: '' }
  ]);

  // Hydrate from parent when loading existing course (avoid overwriting user's toggle with stale false after save)
  React.useEffect(() => {
    if (!initialData) return;
    if (initialData.affiliateRewardEnabled !== undefined) {
      setAffiliateRewardEnabled((prev) => {
        if (initialData!.affiliateRewardEnabled === true) return true;
        if (initialData!.affiliateRewardEnabled === false && prev === true) return prev;
        return !!initialData!.affiliateRewardEnabled;
      });
    }
    if (initialData.affiliateRewardPercentage !== undefined && initialData.affiliateRewardPercentage !== '') {
      setAffiliateRewardPercentage(String(initialData.affiliateRewardPercentage));
    }
    if (initialData.watermarkRemovalEnabled !== undefined) {
      setWatermarkRemovalEnabled(initialData.watermarkRemovalEnabled);
    }
    if (initialData.faqs && Array.isArray(initialData.faqs)) {
      if (initialData.faqs.length === 0) {
        setFaqs([{ id: 1, question: '', answer: '' }]);
      } else {
        setFaqs(initialData.faqs.map((item, index) => ({
          id: index + 1,
          question: item.question || '',
          answer: item.answer || ''
        })));
      }
    }
  }, [initialData]);

  const handleAddFAQ = () => {
    if (faqs.length < 10) {
      const newId = Math.max(...faqs.map(faq => faq.id), 0) + 1;
      setFaqs([...faqs, { id: newId, question: '', answer: '' }]);
    }
  };

  const handleRemoveFAQ = (id: number) => {
    if (faqs.length > 1) {
      setFaqs(faqs.filter(faq => faq.id !== id));
    }
  };

  const handleFAQChange = (id: number, field: 'question' | 'answer', value: string) => {
    setFaqs(faqs.map(faq => 
      faq.id === id ? { ...faq, [field]: value } : faq
    ));
  };

  const getAdditionalDetails = React.useCallback((): AdditionalDetailsPayload => {
    const pct = Math.max(0, Math.min(100, parseFloat(affiliateRewardPercentage) || 0));
    const faqsPayload = faqs
      .filter(f => (f.question || '').trim() !== '' && (f.answer || '').trim() !== '')
      .map(f => ({ question: f.question.trim(), answer: f.answer.trim() }));
    return {
      faqs: faqsPayload,
      affiliateActive: affiliateRewardEnabled,
      affiliateRewardPercentage: pct,
      watermarkRemovalEnabled
    };
  }, [faqs, affiliateRewardEnabled, affiliateRewardPercentage, watermarkRemovalEnabled]);

  React.useImperativeHandle(additionalDetailsRef, () => ({
    getAdditionalDetails
  }), [getAdditionalDetails]);

  return (
    <Box sx={{ 
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ flexShrink: 0 }}
      >
        <Box sx={{
          background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
          borderRadius: 4,
          p: 4,
          mb: 4,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%'
          }} />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h3" fontWeight={800} color="white" gutterBottom>
                Additional Details
              </Typography>
              <Typography variant="h6" color="rgba(255,255,255,0.8)" sx={{ mb: 2 }}>
                Configure affiliate rewards, FAQs, and content settings
              </Typography>
              <Chip
                icon={<AddIcon />}
                label="Course Setup"
                sx={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)'
                }}
              />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <AddIcon sx={{ fontSize: 80, color: 'white', opacity: 0.8 }} />
              </motion.div>
            </Box>
          </Stack>
        </Box>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{ 
          flex: 1,
          overflow: 'auto',
          overflowX: 'hidden'
        }}
      >
        <Card sx={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(76, 175, 80, 0.1)',
          border: '1px solid rgba(76, 175, 80, 0.1)',
          mb: 4,
          height: '100%'
        }}>
          <CardContent sx={{ p: 4, height: '100%' }}>
            <Stack spacing={3}>
              
              {/* Affiliate Reward Section */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      <MonetizationOnIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#4CAF50' }} />
                      Affiliate Reward
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Affiliate reward is the amount a person receives when a subscription is purchased from an affiliate link.
                    </Typography>
                  </Box>
                  <Switch
                    checked={affiliateRewardEnabled}
                    onChange={(e) => setAffiliateRewardEnabled(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#4CAF50',
                        '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.08)' }
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#4CAF50'
                      }
                    }}
                  />
                </Stack>

                {affiliateRewardEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.5 }}
                  >
                    <TextField
                      label="Affiliate Reward Percentage"
                      type="number"
                      placeholder="10"
                      value={affiliateRewardPercentage}
                      onChange={(e) => setAffiliateRewardPercentage(e.target.value)}
                      fullWidth
                      InputProps={{
                        endAdornment: <Typography sx={{ ml: 1 }}>%</Typography>
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' }
                        }
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Affiliates will receive {affiliateRewardPercentage}% of each successful referral.
                    </Typography>
                  </motion.div>
                )}
              </Paper>

              {/* Watermark Removal Section */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      <WaterDropIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#FF9800' }} />
                      Remove Watermark
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Remove application logo watermark from all documents and videos uploaded while creating curriculum.
                    </Typography>
                  </Box>
                  <Switch
                    checked={watermarkRemovalEnabled}
                    onChange={(e) => setWatermarkRemovalEnabled(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#FF9800',
                        '&:hover': { backgroundColor: 'rgba(255, 152, 0, 0.08)' }
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#FF9800'
                      }
                    }}
                  />
                </Stack>

                {watermarkRemovalEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.5 }}
                  >
                    <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255, 152, 0, 0.05)', border: '1px solid rgba(255, 152, 0, 0.1)' }}>
                      <Typography variant="body2" color="text.secondary">
                        ⚠️ <strong>Note:</strong> When watermark is enabled, user details accessing the video are displayed. 
                        Disabling it will impact our ability to trace and monitor content usage. 
                        The watermark serves as a protective measure against unauthorized use.
                      </Typography>
                    </Paper>
                  </motion.div>
                )}
              </Paper>

              {/* FAQ Section */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      <QuestionAnswerIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#2196F3' }} />
                      Frequently Asked Questions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Add up to 10 FAQs to help your students understand your course better.
                    </Typography>
                  </Box>
                  <Chip
                    label={`${faqs.length}/10 FAQs`}
                    color="primary"
                    variant="outlined"
                  />
                </Stack>

                <Stack spacing={2}>
                  {faqs.map((faq, index) => (
                    <Accordion key={faq.id} sx={{ border: '1px solid rgba(33, 150, 243, 0.1)' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            Question {index + 1}
                          </Typography>
                          {faqs.length > 1 && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFAQ(faq.id);
                              }}
                              sx={{ color: 'error.main' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={2}>
                          <TextField
                            label="Question"
                            placeholder="Please write your question here"
                            value={faq.question}
                            onChange={(e) => handleFAQChange(faq.id, 'question', e.target.value)}
                            fullWidth
                            multiline
                            rows={2}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2196F3' }
                              }
                            }}
                          />
                          <TextField
                            label="Answer"
                            placeholder="Please write your answer here"
                            value={faq.answer}
                            onChange={(e) => handleFAQChange(faq.id, 'answer', e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2196F3' }
                              }
                            }}
                          />
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  ))}

                  {faqs.length < 10 && (
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleAddFAQ}
                      sx={{
                        borderColor: '#2196F3',
                        color: '#2196F3',
                        '&:hover': {
                          borderColor: '#1976D2',
                          backgroundColor: 'rgba(33, 150, 243, 0.08)'
                        }
                      }}
                    >
                      Add FAQ
                    </Button>
                  )}
                </Stack>
              </Paper>

            </Stack>
          </CardContent>
        </Card>
      </motion.div>

    </Box>
  );
});

export default AdditionalDetailsStep; 