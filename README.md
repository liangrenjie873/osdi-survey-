# Glasses Discomfort Survey with Database Support

This is a comprehensive web-based survey system with database support, designed to assess and track the discomfort experienced by glasses wearers in different environments and their eye health conditions.

## 🆕 New Database Features

- **Data Persistence**: All survey responses are saved to a SQLite database
- **Admin Dashboard**: View statistics, recent submissions, and export data
- **Real-time Analytics**: Track submission trends and rating distributions
- **Data Export**: Export all data as JSON for analysis
- **API Integration**: RESTful API for survey submissions and data retrieval

## 🎨 Custom Logo Support

- **Easy Logo Replacement**: Simply place your logo files in the `images/` directory
- **Dual Logo Support**: Separate logos for main page and admin dashboard
- **Responsive Design**: Logos automatically adapt to different screen sizes
- **Professional Display**: Optimized for medical/healthcare branding

### Logo Files Needed:
- `images/koushicare-logo.png` - Main survey page logo
- `images/koushicare-logo-white.png` - Admin dashboard logo (white/light version)

📖 **Detailed instructions**: See `LOGO_REPLACEMENT_GUIDE.md`

## Features

- ✨ **Responsive Design** - Supports computers, tablets, and mobile devices
- 🎨 **Unified Pink Theme** - Consistent visual style with the original survey forms
- 📊 **Smart Results Analysis** - Provides detailed score statistics and health recommendations
- 💾 **Local Data Storage** - Automatically saves responses, won't lose data on page refresh
- 📄 **Results Export** - Supports exporting text files and printing functionality
- ⚡ **Real-time Validation** - Ensures all questions are completed
- 🎯 **User-friendly** - Smooth animations and visual feedback enhance user experience

## Survey Content

### 1. The degree of discomfort of the glasses in a particular environment
- windy
- dry
- windy

### 2. The degree of eye discomfort
- photophobia
- feeling of sand in the eyes
- pain/swelling
- blurred vision
- decreased vision

### 3. Daily eye habits
- reading
- driving at night
- using computer
- watching TV

## 🚀 Quick Start

### Prerequisites
- Node.js 14.0.0 or higher
- npm (comes with Node.js)

### Installation

#### Option 1: Automated Installation (Recommended)
```bash
# Make the install script executable and run it
chmod +x install.sh
./install.sh
```

#### Option 2: Manual Installation
```bash
# Install dependencies
npm install

# Start the server
npm start
```

### Usage
1. **Start the server**: 
   ```bash
   npm start
   ```
   For development with auto-restart:
   ```bash
   npm run dev
   ```

2. **Access the survey**: Open `http://localhost:3000` in your browser

3. **Admin dashboard**: Visit `http://localhost:3000/admin` to view:
   - Submission statistics
   - Rating distributions
   - Recent submissions
   - Data export functionality

## 📊 Database Schema

The system uses SQLite with the following main tables:

### surveys
Stores individual survey responses with calculated scores:
- Personal responses (windy1, dry, windy2, photophobia, etc.)
- Calculated category scores
- Overall rating and percentage
- Submission metadata (IP, timestamp, user agent)

### survey_summary
Daily aggregated statistics for performance optimization

## Scoring Instructions

Each question uses a 5-point scale:
- **always** (4 points) - Frequently occurs
- **usually** (3 points) - Occurs most of the time
- **half time** (2 points) - Occurs occasionally
- **sometimes** (1 point) - Rarely occurs
- **never** (0 points) - Never occurs

## OSDI Scoring System

The system uses the standard **OSDI (Ocular Surface Disease Index)** calculation:

**OSDI Score = (Sum of scores × 25) ÷ Number of questions answered**

This produces a score from 0 to 100, where:
- **0-12**: Normal/No Significant Discomfort
- **13-22**: Mild Discomfort  
- **23-32**: Moderate Discomfort
- **33-100**: Severe Discomfort

