# 🚀 Quick Start Guide

## 1-Minute Setup

### Step 1: Install Dependencies
```bash
# Make install script executable
chmod +x install.sh

# Run automated installation
./install.sh
```

### Step 2: Start the Server
```bash
npm start
```

### Step 3: Access the Application
- **Survey**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin

## What You Get

### 🔍 Survey Features
- English language interface
- Responsive design (mobile/desktop)
- Real-time form validation
- Automatic score calculation
- Local storage backup

### 📊 Admin Dashboard
- **Statistics Overview**: Total submissions, average scores
- **Rating Distribution**: Visual breakdown of comfort levels
- **Recent Submissions**: Last 20 responses with details
- **Data Export**: Download all data as JSON

### 🗄️ Database
- **SQLite**: Lightweight, file-based database
- **Automatic Schema**: Creates tables on first run
- **Data Persistence**: All submissions saved permanently
- **Performance**: Optimized queries and indexes

## Testing the System

### Submit a Test Survey
1. Go to http://localhost:3000
2. Fill out all questions (select any values)
3. Click "Submit Survey"
4. Check the results display

### Check Admin Dashboard
1. Go to http://localhost:3000/admin
2. View the statistics (should show 1 submission)
3. Check the recent submissions table
4. Try exporting data

## File Locations

```
📁 Your Project Directory
├── survey.db          # SQLite database (auto-created)
├── server.js          # Backend server (handles API)
├── index.html         # Main survey page
├── admin.html         # Admin dashboard
└── package.json       # Dependencies list
```

## Common Commands

```bash
# Start server (production)
npm start

# Start with auto-restart (development)
npm run dev

# View server logs
# (logs appear in terminal where you ran npm start)

# Check if server is running
curl http://localhost:3000/api/survey/stats

# Stop server
# Press Ctrl+C in terminal
```

## Troubleshooting

### "Port 3000 is already in use"
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

### "Database is locked"
```bash
# Check if database file exists and has write permissions
ls -la survey.db
```

### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. **Customize the Survey**: Edit `index.html` to modify questions
2. **Style Changes**: Update `style.css` for different colors/layout
3. **Add Questions**: Update both frontend and backend schema
4. **Deploy**: Consider using PM2, Docker, or cloud hosting
5. **Backup**: Set up regular database backups

## Development Tips

- **Hot Reload**: Use `npm run dev` for automatic server restart
- **Database Viewer**: Use SQLite browser to inspect data directly
- **API Testing**: Use Postman or curl to test API endpoints
- **Logs**: Check terminal output for error messages

## Need Help?

1. **Check the README**: Detailed documentation available
2. **Inspect Network Tab**: Browser developer tools show API calls
3. **Check Server Logs**: Terminal shows detailed error messages
4. **Test API Directly**: Use curl to isolate frontend/backend issues

---

**That's it! Your survey system with database support is ready to use.** 🎉