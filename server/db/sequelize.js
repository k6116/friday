
const Sequelize = require('sequelize');
const config = require('./config').config;


let sequelize = new Sequelize(config.dbname, config.username, config.password, {
  host: config.host,
  dialect: config.dialect
});

if (process.env.DATABASE_URL) {
  // the application is executed on Heroku ... use the postgres database
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect:  'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: true
  }
  })
} else {
  // the application is executed on the local machine ... use mysql
  sequelize = new Sequelize('ps_friday_staging', 'postgres', 'Qwer1234!@#$', config);
}

function connect() {

  sequelize
    .authenticate()
    .then(() => {
      console.log(`Postgres connection to database '${sequelize.config.database}' has been established successfully`);
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
    });

}

module.exports = {
  sequelize: sequelize,
  connect: connect
};