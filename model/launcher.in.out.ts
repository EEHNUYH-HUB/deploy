import sqlite3 from 'sqlite3';

export class LauncherInAndOut {
    
    private static _Connection = () => {
        return new Promise<sqlite3.Database>((resolve, reject) => {

            var isWALMode = false;
            var IsCreateInput = false;
            var IsCreateOuput = false;
            var sqliteConnection = new sqlite3.Database('./flowline.sqlite', (err) => {
                if (err) {
                    console.error(err.message);
                    
                }
               

                // Enable WAL mode
                sqliteConnection?.run("PRAGMA journal_mode=WAL;", (err) => {
                    if (err) {
                        console.error(err.message);  
                    }

                    isWALMode= true;
                    
                    if(isWALMode && IsCreateInput &&IsCreateOuput){
                        resolve(sqliteConnection);
                    }
                });

                // Create tables if they don't exist
                sqliteConnection?.run(`CREATE TABLE IF NOT EXISTS inputs (
                    id TEXT PRIMARY KEY,
                    input TEXT
                )`, (err) => {
                    if (err) {
                        console.error(err.message);
                    }
                    IsCreateInput = true;
                    if(isWALMode && IsCreateInput &&IsCreateOuput){
                        resolve(sqliteConnection);
                    }
                });

                sqliteConnection?.run(`CREATE TABLE IF NOT EXISTS outputs (
                    id TEXT PRIMARY KEY,
                    output TEXT
                )`, (err) => {
                    if (err) {
                        console.error(err.message);
                    }
                    IsCreateOuput = true;
                    if(isWALMode && IsCreateInput &&IsCreateOuput){
                        resolve(sqliteConnection);
                    }
                });

                
            });
        });
    }

    static WriteInput =async (id: string, input: any) => {
        var sqliteConnection =  await LauncherInAndOut._Connection()
        return new Promise<void>((resolve, reject) => {
            const sql = `INSERT INTO inputs (id, input) VALUES (?, ?)`;
            sqliteConnection?.run(sql, [id, input], (err) => {
                if (err) {
                    console.error(err.message);

                }

                LauncherInAndOut._Dispose(sqliteConnection,id);
                resolve();

            });
        });
    }

    static GetInput =async (id: string) => {
        var sqliteConnection =  await LauncherInAndOut._Connection()
        return new Promise<string | null>((resolve, reject) => {
            const sql = `SELECT input FROM inputs WHERE id = ?`;
            sqliteConnection?.get(sql, [id], (err, row: any) => {
                if (err) {
                    console.error(err.message);
                    resolve(null);
                }
                
                LauncherInAndOut._Dispose(sqliteConnection,id);
                resolve(row ? row.input : null);

            });
        });
    }
    static WriteOutput =async (id: string, output: any) => {
        var sqliteConnection =  await LauncherInAndOut._Connection()
        return new Promise<void>((resolve, reject) => {
            const sql = `INSERT INTO outputs (id, output) VALUES (?, ?)`;
            sqliteConnection?.run(sql, [id, output], (err) => {
                if (err) {
                    console.error(err.message);

                }
                
                LauncherInAndOut._Dispose(sqliteConnection,id);
                resolve();

            });
        });
    }

    static GetOutput =async (id: string) => {
        var sqliteConnection =  await LauncherInAndOut._Connection()
        return new Promise<string | null>(async (resolve, reject) => {
            const sql = `SELECT output FROM outputs WHERE id = ?`;
            sqliteConnection?.get(sql, [id], (err, row: any) => {
                if (err) {
                    console.error(err.message);

                }
                
                LauncherInAndOut._Dispose(sqliteConnection,id,true);
                resolve(row ? row.output : null);

            });
        });
    }

 
    private static _DeleteInput = async (sqliteConnection:sqlite3.Database,id: string) => {
        
        return new Promise<void>((resolve, reject) => {
            const sql = `DELETE FROM inputs WHERE id = ?`;
            sqliteConnection?.run(sql, [id], (err) => {
                if (err) {
                    console.error(err.message);
                }
                resolve();
            });
        });
    }

    private  static _DeleteOutput = async (sqliteConnection:sqlite3.Database,id:string) => {
        return new Promise<void>((resolve, reject) => {
            const sql = `DELETE FROM outputs WHERE id = ?`;
            sqliteConnection?.run(sql, [id], (err) => {
                if (err) {
                    console.error(err.message);
                }
                resolve();
            });
        });
    }

    private static _Dispose =async (sqliteConnection:sqlite3.Database,id: string,isDelete:boolean=false) => {
        if (isDelete) {
            await LauncherInAndOut._DeleteInput(sqliteConnection, id)
            await LauncherInAndOut._DeleteOutput(sqliteConnection, id)
        }

        return new Promise<void>((resolve, reject) => {
            sqliteConnection?.close((err) => {
                if (err) {
                    console.error(err.message);
                }

                resolve();
            });
        });
    }
}