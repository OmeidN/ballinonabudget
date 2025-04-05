import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Global variable to track MongoDB connection status
let isMongoConnected = false;

export function getMongoConnectionStatus(): boolean {
  return isMongoConnected;
}

export function setMongoConnectionStatus(status: boolean): void {
  isMongoConnected = status;
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grocery-optimizer';

export const connectToDatabase = async (): Promise<boolean> => {
  console.log('🔍 Loaded MONGODB_URI:', MONGODB_URI);
  if (!MONGODB_URI || MONGODB_URI === 'mongodb://localhost:27017/grocery-optimizer') {
    console.log('No MongoDB URI provided or using default local URI. Database features will be limited.');
    setMongoConnectionStatus(false);
    return false;
  }
  
  try {
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30
      socketTimeoutMS: 30000, // Close sockets after 30 seconds of inactivity
      connectTimeoutMS: 5000, // Connection attempt timeout after 5 seconds
      bufferCommands: false, // Disable command buffering
    };
    
    await mongoose.connect(MONGODB_URI, options);
    console.log('Connected to MongoDB');
    setMongoConnectionStatus(true);
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    setMongoConnectionStatus(false);
    return false;
  }
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  setMongoConnectionStatus(false);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  setMongoConnectionStatus(false);
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
  setMongoConnectionStatus(true);
});

// Close MongoDB connection when the application is shutting down
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

export default mongoose;