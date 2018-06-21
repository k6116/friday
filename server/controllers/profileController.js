
const models = require('../models/_index');
const sequelize = require('../db/sequelize').sequelize;
const Sequelize = require('sequelize');

function show(req, res) {

    models.JobTitle.findAll({
        order: [['jobTitleName', 'ASC']], 
        attributes: ['id', 'jobTitleName', 'description'],
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

function insertJobTitleSub(req, res) {

	// get the project object from the request body
	const jobTitleData = req.body;

	return sequelize.transaction((t) => {

		return models.JobTitleSub
			.create(
				{
					jobTitleSubName: jobTitleData.jobTitleName,
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
			message: `The job title '${jobTitleData.jobTitleSubName}' has been added successfully`,
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
    update: update,
    insertJobTitle: insertJobTitle,
    deleteJobTitle: deleteJobTitle,
    insertJobTitleSub: insertJobTitleSub,
}