## Results Interpretation

The system calculates both raw scores and OSDI scores:

### Raw Scores
- Environment: 0-12 points (3 questions × 4 max points)
- Eye Discomfort: 0-20 points (5 questions × 4 max points)  
- Daily Habits: 0-16 points (4 questions × 4 max points)
- **Total**: 0-52 points (13 questions × 4 max points)

### OSDI Scores (0-100)
- **Normal** (OSDI < 13) - Good eye health condition
- **Mild Discomfort** (OSDI 13-22) - Monitor symptoms, basic eye care
- **Moderate Discomfort** (OSDI 23-32) - Consider professional consultation
- **Severe Discomfort** (OSDI ≥ 33) - Recommend immediate medical examination

## 🔌 API Endpoints

### POST /api/survey/submit
Submit a new survey response
```json
{
  "windy1": 2, "dry": 1, "windy2": 3,
  "photophobia": 1, "sandFeeling": 0,
  "painSwelling": 2, "blurredVision": 1,
  "decreasedVision": 0, "reading": 4,
  "nightDriving": 2, "computerUse": 3,
  "watchingTV": 2
}
```

### GET /api/survey/stats
Get overall statistics and rating distribution

### GET /api/survey/recent/:limit
Get recent submissions (default: 10, max in example: 20)

### GET /api/survey/export
Export all survey data (admin only)

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configured for web security
- **Helmet Security Headers**: Additional HTTP security
- **Input Validation**: Server-side validation of all inputs
- **SQL Injection Protection**: Using parameterized queries

## Technical Implementation

- **Backend**: Node.js + Express.js
- **Database**: SQLite3 for simplicity and portability
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Security**: Helmet, CORS, Rate Limiting
- **Data Storage**: SQLite database + localStorage backup

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers

## File Structure

```
├── index.html          # Main survey page
├── admin.html          # Admin dashboard
├── server.js           # Express.js backend server
├── style.css           # CSS styles (shared)
├── script.js           # Frontend JavaScript
├── package.json        # Node.js dependencies
├── install.sh          # Automated setup script
├── README.md           # This documentation
├── survey.db           # SQLite database (created on first run)
└── data/               # Database backup directory
```

## 🚀 Deployment

### Development
```bash
npm run dev    # Uses nodemon for auto-restart
```

### Production
```bash
npm start      # Standard production start
```

### Environment Variables (Optional)
```bash
PORT=3000      # Server port (default: 3000)
NODE_ENV=production
```

## 📈 Monitoring & Maintenance

### Database Management
- SQLite database file: `survey.db`
- Automatic daily summary updates
- Built-in data export functionality

### Backup Recommendations
1. Regular database backups: `cp survey.db backups/survey_$(date +%Y%m%d).db`
2. Export data periodically via admin panel
3. Monitor disk space for log files

## 🛠️ Troubleshooting

### Common Issues

**Server won't start**
- Check if Node.js is installed: `node --version`
- Verify port 3000 is available: `netstat -tulpn | grep 3000`
- Install dependencies: `npm install`

**Database errors**
- Check write permissions in project directory
- Ensure SQLite3 is properly installed
- Delete and recreate database: `rm survey.db` then restart server

**Network issues**
- Check firewall settings
- Verify CORS configuration in server.js
- Test API endpoints manually: `curl http://localhost:3000/api/survey/stats`

## Notes

1. Database automatically handles schema creation
2. Rate limiting prevents spam submissions
3. All data includes IP tracking for analytics
4. Admin dashboard updates in real-time
5. System handles both online and offline scenarios

## Privacy & Data Protection

- **Server-side Storage**: All responses stored in local SQLite database
- **IP Tracking**: IP addresses logged for analytics and spam prevention
- **No External Services**: All data remains on your server
- **Data Retention**: No automatic data deletion (manual management required)
- **Export Capability**: Full data export available for compliance