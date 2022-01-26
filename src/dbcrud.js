export const initDBTables = async (db) => {
  const queries = `
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
            CONSTRAINT fk_server
                FOREIGN KEY (server_id)
                REFERENCES server(id)
                ON DELETE CASCADE
        );
    `;
  console.log("Initalizing DB");
  const res = await db.execute(queries);
  if (res.changes && res.changes.changes && res.changes.changes < 0) {
    throw new Error(`Error: execute failed`);
  }
};

export const createServer = async (db, data) => {
  try {
    console.log(`Creating server: ${JSON.stringify(data)}`);
    const res = await db.run(
      `INSERT INTO server (name, host, port) VALUES ("${data.name}", "${data.host}", ${data.port} );`
    );

    if (res.changes && res.changes.changes && res.changes.changes < 0) {
      console.log("Failed");
      throw new Error(`Error: execute failed`);
    }
    console.log(res.changes);
  } catch (e) {
    console.log("Failed creating server:");
    console.log(e);
  }
};

export const getServer = async (db, id = null) => {
  if (id) {
    console.log("Get single one");
    const res = await db.query(`SELECT * FROM server WHERE id=${id}`);
    return res;
  } else {
    console.log("Get all servers");
    const res = await db.query("SELECT * FROM server");
    return res.values;
  }
};

export const updateServer = async (db, id, data) => {
  const res = await db.run(
    "UPDATE server SET name=COALESCE(?, name), host=COALESCE(?, host), port=COALESCE(?, port) WHERE id=?",
    [data.name, data.host, data.port, id]
  );
  if (res.changes && res.changes.changes && res.changes.changes < 0) {
    throw new Error(`Error: execute failed`);
  }
};
