
const config = {
  dbname: "Jarvis_DEV",
  host: 'SPYGLASS.SRS.IS.KEYSIGHT.COM',
  username: 'JarvisRTUser',
  password: '3pineapple#',
  dialect: 'mssql'
};

const configPLM = {
  dbname: "OracleWorkSpace",
  host: 'PLMBRIDGE.COS.IS.KEYSIGHT.COM',
  username: 'DARWIN_USER',
  password: 'sp_f1nches',
  dialect: 'mssql'
};


// username: 'DARWIN_USER',
// password: 'sp_f1nches',
// username: 'IETOOLS_USER',
//   password: 'be3pH0r3ekNo!r',



module.exports = {
  config: config, 
  configPLM: configPLM
};


