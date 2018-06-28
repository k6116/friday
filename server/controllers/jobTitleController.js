
const models = require('../models/_index');
const sequelize = require('../db/sequelize').sequelize;
const Sequelize = require('sequelize');

// Retrieve list of all job titles and the associated job title subs
function indexJobTitle(req, res) {

    models.JobTitle.findAll({
        order: [['jobTitleName', 'ASC']], 
        attributes: ['id', 'jobTitleName', 'description'],
        include: [{
            model: models.JobTitleMap,
            attributes: ['jobTitleID'],
            include: [{
                model: models.JobSubTitle,
                attributes: ['id', 'jobSubTitleName'],
            }]
        }],
        
    })

    .then(indexJobTitle => {
        console.log('WORKED!')
        res.json(indexJobTitle);
    })
    .catch(error => {
        res.status(400).json({
            title: 'Error (in catch)',
            error: {message: error}
        })
    })
}

function indexJobSubTitle(req, res) {

    models.JobSubTitle.findAll({
        order: [['jobSubTitleName', 'ASC']], 
        attributes: ['id', 'jobSubTitleName', 'description']        
    })

    .then(indexJobSubTitle => {
        console.log('WORKED!')
        res.json(indexJobSubTitle);
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

function insertJobTitle(req, res) {

	// get the project object from the request body
	const jobTitleData = req.body;

	return sequelize.transaction((t) => {

		return models.JobTitle
			.create(
				{
					jobTitleName: jobTitleData.jobTitleName,
					description: jobTitleData.description,
				},
				{
					transaction: t
				}
			)
			.then(savedJobTitle => {
			//   console.log('created new job title: ', savedJobTitle );
			})

	}).then(() => {

		res.json({
			message: `The job title '${jobTitleData.jobTitleName}' has been added successfully`,
		})

	}).catch(error => {

		console.log(error);
		res.status(500).json({
			title: 'update failed',
			error: {message: error}
		});

	})
  
}

function deleteJobTitle(req, res) {

	const jobTitleData = req.body;
	console.log(`deleting job title with id: ${jobTitleData.jobTitleID}`);

	return sequelize.transaction((t) => {

    return models.JobTitle
    .destroy(
        {
        where: {id: jobTitleData.jobTitleID},
        transaction: t
        }
    )
    .then(deletedRecordCount => {

        console.log('number of jobTitles deleted:')
        console.log(deletedRecordCount);

    })

	}).then(() => {

    res.json({
        message: `The jobTitleID '${jobTitleData.jobTitleID}' has been deleted successfully`,
    })

	}).catch(error => {

    console.log(error);
    res.status(500).json({
        title: 'update failed',
        error: {message: error}
    });

	})
}

function insertJobSubTitle(req, res) {

	// get the project object from the request body
	const jobTitleData = req.body;

	return sequelize.transaction((t) => {

		return models.JobSubTitle
			.create(
				{
                    // TO-DO CHAI: What is the naming?
					jobSubTitleName: jobTitleData.jobTitleName,
					description: jobTitleData.description,
				},
				{
					transaction: t
				}
			)
			.then(savedJobTitle => {
			//   console.log('created new job title: ', savedJobTitle );
			})

	}).then(() => {

		res.json({
			message: `The job title '${jobTitleData.jobSubTitleName}' has been added successfully`,
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
    indexJobSubTitle: indexJobSubTitle,
    updateJobTitle: updateJobTitle,
    insertJobTitle: insertJobTitle,
    deleteJobTitle: deleteJobTitle,
    insertJobSubTitle: insertJobSubTitle    
}