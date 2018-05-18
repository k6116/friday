
const models = require('../models/_index');
const sequelize = require('../db/sequelize').sequelize;
const Sequelize = require('sequelize');

function show(req, res) {

    models.JobTitle.findAll({
        order: [['jobTitleName', 'ASC']], 
        attributes: ['id', 'jobTitleName'],
        include: [{
            model: models.JobTitleJunction,
            attributes: ['jobTitleID'],
            include: [{
                model: models.JobTitleSub,
                attributes: ['id', 'jobTitleSubName'],
            }]
        }],
        
    })

    .then(profile => {
        console.log('WORKED!')
        res.json(profile);
    })
    .catch(error => {
        res.status(400).json({
            title: 'Error (in catch)',
            error: {message: error}
        })
    })
}

function update(req,res) {
    const jobTitles = req.body;
    const userID = req.params.userID;
    console.log(jobTitles);
    return sequelize.transaction((t) => {

        return models.User
            .update(
                {
                    jobTitleID: jobTitles.newJobTitleID,
                    jobTitleSubID: jobTitles.newJobTitleSubID
                },
                {
                    where: {id: userID},
                    transaction: t
                }
            )
            .then(updateProfile => {
                console.log('Updated Profile');
            })
    
        }).then(() => {

            res.json({
              message: `This jobtitle '${jobTitles.newJobTitleID}' and subtitle have been updated successfully`
            })
      
        }).catch(error => {
      
            console.log(error);
            res.status(500).json({
              title: 'update failed',
              error: {message: error}
            });
      
        })
      
}

module.exports = {
    show: show,
    update: update
}