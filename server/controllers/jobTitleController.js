
const models = require('../models/_index');
const sequelize = require('../db/sequelize').sequelize;
const Sequelize = require('sequelize');

// Retrieve list of all job titles and the associated job title subs
function indexJobTitle(req, res) {

    models.JobTitle.findAll({
        order: [['jobTitleName', 'ASC']], 
        attributes: ['id', 'jobTitleName'],
        include: [{
            model: models.JobTitleMap,
            attributes: ['jobTitleID'],
            include: [{
                model: models.JobSubTitle,
                attributes: ['id', 'jobSubTitleName'],
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

// Update user's job title and job title sub
function updateJobTitle(req,res) {
    const jobTitles = req.body;
    const userID = req.params.userID;
    console.log(jobTitles);
    return sequelize.transaction((t) => {

        return models.User
            .update(
                {
                    jobTitleID: jobTitles.newJobTitleID,
                    jobSubTitleID: jobTitles.newJobSubTitleID
                },
                {
                    where: {id: userID},
                    transaction: t
                }
            )
            .then(updateJobTitle => {
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
    indexJobTitle: indexJobTitle,
    updateJobTitle: updateJobTitle
}