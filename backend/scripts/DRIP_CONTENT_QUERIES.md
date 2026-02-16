# MongoDB Queries for Drip Content Settings

Quick reference guide for checking drip content settings in MongoDB Atlas.

## Quick Check - Most Common Queries

### 1. Check a Specific Course (by Course ID)
```javascript
db.courses.findOne(
  { courseId: "C-ADM-0001" },
  {
    courseId: 1,
    name: 1,
    dripEnabled: 1,
    dripDisplayOption: 1,
    dripHideUnlockDate: 1,
    dripSendCommunication: 1,
    dripMethods: 1,
    lastUpdated: 1
  }
);
```

### 2. Check a Specific Course (by MongoDB ObjectId)
```javascript
db.courses.findOne(
  { _id: ObjectId("6919c01a6ade86f72f2fa20a") },
  {
    courseId: 1,
    name: 1,
    dripEnabled: 1,
    dripDisplayOption: 1,
    dripHideUnlockDate: 1,
    dripSendCommunication: 1,
    dripMethods: 1,
    lastUpdated: 1
  }
);
```

### 3. List All Courses with Drip Content Enabled
```javascript
db.courses.find(
  { dripEnabled: true },
  {
    courseId: 1,
    name: 1,
    dripEnabled: 1,
    dripDisplayOption: 1,
    dripHideUnlockDate: 1,
    dripSendCommunication: 1,
    lastUpdated: 1
  }
).pretty();
```

### 4. Check Recent Updates (Last 24 Hours)
```javascript
db.courses.find(
  {
    dripEnabled: true,
    lastUpdated: {
      $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  },
  {
    courseId: 1,
    name: 1,
    dripEnabled: 1,
    dripDisplayOption: 1,
    dripHideUnlockDate: 1,
    dripSendCommunication: 1,
    lastUpdated: 1
  }
).sort({ lastUpdated: -1 }).pretty();
```

## Expected Field Values

- **dripEnabled**: `true` or `false`
- **dripDisplayOption**: `"title"`, `"titleAndLessons"`, or `"hide"`
- **dripHideUnlockDate**: `true` or `false`
- **dripSendCommunication**: `true` or `false`
- **dripMethods**: Array of objects with `moduleId`, `method`, `action`, `unlockDate`

## How to Use in MongoDB Compass

1. Open MongoDB Compass
2. Connect to your database
3. Select the `courses` collection
4. Click on the "Documents" tab
5. Click the filter icon (funnel) at the top
6. Paste one of the queries above (without `db.courses.`)
7. Click "Find" to execute

## Example: What You Should See

After enabling drip content and saving, you should see something like:

```json
{
  "_id": ObjectId("6919c01a6ade86f72f2fa20a"),
  "courseId": "C-ADM-0001",
  "name": "T1",
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
  "lastUpdated": ISODate("2025-01-11T12:00:00.000Z")
}
```

## Troubleshooting

If `dripEnabled` is `false` after toggling:
1. Check browser console for the debug logs
2. Check Network tab to see the request payload
3. Verify the backend received the correct data
4. Check MongoDB to see what was actually saved

