
const jwt = require('jsonwebtoken');
const dotevnv = require('dotenv').config(
  {path: '/.env'}
);

function decode(token) {

  var decodedToken;
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (decoded) {
      // console.log('decoded token:');
      // console.log(decoded);
      decodedToken = decoded;
    } else {
      decodedToken = undefined;
    }
  })

  return decodedToken;

}

module.exports = {
  decode: decode
}