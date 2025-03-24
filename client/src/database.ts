// db.ts
import { Client } from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const client = new Client({
    connectionString: process.env.DATABASE_URL, // Use the DATABASE_URL from .env
});

const connectToDatabase = async () => {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL database');
    } catch (error) {
        console.error('Database connection error:', error);
    }
};

// Export the connection function and the client for use in other files
export { connectToDatabase, client };