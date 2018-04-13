
const models = require('../models/_index')
const sequelize = require('../db/sequelize').sequelize2;


function show(req, res) {

  const emailAddress = req.params.emailAddress;

  sequelize.query('EXECUTE dbo.GetNestedOrgJson :emailAddress', {replacements: {emailAddress: emailAddress}, type: sequelize.QueryTypes.SELECT})
    .then(org => {
      console.log("returning nested org data");
      res.json(org);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });


  // models.Org.findOne({
  //   where: { id: 1 }
  // }
  // ).then(org => {
  //   console.log("returning nested org data");
  //   res.json(org);
  // });

}

module.exports = {
  show: show
}
