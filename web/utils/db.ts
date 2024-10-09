import mysql from "mysql";
import {promisify} from "util";
require('dotenv').config();

if(!process.env.MYSQL_HOST){
    console.error("Missing .env MYSQL vars");
    throw Error("Missing .env MYSQL vars");
}

const pool = mysql.createPool({
    connectionLimit : 100, //important
    queueLimit: 150,
    waitForConnections:false,
    host     : process.env.MYSQL_HOST,
    user     : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASS,
    database : process.env.MYSQL_DB,
    debug    :  false
});
pool.on('acquire', function (connection) {
    console.log('Connection %d acquired', connection.threadId);
});
pool.on('connection', function (connection) {
    console.log('Connection', connection.threadId);
});
pool.on('enqueue', function () {
    console.log('Waiting for available connection slot');
});
pool.on('release', function (connection) {
    console.log('Connection %d released', connection.threadId);
});

export const query:any = async (query, params?)=>{
    try {
        //const connection:any = await getDBConnection();
        const result = await promisify(pool.query).bind(pool)(query, params);
        //connection.release();
        if(query.trim().indexOf("COUNT(*)") !== -1){
          return Object.values(result[0])[0];
        }
        return query.trim().indexOf("INSERT") === 0
            ? JSON.parse(JSON.stringify(result))
            : Object.values(JSON.parse(JSON.stringify(result)))
    } catch(err){
        console.error(err);
    }
};

export const insertTournament = async ({ organizer,
                                           organizer_display_name,
                                           whitelist,
                                           max_participants,
                                           expiration_date,
                                           start_date, courses, min_level, comment, is_live_tournament }) => {
    const code = createRandomCode(4);//TODO REVIEW if we should ensure it doesn't exist
    const queryResult = await query(
        "INSERT INTO tournaments(organizer, organizer_display_name, whitelist, max_participants, expiration_date, start_date, courses, code, min_level, comment, is_live_tournament) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        [organizer, organizer_display_name||"???",whitelist, max_participants, expiration_date, start_date, courses.join(","), code, min_level||0, comment, is_live_tournament||false]);
    const {insertId} = queryResult;

    return {ID:insertId, code};
};

export async function insertTournamentParticipant({ID, address, playfab, data, displayName}){
    const result = await query("INSERT INTO tournament_participant(ID, address, playfab, data, displayName) VALUES (?,?,?,?,?)",[ID, address, playfab, data, displayName]);
    return result.affectedRows;
}

export async function getTournamentDataByID(ID){
    const [tournament] = await query('SELECT * FROM tournaments WHERE ID = ?', ID);
    if(!tournament) return null;
    const participants = await query('SELECT *  FROM tournament_participant WHERE ID = ?', ID);

    return {
        ...tournament,
        participants
    };
}

export async function updateTournamentParticipant({ID, address, data}){
    const result = await query(`UPDATE tournament_participant SET data = ? WHERE ID = ? AND address = ?`, [
        data, ID, address
    ]);

    console.log("result update tournament_participant", result);

    return result;
}

export async function countTournaments({filter = {organizer:undefined, alive:null, onlyPublic:null}}){
    const {organizer, alive, onlyPublic} = filter;
    const filterParams = [organizer?.toLowerCase()];
    const clauses = [
        organizer?'organizer = ?':'',
        alive?`(finished IS NULL OR finished = 0)`:``,
        onlyPublic?`(whitelist IS NULL)`:''
    ].filter(i=>i);

    return await query(`SELECT COUNT(*) FROM tournaments ${!(organizer||alive||onlyPublic)?"":"WHERE"}          
        ${clauses?.length ? clauses.join(" AND "):""}
         ORDER BY start_date DESC`,
        [...filterParams.filter(i=>i)]
    );
}

export async function getTournaments({start = 0,limit = 99, filter = {organizer:undefined, alive:null, onlyPublic:null}}){
    const {organizer, alive, onlyPublic} = filter;
    const filterParams = [organizer?.toLowerCase()];

    const clauses = [
        organizer?'organizer = ?':'',
        alive?`(finished IS NULL OR finished = 0)`:``,
        onlyPublic?`(whitelist IS NULL)`:''
    ].filter(i=>i);
    const sql = `SELECT ID,code,organizer,whitelist,max_participants,expiration_date,start_date,min_level,finished,comment,is_live_tournament FROM tournaments ${!(organizer||alive||onlyPublic)?"":"WHERE"} 
        ${clauses?.length ? clauses.join(" AND "):""}
         ORDER BY start_date DESC 
         LIMIT ?,?`.replace(/\n/g,' ');
    return await query(sql,
        [...filterParams.filter(i=>i), start, limit]
    );
}

export async function getTournamentDataByCode(code){
    const [data] = await query('SELECT * FROM tournaments WHERE code = ?', code);
    if(!data) return null;
    const {ID, ...tournament} = data;
    const participants = await query('SELECT *  FROM tournament_participant WHERE ID = ?', ID);
    return {
        ID,
        ...tournament,
        participants
    };
}

function createRandomCode(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}