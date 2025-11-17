# Curriculum Storage in MongoDB Atlas

## Overview

The Curriculum (Modules and Lessons) is stored as **embedded documents** within the Course document in MongoDB Atlas. This ensures that all curriculum data is always linked to the course via the `courseId`.

## Database Structure

### Collection
- **Collection Name**: `courses`
- **Database**: `creatormarketplace`

### Document Structure

```javascript
{
  _id: ObjectId("..."),
  courseId: "C-ADM-0001",  // Human-readable course ID
  name: "Course Name",
  instructor: ObjectId("..."),  // Reference to User
  
  // CURRICULUM (Embedded in Course Document)
  modules: [
    {
      _id: ObjectId("..."),  // Module ID
      title: "Module Title",
      description: "Module description",
      order: 1,
      isUnlocked: true,
      unlockDate: null,
      lessons: [
        {
          _id: ObjectId("..."),  // Lesson ID
          title: "Lesson Title",
          description: "Lesson description",
          type: "Video",  // Video, Text, Audio, Quiz, Assignment, Live
          duration: 30,  // in minutes
          order: 1,
          isUnlocked: true,
          unlockDate: null,
          content: {
            // Video content
            videoUrl: "...",
            thumbnailUrl: "...",
            transcript: "...",
            
            // Text content
            textContent: "...",
            
            // Audio content
            audioUrl: "...",
            waveformData: [...],
            
            // Quiz content
            questions: [...],
            timeLimit: 30,
            passingScore: 70,
            
            // Assignment content
            instructions: "...",
            submissionType: "both",
            maxFileSize: 10,
            allowedFileTypes: [".pdf", ".doc"],
            
            // Live content
            meetingLink: "...",
            meetingPlatform: "Google Meet",
            startDateTime: Date,
            endDateTime: Date,
            preClassMessage: "...",
            postClassMessage: "..."
          },
          resources: [
            {
              name: "Resource Name",
              type: "document",
              url: "...",
              size: 1024000
            }
          ]
        }
      ]
    }
  ],
  
  duration: 120,  // Total duration in minutes (calculated from lessons)
  
  // ... other course fields
}
```

## Key Points

### 1. Embedded Structure
- **Modules and Lessons are NOT in separate collections**
- They are **embedded arrays** within the Course document
- This ensures:
  - ✅ All curriculum data is always linked to the course
  - ✅ Easy to query and retrieve complete course structure
  - ✅ Atomic updates (all or nothing)
  - ✅ No orphaned modules/lessons

### 2. Course ID Reference
- Every course has a `courseId` (e.g., `C-ADM-0001`)
- This `courseId` is the **primary reference** for all curriculum data
- Query example:
  ```javascript
  Course.findOne({ courseId: "C-ADM-0001" })
  ```
- This returns the complete course with all modules and lessons

### 3. Module Structure
- Each module has:
  - `_id`: Unique MongoDB ObjectId
  - `title`: Required
  - `description`: Optional
  - `order`: Required (1, 2, 3, ...)
  - `lessons`: Array of lesson documents
  - `isUnlocked`: Boolean
  - `unlockDate`: Date (for drip content)

### 4. Lesson Structure
- Each lesson has:
  - `_id`: Unique MongoDB ObjectId
  - `title`: Required
  - `description`: Optional
  - `type`: Required (Video, Text, Audio, Quiz, Assignment, Live)
  - `duration`: Number (in minutes)
  - `order`: Required (1, 2, 3, ...)
  - `content`: Required object (varies by lesson type)
  - `resources`: Array of resource objects
  - `isUnlocked`: Boolean
  - `unlockDate`: Date

### 5. Content Field (Required)
The `content` field is **required** for all lessons. It should contain:
- For **Video**: `videoUrl`, `thumbnailUrl`, `transcript`
- For **Text**: `textContent`
- For **Audio**: `audioUrl`, `waveformData`
- For **Quiz**: `questions`, `timeLimit`, `passingScore`
- For **Assignment**: `instructions`, `submissionType`, `maxFileSize`, `allowedFileTypes`
- For **Live**: `meetingLink`, `meetingPlatform`, `startDateTime`, `endDateTime`, `preClassMessage`, `postClassMessage`

**Important**: Even if empty, the `content` field must be an object `{}` to satisfy the schema requirement.

## How to Query

### Get Course with Full Curriculum
```javascript
const course = await Course.findOne({ courseId: "C-ADM-0001" })
  .populate('instructor', 'name email avatar');
```

### Get Only Modules Count
```javascript
const course = await Course.findOne({ courseId: "C-ADM-0001" })
  .select('courseId name modules');
console.log(`Modules: ${course.modules.length}`);
```

### Get Specific Module
```javascript
const course = await Course.findOne({ courseId: "C-ADM-0001" });
const module = course.modules.find(m => m._id.toString() === moduleId);
```

### Get Specific Lesson
```javascript
const course = await Course.findOne({ courseId: "C-ADM-0001" });
const module = course.modules.find(m => m._id.toString() === moduleId);
const lesson = module.lessons.find(l => l._id.toString() === lessonId);
```

## Saving Curriculum

### Frontend to Backend Mapping

When saving from the frontend, the data is mapped as follows:

**Frontend Format:**
```typescript
{
  id: "module-123",
  title: "Module Title",
  lessons: [{
    id: "lesson-456",
    title: "Lesson Title",
    type: "Video",
    duration: 30,
    order: 1,
    content: {},
    resources: []
  }]
}
```

**Backend Format (saved to MongoDB):**
```javascript
{
  title: "Module Title",
  description: "",
  order: 1,
  lessons: [{
    title: "Lesson Title",
    description: "",
    type: "Video",
    duration: 30,
    order: 1,
    content: {},
    resources: [],
    isUnlocked: true
  }]
}
```

### Save Process

1. Frontend sends modules array in the request body
2. Backend controller (`saveDraft` or `updateCourse`) receives the data
3. Backend calculates total duration from all lessons
4. Backend saves/updates the course document with modules
5. MongoDB stores modules as embedded documents

## Verification

Use the verification script to check curriculum storage:

```bash
node backend/scripts/verifyCurriculumStorage.js
```

This script will:
- ✅ Show all courses with curriculum
- ✅ Display module and lesson details
- ✅ Verify courseId references
- ✅ Show statistics (total modules, lessons, etc.)

## Benefits of Embedded Structure

1. **Data Integrity**: All curriculum data is always linked to the course
2. **Performance**: Single query retrieves complete course structure
3. **Atomicity**: Updates to course and curriculum happen together
4. **Simplicity**: No need for joins or separate queries
5. **Reference**: `courseId` provides easy lookup

## Important Notes

- ⚠️ **Content field is required**: Even if empty, provide `{}`
- ⚠️ **Order fields are required**: Modules and lessons must have `order` values
- ⚠️ **Type validation**: Lesson type must be one of: Video, Text, Audio, Quiz, Assignment, Live
- ✅ **Auto-calculation**: Total duration is automatically calculated from lesson durations
- ✅ **Course ID**: Always generated automatically if not provided

