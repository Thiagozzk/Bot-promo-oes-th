const Database=require("better-sqlite3"),fs=require("fs"),path=require("path");
const dir=path.join(process.cwd(),"data");fs.mkdirSync(dir,{recursive:true});
const db=new Database(path.join(dir,"offers.db"));db.pragma("journal_mode=WAL");
db.exec(`CREATE TABLE IF NOT EXISTS offers(
 id TEXT PRIMARY KEY,title TEXT,store TEXT,url TEXT UNIQUE,image TEXT,
 old_price REAL,price REAL,discount REAL,found_at TEXT,sent_at TEXT,raw TEXT
);`);
module.exports=db;