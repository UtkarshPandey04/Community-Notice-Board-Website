// Minimal server to test basic functionality
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Minimal server is working!',
    timestamp: new Date().toISOString(),
    routes: ['/', '/test', '/health']
  });
});

app.get('/test', (req, res) => {
  res.json({ message: 'Test route working!' });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Minimal server running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Minimal server running on port ${PORT}`);
  console.log(`📱 Test URL: http://localhost:${PORT}/`);
  console.log(`🧪 Test route: http://localhost:${PORT}/test`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
});

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
