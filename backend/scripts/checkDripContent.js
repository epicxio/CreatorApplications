/**
 * MongoDB Queries to Check Drip Content Settings
 * 
 * Run these queries in MongoDB Compass, MongoDB Shell, or your preferred MongoDB client
 * 
 * Database: Your database name (usually from connection string)
 * Collection: courses
 */

// ============================================
// 1. Check All Courses with Drip Content Enabled
// ============================================
db.courses.find(
  { dripEnabled: true },
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
).pretty();

// ============================================
// 2. Check Specific Course by Course ID (Formatted)
// ============================================
// Replace "C-ADM-0001" with your actual course ID
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

// ============================================
// 3. Check Specific Course by MongoDB ObjectId
// ============================================
// Replace "6919c01a6ade86f72f2fa20a" with your actual ObjectId
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

// ============================================
// 4. Check All Drip Content Settings (Summary)
// ============================================
db.courses.aggregate([
  {
    $project: {
      courseId: 1,
      name: 1,
      dripEnabled: 1,
      dripDisplayOption: 1,
      dripHideUnlockDate: 1,
      dripSendCommunication: 1,
      dripMethodsCount: { $size: { $ifNull: ["$dripMethods", []] } },
      lastUpdated: 1
    }
  },
  {
    $sort: { lastUpdated: -1 }
  }
]);

// ============================================
// 5. Check Courses with Specific Display Option
// ============================================
// Options: "title", "titleAndLessons", "hide"
db.courses.find(
  { 
    dripEnabled: true,
    dripDisplayOption: "titleAndLessons"
  },
  {
    courseId: 1,
    name: 1,
    dripDisplayOption: 1,
    lastUpdated: 1
  }
).pretty();

// ============================================
// 6. Check Courses with Hide Unlock Date Enabled
// ============================================
db.courses.find(
  { 
    dripEnabled: true,
    dripHideUnlockDate: true
  },
  {
    courseId: 1,
    name: 1,
    dripHideUnlockDate: 1,
    lastUpdated: 1
  }
).pretty();

// ============================================
// 7. Check Courses with Automated Notifications Enabled
// ============================================
db.courses.find(
  { 
    dripEnabled: true,
    dripSendCommunication: true
  },
  {
    courseId: 1,
    name: 1,
    dripSendCommunication: 1,
    lastUpdated: 1
  }
).pretty();

// ============================================
// 8. Check Drip Methods for a Specific Course
// ============================================
// Replace "C-ADM-0001" with your actual course ID
db.courses.findOne(
  { courseId: "C-ADM-0001" },
  {
    courseId: 1,
    name: 1,
    dripMethods: 1
  }
);

// ============================================
// 9. Count Courses by Drip Content Status
// ============================================
db.courses.aggregate([
  {
    $group: {
      _id: {
        dripEnabled: "$dripEnabled",
        dripDisplayOption: "$dripDisplayOption"
      },
      count: { $sum: 1 }
    }
  },
  {
    $sort: { "_id.dripEnabled": -1, "_id.dripDisplayOption": 1 }
  }
]);

// ============================================
// 10. Find Courses Updated in Last 24 Hours with Drip Content
// ============================================
db.courses.find(
  {
    dripEnabled: true,
    lastUpdated: {
      $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
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

// ============================================
// 11. Update a Course's Drip Content Settings (Manual Update)
// ============================================
// WARNING: Use with caution! This is for testing/debugging only.
// Replace "C-ADM-0001" with your actual course ID
/*
db.courses.updateOne(
  { courseId: "C-ADM-0001" },
  {
    $set: {
      dripEnabled: true,
      dripDisplayOption: "titleAndLessons",
      dripHideUnlockDate: false,
      dripSendCommunication: true,
      lastUpdated: new Date()
    }
  }
);
*/

// ============================================
// 12. Check if Drip Content Fields Exist and Are Not Null
// ============================================
db.courses.find(
  {
    $or: [
      { dripEnabled: { $exists: true, $ne: null } },
      { dripDisplayOption: { $exists: true, $ne: null } },
      { dripHideUnlockDate: { $exists: true, $ne: null } },
      { dripSendCommunication: { $exists: true, $ne: null } }
    ]
  },
  {
    courseId: 1,
    name: 1,
    dripEnabled: 1,
    dripDisplayOption: 1,
    dripHideUnlockDate: 1,
    dripSendCommunication: 1,
    dripMethods: 1
  }
).pretty();

