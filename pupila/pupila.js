const EventSource = require('eventsource');
const fs = require('fs');
const Pool = require('pg').Pool;
const secret = require('/volume/secretApi')
const pool = require('/volume/pool.js')

const NWarraySports = require('/volume/class/readMatchFiles.js')


class generalConfig {

  constructor() {}

  //please make all of this private variables

  static logFile = '/volume/program.log'                   //./program.log in production
  static dataLogFile = '/volume/dataLog.log'
  static fileMatch = '/volume/dataJson/partidos.json'
  static #timeToClose = 300000; //Predefined 5 min to close an event if don´t receive data

  static insertLog(error, method) {

    let now = new Date();

    let insert = now + '\n' + method + '\n' + error + '\n'

    fs.appendFile(generalConfig.logFile, insert, (err) => { if (err) console.log(err) })
  }

  static get getTimeToClose() {
    return this.#timeToClose;
  }
}


class matchStream {

  constructor(matchIDsc) {

    this.beginning = secret.beginning;
    this.end = secret.end;
    this.matchID = undefined;
    this.matchIDsc = matchIDsc;
    this.state = undefined;
    this.timeToClose = generalConfig.getTimeToClose; 
    this.url = this.beginning + this.matchIDsc + this.end;
    this.stream = new EventSource(this.url);
  }

  get getURL() {

    return this.url;

  }

  get getReadyStatus() {

    return this.getStream.readyState

  }

  get getMatchID() {

    return this.matchID

  }

  get getMatchIDsc() {

    return this.matchIDsc

  }

  get getLastTimeStatusData() {

    return this.lastTimeStatusData;

  }

  get getStream() {

    return this.stream

  }


  setURL(matchIDsc) {

    this.url = this.beginning + matchIDsc + this.end

  }

  async insertStreamData(state) {

    try {

      if (state.toLowerCase() == 'open') {

        let adding = await pool.DB.query(`Insert into streamdata (matchIDsc, status) VALUES ('${this.matchIDsc}','Open')`)
      }

      if (state.toLowerCase() == 'close') {

        let adding = await pool.DB.query(`Insert into streamdata (matchIDsc, status) VALUES ('${this.matchIDsc}','Close')`)
      }

    } catch (error) {
      generalConfig.insertLog(error, "Error en el insert Stream Data")
    }

  }

  async insertIDdata() {    

    try {
      
      //please add a hour check in the database
      let dateToCheck = new Date(Date.now() - (6*60*60*1000)) 
      

      let hourToCheck = dateToCheck.getFullYear() + "-" + (dateToCheck.getMonth() + 1)
      + "-" + dateToCheck.getDate() + " " + dateToCheck.getHours() + ":" + dateToCheck.getMinutes()
      + ":" + dateToCheck.getSeconds() + "." + dateToCheck.getMilliseconds();
 
      let exists = await pool.DB.query(`Select matchID from iddata where matchIDsc = '${this.matchIDsc}' and insertdate >= '${hourToCheck}' limit 1`)
      if (exists.rows && exists.rows[0]) {

        this.setMatchID(exists.rows[0]["matchid"])

      } else {

        let adding = await pool.DB.query(`Insert into iddata (matchIDsc) VALUES ('${this.matchIDsc}')`)

        exists = await pool.DB.query(`Select matchID from iddata where matchIDsc = '${this.matchIDsc}' limit 1`)
        this.setMatchID(exists.rows[0]["matchid"])

      }

    } catch (error) {
      generalConfig.insertLog(error, "error en el insert ID data")
    }
  }

  async setMatchID(matchID) {

    this.matchID = matchID;

  }

  setMatchIDscToStream() {
    // meh...cambiar para que esto se envie al dataStream
    this.stream.matchIDsc = this.matchIDsc

  }

  createOddsEvent() {

    try {
      this.stream.addEventListener('odds', this.readEventsOdds.bind(this))
    } catch (error) {

      generalConfig.insertLog(error, "create odds event Error")
    }
  }

  createMatchEvent() {

    try {
      this.getStream.addEventListener('match', this.readEventsMatch.bind(this))
    } catch (error) {
      generalConfig.insertLog(error, "Create match event error")
    }
  }

