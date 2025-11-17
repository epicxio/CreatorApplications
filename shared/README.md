# 📋 Shared Permissions Configuration

## 🎯 Single Source of Truth

This is the **ONLY PLACE** you need to edit when adding new modules to the application.

**File Location:** `frontend/src/shared/permissions.config.js`

---

## ✅ How to Add a New Module

### Step 1: Open the Config File

Open: `frontend/src/shared/permissions.config.js`

### Step 2: Add Your Module

Find the section that says:
```javascript
// ============================================================================
// ✅ ADD NEW MODULES BELOW THIS LINE
// ============================================================================
```

Add your module in one of these formats:

#### **Simple Module (No Sub-menus):**
```javascript
{ name: 'My New Module', path: '/my-new-module' },
```

#### **Module with Sub-menus:**
```javascript
{
  name: 'My New Module',
  path: '/my-new-module',
  children: [
    { name: 'Sub Menu 1', path: '/my-new-module/sub1' },
    { name: 'Sub Menu 2', path: '/my-new-module/sub2' },
  ],
},
```

### Step 3: Add Icon (Frontend Only)

If you want a custom icon, open: `frontend/src/config/permissions.ts`

Add your icon to the `iconMap` object:
```typescript
const iconMap: Record<string, React.ElementType> = {
  // ... existing icons ...
  'My New Module': YourIconComponent,  // ✅ Add here
};
```

### Step 4: Restart the Server

Restart the backend server:
```bash
cd backend
npm run dev
```

---

## 🚀 What Happens Automatically

When you add a module and restart the server, the system automatically:

1. ✅ **Syncs to MongoDB Atlas** - Creates permissions in the database
2. ✅ **Assigns to Super Admin** - Super Admin gets View, Create, Edit, Delete permissions
3. ✅ **Updates Role Management UI** - Module appears in the permissions list
4. ✅ **No Manual Steps Required** - Everything is automatic!

---

## 📝 Module Format Details

### Required Fields:
- **`name`**: The display name of the module (used as resource identifier)
- **`path`**: The route path (should match your React Router route)

### Optional Fields:
- **`children`**: Array of sub-menu items (each with `name` and `path`)

### Example:
```javascript
{
  name: 'Revenue Desk',           // Module name
  path: '/revenue-desk',          // Route path
  children: [                     // Optional sub-menus
    { name: 'Earnings', path: '/revenue-desk/earnings' },
    { name: 'Transactions', path: '/revenue-desk/transactions' },
  ],
}
```

---

## 🔐 Permissions Created

For each module (parent and children), the system automatically creates 4 permissions:
- **View** - Can view the module
- **Create** - Can create items in the module
- **Edit** - Can edit items in the module
- **Delete** - Can delete items in the module

**Example:** If you add a module called "My Module", these permissions are created:
- `My Module:View`
- `My Module:Create`
- `My Module:Edit`
- `My Module:Delete`

---

## ⚠️ Important Notes

1. **Single Source of Truth**: Only edit `shared/permissions.config.js`
2. **Name Must Be Unique**: Module names are used as identifiers
3. **Path Should Match Routes**: The path should match your React Router route
4. **Super Admin Gets Everything**: Super Admin automatically gets all permissions
5. **Restart Required**: Backend server must be restarted for changes to take effect

---

## 🐛 Troubleshooting

### Module not appearing in Role Management?
- ✅ Check that you restarted the backend server
- ✅ Check the server console for sync messages
- ✅ Verify the module name doesn't have typos

### Permissions not showing for Super Admin?
- ✅ The system auto-assigns on server start
- ✅ Check MongoDB Atlas to verify permissions were created
- ✅ Try editing the Super Admin role (this triggers a sync)

### Icon not showing?
- ✅ Add the icon to `iconMap` in `frontend/src/config/permissions.ts`
- ✅ Import the icon component from `@mui/icons-material`

---

## 📚 Examples

### Example 1: Simple Module
```javascript
{ name: 'Settings', path: '/settings' },
```

### Example 2: Module with Sub-menus
```javascript
{
  name: 'Analytics',
  path: '/analytics',
  children: [
    { name: 'Dashboard', path: '/analytics/dashboard' },
    { name: 'Reports', path: '/analytics/reports' },
    { name: 'Export', path: '/analytics/export' },
  ],
},
```

### Example 3: Multiple Simple Modules
```javascript
{ name: 'Module 1', path: '/module1' },
{ name: 'Module 2', path: '/module2' },
{ name: 'Module 3', path: '/module3' },
```

---

## 🎉 That's It!

Just add your module to the config file and restart the server. Everything else is automatic!

**Questions?** Check the comments in `shared/permissions.config.js` for more details.

