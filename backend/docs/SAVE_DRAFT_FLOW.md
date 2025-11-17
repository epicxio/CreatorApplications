# Save Draft Flow - Complete Documentation

## Overview
This document explains what happens when you click "Save Draft" button and how the data flows from the frontend to MongoDB Atlas.

## Complete Flow

### 1. **User Action**
- User clicks the **"Save Draft"** button in the Course Builder UI

### 2. **Frontend: `handleSaveDraft()` Function**
**Location:** `frontend/src/components/learnloop/CourseBuilderPage.tsx` (line ~705)

**What it does:**
- Sets `saving` state to `true` (shows loading indicator)
- Prepares complete course data (`draftData`) including:
  - Course details (name, subtitle, description, category, level, language, tags, visibility)
  - Modules and lessons
  - Video URLs and thumbnail URLs (mapped from `lesson.videos` to `lesson.content.videoUrl` and `lesson.content.thumbnailUrl`)
  - Resources (with proper `type` field)
  - Pre/post class messages
  - Quiz questions (if applicable)
  - Live lesson fields (if applicable)
  - Audio files (if applicable)
- Calls `courseService.saveDraft(courseId, draftData)`

### 3. **Frontend Service: `courseService.saveDraft()`**
**Location:** `frontend/src/services/courseService.ts` (line ~512)

**What it does:**
- Determines the API endpoint:
  - If `courseId` exists: `POST /api/courses/${courseId}/draft` (update existing)
  - If `courseId` is null: `POST /api/courses/draft` (create new)
- Sends HTTP POST request with course data to backend
- Includes authentication token in headers (from localStorage)
- Returns success/error response

### 4. **Backend Route Handler**
**Location:** `backend/src/routes/courseRoutes.js`

**Route:** 
- `POST /api/courses/draft` → `courseController.saveDraft` (create new)
- `POST /api/courses/:id/draft` → `courseController.saveDraft` (update existing)

**Authentication:** Protected by `auth` middleware (requires valid JWT token)

### 5. **Backend Controller: `saveDraft()`**
**Location:** `backend/src/controllers/courseController.js` (line ~255)

**What it does:**

#### Step 5.1: Prepare Data
- Sets `instructor` from authenticated user (`req.user._id`)
- Ensures `status` is set to `'Draft'`
- Provides default values for required fields:
  - `description`: Defaults to "Course: {name}" or "Course description will be added later"
  - `category`: Defaults to `'NA'` if empty
  - `level`: Defaults to `'NA'` if empty
  - `language`: Defaults to `'NA'` if empty

#### Step 5.2: Calculate Duration
- If modules are provided, calculates total duration by summing all lesson durations

#### Step 5.3: Generate Course ID
- If `courseId` doesn't exist, generates one using format: `C-{first 3 letters of creator name}-{number}`
- Example: `C-ADM-0001`

#### Step 5.4: Save to MongoDB Atlas

**If updating existing course (`id` provided):**
```javascript
course = await Course.findByIdAndUpdate(
  id,
  { $set: courseData },
  { new: true, runValidators: true }
).populate('instructor', 'name email avatar');
```

**If creating new course:**
```javascript
course = new Course(courseData);
await course.save();
await course.populate('instructor', 'name email avatar');
```

#### Step 5.5: Database Confirmation
- Logs detailed confirmation to console showing:
  - Database name (from MongoDB Atlas connection)
  - Collection name (`courses`)
  - Course ID
  - Course name
  - Modules count
  - Total lessons
  - Module details
  - Timestamp

#### Step 5.6: Return Response
- Returns JSON response with:
  - `success: true`
  - `data: course` (the saved course object)
  - `message: 'Draft saved successfully'`

### 6. **MongoDB Atlas Storage**