  createStatusEvent() {

    try {

      this.getStream.addEventListener('status', this.readEventsStatus.bind(this))  
      this.setLastTimeStatusData();
      this.checkReceivingData();

    } catch (error) {

      generalConfig.insertLog(error, "Create status event error")

    }
  }

  readEventsOdds(data) {

    try {

      let dataST = new dataStream(data, this.matchIDsc, this.matchID)
      dataST.setReadDate();
      dataST.processOdds();
      dataST.insertDataOdds();

    } catch (error) {

      generalConfig.insertLog(error, "read events odds error")
    }

  }

  readEventsMatch(data) {

    try {

      let dataST = new dataStream(data, this.matchIDsc, this.matchID)
      dataST.setReadDate();
      dataST.processMatch();
      dataST.insertDataMatch();

    } catch (error) {
      generalConfig.insertLog(error, "read events match error")
    }
  }

  readEventsStatus(data) {

    try {

      this.setLastTimeStatusData();
      let dataST = new dataStream(data, this.matchIDsc, this.matchID)
      dataST.setReadDate();
      dataST.processStatus();
      dataST.insertDataStatus();

    } catch (error) {

      generalConfig.insertLog(error, "read events status error")

    }
  }

  countTime(toCount, lapse) {

    let now = new Date().getTime();

    if ((now - toCount) >= lapse)
      return true
    else return false 

  }


  checkCountTime(lapse, timeToRepeat) {

    //please make this a generic method

    var interval = setInterval(() => {

      let toCount = this.getLastTimeStatusData;

      if (this.countTime(toCount, lapse)) {

        this.closeStream();
        clearInterval(interval);

      }
    }, timeToRepeat)
  }


  checkReceivingData() {

   this.checkCountTime(this.timeToClose, 60000)

  }

  setLastTimeStatusData() {

    let newDate = new Date().getTime();
    this.lastTimeStatusData = newDate

  }



  closeStream() {

    let lapse = this.timeToClose; //probably clear it
    this.getStream.close();
    this.insertStreamData("close");
    NWarraySports.deleteOfMemory(this.getMatchIDsc)
    
  }

  setStream(stream) {

    this.stream = stream;
  }
}

class dataStream {

  constructor(data, matchIDsc, matchID) {

    this.newdata = data
    this.matchIDsc = matchIDsc
    this.matchID = matchID
    this.readDate = undefined;
  }

  setReadDate() {
    let now = new Date();
    let formatNow = now.getUTCFullYear() + "-" + (now.getUTCMonth() + 1)
      + "-" + now.getUTCDate() + " " + now.getUTCHours() + ":" + now.getUTCMinutes()
      + ":" + now.getUTCSeconds() + "." + now.getUTCMilliseconds();

    this.readDate = formatNow;
  }

  processOdds() {

    this.newdata = JSON.parse(this.newdata["data"])
    // let log = JSON.stringify(this.newdata)
    // this.logData(log);
  }

  processMatch() {

    this.newdata = JSON.parse(this.newdata["data"])
    //let log = JSON.stringify(this.newdata)
    //this.logData(log);
  }

  processStatus() {

    this.newdata = JSON.parse(this.newdata["data"])
    // let log = JSON.stringify(this.newdata)
    // this.logData(log);
  }

  logData(log) {
    fs.appendFile(generalConfig.dataLogFile, "\n________________\n", (err) => { if (err) throw err })
    fs.appendFile(generalConfig.dataLogFile, log, (err) => { if (err) throw err })
  }

