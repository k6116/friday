// get environment/instance (dev, test, or prod)
const env = process.env.ENVIRONMENT;

// database configuration info for Jarvis DB on spyglass
// using .env file to switch between production and test databases
let config;

if (env === 'prod') {
  config = {
    dbname: 'ps_friday_staging',
    host: 'localhost',
    port: 5434,
    username: 'postgres',
    password: 'Qwer1234!@#$',
    dialect: 'postgres'
  };
} else {
  config = {
  dbname: 'ps_friday_staging',
  host: 'localhost',
  port: 5434,
  username: 'postgres',
  password: 'Qwer1234!@#$',
  dialect: 'postgres'
  };
}

module.exports = {
  config: config
};
