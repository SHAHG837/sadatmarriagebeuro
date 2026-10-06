import { SadatRecord } from '../types/record';
import { supabase, rowToSadatRecord, sadatRecordToRow } from '../lib/supabase';
import { INITIAL_RECORDS } from '../data/initialRecords';
import { isDummyRecord } from '../utils/serialHelper';

export interface SyncStatus {
  connected: boolean;
  tableReady: boolean;
  message: string;
  error?: string;
}

/**
 * Fetch records from Supabase (opportunities or sadat_records) with fallback to localStorage
 */
export async function getRecordsFromBackend(): Promise<{
  records: SadatRecord[];
  status: SyncStatus;
}> {
  try {
    // Try opportunities table first (as required by Supabase production schema)
    let { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('serial_number', { ascending: true });

    if (error) {
      // Fallback to sadat_records
      const fallback = await supabase
        .from('sadat_records')
        .select('*')
        .order('serial_number', { ascending: true });

      if (fallback.error) {
        console.warn('Supabase fetch notice:', error.message, fallback.error.message);
        const isMissingTable = 
          error.code === '42P01' || 
          error.message?.includes('does not exist') ||
          error.message?.includes('not found');

        return {
          records: loadLocalRecords(),
          status: {
            connected: !isMissingTable,
            tableReady: false,
            message: isMissingTable 
              ? 'سُپابیس سے کنکشن قائم ہے مگر ٹیبلز ابھی نہیں بنیں۔ اوپر دائیں "سُپابیس DB" سے اسکرپٹ چلائیں۔' 
              : 'سُپابیس سے رابطہ میں عارضی مسئلہ، لوکل اسٹوریج فعال ہے۔',
            error: error.message
          }
        };
      }
      data = fallback.data;
    }

    if (data && data.length > 0) {
      const allRows = data.map(rowToSadatRecord);
      
      // Identify and purge any dummy records in the background from Supabase
      const dummyRows = allRows.filter((r) => isDummyRecord(r));
      if (dummyRows.length > 0) {
        dummyRows.forEach((d) => {
          supabase.from('opportunities').delete().eq('id', d.id).then(() => {});
          supabase.from('sadat_records').delete().eq('id', d.id).then(() => {});
        });
      }

      const parsedRecords = allRows.filter((r) => !isDummyRecord(r));

      // Cache locally as backup
      localStorage.setItem('sadat_records_v1', JSON.stringify(parsedRecords));
      return {
        records: parsedRecords,
        status: {
          connected: true,
          tableReady: true,
          message: parsedRecords.length > 0
            ? 'سُپابیس لائیو ڈیٹا بیس فعال اور تمام ریکارڈز ہم آہنگ ہیں۔'
            : 'سُپابیس لائیو ڈیٹا بیس منسلک ہے اور نئے اندراج کے لیے بالکل صاف (Zero Records) ہے۔'
        }
      };
    }

    // Table exists but has no entries yet -> return empty array (no dummy data)
    localStorage.setItem('sadat_records_v1', JSON.stringify([]));
    return {
      records: [],
      status: {
        connected: true,
        tableReady: true,
        message: 'سُپابیس لائیو ڈیٹا بیس منسلک ہے اور اندراج کے لیے تیار ہے۔'
      }
    };
  } catch (err: any) {
    console.error('Supabase connection error:', err);
    return {
      records: loadLocalRecords(),
      status: {
        connected: false,
        tableReady: false,
        message: 'سُپابیس سے کنکشن قائم نہیں ہو سکا۔',
        error: err?.message
      }
    };
  }
}

/**
 * Subscribes to Supabase Realtime changes so frontend updates automatically in real-time
 */
export function subscribeToRecordsChanges(onChange: () => void): () => void {
  try {
    const channel = supabase
      .channel('realtime_opportunities_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'opportunities' },
        () => {
          onChange();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sadat_records' },
        () => {
          onChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Realtime subscription fallback:', err);
    return () => {};
  }
}

/**
 * Reset / Clear all records from backend and frontend (for Admin reset)
 */
export async function clearAllRecordsFromBackend(): Promise<{ success: boolean; error?: string }> {
  try {
    localStorage.removeItem('sadat_records_v1');
    localStorage.setItem('sadat_records_v1', JSON.stringify([]));

    // Clear backend tables completely
    await supabase.from('opportunities').delete().neq('id', '___placeholder___');
    await supabase.from('sadat_records').delete().neq('id', '___placeholder___');

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Save / Insert a record into Supabase (opportunities and sadat_records)
 */
export async function saveRecordToBackend(record: SadatRecord): Promise<{ success: boolean; error?: string }> {
  try {
    const row = sadatRecordToRow(record);
    
    // Attempt save to opportunities
    const { error: oppError } = await supabase
      .from('opportunities')
      .upsert(row, { onConflict: 'id' });

    if (!oppError) {
      return { success: true };
    }

    // If opportunities fails, try sadat_records fallback
    const { error: sadatError } = await supabase
      .from('sadat_records')
      .upsert(row, { onConflict: 'id' });

    if (sadatError && oppError) {
      console.warn('Supabase upsert failed:', oppError.message, sadatError.message);
      return { success: false, error: oppError.message || sadatError.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Delete a record from Supabase
 */
export async function deleteRecordFromBackend(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await supabase.from('opportunities').delete().eq('id', id);
    await supabase.from('sadat_records').delete().eq('id', id);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Bulk upload/sync all records into Supabase
 */
export async function syncAllRecordsToBackend(records: SadatRecord[]): Promise<{ count: number; error?: string }> {
  try {
    const rows = records.map(sadatRecordToRow);
    
    // Try opportunities first
    const { error: oppError } = await supabase
      .from('opportunities')
      .upsert(rows, { onConflict: 'id' });

    if (!oppError) {
      return { count: records.length };
    }

    // Fallback to sadat_records
    const { error: sadatError } = await supabase
      .from('sadat_records')
      .upsert(rows, { onConflict: 'id' });

    if (oppError && sadatError) {
      return { count: 0, error: oppError.message || sadatError.message };
    }

    return { count: records.length };
  } catch (err: any) {
    return { count: 0, error: err?.message };
  }
}

function loadLocalRecords(): SadatRecord[] {
  const saved = localStorage.getItem('sadat_records_v1');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Strict filter: purge any sample dummy records
        const activeUserRecords = parsed.filter((r) => !isDummyRecord(r));
        return activeUserRecords;
      }
    } catch (e) {
      console.error(e);
    }
  }
  return [];
}