  parsingDataOdds(name, oddCount, indexOddsBlock, type) {

    try {
      let dataRoutes = {

        "TYPSCORE": ['typscore', this.newdata["odds"][indexOddsBlock]["typscore"]],
        "TYPPARIS": ['typparis', this.newdata["odds"][indexOddsBlock]["typparis"]],
        "OD": ['od', this.newdata["odds"][indexOddsBlock]["od"]],
        "gp": ['gp', this.newdata["odds"][indexOddsBlock]["gp"]],
        "pid": ['pid', this.newdata["odds"][indexOddsBlock]["pid"]],
        "ha": ['ha', this.clearQuotations(this.newdata["odds"][indexOddsBlock]["ha"])],
        "market": ['market', this.clearQuotations(this.newdata["odds"][indexOddsBlock]["qt"])],
        "qlid": ['qlid', this.newdata["odds"][indexOddsBlock]["qlid"]],
        "selection": ['selection', this.clearQuotations(this.newdata["odds"][indexOddsBlock]["tch"][oddCount]["act"])],
        "odds": ['odds', this.newdata["odds"][indexOddsBlock]["tch"][oddCount]["ct"]],
        "idSCodds": ['idSCodds', this.newdata["odds"][indexOddsBlock]["tch"][oddCount]["id"]],
        "cid": ['cid', this.clearQuotations(this.newdata["odds"][indexOddsBlock]["tch"][oddCount]["cid"])],
        "td": ['td', this.clearQuotations(this.newdata["odds"][indexOddsBlock]["tch"][oddCount]["td"])]
      }
  
      if (type == "field") {
  
        return dataRoutes[name][0]
  
      } else if (type == "value") {
  
        return dataRoutes[name][1]
  
      } else {
  
        throw new SyntaxError('Syntax error in parsing Data Odds Method')
  
      }
    } catch (error) {

      generalConfig.insertLog(error, "Error en el parsing data odds")
      
    }
  }

  parsingDataMatch(name, type) {

    try {

      let dataRoutes = {

        "evt": ['MatchEvent', this.clearQuotations(this.newdata["evt"])],
        "lb": ['lb', this.clearQuotations(this.newdata["lb"])],
        "icn": ['Icon', this.newdata["icn"]],
        "act1": ['Team1', this.clearQuotations(this.newdata["act1"])],
        "act2": ['Team2', this.clearQuotations(this.newdata["act2"])],
        "tp": ['Tp', this.newdata["tp"]],
        "st": ['St', this.clearQuotations(this.newdata["st"])],
        "stcourt": ['Stcourt', this.clearQuotations(this.newdata["stcourt"])],
        "stbrute": ['Atribute', this.clearQuotations(this.newdata["stbrute"])],
        "status": ['Status', this.newdata["status"]],
        "mtm": ['Minut', this.newdata["mtm"]], //falta clearQuo
        "sc": ['Score', this.clearQuotations(this.newdata["sc"])],
        "sv": ['Sv', this.newdata["sv"]],
        "ssc": ['Ssc', this.clearQuotations(this.newdata["ssc"])],
        "gsc": ['Gsc', this.clearQuotations(this.newdata["gsc"])],
        "cardyelhome": ['Cardyelhome', this.newdata["cardyelhome"]],
        "cardyelaway": ['Cardyelaway', this.newdata["cardyelaway"]],
        "cardredhome": ['Cardredhome', this.newdata["cardredhome"]],
        "cardredaway": ['Cardredaway', this.newdata["cardredaway"]],
        "cls": ['Cls', this.newdata["cls"]],
        "match_id": ['matchIDsc', this.newdata["match_id"]]
  
      }
  
      if (type == "field") {
  
        return dataRoutes[name][0]
  
      } else if (type == "value") {
  
        return dataRoutes[name][1]
  
      } else {
  
        throw new SyntaxError('Syntax error in parsing Data Match Method')
  
      }
      
    } catch (error) {

      generalConfig.insertLog(error, "Error en el parsing data match")
      
    }
  }

  parsingDataStatus(name, type) {

    try {

      let dataRoutes = {

        "active": ['Status', this.newdata["active"]],
        "match_id": ['matchIDsc', this.newdata["match_id"]]

      }

      if (type == "field") {

        return dataRoutes[name][0]

      } else if (type == "value") {

        return dataRoutes[name][1]

      } else {

        throw new SyntaxError('Syntax error in parsing Data Status Method')

      }

    } catch (error) {
      generalConfig.insertLog(error, "error en el parsingDataStatus");
    }
  }

