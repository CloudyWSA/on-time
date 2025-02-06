import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Helper function to normalize dates safely
function normalizeDate(date: string | Date): string {
  if (!date) return '';
  
  try {
    // If it's already in YYYY-MM-DD format, return as is
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }

    // Convert to Date object if it's a string
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Format to YYYY-MM-DD
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error normalizing date:', error);
    return '';
  }
}

export interface TimeEntry {
  date: string;
  entry_time: string;
  lunch_start: string | null;
  lunch_end: string | null;
  exit_time: string;
}

interface TimeEntryState {
  entries: TimeEntry[];
  filledDates: Set<string>;
  isLoading: boolean;
  error: string | null;
  setEntries: (entries: TimeEntry[]) => void;
  addEntry: (entry: TimeEntry) => void;
  fetchEntries: (year: number, month: number) => Promise<void>;
}

export const useTimeEntryStore = create<TimeEntryState>()(
  devtools(
    (set, get) => ({
      entries: [],
      filledDates: new Set<string>(),
      isLoading: false,
      error: null,

      setEntries: (entries) => {
        // Normalize dates to YYYY-MM-DD format
        const normalizedEntries = entries.map(entry => ({
          ...entry,
          date: normalizeDate(entry.date)
        })).filter(entry => entry.date); // Remove entries with invalid dates
        
        const filledDates = new Set(normalizedEntries.map(entry => entry.date));
        console.log('Store: Setting normalized entries:', normalizedEntries);
        console.log('Store: Filled dates:', Array.from(filledDates));
        set({ entries: normalizedEntries, filledDates });
      },

      addEntry: (entry) => {
        set((state) => {
          // Normalize the new entry's date
          const normalizedDate = normalizeDate(entry.date);
          if (!normalizedDate) {
            console.error('Invalid date format for entry:', entry);
            return state;
          }

          const normalizedEntry = {
            ...entry,
            date: normalizedDate
          };
          
          // Remove any existing entry for the same date and add the new one
          const entries = [
            ...state.entries.filter(e => e.date !== normalizedDate),
            normalizedEntry
          ];
          
          const filledDates = new Set(entries.map(e => e.date));
          console.log('Store: Adding entry:', normalizedEntry);
          console.log('Store: Updated filled dates:', Array.from(filledDates));
          return { entries, filledDates };
        });
      },

      fetchEntries: async (year: number, month: number) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/time-entries?year=${year}&month=${month}`);
          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Failed to fetch time entries');
          }

          if (result.data) {
            // Dates should already be normalized from the API
            console.log('Store: Fetched entries:', result.data);
            get().setEntries(result.data);
          }
        } catch (error) {
          const errorMessage = (error as Error).message;
          console.error('Failed to fetch time entries:', errorMessage);
          set({ error: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      }
    })
  )
);