**Database:** As configured in `MONGODB_URI` environment variable
**Collection:** `courses`
**Document Structure:**
```javascript
{
  _id: ObjectId,
  courseId: "C-ADM-0001",
  name: "Course Name",
  subtitle: "Course Subtitle",
  description: "Course Description",
  instructor: ObjectId (reference to User),
  category: "Category Name",
  level: "Beginner" | "Intermediate" | "Advanced" | "NA",
  language: "English" | "NA",
  tags: ["tag1", "tag2"],
  visibility: "Public" | "Unlisted" | "Private",
  status: "Draft",
  modules: [
    {
      _id: ObjectId,
      title: "Module Title",
      description: "Module Description",
      order: 1,
      lessons: [
        {
          _id: ObjectId,
          title: "Lesson Title",
          description: "Lesson Description",
          type: "Video" | "Text" | "Audio" | "Quiz" | "Assignment" | "Live",
          duration: 30,
          order: 1,
          content: {
            videoUrl: "/uploads/courses/videos/filename.mp4",
            thumbnailUrl: "/uploads/courses/thumbnails/filename.png",
            preClassMessage: "Message",
            postClassMessage: "Message",
            // ... other content fields
          },
          resources: [
            {
              name: "Resource Name",
              type: "document" | "image" | "video" | "audio" | "archive" | "other",
              url: "/uploads/courses/resources/filename.pdf",
              size: 1024000,
              downloadCount: 0
            }
          ]
        }
      ]
    }
  ],
  duration: 120,
  createdAt: Date,
  lastUpdated: Date
}
```

### 7. **Frontend: Handle Response**

**On Success:**
- Updates `courseId` state if it's a new course
- Updates `lastSaved` timestamp
- Sets `hasUnsavedChanges` to `false`
- Shows success toast notification: "Draft saved successfully!"
- Logs confirmation to console

**On Error:**
- Shows error toast notification with error message
- Logs error to console
- Handles specific errors:
  - Network errors: "Cannot connect to server..."
  - Authentication errors: "You are not authenticated..."
  - Validation errors: Shows backend error message

## Data Mapping

### Frontend → Backend Mapping

| Frontend Field | Backend Field | Notes |
|---------------|---------------|-------|
| `lesson.videos[0].video.url` | `lesson.content.videoUrl` | First video URL |
| `lesson.videos[0].thumbnail.url` | `lesson.content.thumbnailUrl` | First thumbnail URL |
| `lesson.audioFiles[0].url` | `lesson.content.audioUrl` | First audio URL |
| `lesson.preClassMessage` | `lesson.content.preClassMessage` | Pre-class message |
| `lesson.postClassMessage` | `lesson.content.postClassMessage` | Post-class message |
| `lesson.resources[].name` | `lesson.resources[].name` | Resource name |
| `lesson.resources[].url` | `lesson.resources[].url` | Resource URL |
| `lesson.resources[].type` | `lesson.resources[].type` | Auto-determined from file extension |

## Verification

### How to Verify Data is Saved to MongoDB Atlas:

1. **Check Backend Console:**
   - Look for confirmation logs:
     ```
     💾 COURSE SAVED TO MONGODB ATLAS:
        📍 Database: creatormarketplace
        📦 Collection: courses
        🆔 Course ID: C-ADM-0001
        📝 Course Name: Course Name
        📚 Modules Count: 1
        📖 Total Lessons: 2
     ```

2. **Check MongoDB Atlas:**
   - Log into MongoDB Atlas dashboard
   - Navigate to your cluster
   - Go to "Browse Collections"
   - Select `creatormarketplace` database
   - Select `courses` collection
   - Find your course document

3. **Check Frontend Console:**
   - Open browser DevTools
   - Look for: "💾 Manual Save Draft - Data being saved:"
   - Look for: "✅ Draft saved successfully!"

## Important Notes

1. **All data is saved to MongoDB Atlas** - The backend uses Mongoose which connects to MongoDB Atlas using the `MONGODB_URI` from `.env` file.

2. **Files are saved locally** - Uploaded files (videos, thumbnails, resources) are saved to `backend/uploads/courses/` directory structure, but their URLs are stored in MongoDB.

3. **Status is always 'Draft'** - When using "Save Draft", the course status is automatically set to `'Draft'` regardless of previous status.

4. **Auto-save also uses this flow** - The auto-save functionality (before navigation) uses the same `saveDraftBeforeLeave()` function which internally calls `courseService.saveDraft()`.

5. **Validation happens on save** - Mongoose schema validation runs when saving, ensuring data integrity.

## Troubleshooting

### If data is not saving:

1. **Check backend server is running:**
   ```bash
   cd backend
   npm start
   ```

2. **Check MongoDB connection:**
   - Verify `MONGODB_URI` in `.env` file
   - Check backend console for connection errors

3. **Check authentication:**
   - Ensure user is logged in
   - Check if JWT token is valid

4. **Check network:**
   - Verify API URL in frontend: `http://localhost:5001/api`
   - Check browser console for network errors

5. **Check validation errors:**
   - Look at backend console for Mongoose validation errors
   - Ensure all required fields have values or defaults

