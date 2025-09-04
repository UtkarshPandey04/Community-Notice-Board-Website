// Simple MongoDB connection test
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shadcn-ui-db';

console.log('🔍 Testing MongoDB connection...');
console.log(`📡 Connection string: ${MONGODB_URI}`);
console.log('');

// Test connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    console.log(`🗄️  Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log(`🔌 Port: ${mongoose.connection.port}`);
    console.log('');
    
    // Test creating a simple document
    const TestSchema = new mongoose.Schema({ name: String, timestamp: Date });
    const TestModel = mongoose.model('Test', TestSchema);
    
    return TestModel.create({ name: 'connection-test', timestamp: new Date() });
  })
  .then((doc) => {
    console.log('✅ Test document created successfully!');
    console.log(`📄 Document ID: ${doc._id}`);
    console.log('');
    
    // Clean up test document
    const TestModel = mongoose.model('Test');
    return TestModel.findByIdAndDelete(doc._id);
  })
  .then(() => {
    console.log('🧹 Test document cleaned up');
    console.log('');
    console.log('🎉 MongoDB is working perfectly!');
    console.log('');
    console.log('💡 Now try running the main server: npm run dev');
    
    // Close connection
    mongoose.connection.close();
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed!');
    console.error('Error details:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting steps:');
    console.log('1. Make sure MongoDB service is running');
    console.log('2. Check if port 27017 is free');
    console.log('3. Verify MongoDB is installed correctly');
    console.log('4. Check Windows Services for MongoDB');
    console.log('');
    console.log('💡 Try opening MongoDB Compass and connecting to: mongodb://localhost:27017');
    
    process.exit(1);
  });
