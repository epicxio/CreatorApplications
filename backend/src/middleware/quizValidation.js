/**
 * Validation middleware for quiz operations
 */

/**
 * Validate quiz questions structure
 * Used when saving/updating courses with quiz lessons
 */
const validateQuizQuestions = (questions) => {
  if (!Array.isArray(questions)) {
    return { valid: false, error: 'Questions must be an array' };
  }

  if (questions.length === 0) {
    return { valid: false, error: 'Quiz must have at least one question' };
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    
    // Validate question text
    if (!q.question || typeof q.question !== 'string' || q.question.trim() === '') {
      return { valid: false, error: `Question ${i + 1}: Question text is required` };
    }

    // Validate question type
    const validTypes = ['multiple-choice', 'true-false', 'text'];
    if (!q.type || !validTypes.includes(q.type)) {
      return { valid: false, error: `Question ${i + 1}: Invalid question type. Must be one of: ${validTypes.join(', ')}` };
    }

    // Validate options for multiple-choice questions
    if (q.type === 'multiple-choice') {
      if (!Array.isArray(q.options) || q.options.length < 2) {
        return { valid: false, error: `Question ${i + 1}: Multiple-choice questions must have at least 2 options` };
      }

      // Validate each option
      for (let j = 0; j < q.options.length; j++) {
        const option = q.options[j];
        if (typeof option !== 'string' || option.trim() === '') {
          return { valid: false, error: `Question ${i + 1}, Option ${j + 1}: Option text cannot be empty` };
        }
      }

      // Validate correct answer
      if (q.correctAnswer === undefined || q.correctAnswer === null) {
        return { valid: false, error: `Question ${i + 1}: Correct answer is required` };
      }

      // For multiple-choice, correctAnswer should be a string or array of strings
      if (Array.isArray(q.correctAnswer)) {
        // Multiple correct answers
        if (q.correctAnswer.length === 0) {
          return { valid: false, error: `Question ${i + 1}: At least one correct answer is required` };
        }
        // Validate that all correct answers exist in options
        for (const correctAns of q.correctAnswer) {
          if (!q.options.includes(correctAns)) {
            return { valid: false, error: `Question ${i + 1}: Correct answer "${correctAns}" is not in the options list` };
          }
        }
      } else {
        // Single correct answer
        if (typeof q.correctAnswer !== 'string') {
          return { valid: false, error: `Question ${i + 1}: Correct answer must be a string or array of strings` };
        }
        if (!q.options.includes(q.correctAnswer)) {
          return { valid: false, error: `Question ${i + 1}: Correct answer "${q.correctAnswer}" is not in the options list` };
        }
      }
    } else if (q.type === 'true-false') {
      // True-false questions
      if (q.correctAnswer !== true && q.correctAnswer !== false && q.correctAnswer !== 'true' && q.correctAnswer !== 'false') {
        return { valid: false, error: `Question ${i + 1}: True-false questions must have correctAnswer as true or false` };
      }
    } else if (q.type === 'text') {
      // Text questions
      if (!q.correctAnswer || (typeof q.correctAnswer !== 'string' && typeof q.correctAnswer !== 'number')) {
        return { valid: false, error: `Question ${i + 1}: Text questions must have a correct answer` };
      }
    }

    // Validate points (optional, defaults to 10)
    if (q.points !== undefined) {
      if (typeof q.points !== 'number' || q.points < 0) {
        return { valid: false, error: `Question ${i + 1}: Points must be a non-negative number` };
      }
    }
  }

  return { valid: true };
};

/**
 * Validate quiz submission answers
 */
const validateQuizSubmission = (answers, questions) => {
  if (!Array.isArray(answers)) {
    return { valid: false, error: 'Answers must be an array' };
  }

  if (answers.length !== questions.length) {
    return { valid: false, error: `Expected ${questions.length} answers, got ${answers.length}` };
  }

  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    const question = questions.find(q => q._id.toString() === answer.questionId);

    if (!question) {
      return { valid: false, error: `Answer ${i + 1}: Question not found` };
    }

    if (!answer.answer) {
      return { valid: false, error: `Answer ${i + 1}: Answer is required` };
    }

    // Validate answer format based on question type
    if (question.type === 'multiple-choice') {
      // Answer should be a string or array of strings
      if (typeof answer.answer !== 'string' && !Array.isArray(answer.answer)) {
        return { valid: false, error: `Answer ${i + 1}: Invalid answer format for multiple-choice question` };
      }
      if (Array.isArray(answer.answer)) {
        // Validate all answers are in options
        for (const ans of answer.answer) {
          if (!question.options.includes(ans)) {
            return { valid: false, error: `Answer ${i + 1}: Answer "${ans}" is not a valid option` };
          }
        }
      } else {
        // Single answer should be in options
        if (!question.options.includes(answer.answer)) {
          return { valid: false, error: `Answer ${i + 1}: Answer "${answer.answer}" is not a valid option` };
        }
      }
    } else if (question.type === 'true-false') {
      // Answer should be boolean or string 'true'/'false'
      if (answer.answer !== true && answer.answer !== false && 
          answer.answer !== 'true' && answer.answer !== 'false') {
        return { valid: false, error: `Answer ${i + 1}: True-false questions require true or false` };
      }
    }
    // Text questions can have any answer format
  }

  return { valid: true };
};

module.exports = {
  validateQuizQuestions,
  validateQuizSubmission
};

