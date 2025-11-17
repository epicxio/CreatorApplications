# Troubleshooting Network Error

## Issue: Network Error when saving course draft

### Possible Causes:

1. **Backend Server Not Running**
   - Check if backend is running on port 5001
   - Run: `cd backend && npm start` or `node src/server.js`

2. **CORS Configuration**
   - Backend should allow requests from `http://localhost:3000`
   - Check `backend/src/server.js` for CORS configuration

3. **Authentication Token Missing**
   - User must be logged in
   - Token should be in `localStorage.getItem('token')`
   - Check browser console for authentication errors

4. **API URL Mismatch**
   - Frontend expects: `http://localhost:5001/api`
   - Check `frontend/src/services/api.ts` for `API_URL`

### Quick Fixes:

1. **Start Backend Server:**
   ```bash
   cd backend
   npm start
   # or
   node src/server.js
   ```

2. **Check Backend Logs:**
   - Look for: `✅ Connected to MongoDB`
   - Look for: `🚀 Server is running on port 5001`

3. **Verify CORS:**
   - Backend should have: `app.use(cors({origin: 'http://localhost:3000', credentials: true}));`

4. **Check Browser Console:**
   - Look for the actual error message
   - Check Network tab to see the failed request

5. **Verify Authentication:**
   - Make sure you're logged in
   - Check if token exists: `localStorage.getItem('token')`

### Testing the API:

```bash
# Test if backend is running
curl http://localhost:5001/

# Test course endpoint (requires auth token)
curl -X POST http://localhost:5001/api/courses/draft \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Test Course","status":"Draft"}'
```