  async insertDataOdds() {

    // improve with falsy values    

    let data = this.newdata;

    try {


      let dataOdds = data["odds"]

      if (dataOdds == undefined) {
        throw new Error("Error bucle insert data odds: ")
      }

      for (let indexOddsBlock in dataOdds) {

        let dataOddsIBlock = data["odds"][indexOddsBlock]["tch"]

        if (dataOddsIBlock == undefined) {
          throw new Error("Error bucle insert data odds: ")
        }

        for (let oddCount in dataOddsIBlock) {



          await pool.DB.query(`Insert into oddsdata
            (
              matchid,
              matchidsc,
              readDate,
            ${this.parsingDataOdds("TYPSCORE", oddCount, indexOddsBlock, "field")},
            ${this.parsingDataOdds("TYPPARIS", oddCount, indexOddsBlock, "field")},
            ${this.parsingDataOdds('OD', oddCount, indexOddsBlock, "field")},
            ${this.parsingDataOdds('gp', oddCount, indexOddsBlock, "field")},
            ${this.parsingDataOdds('pid', oddCount, indexOddsBlock, "field")},
            ${this.parsingDataOdds('ha', oddCount, indexOddsBlock, "field")},
            ${this.parsingDataOdds('market', oddCount, indexOddsBlock, "field")},
            ${this.parsingDataOdds('qlid', oddCount, indexOddsBlock, "field")},
            ${this.parsingDataOdds('selection', oddCount, indexOddsBlock, "field")},
            ${this.parsingDataOdds('odds', oddCount, indexOddsBlock, "field")},
            ${this.parsingDataOdds('idSCodds', oddCount, indexOddsBlock, "field")},
            ${this.parsingDataOdds('cid', oddCount, indexOddsBlock, "field")},
            ${this.parsingDataOdds('td', oddCount, indexOddsBlock, "field")}
            
            ) VALUES (
              
              '${this.matchID}',
              '${this.matchIDsc}',
              '${this.readDate}',
              '${this.parsingDataOdds("TYPSCORE", oddCount, indexOddsBlock, "value")}',          
            '${this.parsingDataOdds('TYPPARIS', oddCount, indexOddsBlock, "value")}',
            '${this.parsingDataOdds('OD', oddCount, indexOddsBlock, "value")}',
            '${this.parsingDataOdds('gp', oddCount, indexOddsBlock, "value")}',
            '${this.parsingDataOdds('pid', oddCount, indexOddsBlock, "value")}',
            '${this.parsingDataOdds('ha', oddCount, indexOddsBlock, "value")}',
            '${this.parsingDataOdds('market', oddCount, indexOddsBlock, "value")}',
            '${this.parsingDataOdds('qlid', oddCount, indexOddsBlock, "value")}',
            '${this.parsingDataOdds('selection', oddCount, indexOddsBlock, "value")}',
            '${this.parsingDataOdds('odds', oddCount, indexOddsBlock, "value")}',
            '${this.parsingDataOdds('idSCodds', oddCount, indexOddsBlock, "value")}',
            '${this.parsingDataOdds('cid', oddCount, indexOddsBlock, "value")}',
            '${this.parsingDataOdds('td', oddCount, indexOddsBlock, "value")}'            
            )`)

        }
      }

    } catch (error) {
      generalConfig.insertLog(error, "Error en el insert data odds")
    }
  }

