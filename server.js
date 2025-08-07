const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

// Database setup
const db = new sqlite3.Database('./survey.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    const createSurveyTable = `
        CREATE TABLE IF NOT EXISTS surveys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            submission_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            participant_name TEXT,
            ip_address TEXT,
            user_agent TEXT,
            
            -- Environment discomfort
            windy1 INTEGER,
            dry INTEGER,
            windy2 INTEGER,
            
            -- Eye discomfort  
            photophobia INTEGER,
            sandFeeling INTEGER,
            painSwelling INTEGER,
            blurredVision INTEGER,
            decreasedVision INTEGER,
            
            -- Daily habits
            reading INTEGER,
            nightDriving INTEGER,
            computerUse INTEGER,
            watchingTV INTEGER,
            
            -- Calculated scores
            environment_score INTEGER,
            eye_discomfort_score INTEGER,
            daily_habits_score INTEGER,
            total_score INTEGER,
            
            -- OSDI scores
            environment_osdi REAL,
            eye_discomfort_osdi REAL,
            daily_habits_osdi REAL,
            overall_osdi REAL,
            overall_percentage REAL,
            overall_rating TEXT
        )
    `;

    const createSummaryTable = `
        CREATE TABLE IF NOT EXISTS survey_summary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATE DEFAULT (date('now')),
            total_submissions INTEGER DEFAULT 0,
            avg_total_score REAL DEFAULT 0,
            avg_environment_score REAL DEFAULT 0,
            avg_eye_discomfort_score REAL DEFAULT 0,
            avg_daily_habits_score REAL DEFAULT 0,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.run(createSurveyTable, (err) => {
        if (err) {
            console.error('Error creating surveys table:', err.message);
        } else {
            console.log('Surveys table created or already exists');
        }
    });

    db.run(createSummaryTable, (err) => {
        if (err) {
            console.error('Error creating summary table:', err.message);
        } else {
            console.log('Summary table created or already exists');
        }
    });
}

// Helper function to calculate scores using OSDI formula
function calculateScores(data) {
    const environmentQuestions = ['windy1', 'dry', 'windy2'];
    const eyeDiscomfortQuestions = ['photophobia', 'sandFeeling', 'painSwelling', 'blurredVision', 'decreasedVision'];
    const dailyHabitsQuestions = ['reading', 'nightDriving', 'computerUse', 'watchingTV'];

    const environmentScore = environmentQuestions.reduce((sum, q) => sum + (data[q] || 0), 0);
    const eyeDiscomfortScore = eyeDiscomfortQuestions.reduce((sum, q) => sum + (data[q] || 0), 0);
    const dailyHabitsScore = dailyHabitsQuestions.reduce((sum, q) => sum + (data[q] || 0), 0);
    
    const totalScore = environmentScore + eyeDiscomfortScore + dailyHabitsScore;
    const totalQuestions = environmentQuestions.length + eyeDiscomfortQuestions.length + dailyHabitsQuestions.length;
    
    // Calculate OSDI scores using formula: (score × 25) / number of questions
    const environmentOSDI = Math.round(((environmentScore * 25) / environmentQuestions.length) * 10) / 10;
    const eyeDiscomfortOSDI = Math.round(((eyeDiscomfortScore * 25) / eyeDiscomfortQuestions.length) * 10) / 10;
    const dailyHabitsOSDI = Math.round(((dailyHabitsScore * 25) / dailyHabitsQuestions.length) * 10) / 10;
    const overallOSDI = Math.round(((totalScore * 25) / totalQuestions) * 10) / 10;
    
    // Determine rating based on OSDI score
    let overallRating;
    if (overallOSDI >= 33) overallRating = 'Severe Discomfort';
    else if (overallOSDI >= 23) overallRating = 'Moderate Discomfort';
    else if (overallOSDI >= 13) overallRating = 'Mild Discomfort';
    else overallRating = 'Normal/No Significant Discomfort';

    return {
        environmentScore,
        eyeDiscomfortScore,
        dailyHabitsScore,
        totalScore,
        environmentOSDI,
        eyeDiscomfortOSDI,
        dailyHabitsOSDI,
        overallOSDI,
        overallPercentage: overallOSDI, // Keep for compatibility, but now represents OSDI score
        overallRating
    };
}

// API Routes

