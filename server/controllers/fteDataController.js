
const models = require('../models/_index')
const sequelize = require('../db/sequelize').sequelize;
const Treeize = require('treeize');


function getFteData(req, res) {

    const userID = req.params.userID;
    sequelize.query('EXECUTE brcheung.DisplayFTE :userID', {replacements: {userID: userID}, type: sequelize.QueryTypes.SELECT})
    .then(results => {
        const fteTree = new Treeize();
        fteTree.grow(results);
        res.json(fteTree.getData());
    })
    .catch(error => {
        res.status(400).json({
            title: 'Error (in catch)',
            error: {message: error}
        })
    });

}

module.exports = {
    getFteData: getFteData
}