  async insertDataMatch() {

    try {

      await pool.DB.query(`Insert into matchData (

              matchid, 
              readDate,                       
              ${this.parsingDataMatch('evt', "field")}, 
              ${this.parsingDataMatch('lb', "field")}, 
              ${this.parsingDataMatch('icn', "field")}, 
              ${this.parsingDataMatch('act1', "field")}, 
              ${this.parsingDataMatch('act2', "field")}, 
              ${this.parsingDataMatch('tp', "field")}, 
              ${this.parsingDataMatch('st', "field")}, 
              ${this.parsingDataMatch('stcourt', "field")}, 
              ${this.parsingDataMatch('stbrute', "field")}, 
              ${this.parsingDataMatch('status', "field")}, 
              ${this.parsingDataMatch('mtm', "field")}, 
              ${this.parsingDataMatch('sc', "field")}, 
              ${this.parsingDataMatch('sv', "field")}, 
              ${this.parsingDataMatch('ssc', "field")}, 
              ${this.parsingDataMatch('gsc', "field")}, 
              ${this.parsingDataMatch('cardyelhome', "field")}, 
              ${this.parsingDataMatch('cardyelaway', "field")}, 
              ${this.parsingDataMatch('cardredhome', "field")}, 
              ${this.parsingDataMatch('cardredaway', "field")}, 
              ${this.parsingDataMatch('cls', "field")}, 
              ${this.parsingDataMatch('match_id', "field")}
            
            
            ) VALUES (
              
              '${this.matchID}',
              '${this.readDate}',              
              '${this.parsingDataMatch('evt', "value")}', 
              '${this.parsingDataMatch('lb', "value")}', 
              '${this.parsingDataMatch('icn', "value")}', 
              '${this.parsingDataMatch('act1', "value")}', 
              '${this.parsingDataMatch('act2', "value")}', 
              '${this.parsingDataMatch('tp', "value")}', 
              '${this.parsingDataMatch('st', "value")}', 
              '${this.parsingDataMatch('stcourt', "value")}', 
              '${this.parsingDataMatch('stbrute', "value")}', 
              '${this.parsingDataMatch('status', "value")}', 
              '${this.parsingDataMatch('mtm', "value")}', 
              '${this.parsingDataMatch('sc', "value")}', 
              '${this.parsingDataMatch('sv', "value")}', 
              '${this.parsingDataMatch('ssc', "value")}', 
              '${this.parsingDataMatch('gsc', "value")}', 
              '${this.parsingDataMatch('cardyelhome', "value")}', 
              '${this.parsingDataMatch('cardyelaway', "value")}', 
              '${this.parsingDataMatch('cardredhome', "value")}', 
              '${this.parsingDataMatch('cardredaway', "value")}', 
              '${this.parsingDataMatch('cls', "value")}', 
              '${this.parsingDataMatch('match_id', "value")}'
              
              )`)

    } catch (error) {

      generalConfig.insertLog(error, "Error en el insert data match")

    }
  }

  async insertDataStatus() {

    try {

      await pool.DB.query(`Insert into statusdata (
                  matchid,
                  readDate,
                  ${this.parsingDataStatus('active', "field")}, 
                  ${this.parsingDataStatus('match_id', "field")}
                
                
                ) VALUES (
                  
                  '${this.matchID}',
                  '${this.readDate}',
                  '${this.parsingDataStatus('active', "value")}', 
                  '${this.parsingDataStatus('match_id', "value")}'
                  
                  )`)

    } catch (error) {

      generalConfig.insertLog(error, "Insert data status error")

    }
  }

  clearQuotations(data) {

    data = JSON.stringify(data).replace(/'/g, '');
    data = JSON.parse(data);

    return data

  }
}



async function start(matchIDsc) {

  try {

    let newMatchStream = new matchStream(matchIDsc);
    await newMatchStream.insertIDdata();  //este await es fundamental
    await newMatchStream.insertStreamData("open");
    handlingEvents(newMatchStream)

  } catch (error) {
    generalConfig.insertLog(error, "error en el start")
  }
}

async function handlingEvents(newMatchStream) {

  try {
    await newMatchStream.createOddsEvent();
    await newMatchStream.createMatchEvent();
    await newMatchStream.createStatusEvent();

  } catch (error) {

    generalConfig.insertLog(error, "error en el handling events")

  }
}

function watchOut() {

  const file = generalConfig.fileMatch;

  fs.watchFile(file, (curr, prev) => {

    try {

      let data = JSON.parse(fs.readFileSync(file))

      NWarraySports.setData(data);

      receivingNewFile();

    } catch (error) {

      generalConfig.insertLog(error, "error en el watchout")

    }
  })
}

function readNWdata() {

  try {
    let data = JSON.parse(fs.readFileSync(generalConfig.fileMatch))
    NWarraySports.setData(data);
    receivingNewFile();
    watchOut();

  } catch (error) {

    generalConfig.insertLog(error, 'readNWdata')
    setTimeout(readNWdata, 15000)


  }
}

function receivingNewFile() {

  try {

    NWarraySports.compare(); 
     
    
    let arr = NWarraySports.getMatchToCatch;

    for (let i in arr) {            
      start(arr[i])
    }   
    
    NWarraySports.clearMatchToCatch();

  } catch (error) {
    generalConfig.insertLog(error, 'error en el receivingNewFile')
  }
}

readNWdata();

