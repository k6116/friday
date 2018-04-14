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

const config2017 = {
  dbname: "JarvisResources",
  host: 'WCOSOFW2.COS.IS.KEYSIGHT.COM',
  username: 'JarvisRTUser',
  password: '3pineapple#',
  dialect: 'mssql'
};

module.exports = {
  config: config, 
  configPLM: configPLM,
  config2017: config2017
};


