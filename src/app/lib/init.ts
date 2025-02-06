import { initDatabase } from './db';

// Initialize database
initDatabase()
  .then(() => {
    console.log('Database initialized successfully');
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
  });
