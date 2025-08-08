const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware with CSP configuration
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting - more permissive for testing
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // increased limit for testing
    message: 'Too many requests from this IP, please try again later.',
    skip: (req) => {
        // Skip rate limiting for health checks and certain IPs
        return req.path === '/api/health' || req.path === '/api/survey/recent';
    }
});
app.use('/api/', limiter);

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

// MongoDB connection
let db;
const connectToMongoDB = async () => {
    try {
        const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
        await client.connect();
        db = client.db('osdi-survey');
        console.log('Connected to MongoDB Atlas');
        
        // Create indexes
        await db.collection('surveys').createIndex({ submission_time: -1 });
        await db.collection('surveys').createIndex({ ip_address: 1 });
        
        console.log('MongoDB indexes created');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        console.log('Falling back to local storage mode');
    }
};

// Initialize MongoDB connection
connectToMongoDB();

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
        overallPercentage: overallOSDI,
        overallRating
    };
}

// API Routes

// Submit survey
app.post('/api/survey/submit', async (req, res) => {
    const data = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // Log detailed request information for debugging
    console.log('=== Survey Submission Request ===');
    console.log('Client IP:', clientIP);
    console.log('User Agent:', userAgent);
    console.log('Participant Name:', data.participantName);
    console.log('Request Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Request Body:', JSON.stringify(data, null, 2));
    console.log('Timestamp:', (() => {
        const time = new Date();
        time.setHours(time.getHours() - 3); // 减3小时显示
        return time.toISOString();
    })());
    console.log('VPN Detection:', clientIP.includes('103.') || clientIP.includes('104.') || clientIP.includes('45.') ? 'Likely VPN' : 'Regular IP');
    console.log('================================');
    
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

    try {
        const currentTime = new Date();
        currentTime.setHours(currentTime.getHours() - 3); // 减3小时显示
        
        // 确保时间是正确的
        console.log('=== Time Debug Info ===');
        console.log('Current server time:', currentTime);
        console.log('Current server time (ISO):', currentTime.toISOString());
        console.log('Current server time (local):', currentTime.toString());
        console.log('Current server time (UTC):', currentTime.toUTCString());
        console.log('Current server time (US Eastern):', currentTime.toLocaleString('en-US', {timeZone: 'America/New_York'}));
        console.log('Server timezone offset:', currentTime.getTimezoneOffset());
        console.log('Server timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
        console.log('========================');
        
        const surveyRecord = {
            submission_time: currentTime,
            participant_name: data.participantName || 'Anonymous',
            ip_address: clientIP,
            user_agent: userAgent,
            ...data,
            ...scores
        };
        
        if (db) {
            // Save to MongoDB
            const result = await db.collection('surveys').insertOne(surveyRecord);
            console.log('Survey saved to MongoDB:', result.insertedId);
            
            res.json({
                success: true,
                message: 'Survey submitted successfully',
                surveyId: result.insertedId,
                scores: scores
            });
        } else {
            // Fallback to local storage
            console.log('Survey data (local storage):', surveyRecord);
            res.json({
                success: true,
                message: 'Survey submitted successfully (local mode)',
                scores: scores
            });
        }
    } catch (error) {
        console.error('Error submitting survey:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting survey'
        });
    }
});

// Get recent submissions
app.get('/api/survey/recent/:limit?', async (req, res) => {
    const limit = parseInt(req.params.limit) || 10;
    
    try {
        if (db) {
            // Get from MongoDB
            const surveys = await db.collection('surveys')
                .find({})
                .sort({ submission_time: -1 })
                .limit(limit)
                .toArray();
            
            res.json(surveys);
        } else {
            // Fallback to empty array
            res.json([]);
        }
    } catch (error) {
        console.error('Error fetching recent submissions:', error);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

// Health check API
app.get('/api/health', async (req, res) => {
    try {
        let totalSurveys = 0;
        if (db) {
            totalSurveys = await db.collection('surveys').countDocuments();
        }
        
        res.json({
            status: 'ok',
            message: 'Server is running',
            database: db ? 'mongodb' : 'local',
            total_surveys: totalSurveys,
            timestamp: (() => {
                const time = new Date();
                time.setHours(time.getHours() - 3); // 减3小时显示
                return time.toISOString();
            })()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Database connection failed',
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Database: ${db ? 'MongoDB Atlas' : 'Local storage'}`);
}); 