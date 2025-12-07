# MongoDB Setup Guide

## Quick Setup with MongoDB Atlas (Free Cloud Database)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google account
3. Choose the **FREE** tier (M0 Sandbox)

### Step 2: Create a Cluster
1. After login, click **"Build a Database"**
2. Choose **FREE** (Shared) tier
3. Select a cloud provider (AWS recommended)
4. Choose a region close to you
5. Click **"Create"** (wait 1-3 minutes for cluster creation)

### Step 3: Create Database User
1. Click **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Choose **Password** authentication
4. Username: `liynmar_admin`
5. Password: Create a strong password (save it!)
6. Database User Privileges: **Read and write to any database**
7. Click **"Add User"**

### Step 4: Whitelist Your IP
1. Click **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
   - IP: `0.0.0.0/0`
4. Click **"Confirm"**

### Step 5: Get Connection String
1. Click **"Database"** in left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**
5. Version: **5.5 or later**
6. Copy the connection string, it looks like:
   ```
   mongodb+srv://liynmar_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Update Your .env File
1. Open `server\.env`
2. Replace `<password>` with your actual password
3. Add database name before the `?`:
   ```env
   MONGODB_URI=mongodb+srv://liynmar_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/liynmar_tutorial?retryWrites=true&w=majority
   ```

### Step 7: Restart Server
The server will automatically restart with nodemon and connect to MongoDB Atlas.

## Alternative: Use MongoDB VS Code Extension

If you prefer to use the MongoDB VS Code extension:

1. Open VS Code
2. Click MongoDB icon in sidebar
3. Click "Add Connection"
4. Paste your Atlas connection string
5. The extension will let you browse your database

## Verify Connection

Once connected, you should see in terminal:
```
✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
📊 Database: liynmar_tutorial
🚀 Server is running on port 5000
```

## Troubleshooting

### "Bad auth" error
- Double-check username and password
- Ensure password doesn't contain special characters like `@`, `:`, `/`
- If it does, encode them (VS Code MongoDB extension can help)

### "Network timeout" error
- Check "Network Access" in Atlas
- Ensure `0.0.0.0/0` is whitelisted
- Check your internet connection

### "User not found" error
- Verify user was created in "Database Access"
- Ensure user has "Read and write to any database" privilege

## For Production

When deploying:
1. Create a separate production cluster
2. Use specific IP whitelisting (not 0.0.0.0/0)
3. Use environment-specific .env files
4. Enable backup in MongoDB Atlas
