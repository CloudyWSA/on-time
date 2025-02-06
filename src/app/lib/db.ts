import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Helper function to run queries
export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Initialize database tables
export async function initDatabase() {
  try {
    const createTables = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        language VARCHAR(2) DEFAULT 'en',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

      CREATE TABLE IF NOT EXISTS work_schedules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        entry_time TIME NOT NULL,
        lunch_start TIME,
        lunch_end TIME,
        exit_time TIME NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS work_schedules_user_id_idx ON work_schedules(user_id);

      CREATE TABLE IF NOT EXISTS time_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        entry_time TIME NOT NULL,
        lunch_start TIME,
        lunch_end TIME,
        exit_time TIME NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, date)
      );

      CREATE INDEX IF NOT EXISTS time_entries_user_id_date_idx ON time_entries(user_id, date);
      CREATE INDEX IF NOT EXISTS time_entries_date_idx ON time_entries(date);
    `;
    await query(createTables);
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
    throw error;
  }
}

// User related queries
export async function createUser(email: string, firstName: string, lastName: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const text = `
    INSERT INTO users (email, first_name, last_name, password)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, first_name, last_name, language
  `;
  return query(text, [email, firstName, lastName, hashedPassword]);
}

export async function getUserByEmail(email: string) {
  const text = `
    SELECT u.*, ws.entry_time, ws.lunch_start, ws.lunch_end, ws.exit_time
    FROM users u
    LEFT JOIN work_schedules ws ON u.id = ws.user_id
    WHERE u.email = $1
  `;
  const users = await query(text, [email]);
  return users[0];
}

export async function getUserById(id: string) {
  const text = `
    SELECT u.*, ws.entry_time, ws.lunch_start, ws.lunch_end, ws.exit_time
    FROM users u
    LEFT JOIN work_schedules ws ON u.id = ws.user_id
    WHERE u.id = $1
  `;
  const users = await query(text, [id]);
  return users[0];
}

export async function updateUserLanguage(userId: string, language: string) {
  const text = `
    UPDATE users
    SET language = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id, email, first_name, last_name, language
  `;
  const users = await query(text, [userId, language]);
  return users[0];
}

// Work schedule related queries
export async function updateWorkSchedule(
  userId: string,
  entryTime: string,
  lunchStart: string | null,
  lunchEnd: string | null,
  exitTime: string
) {
  const text = `
    INSERT INTO work_schedules (user_id, entry_time, lunch_start, lunch_end, exit_time)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (user_id) DO UPDATE
    SET entry_time = $2,
        lunch_start = $3,
        lunch_end = $4,
        exit_time = $5,
        updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  const schedules = await query(text, [userId, entryTime, lunchStart, lunchEnd, exitTime]);
  return schedules[0];
}

export async function getWorkSchedule(userId: string) {
  const text = 'SELECT * FROM work_schedules WHERE user_id = $1';
  const schedules = await query(text, [userId]);
  return schedules[0];
}

// Time entry related queries
interface TimeEntryData {
  userId: string;
  date: string;
  entry_time: string;
  lunch_start?: string | null;
  lunch_end?: string | null;
  exit_time: string;
}

export async function createTimeEntry(data: TimeEntryData) {
  const text = `
    INSERT INTO time_entries (
      user_id, date, entry_time, lunch_start, lunch_end, exit_time
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (user_id, date) DO UPDATE
    SET entry_time = $3,
        lunch_start = $4,
        lunch_end = $5,
        exit_time = $6,
        updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  const entries = await query(text, [
    data.userId,
    data.date,
    data.entry_time,
    data.lunch_start,
    data.lunch_end,
    data.exit_time,
  ]);
  return entries[0];
}

export async function getTimeEntriesByMonth(userId: string, year: number, month: number) {
  const text = `
    SELECT *
    FROM time_entries
    WHERE user_id = $1
    AND EXTRACT(YEAR FROM date) = $2
    AND EXTRACT(MONTH FROM date) = $3
    ORDER BY date ASC
  `;
  return query(text, [userId, year, month]);
}

export async function getTimeEntriesForMonth(userId: string, year: number, month: number) {
  const text = `
    SELECT date, entry_time, lunch_start, lunch_end, exit_time
    FROM time_entries
    WHERE user_id = $1
    AND EXTRACT(YEAR FROM date) = $2
    AND EXTRACT(MONTH FROM date) = $3
    ORDER BY date ASC
  `;
  return query(text, [userId, year, month]);
}
