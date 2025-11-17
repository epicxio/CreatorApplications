# ⚡ Quick Start: Adding a New Module

## 🎯 3 Simple Steps

### 1️⃣ Open the Config File
```
frontend/src/shared/permissions.config.js
```

### 2️⃣ Add Your Module
Find this line:
```javascript
// ✅ ADD NEW MODULES BELOW THIS LINE
```

Add your module:
```javascript
{ name: 'My New Module', path: '/my-new-module' },
```

### 3️⃣ Restart Backend Server
```bash
cd backend
npm run dev
```

**Done!** ✅

The system automatically:
- ✅ Creates 4 permissions in MongoDB Atlas: View, Create, Edit, Delete
- ✅ Assigns ALL 4 permissions to Super Admin automatically
- ✅ Shows in Role Management UI with all toggles enabled

**Need to sync manually?** Run:
```bash
node backend/scripts/syncPermissionsNow.js
```

---

## 📝 Examples

**Simple module:**
```javascript
{ name: 'Settings', path: '/settings' },
```

**Module with sub-menus:**
```javascript
{
  name: 'My Module',
  path: '/my-module',
  children: [
    { name: 'Sub 1', path: '/my-module/sub1' },
    { name: 'Sub 2', path: '/my-module/sub2' },
  ],
},
```

---

## 🎨 Want a Custom Icon?

1. Open: `frontend/src/config/permissions.ts`
2. Add to `iconMap`:
```typescript
'My New Module': YourIconComponent,
```

---

**That's it!** See `shared/README.md` for more details.

