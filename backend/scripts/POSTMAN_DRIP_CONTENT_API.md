# Postman API Requests for Drip Content

## Base URL
```
http://localhost:5000/api/courses
```
*(Replace with your actual backend URL if different)*

## Authentication
All endpoints require authentication. You need to include an **Authorization token** in the headers.

### How to Get Your Token
1. Login to your application
2. Open browser DevTools → Application/Storage → Look for token
3. Or check the Network tab when making API calls to see the Authorization header

### Postman Header Setup
```
Key: Authorization
Value: Bearer YOUR_TOKEN_HERE
```

---

## API Endpoints

### 1. Get Course by MongoDB ObjectId
**GET** `/api/courses/:id`

**Example:**
```
GET http://localhost:5000/api/courses/6919c01a6ade86f72f2fa20a
```

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Response includes:**
- `dripEnabled`
- `dripDisplayOption`
- `dripHideUnlockDate`
- `dripSendCommunication`
- `dripMethods`
- All other course fields

---

### 2. Get Course by Formatted Course ID
**GET** `/api/courses/:id`

**Note:** The backend supports both ObjectId and formatted courseId (like "C-ADM-0001")

**Example:**
```
GET http://localhost:5000/api/courses/C-ADM-0001
```

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

---

### 3. Get All Your Courses (My Courses)
**GET** `/api/courses/my-courses`

**Example:**
```
GET http://localhost:5000/api/courses/my-courses
```

**Query Parameters (Optional):**
- `status` - Filter by status (Draft, Published, etc.)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Example with query params:**
```
GET http://localhost:5000/api/courses/my-courses?status=Draft&page=1&limit=10
```

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Response:** Array of courses with drip content fields

---

### 4. Get All Courses (with filters)
**GET** `/api/courses`

**Query Parameters (Optional):**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `category` - Filter by category
- `level` - Filter by level
- `status` - Filter by status
- `dripEnabled` - Filter by drip content enabled (true/false)
- `searchQuery` - Search in course name/description

**Example:**
```
GET http://localhost:5000/api/courses?dripEnabled=true&page=1&limit=10
```

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

---

## Expected Response Format

### Single Course Response
```json
{
  "success": true,
  "data": {
    "_id": "6919c01a6ade86f72f2fa20a",
    "courseId": "C-ADM-0001",
    "name": "T1",
    "subtitle": "T1",
    "description": "Course: T1",
    "dripEnabled": true,
    "dripDisplayOption": "titleAndLessons",
    "dripHideUnlockDate": false,
    "dripSendCommunication": false,
    "dripMethods": [
      {
        "moduleId": "module-1",
        "method": "immediate",
        "action": null
      },
      {
        "moduleId": "module-2",
        "method": "days",
        "action": 7
      }
    ],
    "lastUpdated": "2025-01-11T12:00:00.000Z",
    "createdAt": "2025-01-11T10:00:00.000Z",
    // ... other course fields
  }
}
```

### Multiple Courses Response
```json
{
  "success": true,
  "courses": [
    {
      "id": "6919c01a6ade86f72f2fa20a",
      "courseId": "C-ADM-0001",
      "name": "T1",
      "dripEnabled": true,
      "lastUpdated": "2025-01-11T12:00:00.000Z",
      // ... other fields
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "hasMore": false
}
```

---

## Quick Postman Setup Steps

1. **Create New Request**
   - Click "New" → "HTTP Request"
   - Name it "Get Course by ID"

2. **Set Method and URL**
   - Method: `GET`
   - URL: `http://localhost:5000/api/courses/6919c01a6ade86f72f2fa20a`
     *(Replace with your course ID)*

3. **Add Headers**
   - Go to "Headers" tab
   - Add:
     - `Authorization`: `Bearer YOUR_TOKEN_HERE`
     - `Content-Type`: `application/json`

4. **Send Request**
   - Click "Send"
   - Check the response body for drip content fields

---

## Testing Checklist

After enabling drip content and saving:

✅ **Check `dripEnabled`** - Should be `true`  
✅ **Check `dripDisplayOption`** - Should be `"title"`, `"titleAndLessons"`, or `"hide"`  
✅ **Check `dripHideUnlockDate`** - Should be `true` or `false`  
✅ **Check `dripSendCommunication`** - Should be `true` or `false`  
✅ **Check `dripMethods`** - Should be an array with module release strategies  
✅ **Check `lastUpdated`** - Should reflect the current timestamp  

---

## Troubleshooting

### 401 Unauthorized
- Make sure you have a valid Authorization token
- Check that the token hasn't expired
- Verify the token format: `Bearer YOUR_TOKEN_HERE`

### 404 Not Found
- Verify the course ID is correct
- Check if the course exists in the database
- Try using the MongoDB ObjectId instead of formatted courseId

### 500 Internal Server Error
- Check backend server logs
- Verify database connection
- Check if the course model schema is correct

---

## Environment Variables (Optional)

Set up Postman environment variables for easier testing:

**Variables:**
- `baseUrl`: `http://localhost:5000`
- `token`: `YOUR_TOKEN_HERE`
- `courseId`: `6919c01a6ade86f72f2fa20a`

**Then use in URL:**
```
{{baseUrl}}/api/courses/{{courseId}}
```

**And in Headers:**
```
Authorization: Bearer {{token}}
```

