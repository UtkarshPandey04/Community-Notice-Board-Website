// Simple test server to isolate route loading issues
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5001; // Use different port to avoid conflicts

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Simple test server is working!' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Simple test server running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🧪 Simple test server running on port ${PORT}`);
  console.log(`📱 Test URL: http://localhost:${PORT}/test`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
});

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
