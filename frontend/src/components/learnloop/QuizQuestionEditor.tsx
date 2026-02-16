import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  Checkbox,
  IconButton,
  Card,
  CardContent,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple';
  options: QuizOption[];
}

interface QuizQuestionEditorProps {
  value: QuizQuestion[];
  onChange: (value: QuizQuestion[]) => void;
}

const QuizQuestionEditor: React.FC<QuizQuestionEditorProps> = ({ value: initialValue, onChange }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialValue || []);

  useEffect(() => {
    setQuestions(initialValue || []);
  }, [initialValue]);

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `question-${Date.now()}`,
      question: '',
      type: 'single',
      options: [
        { id: `option-${Date.now()}-1`, text: 'Option 1', isCorrect: false },
        { id: `option-${Date.now()}-2`, text: 'Option 2', isCorrect: true }
      ],
    };
    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
    onChange(updatedQuestions);
  };

  const removeQuestion = (questionId: string) => {
    const updatedQuestions = questions.filter(q => q.id !== questionId);
    setQuestions(updatedQuestions);
    onChange(updatedQuestions);
  };

  const updateQuestion = (questionId: string, updates: Partial<QuizQuestion>) => {
    const updatedQuestions = questions.map(q => 
      q.id === questionId ? { ...q, ...updates } : q
    );
    setQuestions(updatedQuestions);
    onChange(updatedQuestions);
  };

  const addOption = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const newOption: QuizOption = {
      id: `option-${Date.now()}`,
      text: `Option ${question.options.length + 1}`,
      isCorrect: false
    };

    const updatedOptions = [...question.options, newOption];
    updateQuestion(questionId, { options: updatedOptions });
  };

  const removeOption = (questionId: string, optionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question || question.options.length <= 2) return;

    const updatedOptions = question.options.filter(o => o.id !== optionId);
    updateQuestion(questionId, { options: updatedOptions });
  };

  const updateOption = (questionId: string, optionId: string, updates: Partial<QuizOption>) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const updatedOptions = question.options.map(o => 
      o.id === optionId ? { ...o, ...updates } : o
    );
    updateQuestion(questionId, { options: updatedOptions });
  };

  const toggleCorrectAnswer = (questionId: string, optionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const updatedOptions = question.options.map(o => ({
      ...o,
      isCorrect: question.type === 'single' 
        ? o.id === optionId 
        : o.id === optionId ? !o.isCorrect : o.isCorrect
    }));
    updateQuestion(questionId, { options: updatedOptions });
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Quiz Questions</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={addQuestion}
          sx={{ background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)' }}
        >
          Add Question
        </Button>
      </Stack>

      {questions.length === 0 && (
        <Card sx={{ p: 3, textAlign: 'center', background: '#f8f9ff' }}>
          <Typography color="text.secondary">
            No questions added yet. Click "Add Question" to get started.
          </Typography>
        </Card>
      )}

      {questions.map((question, questionIndex) => (
        <Accordion key={question.id} defaultExpanded sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
              <Chip 
                label={`Question ${questionIndex + 1}`} 
                color="primary" 
                size="small" 
              />
              <Typography variant="subtitle1" sx={{ flex: 1 }}>
                {question.question || 'Untitled Question'}
              </Typography>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  removeQuestion(question.id);
                }}
                size="small"
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              {/* Question Type */}
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  label="Question"
                  value={question.question}
                  onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                  fullWidth
                />
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={question.type}
                    onChange={(e) => updateQuestion(question.id, { type: e.target.value as 'single' | 'multiple' })}
                    label="Type"
                  >
                    <MenuItem value="single">Single Choice</MenuItem>
                    <MenuItem value="multiple">Multiple Choice</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              {/* Options */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Options
                </Typography>
                <Stack spacing={2}>
                  {question.options.map((option) => (
                    <Stack key={option.id} direction="row" spacing={2} alignItems="center">
                      {question.type === 'single' ? (
                        <Radio
                          checked={option.isCorrect}
                          onChange={() => toggleCorrectAnswer(question.id, option.id)}
                          color="primary"
                        />
                      ) : (
                        <Checkbox
                          checked={option.isCorrect}
                          onChange={() => toggleCorrectAnswer(question.id, option.id)}
                          color="primary"
                        />
                      )}
                      <TextField
                        value={option.text}
                        onChange={(e) => updateOption(question.id, option.id, { text: e.target.value })}
                        fullWidth
                        size="small"
                      />
                      <IconButton
                        onClick={() => removeOption(question.id, option.id)}
                        disabled={question.options.length <= 2}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  ))}
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => addOption(question.id)}
                    variant="outlined"
                    size="small"
                  >
                    Add Option
                  </Button>
                </Stack>
              </Box>

              {/* Instructions */}
              <Box sx={{ background: '#f0f4ff', borderRadius: 2, p: 2 }}>
                <Typography variant="body2" color="primary">
                  For <strong>Single Choice</strong>, select one correct answer using the radio button. 
                  For <strong>Multiple Choice</strong>, select all correct answers using the checkboxes. 
                  These selections will be used to automatically grade the quiz for learners.
                </Typography>
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Preview Section */}
      {questions.length > 0 && (
        <Card sx={{ mt: 3, background: '#fafbff' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Preview
            </Typography>
            <Stack spacing={3}>
              {questions.map((question, index) => (
                <Box key={question.id}>
                  <Typography variant="subtitle1" gutterBottom>
                    Question {index + 1}: {question.question}
                  </Typography>
                  <Stack spacing={1}>
                    {question.options.map((option) => (
                      <Stack key={option.id} direction="row" spacing={2} alignItems="center">
                        {question.type === 'single' ? (
                          <Radio disabled />
                        ) : (
                          <Checkbox disabled />
                        )}
                        <Typography variant="body2">
                          {option.text}
                          {option.isCorrect && (
                            <Chip 
                              label="Correct" 
                              size="small" 
                              color="success" 
                              sx={{ ml: 1 }} 
                            />
                          )}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default QuizQuestionEditor; 