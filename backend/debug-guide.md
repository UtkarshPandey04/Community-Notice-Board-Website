# 🔍 Backend Route Loading Debug Guide

## 🚨 **Problem: Routes aren't being loaded properly**

### **Step 1: Test Simple Server**

```bash
cd backend
node test-simple.js
```

- Should show: "Simple test server running on port 5001"
- Test: http://localhost:5001/test
- Test: http://localhost:5001/health

### **Step 2: Check Dependencies**

```bash
npm install
```

- Make sure all packages are installed
- Check for any error messages

### **Step 3: Check MongoDB Connection**

```bash
# Make sure MongoDB is running
# On Windows: Check Services app for "MongoDB"
# Or start manually if needed
```

### **Step 4: Test Main Server Step by Step**

#### **A. Test without routes first:**

Comment out all route imports in server.js and test:

```javascript
// Comment out these lines temporarily:
// import authRoutes from './routes/auth.js';
// import userRoutes from './routes/users.js';
// ... etc

// And comment out route usage:
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// ... etc
```

#### **B. Test with just one route:**

Uncomment only auth routes and test:

```javascript
import authRoutes from "./routes/auth.js";
// ... other imports commented out

app.use("/api/auth", authRoutes);
// ... other routes commented out
```

### **Step 5: Check for Import Errors**

#### **A. Test route file individually:**

```bash
node -e "import('./routes/auth.js').then(console.log).catch(console.error)"
```

#### **B. Test model file individually:**

```bash
node -e "import('./models/User.js').then(console.log).catch(console.error)"
```

#### **C. Test middleware file individually:**

```bash
node -e "import('./middleware/auth.js').then(console.log).catch(console.error)"
```

### **Step 6: Common Issues & Solutions**

#### **Issue 1: ES Module Import Error**

- Make sure package.json has `"type": "module"`
- Use `.js` extension in imports
- Check Node.js version (needs 16+)

#### **Issue 2: MongoDB Connection Failing**

- MongoDB service not running
- Wrong connection string
- Network/firewall issues

#### **Issue 3: Missing Dependencies**

- Run `npm install` again
- Check if all packages are in package.json

#### **Issue 4: Port Already in Use**

- Check if port 5000 is free: `netstat -an | findstr :5000`
- Kill process using port 5000
- Or change port in .env file

### **Step 7: Debug Output**

When you run `npm run dev`, you should see:

```
✅ Connected to MongoDB successfully
🚀 Server running on port 5000
📱 Frontend URL: http://localhost:5173
🗄️  Database: mongodb://localhost:27017/shadcn-ui-db
🌍 Environment: development
```

If you see errors, they will help identify the issue.

### **Step 8: Test Routes After Fix**

Once working, test these endpoints:

- https://community-notice-board-website.vercel.app//api/health
- https://community-notice-board-website.vercel.app//api/auth/register (POST)
- https://community-notice-board-website.vercel.app//api/announcements/categories/list

## 🆘 **Still Having Issues?**

1. **Check console output** for error messages
2. **Verify MongoDB** is running
3. **Check .env file** exists and has correct values
4. **Try the simple test server** first
5. **Test routes one by one** to isolate the problem

## 📋 **Quick Commands to Run:**

```bash
# Test simple server
node test-simple.js

# Install dependencies
npm install

# Start main server
npm run dev

# Test health endpoint
curl https://community-notice-board-website.vercel.app//api/health
```
