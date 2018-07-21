
const jwt = require('jsonwebtoken');
const dotevnv = require('dotenv').config(
  {path: '/.env'}
);

function decode(token) {

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (decoded) {
      console.log('decoded token:');
      console.log(decoded);
      return decoded;
    } else {
      return undefined;
    }
  })

}

module.exports = {
  decode: decode
}