# Quiz API Endpoints

## Overview
This document describes the backend API endpoints for quiz operations, including getting quiz questions, starting attempts, submitting answers, and retrieving results.

## Base URL
All quiz endpoints are prefixed with `/api/quiz`

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Get Quiz Questions
Get quiz questions for a specific lesson (without correct answers).

**Endpoint:** `GET /api/quiz/:courseId/:lessonId/questions`

**Parameters:**
- `courseId` (path): Course ID or MongoDB ObjectId
- `lessonId` (path): Lesson ID or MongoDB ObjectId

**Response:**
```json
{
  "success": true,
  "data": {
    "courseId": "507f1f77bcf86cd799439011",
    "courseName": "Introduction to React",
    "lessonId": "507f1f77bcf86cd799439012",
    "lessonTitle": "React Basics Quiz",
    "questions": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "question": "What is React?",
        "type": "multiple-choice",
        "options": ["A library", "A framework", "A language"],
        "points": 10
      }
    ],
    "metadata": {
      "timeLimit": 30,
      "passingScore": 70,
      "totalQuestions": 5,
      "totalPoints": 50
    },
    "previousAttempts": [
      {
        "attemptNumber": 1,
        "score": 80,
        "passed": true,
        "submittedAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

### 2. Start Quiz Attempt
Start a new quiz attempt for a user.

**Endpoint:** `POST /api/quiz/:courseId/:lessonId/start`

**Parameters:**
- `courseId` (path): Course ID or MongoDB ObjectId
- `lessonId` (path): Lesson ID or MongoDB ObjectId

**Response:**
```json
{
  "success": true,
  "data": {
    "submissionId": "507f1f77bcf86cd799439014",
    "attemptNumber": 1,
    "startedAt": "2024-01-15T10:30:00Z",
    "timeLimit": 30
  }
}
```

---

### 3. Submit Quiz
Submit quiz answers and automatically grade the quiz.

**Endpoint:** `POST /api/quiz/:submissionId/submit`

**Parameters:**
- `submissionId` (path): Quiz submission ID

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": "507f1f77bcf86cd799439013",
      "answer": "A library"
    },
    {
      "questionId": "507f1f77bcf86cd799439015",
      "answer": ["Option 1", "Option 2"]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "submissionId": "507f1f77bcf86cd799439014",
    "totalPoints": 40,
    "maxPoints": 50,
    "score": 80,
    "passingScore": 70,
    "passed": true,
    "timeSpent": 1200,
    "submittedAt": "2024-01-15T10:50:00Z",
    "results": [
      {
        "questionId": "507f1f77bcf86cd799439013",
        "question": "What is React?",
        "correctAnswer": "A library",
        "userAnswer": "A library",
        "isCorrect": true,
        "pointsEarned": 10,
        "pointsPossible": 10,
        "explanation": "React is a JavaScript library for building user interfaces."
      }
    ]
  }
}
```

---

### 4. Get Quiz Results
Get detailed results for a specific quiz submission.

**Endpoint:** `GET /api/quiz/:submissionId/results`

**Parameters:**
- `submissionId` (path): Quiz submission ID

**Response:**
```json
{
  "success": true,
  "data": {
    "submissionId": "507f1f77bcf86cd799439014",
    "courseId": "507f1f77bcf86cd799439011",
    "courseName": "Introduction to React",
    "lessonId": "507f1f77bcf86cd799439012",
    "lessonTitle": "React Basics Quiz",
    "totalPoints": 40,
    "maxPoints": 50,
    "score": 80,
    "passingScore": 70,
    "passed": true,
    "attemptNumber": 1,
    "timeSpent": 1200,
    "submittedAt": "2024-01-15T10:50:00Z",
    "results": [
      {
        "questionId": "507f1f77bcf86cd799439013",
        "question": "What is React?",
        "type": "multiple-choice",
        "options": ["A library", "A framework", "A language"],
        "userAnswer": "A library",
        "correctAnswer": "A library",
        "isCorrect": true,
        "pointsEarned": 10,
        "pointsPossible": 10,
        "explanation": "React is a JavaScript library for building user interfaces."
      }
    ]
  }
}
```

---

### 5. Get All Quiz Attempts
Get all quiz attempts for a user in a specific lesson.

**Endpoint:** `GET /api/quiz/:courseId/:lessonId/attempts`

**Parameters:**
- `courseId` (path): Course ID or MongoDB ObjectId
- `lessonId` (path): Lesson ID or MongoDB ObjectId

**Response:**
```json
{
  "success": true,
  "data": {
    "lessonId": "507f1f77bcf86cd799439012",
    "lessonTitle": "React Basics Quiz",
    "attempts": [
      {
        "submissionId": "507f1f77bcf86cd799439014",
        "attemptNumber": 1,
        "score": 80,
        "totalPoints": 40,
        "maxPoints": 50,
        "passed": true,
        "status": "graded",
        "submittedAt": "2024-01-15T10:50:00Z",
        "timeSpent": 1200
      }
    ]
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "No token, authorization denied"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Course not found"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Answers array is required",
  "error": "Answers array is required"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to submit quiz",
  "error": "Error message details"
}
```

---

## Quiz Question Validation

When saving courses with quiz lessons, the following validation rules apply:

1. **Question Text:** Required, must be a non-empty string
2. **Question Type:** Must be one of: `multiple-choice`, `true-false`, `text`
3. **Options:** 
   - Required for `multiple-choice` questions
   - Must have at least 2 options
   - Each option must be a non-empty string
4. **Correct Answer:**
   - Required for all question types
   - For `multiple-choice`: Must be a string or array of strings that exist in the options
   - For `true-false`: Must be `true` or `false`
   - For `text`: Must be a string or number
5. **Points:** Optional, defaults to 10, must be a non-negative number

---

## Quiz Grading Logic

### Multiple Choice (Single Answer)
- User answer is compared directly to the correct answer
- Points awarded if they match exactly

### Multiple Choice (Multiple Answers)
- User answers are sorted and compared to sorted correct answers
- Points awarded only if all answers match exactly

### True/False
- User answer is compared directly to the correct answer
- Points awarded if they match

### Text
- User answer is converted to lowercase and trimmed
- Compared to lowercase, trimmed correct answer
- Points awarded if they match exactly

---

## Database Models

### QuizSubmission
Stored in `quizsubmissions` collection:
- `courseId`: Reference to Course
- `lessonId`: Reference to Lesson
- `userId`: Reference to User
- `answers`: Array of answer objects
- `totalPoints`: Points earned
- `maxPoints`: Maximum possible points
- `score`: Percentage score
- `passed`: Boolean indicating if passing score was met
- `attemptNumber`: Sequential attempt number
- `status`: `in_progress`, `submitted`, `graded`, `expired`
- `startedAt`, `submittedAt`: Timestamps
- `timeSpent`: Time in seconds

---

## Example Usage Flow

1. **Get Quiz Questions:**
   ```
   GET /api/quiz/507f1f77bcf86cd799439011/507f1f77bcf86cd799439012/questions
   ```

2. **Start Quiz Attempt:**
   ```
   POST /api/quiz/507f1f77bcf86cd799439011/507f1f77bcf86cd799439012/start
   ```

3. **Submit Quiz:**
   ```
   POST /api/quiz/507f1f77bcf86cd799439014/submit
   Body: { "answers": [...] }
   ```

4. **View Results:**
   ```
   GET /api/quiz/507f1f77bcf86cd799439014/results
   ```

5. **View All Attempts:**
   ```
   GET /api/quiz/507f1f77bcf86cd799439011/507f1f77bcf86cd799439012/attempts
   ```