// Submit survey
app.post('/api/survey/submit', (req, res) => {
    const data = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // Validate required fields
    const requiredFields = [
        'windy1', 'dry', 'windy2',
        'photophobia', 'sandFeeling', 'painSwelling', 'blurredVision', 'decreasedVision',
        'reading', 'nightDriving', 'computerUse', 'watchingTV'
    ];
    
    const missingFields = requiredFields.filter(field => data[field] === undefined || data[field] === null);
    if (missingFields.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields',
            missingFields: missingFields
        });
    }

    // Calculate scores
    const scores = calculateScores(data);

    // Insert into database
    const insertSql = `
        INSERT INTO surveys (
            participant_name, ip_address, user_agent,
            windy1, dry, windy2,
            photophobia, sandFeeling, painSwelling, blurredVision, decreasedVision,
            reading, nightDriving, computerUse, watchingTV,
            environment_score, eye_discomfort_score, daily_habits_score, total_score,
            environment_osdi, eye_discomfort_osdi, daily_habits_osdi, overall_osdi,
            overall_percentage, overall_rating
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        data.participantName || null, clientIP, userAgent,
        data.windy1, data.dry, data.windy2,
        data.photophobia, data.sandFeeling, data.painSwelling, data.blurredVision, data.decreasedVision,
        data.reading, data.nightDriving, data.computerUse, data.watchingTV,
        scores.environmentScore, scores.eyeDiscomfortScore, scores.dailyHabitsScore, scores.totalScore,
        scores.environmentOSDI, scores.eyeDiscomfortOSDI, scores.dailyHabitsOSDI, scores.overallOSDI,
        scores.overallPercentage, scores.overallRating
    ];

    db.run(insertSql, values, function(err) {
        if (err) {
            console.error('Error inserting survey:', err.message);
            return res.status(500).json({
                success: false,
                message: 'Database error occurred'
            });
        }

        // Update daily summary
        updateDailySummary();

        res.json({
            success: true,
            message: 'Survey submitted successfully',
            surveyId: this.lastID,
            scores: scores
        });
    });
});

// Get survey statistics
app.get('/api/survey/stats', (req, res) => {
    const statsSql = `
        SELECT 
            COUNT(*) as total_submissions,
            AVG(total_score) as avg_total_score,
            AVG(environment_score) as avg_environment_score,
            AVG(eye_discomfort_score) as avg_eye_discomfort_score,
            AVG(daily_habits_score) as avg_daily_habits_score,
            AVG(overall_osdi) as avg_osdi_score,
            AVG(environment_osdi) as avg_environment_osdi,
            AVG(eye_discomfort_osdi) as avg_eye_discomfort_osdi,
            AVG(daily_habits_osdi) as avg_daily_habits_osdi,
            MIN(submission_time) as first_submission,
            MAX(submission_time) as last_submission
        FROM surveys
    `;

    const ratingDistributionSql = `
        SELECT 
            overall_rating,
            COUNT(*) as count,
            ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM surveys), 2) as percentage
        FROM surveys 
        GROUP BY overall_rating
        ORDER BY count DESC
    `;

    db.get(statsSql, (err, stats) => {
        if (err) {
            console.error('Error fetching stats:', err.message);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        db.all(ratingDistributionSql, (err, distribution) => {
            if (err) {
                console.error('Error fetching distribution:', err.message);
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            res.json({
                success: true,
                stats: {
                    ...stats,
                    avg_total_score: Math.round(stats.avg_total_score * 10) / 10,
                    avg_environment_score: Math.round(stats.avg_environment_score * 10) / 10,
                    avg_eye_discomfort_score: Math.round(stats.avg_eye_discomfort_score * 10) / 10,
                    avg_daily_habits_score: Math.round(stats.avg_daily_habits_score * 10) / 10,
                    avg_osdi_score: Math.round(stats.avg_osdi_score * 10) / 10,
                    avg_environment_osdi: Math.round(stats.avg_environment_osdi * 10) / 10,
                    avg_eye_discomfort_osdi: Math.round(stats.avg_eye_discomfort_osdi * 10) / 10,
                    avg_daily_habits_osdi: Math.round(stats.avg_daily_habits_osdi * 10) / 10
                },
                ratingDistribution: distribution
            });
        });
    });
});

// Get recent submissions
app.get('/api/survey/recent/:limit?', (req, res) => {
    const limit = parseInt(req.params.limit) || 10;
    
    const sql = `
        SELECT 
            id, submission_time, participant_name,
            environment_score, eye_discomfort_score, daily_habits_score, total_score,
            environment_osdi, eye_discomfort_osdi, daily_habits_osdi, overall_osdi,
            overall_percentage, overall_rating
        FROM surveys 
        ORDER BY submission_time DESC 
        LIMIT ?
    `;

    db.all(sql, [limit], (err, rows) => {
        if (err) {
            console.error('Error fetching recent submissions:', err.message);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        // Return data directly as array for admin.html compatibility
        res.json(rows);
    });
});

// Export all data (for admin)
app.get('/api/survey/export', (req, res) => {
    const sql = 'SELECT * FROM surveys ORDER BY submission_time DESC';
    
    db.all(sql, (err, rows) => {
        if (err) {
            console.error('Error exporting data:', err.message);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({
            success: true,
            data: rows,
            exportTime: new Date().toISOString()
        });
    });
});

// Update daily summary
function updateDailySummary() {
    const today = new Date().toISOString().split('T')[0];
    
    const updateSql = `
        INSERT OR REPLACE INTO survey_summary (
            date, total_submissions, avg_total_score, 
            avg_environment_score, avg_eye_discomfort_score, avg_daily_habits_score,
            updated_at
        )
        SELECT 
            ? as date,
            COUNT(*) as total_submissions,
            AVG(total_score) as avg_total_score,
            AVG(environment_score) as avg_environment_score,
            AVG(eye_discomfort_score) as avg_eye_discomfort_score,
            AVG(daily_habits_score) as avg_daily_habits_score,
            CURRENT_TIMESTAMP as updated_at
        FROM surveys 
        WHERE DATE(submission_time) = ?
    `;

    db.run(updateSql, [today, today], (err) => {
        if (err) {
            console.error('Error updating daily summary:', err.message);
        }
    });
}

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Serve remote admin page
app.get('/remote-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'remote-admin.html'));
});

// Health check API
app.get('/api/health', (req, res) => {
    db.get('SELECT COUNT(*) as count FROM surveys', (err, result) => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                message: 'Database connection failed',
                error: err.message
            });
        }
        
        res.json({
            status: 'ok',
            message: 'Server is running',
            database: 'connected',
            total_surveys: result.count,
            timestamp: new Date().toISOString()
        });
    });
});

// Export all survey data (for remote sync)
app.get('/api/survey/export', (req, res) => {
    // Optional authentication
    const authKey = req.headers.authorization;
    const expectedKey = process.env.EXPORT_AUTH_KEY || 'osdi-export-2024';
    
    if (authKey && authKey !== `Bearer ${expectedKey}`) {
        return res.status(401).json({
            success: false,
            message: 'Invalid authentication key'
        });
    }
    
    const query = `
        SELECT 
            id,
            submission_time,
            participant_name,
            overall_osdi,
            overall_rating,
            environment_osdi,
            eye_discomfort_osdi,
            daily_habits_osdi
        FROM surveys 
        ORDER BY submission_time DESC
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }
        
        const exportData = {
            export_time: new Date().toISOString(),
            version: '1.0',
            source: 'OSDI Survey System',
            total_records: rows.length,
            submissions: rows.map(row => ({
                id: row.id,
                participant_name: row.participant_name || 'Anonymous',
                submission_time: row.submission_time,
                overall_osdi: row.overall_osdi,
                overall_rating: row.overall_rating,
                environment_osdi: row.environment_osdi,
                eye_discomfort_osdi: row.eye_discomfort_osdi,
                daily_habits_osdi: row.daily_habits_osdi
            }))
        };
        
        res.json(exportData);
    });
});

// Export as CSV format
app.get('/api/survey/export-csv', (req, res) => {
    const authKey = req.headers.authorization;
    const expectedKey = process.env.EXPORT_AUTH_KEY || 'osdi-export-2024';
    
    if (authKey && authKey !== `Bearer ${expectedKey}`) {
        return res.status(401).json({
            success: false,
            message: 'Invalid authentication key'
        });
    }
    
    const query = `
        SELECT 
            participant_name,
            submission_time,
            overall_osdi,
            overall_rating
        FROM surveys 
        ORDER BY submission_time DESC
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }
        
        // Generate CSV
        let csv = 'Name,Date,Score,Rating\n';
        rows.forEach(row => {
            const name = (row.participant_name || 'Anonymous').replace(/"/g, '""');
            const date = row.submission_time;
            const score = row.overall_osdi || 0;
            const rating = (row.overall_rating || '').replace(/"/g, '""');
            
            csv += `"${name}","${date}","${score}","${rating}"\n`;
        });
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="osdi-export.csv"');
        res.send(csv);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Admin panel available at http://localhost:${PORT}/admin`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});