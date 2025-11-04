import * as SQLite from 'expo-sqlite';

// Simple promisified wrapper around expo-sqlite
export const openDatabaseAsync = (name) => {
  const db = SQLite.openDatabase(name);

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
    // result.rows may contain _array or item() depending on environment
    const rows = result.rows || {};
    return rows._array || [];
  };

  const getFirstAsync = async (sql, params = []) => {
    const rows = await getAllAsync(sql, params);
    return rows[0] || { count: 0 };
  };

  const execAsync = async (sql) => {
    // Split statements by ';' and run sequentially
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
