export const initDBTables = async (db) => {
  const queries_v1 = `
        PRAGMA foreign_keys=on;
        CREATE TABLE IF NOT EXISTS server (
            id INTEGER PRIMARY KEY NOT NULL,
            name TEXT,
            host TEXT NOT NULL,
            port UNSIGNED SMALLINT DEFAULT 8000 NOT NULL 
        );
        CREATE TABLE IF NOT EXISTS fileman_history(
            id INTEGER PRIMARY KEY NOT NULL,
            server_id INTEGER NOT NULL,
            paths TEXT DEFAULT "[]",
            last_path TEXT,
            CONSTRAINT fk_server
                FOREIGN KEY (server_id)
                REFERENCES server(id)
                ON DELETE CASCADE
        );
    `;
  // TODO: Refactor database handling to use migration, it will take long time.
  const queries_v2 = `
    CREATE TABLE IF NOT EXISTS custom_commands (
      id INTEGER PRIMARY KEY NOT NULL,
      server_id INTEGER NOT NULL,
      name TEXT,
      command TEXT NOT NULL,
      default_args TEXT
    )
  `;
  console.log("Initalizing DB");
  const res = await db.execute(queries_v1);
  if (res.changes && res.changes.changes && res.changes.changes < 0) {
    throw new Error(`Error: execute failed`);
  }
  const res2 = await db.execute(queries_v2);
  if (res2.changes && res2.changes.changes && res2.changes.changes < 0) {
    throw new Error(`Error: execute failed`);
  }
};

export const createServer = async (db, data) => {
  try {
    const res = await db.run(
      "INSERT INTO server (name, host, port) VALUES (?, ?, ?);",
      [data.name, data.host, data.port]
    );

    if (res.changes && res.changes.changes && res.changes.changes < 0) {
      throw new Error("Error: execute failed");
    }
    return res;
  } catch (e) {
    console.log("Failed creating server:");
    console.log(e);
  }
};

export const getServer = async (db, id = null) => {
  if (id) {
    // const res = await db.query(`SELECT * FROM server WHERE id=${id}`);
    const res = await db.query("SELECT * FROM server WHERE id=?", [id]);
    return res;
  } else {
    const res = await db.query("SELECT * FROM server");
    return res.values;
  }
};

export const updateServerSQL = async (db, id, data) => {
  const res = await db.run(
    "UPDATE server SET name=COALESCE(?, name), host=COALESCE(?, host), port=COALESCE(?, port) WHERE id=?",
    [data.name, data.host, data.port, id]
  );
  if (res.changes && res.changes.changes && res.changes.changes < 0) {
    throw new Error("Error: execute failed");
  }
  return res;
};

export const deleteServer = async (db, id) => {
  const res = await db.run("DELETE FROM server WHERE id=?", [id]);
  console.log(res);
  return res;
};

export const createFilemanHistorySQL = async (
  db,
  serverId,
  paths = [],
  last_path = null
) => {
  console.log(`Create history for ${serverId}, ${paths}`);
  const res = await db.run(
    "INSERT INTO fileman_history (server_id, paths, last_path) VALUES(?, ?, ?)",
    [serverId, JSON.stringify(paths), JSON.stringify(last_path)]
  );
  if (res.changes && res.changes.changes && res.changes.changes < 0) {
    throw new Error("Error: execute failed");
  }
  return res;
};

export const getFilemanHistorySQL = async (db, serverId = null) => {
  if (serverId) {
    const res = await db.query(
      "SELECT * FROM fileman_history WHERE server_id=?",
      [serverId]
    );
    return res.values;
  } else {
    const res = await db.query("SELECT * FROM fileman_history");
    return res.values;
  }
};

export const UpdateFilemanHistorySQL = async (
  db,
  serverId,
  paths,
  last_path
) => {
  // Check if exists
  const historyEntry = await getFilemanHistorySQL(db, serverId);
  console.log(`Paths: ${paths}`);
  if (historyEntry.length > 0) {
    const res = await db.run(
      "UPDATE fileman_history SET paths=?, last_path=? WHERE id=?",
      [JSON.stringify(paths), JSON.stringify(last_path), historyEntry[0].id]
    );
    if (res.changes && res.changes.changes && res.changes.changes < 0) {
      throw new Error("Error: execute failed");
    }
    return res;
  } else {
    return await createFilemanHistorySQL(db, serverId, paths, last_path);
  }
};

export const createCustomCommand = async (db, data) => {
  try {
    const res = await db.run(
      "INSERT INTO custom_commands (name, server_id, command, default_args) VALUES (?, ?, ?, ?);",
      [data.name, data.server_id, data.command, data.default_args]
    );

    if (res.changes && res.changes.changes && res.changes.changes < 0) {
      throw new Error("Error: execute failed");
    }
    return res;
  } catch (e) {
    console.log("Failed creating custom command:");
    console.log(e);
  }
};

export const updateCustomCommandSQL = async (db, id, data) => {
  const res = await db.run(
    "UPDATE custom_commands SET name=COALESCE(?, name), command=COALESCE(?, command), default_args=COALESCE(?, default_args) WHERE id=?",
    [data.name, data.command, data.default_args, id]
  );
  if (res.changes && res.changes.changes && res.changes.changes < 0) {
    throw new Error("Error: execute failed");
  }
  return res;
};

export const deleteCustomCommand = async (db, id) => {
  const res = await db.run("DELETE FROM custom_commands WHERE id=?", [id]);
  console.log(res);
  return res;
};

export const getCustomCommands = async (db, serverId) => {
  const res = await db.query(
    "SELECT * FROM custom_commands where server_id=?",
    [serverId]
  );
  return res.values;
};
