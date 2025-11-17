import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Button,
  Box,
  LinearProgress,
  styled,
} from '@mui/material';
import { motion } from 'framer-motion';

interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer?: string;
}

interface Assessment {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'completed';
  questions: Question[];
}

interface AssessmentProps {
  assessment: Assessment;
  onSubmit: (answers: Record<string, string>) => void;
}

const StyledCard = styled(Card)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
`;

const QuestionContainer = styled(Box)`
  margin: 2rem 0;
`;

const StyledRadioGroup = styled(RadioGroup)`
  margin-top: 1rem;
`;

const ProgressBar = styled(LinearProgress)`
  height: 8px;
  border-radius: 4px;
  margin: 2rem 0;
`;

export const Assessment = ({ assessment, onSubmit }: AssessmentProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100;

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <FormControl component="fieldset">
            <StyledRadioGroup
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            >
              {question.options?.map((option) => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </StyledRadioGroup>
          </FormControl>
        );

      case 'true-false':
        return (
          <FormControl component="fieldset">
            <StyledRadioGroup
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            >
              <FormControlLabel value="true" control={<Radio />} label="True" />
              <FormControlLabel value="false" control={<Radio />} label="False" />
            </StyledRadioGroup>
          </FormControl>
        );

      case 'short-answer':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            variant="outlined"
          />
        );

      default:
        return null;
    }
  };

  return (
    <StyledCard>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {assessment.title}
        </Typography>

        <ProgressBar variant="determinate" value={progress} />

        <QuestionContainer>
          <Typography variant="h6" gutterBottom>
            Question {currentQuestionIndex + 1} of {assessment.questions.length}
          </Typography>
          <Typography variant="body1" gutterBottom>
            {currentQuestion.text}
          </Typography>
          {renderQuestion(currentQuestion)}
        </QuestionContainer>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="contained"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            component={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Previous
          </Button>

          {currentQuestionIndex === assessment.questions.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Submit
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Next
            </Button>
          )}
        </Box>
      </CardContent>
    </StyledCard>
  );
}; 