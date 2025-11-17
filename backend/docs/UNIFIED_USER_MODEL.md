# Unified User Model Documentation

## Overview

The unified User model consolidates all user types (Creators, Admins, Brands, Account Managers, Employees) into a single collection while maintaining type-specific functionality. This approach eliminates data duplication and simplifies the database schema.

## Benefits

1. **Single Source of Truth**: All user data in one collection
2. **Reduced Complexity**: No need to manage multiple collections
3. **Better Performance**: Fewer joins and queries
4. **Easier Maintenance**: One model to maintain
5. **Flexible Schema**: Accommodates all user types with their specific fields

## User Types Supported

- **Super Admin**: System administrators with full access
- **Admin**: Platform administrators
- **Creator**: Content creators, influencers, artists
- **Brand**: Companies, businesses, organizations
- **Account Manager**: Client relationship managers
- **Employee**: Regular platform users

## Schema Structure

### Core Fields (All User Types)
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  passwordHash: String (required),
  userType: ObjectId (ref: UserType, required),
  status: String (enum: ['active', 'inactive', 'deleted']),
  createdAt: Date,
  updatedAt: Date
}
```

### Type-Specific Fields

#### Creator Fields
```javascript
{
  bio: String,
  creatorId: String (unique, format: CA00001),
  socialMedia: {
    instagram: String,
    facebook: String,
    youtube: String,
    tiktok: String,
    twitter: String,
    linkedin: String
  }
}
```

#### Brand Fields
```javascript
{
  companyName: String,
  industry: String,
  website: String
}
```

#### Corporate/Employee Fields
```javascript
{
  organization: String,
  department: String,
  grade: String,
  class: String
}
```

#### Account Manager Fields
```javascript
{
  assignedClients: [ObjectId] (ref: User)
}
```

### Common Metadata
```javascript
{
  profileImage: String,
  phoneNumber: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  preferences: {
    notifications: {
      email: Boolean,
      push: Boolean,
      sms: Boolean
    },
    language: String,
    timezone: String
  }
}
```

## API Endpoints

### Get All Users
```
GET /api/users
Query Parameters:
- userType: Filter by user type
- status: Filter by status
- search: Search in name, email, creatorId, social media
```

### Get Creators Only
```
GET /api/users/creators
```

### Get User Statistics
```
GET /api/users/stats
Returns: Count by user type with active/inactive breakdown
```

### Create User
```
POST /api/users
Body: CreateUserData interface
```

### Update User
```
PUT /api/users/:id
Body: UpdateUserData interface
```

### Delete User (Soft Delete)
```
DELETE /api/users/:id
Sets status to 'deleted'
```

### Reset Password
```
POST /api/users/:id/reset-password
Generates temporary password
```

## Model Methods

### Instance Methods
- `getUserTypeName()`: Returns user type name
- `isCreator()`: Checks if user is creator
- `isAdmin()`: Checks if user is admin/superadmin
- `isBrand()`: Checks if user is brand

### Static Methods
- `getByType(userTypeName)`: Get users by type
- `getCreators()`: Get all creators
- `getAdmins()`: Get all admins

## Migration Guide

### Running the Migration
```bash
cd backend
node src/scripts/migrateToUnifiedUsers.js
```

### What the Migration Does
1. Migrates existing creators from `creators` collection
2. Updates existing users to use new schema
3. Maps old `role` field to new `userType` field
4. Generates creator IDs for creators
5. Preserves all existing data

### Post-Migration
1. Verify all data migrated correctly
2. Test API endpoints
3. Update frontend components if needed
4. Remove old collections (optional)

## Frontend Integration

### TypeScript Interfaces
```typescript
interface User {
  _id: string;
  name: string;
  email: string;
  userType: UserType;
  status: 'active' | 'inactive' | 'deleted';
  // ... other fields
}
```

### Service Methods
```typescript
// Get all users with filtering
userService.getUsers({ userType: 'creator', status: 'active' })

// Get creators only
userService.getCreators()

// Get user statistics
userService.getUserStats()
```

## Best Practices

### 1. Type Checking
Always check user type before accessing type-specific fields:
```javascript
if (user.isCreator()) {
  // Access creator-specific fields
  console.log(user.bio, user.creatorId);
}
```

### 2. Field Validation
Validate type-specific fields based on user type:
```javascript
if (userType === 'creator' && !bio) {
  throw new Error('Bio is required for creators');
}
```

### 3. Query Optimization
Use indexes for better performance:
```javascript
// Indexes are automatically created for:
// - email
// - userType
// - status
// - creatorId
// - socialMedia.instagram
```

### 4. Data Integrity
- Creator IDs are auto-generated
- Email uniqueness is enforced
- Status transitions are validated

## Security Considerations

1. **Password Security**: Passwords are hashed using bcrypt
2. **Access Control**: Use userType for role-based access
3. **Data Validation**: Validate all input fields
4. **Soft Deletes**: Users are soft-deleted, not hard-deleted

## Performance Tips

1. **Selective Population**: Only populate userType when needed
2. **Index Usage**: Use existing indexes for queries
3. **Pagination**: Implement pagination for large datasets
4. **Caching**: Cache frequently accessed user data

## Troubleshooting

### Common Issues

1. **Missing UserType**: Ensure UserType exists before creating users
2. **Duplicate Emails**: Check for existing users before creation
3. **Invalid Creator ID**: Creator IDs are auto-generated, don't set manually
4. **Migration Errors**: Check MongoDB connection and permissions

### Debug Queries
```javascript
// Check user types
db.usertypes.find({})

// Check users by type
db.users.find({}).populate('userType')

// Check for orphaned users
db.users.find({ userType: { $exists: false } })
```

## Future Enhancements

1. **Audit Trail**: Add change tracking
2. **Bulk Operations**: Support bulk user operations
3. **Advanced Search**: Full-text search capabilities
4. **User Groups**: Support for user grouping
5. **API Rate Limiting**: Implement rate limiting per user type 