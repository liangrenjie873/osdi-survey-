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

// Security middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

// MongoDB connection
let db;
const connectToMongoDB = async () => {
    try {
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        db = client.db('osdi-survey');
        console.log('Connected to MongoDB Atlas');
        
        // Create indexes
        await db.collection('surveys').createIndex({ submission_time: -1 });
        await db.collection('surveys').createIndex({ ip_address: 1 });
        
        console.log('MongoDB indexes created');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Initialize MongoDB connection
if (process.env.DATABASE_TYPE === 'mongodb' && process.env.MONGODB_URI) {
    connectToMongoDB();
}

// Helper function to calculate scores
function calculateScores(data) {
    const environmentScore = (data.windy1 || 0) + (data.dry || 0) + (data.windy2 || 0);
    const eyeDiscomfortScore = (data.photophobia || 0) + (data.sandFeeling || 0) + 
                              (data.painSwelling || 0) + (data.blurredVision || 0) + 
                              (data.decreasedVision || 0);
    const dailyHabitsScore = (data.reading || 0) + (data.nightDriving || 0) + 
                            (data.computerUse || 0) + (data.watchingTV || 0);
    
    const totalScore = environmentScore + eyeDiscomfortScore + dailyHabitsScore;
    const totalQuestions = 12; // Total number of questions
    
    // Calculate OSDI scores
    const environmentOsdi = (environmentScore * 25) / 3;
    const eyeDiscomfortOsdi = (eyeDiscomfortScore * 25) / 5;
    const dailyHabitsOsdi = (dailyHabitsScore * 25) / 4;
    const overallOsdi = (totalScore * 25) / totalQuestions;
    const overallPercentage = (overallOsdi / 100) * 100;
    
    // Determine rating
    let overallRating;
    if (overallOsdi <= 12) {
        overallRating = 'Normal';
    } else if (overallOsdi <= 22) {
        overallRating = 'Mild Discomfort';
    } else if (overallOsdi <= 32) {
        overallRating = 'Moderate Discomfort';
    } else {
        overallRating = 'Severe Discomfort';
    }
    
    return {
        environment_score: environmentScore,
        eye_discomfort_score: eyeDiscomfortScore,
        daily_habits_score: dailyHabitsScore,
        total_score: totalScore,
        environment_osdi: environmentOsdi,
        eye_discomfort_osdi: eyeDiscomfortOsdi,
        daily_habits_osdi: dailyHabitsOsdi,
        overall_osdi: overallOsdi,
        overall_percentage: overallPercentage,
        overall_rating: overallRating
    };
}

// API Routes
app.post('/api/survey/submit', async (req, res) => {
    try {
        const surveyData = req.body;
        const scores = calculateScores(surveyData);
        
        const surveyRecord = {
            submission_time: new Date(),
            participant_name: surveyData.participant_name || 'Anonymous',
            ip_address: req.ip || req.connection.remoteAddress,
            user_agent: req.get('User-Agent'),
            ...surveyData,
            ...scores
        };
        
        if (process.env.DATABASE_TYPE === 'mongodb' && db) {
            // MongoDB
            const result = await db.collection('surveys').insertOne(surveyRecord);
            console.log('Survey saved to MongoDB:', result.insertedId);
        } else {
            // Fallback to local storage (for demo purposes)
            console.log('Survey data (local storage):', surveyRecord);
        }
        
        res.json({
            success: true,
            message: 'Survey submitted successfully',
            scores: scores
        });
    } catch (error) {
        console.error('Error submitting survey:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting survey'
        });
    }
});

app.get('/api/survey/stats', async (req, res) => {
    try {
        if (process.env.DATABASE_TYPE === 'mongodb' && db) {
            // MongoDB stats
            const totalSurveys = await db.collection('surveys').countDocuments();
            const avgScores = await db.collection('surveys').aggregate([
                {
                    $group: {
                        _id: null,
                        avgTotalScore: { $avg: '$total_score' },
                        avgEnvironmentScore: { $avg: '$environment_score' },
                        avgEyeDiscomfortScore: { $avg: '$eye_discomfort_score' },
                        avgDailyHabitsScore: { $avg: '$daily_habits_score' },
                        avgOverallOsdi: { $avg: '$overall_osdi' }
                    }
                }
            ]).toArray();
            
            const ratingDistribution = await db.collection('surveys').aggregate([
                {
                    $group: {
                        _id: '$overall_rating',
                        count: { $sum: 1 }
                    }
                }
            ]).toArray();
            
            res.json({
                total_surveys: totalSurveys,
                average_scores: avgScores[0] || {},
                rating_distribution: ratingDistribution
            });
        } else {
            // Fallback response
            res.json({
                total_surveys: 0,
                average_scores: {},
                rating_distribution: [],
                message: 'Database not configured'
            });
        }
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving statistics'
        });
    }
});

app.get('/api/survey/recent/:limit?', async (req, res) => {
    try {
        const limit = parseInt(req.params.limit) || 10;
        
        if (process.env.DATABASE_TYPE === 'mongodb' && db) {
            const recentSurveys = await db.collection('surveys')
                .find({})
                .sort({ submission_time: -1 })
                .limit(limit)
                .toArray();
            
            res.json(recentSurveys);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error getting recent surveys:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving recent surveys'
        });
    }
});

app.get('/api/survey/export', async (req, res) => {
    try {
        if (process.env.DATABASE_TYPE === 'mongodb' && db) {
            const allSurveys = await db.collection('surveys').find({}).toArray();
            
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 'attachment; filename=surveys.json');
            res.json(allSurveys);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error exporting surveys:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting data'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: process.env.DATABASE_TYPE || 'sqlite'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Database type: ${process.env.DATABASE_TYPE || 'sqlite'}`);
    if (process.env.DATABASE_TYPE === 'mongodb') {
        console.log('MongoDB Atlas enabled');
    }
}); 