
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



module.exports = {
  config: config, 
  configPLM: configPLM
};


