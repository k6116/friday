
const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize').sequelize;
const sequelize2017 = require('../db/sequelize').sequelize2017;


function indexPrimaryKeyRefs(req, res) {
  
  const pKeyName = req.params.pKeyName;
  const pKeyValue = req.params.pKeyValue;
  const userID = req.params.userID;

  sequelize.query('EXECUTE ref.FindReferencedTables :pKeyName, :pKeyValue, :userID', {replacements: {pKeyName: pKeyName, pKeyValue: pKeyValue, userID: userID}, type: sequelize.QueryTypes.SELECT})
    .then(org => {
      console.log("returning primary key reference table list");
      console.log('EXECUTE ref.FindReferencedTables :pKeyName, :pKeyValue, :userID', {replacements: {pKeyName: pKeyName, pKeyValue: pKeyValue, userID: userID}});
      res.json(org);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });
}


module.exports = {
  indexPrimaryKeyRefs: indexPrimaryKeyRefs
}
