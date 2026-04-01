const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

function createDatabase(dbPath) {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new sqlite3.Database(dbPath);

  function run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function onRun(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this);
      });
    });
  }

  function get(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row || null);
      });
    });
  }

  function all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows || []);
      });
    });
  }

  function exec(sql) {
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  async function transaction(fn) {
    await run("BEGIN TRANSACTION");
    try {
      const result = await fn({ run, get, all, exec });
      await run("COMMIT");
      return result;
    } catch (error) {
      await run("ROLLBACK");
      throw error;
    }
  }

  return {
    run,
    get,
    all,
    exec,
    transaction,
    raw: db,
  };
}

module.exports = {
  createDatabase,
};
