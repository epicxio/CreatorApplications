# Quiz Question Storage in MongoDB

## Overview
This document explains how quiz questions are stored in MongoDB Atlas when creating Quiz-type lessons.

## MongoDB Storage Details

### Collection Name
- **Collection:** `courses`
- **Database:** As configured in `MONGODB_URI` (typically `creatormarketplace`)

### Field Path for Quiz Questions
Quiz questions are stored within the lesson's content object:

```
Database: creatormarketplace
Collection: courses
Document Structure:
{
  _id: ObjectId("..."),
  courseId: "C-ADM-0001",
  name: "Course Name",
  modules: [
    {
      _id: ObjectId("..."),
      title: "Module Title",
      lessons: [
        {
          _id: ObjectId("..."),
          title: "Quiz Lesson Title",
          type: "Quiz",
          content: {
            questions: [                    ← QUIZ QUESTIONS ARRAY HERE
              {
                question: "What is a keyframe?",
                type: "multiple-choice",
                options: ["Option 1", "Option 2", "Option 3"],
                correctAnswer: "Option 2",  // or ["Option 2", "Option 3"] for multiple correct
                explanation: "Optional explanation text",
                points: 10
              }
            ],
            timeLimit: 30,        // Optional: in minutes
            passingScore: 70      // Optional: percentage
          }
        }
      ]
    }
  ]
}
```

## Field Structure

### Quiz Question Schema (Backend)
```javascript
{
  question: String,              // Required: The question text
  type: String,                  // Required: 'multiple-choice' | 'true-false' | 'text'
  options: [String],             // Array of option strings
  correctAnswer: Mixed,          // Required: String (single choice) or Array (multiple choice)
  explanation: String,           // Optional: Explanation for the answer
  points: Number                 // Default: 10
}
```

### Frontend to Backend Mapping

**Frontend Format (QuizQuestionEditor):**
```typescript
{
  id: string,
  question: string,
  type: 'single' | 'multiple',
  options: [
    {
      id: string,
      text: string,
      isCorrect: boolean
    }
  ]
}
```

**Backend Format (MongoDB):**
```javascript
{
  question: string,
  type: 'multiple-choice',  // 'single' → 'multiple-choice', 'multiple' → 'multiple-choice'
  options: [string],        // Array of option text strings
  correctAnswer: string | [string],  // Single answer or array of correct answers
  explanation: string,      // Optional
  points: number           // Default: 10
}
```

## Data Transformation Flow

### When Saving (Frontend → Backend)

**Location:** `frontend/src/components/learnloop/CourseBuilderPage.tsx`

**Mapping Logic:**
```typescript
if (lesson.type === 'Quiz' && lessonData.quizQuestions) {
  content.questions = lessonData.quizQuestions.map((q: any) => ({
    question: q.question,
    type: q.type === 'single' ? 'multiple-choice' : 
          q.type === 'multiple' ? 'multiple-choice' : 'text',
    options: q.options?.map((opt: any) => opt.text) || [],
    correctAnswer: q.type === 'single' 
      ? q.options?.find((opt: any) => opt.isCorrect)?.text || ''
      : q.options?.filter((opt: any) => opt.isCorrect).map((opt: any) => opt.text) || [],
    points: 10
  }));
}
```

**Transformation Steps:**
1. **Type Mapping:**
   - `'single'` → `'multiple-choice'`
   - `'multiple'` → `'multiple-choice'`
   - Other → `'text'`

2. **Options Mapping:**
   - `options: [{ id, text, isCorrect }]` → `options: [string]`
   - Extracts only the `text` property from each option

3. **Correct Answer Mapping:**
   - **Single Choice:** Finds the option with `isCorrect: true` and uses its `text`
   - **Multiple Choice:** Filters all options with `isCorrect: true` and creates an array of their `text` values

### When Loading (Backend → Frontend)

**Location:** `frontend/src/components/learnloop/CourseBuilderPage.tsx`

**Mapping Logic:**
```typescript
quizQuestions: lesson.type === 'Quiz' && content.questions ? 
  content.questions.map((q: any, qIdx: number) => ({
    id: `q-${qIdx + 1}`,
    question: q.question || '',
    type: q.type === 'multiple-choice' ? 'single' : q.type,
    options: (q.options || []).map((opt: string, optIdx: number) => ({
      id: `opt-${optIdx + 1}`,
      text: opt,
      isCorrect: Array.isArray(q.correctAnswer) 
        ? q.correctAnswer.includes(opt)
        : q.correctAnswer === opt
    }))
  })) : undefined
```

**Transformation Steps:**
1. **Type Mapping:**
   - `'multiple-choice'` → `'single'` (default assumption)
   - Other types preserved

2. **Options Mapping:**
   - `options: [string]` → `options: [{ id, text, isCorrect }]`
   - Generates IDs for each option
   - Determines `isCorrect` by checking if option text matches `correctAnswer`

3. **Correct Answer Mapping:**
   - **String:** Checks if option text equals `correctAnswer`
   - **Array:** Checks if option text is included in `correctAnswer` array

## Example: Complete Flow

### 1. User Creates Quiz Question (Frontend)
```typescript
{
  id: "question-123",
  question: "What is React?",
  type: "single",
  options: [
    { id: "opt-1", text: "A library", isCorrect: true },
    { id: "opt-2", text: "A framework", isCorrect: false },
    { id: "opt-3", text: "A language", isCorrect: false }
  ]
}
```

### 2. Saved to MongoDB (Backend)
```javascript
{
  question: "What is React?",
  type: "multiple-choice",
  options: ["A library", "A framework", "A language"],
  correctAnswer: "A library",
  points: 10
}
```

### 3. Loaded Back (Frontend)
```typescript
{
  id: "q-1",
  question: "What is React?",
  type: "single",
  options: [
    { id: "opt-1", text: "A library", isCorrect: true },
    { id: "opt-2", text: "A framework", isCorrect: false },
    { id: "opt-3", text: "A language", isCorrect: false }
  ]
}
```

## Verification

### Check Quiz Questions in MongoDB Atlas

1. **Using MongoDB Atlas Dashboard:**
   - Navigate to your cluster
   - Browse Collections → `creatormarketplace` → `courses`
   - Find a course with Quiz lessons
   - Navigate to: `modules[].lessons[]` where `type: "Quiz"`
   - Check `content.questions[]` array

2. **Using Verification Script:**
   ```bash
   cd backend
   node scripts/verifyQuizStorage.js
   ```

### Expected MongoDB Query
```javascript
db.courses.find({
  "modules.lessons.type": "Quiz",
  "modules.lessons.content.questions": { $exists: true, $ne: [] }
})
```

## Important Notes

1. **Quiz questions are stored in `lesson.content.questions`** - This is an array of question objects
2. **Options are stored as strings** - Not as objects with IDs
3. **Correct answer can be string or array** - String for single choice, array for multiple choice
4. **Points default to 10** - Can be customized per question
5. **Explanation is optional** - Can be added for each question

## Backend API Endpoints

Quiz questions are saved as part of the course when using:
- `POST /api/courses/draft` - Create new course with quiz
- `POST /api/courses/:id/draft` - Update existing course with quiz
- `PUT /api/courses/:id` - Update course (including quiz questions)

All quiz data is embedded within the course document in the `courses` collection.

