
const jwt = require('jsonwebtoken');
const dotevnv = require('dotenv').config(
  {path: '/.env'}
);

function decode(token) {

  console.log('token within decode function (token.js)');
  console.log(token);

  var decodedToken;
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (decoded) {
      decodedToken = decoded;
    } else {
      decodedToken = undefined;
      res.status(401).json({
        title: 'Authentication Error',
        message: `There was an issue verifying your identify.  For security you have been logged out.
          If you believe this error is invalid, please contact support`,
        error: err
      });
    }
  })

  console.log('decoded token:');
  console.log(decodedToken);

  return decodedToken;

}

module.exports = {
  decode: decode
}