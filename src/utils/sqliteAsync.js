import * as SQLite from 'expo-sqlite';

// Promisified wrapper for expo-sqlite that works with both old and new APIs
export const openDatabaseAsync = async (name) => {
  let db;
  
  // Try new API first (expo-sqlite 11+)
  if (SQLite.openDatabaseAsync) {
    db = await SQLite.openDatabaseAsync(name);
    
    // New API already returns promises, so we can use it directly
    return {
      db,
      runAsync: async (sql, params = []) => {
        return await db.runAsync(sql, params);
      },
      getAllAsync: async (sql, params = []) => {
        return await db.getAllAsync(sql, params);
      },
      getFirstAsync: async (sql, params = []) => {
        const result = await db.getFirstAsync(sql, params);
        return result || { count: 0 };
      },
      execAsync: async (sql) => {
        return await db.execAsync(sql);
      },
    };
  }
  
  // Fallback to old API (expo-sqlite 10 and earlier)
  db = SQLite.openDatabase(name);

  const runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            sql,
            params,
            (_, result) => resolve(result),
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (txError) => reject(txError)
      );
    });
  };

  const getAllAsync = async (sql, params = []) => {
    const result = await runAsync(sql, params);
    const rows = result.rows || {};
    return rows._array || [];
  };

  const getFirstAsync = async (sql, params = []) => {
    const rows = await getAllAsync(sql, params);
    return rows[0] || { count: 0 };
  };

  const execAsync = async (sql) => {
    const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      await runAsync(stmt);
    }
    return true;
  };

  return {
    db,
    runAsync,
    getAllAsync,
    getFirstAsync,
    execAsync,
  };
};

export default openDatabaseAsync;
