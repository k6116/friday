
const models = require('../models/_index');
const sequelize = require('../db/sequelize').sequelize;
const Sequelize = require('sequelize');
const Treeize = require('treeize');

// // Retrieve list of all job titles and the associated job title subs
// function indexJobTitle(req, res) {

//     models.JobTitle.findAll({
//         order: [['jobTitleName', 'ASC']], 
//         attributes: ['id', 'jobTitleName', 'description'],
//         include: [{
//             model: models.JobTitleMap,
//             attributes: ['jobTitleID','jobSubTitleID'],
//             include: [{
//                 model: models.JobSubTitle,
//                 attributes: ['id', 'jobSubTitleName'],
//             }]
//         }],
        
//     })

//     .then(indexJobTitle => {
//         console.log('WORKED!')
//         res.json(indexJobTitle);
//     })
//     .catch(error => {
//         res.status(400).json({
//             title: 'Error (in catch)',
//             error: {message: error}
//         })
//     })
// }

// Retrieve list of all job titles and the associated job title subs
function indexJobTitle(req, res) {

	const sql = `
		SELECT
			J.JobTitleID as 'id',
			J.JobTitleName as 'jobTitleName',
			JS.JobSubTitleID as 'jobSubTitles:id',
			JS.JobSubTitleName as 'jobSubTitles:jobSubTitleName',
			JS.Description as 'jobSubTitles:description'
		FROM 
			resources.JobTitle J
			LEFT JOIN resources.JobTitleMap JM ON J.JobTitleID = JM.JobTitleID
            LEFT JOIN resources.JobSubTitle JS ON JM.JobSubTitleID = JS.JobSubTitleID
        ORDER BY
            J.JobTitleName
	`

	sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
	.then(indexJobTitle => {
			const jobTitleTree = new Treeize();
			jobTitleTree.grow(indexJobTitle);
			const jobTitle = jobTitleTree.getData();
			res.json(jobTitle);
	})
	.catch(error => {
			res.status(400).json({
			title: 'Error (in catch)',
			error: {message: error}
			})
	});
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
function updateEmployeeJobTitle(req,res) {
    const jobTitles = req.body;
    // const userID = req.params.userID;
    const decodedToken = token.decode(req.header('X-Token'), res);
    // console.log('JOBTITLE DATA:', jobTitles);
    return sequelize.transaction((t) => {

        return models.User
            .update(
                {
                    jobTitleID: jobTitles.newJobTitleID,
                    jobSubTitleID: jobTitles.newJobSubTitleID
                },
                {
                    where: {id: decodedToken.userData.id},
                    transaction: t
                }
            )
            .then(updateEmployeeJobTitle => {
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

// For Admin Page:
function insertJobTitle(req, res) {
    const jobTitleData = req.body;
    console.log('JOBTITLE DATA:', jobTitleData);
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
            //   console.log('created new job title: ', jobTitleData.jobTitleName);
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

function updateJobTitle(req,res) {
    const jobTitleData = req.body;
    // const id = req.params.userID;
    // console.log('JOBTITLE DATA:', jobTitleData);
    return sequelize.transaction((t) => {
        return models.JobTitle
            .update(
                {
                    jobTitleName: jobTitleData.jobTitleName,
                    description: jobTitleData.description
                },
                {
                    where: {id: jobTitleData.id},
                    transaction: t
                }
            )
            .then(updateJobTitle => {
                console.log('Updated JobTitle');
            })
        }).then(() => {
            res.json({
                message: `This jobtitle '${jobTitleData.jobTitleName}' has been updated successfully`
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
    const jobSubTitleData = req.body;
    console.log('SUBTITLE DATA:', jobSubTitleData);
    return sequelize.transaction((t) => {
        return models.JobSubTitle
            .create(
                {
                    jobSubTitleName: jobSubTitleData.jobSubTitleName,
                    description: jobSubTitleData.description,
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
            message: `The job title '${jobSubTitleData.jobSubTitleName}' has been added successfully`,
        })

    }).catch(error => {

        console.log(error);
        res.status(500).json({
            title: 'update failed',
            error: {message: error}
        });

    })
  
}

function deleteJobSubTitle(req, res) {

    const jobSubTitleData = req.body;
    console.log(`deleting job title with id: ${jobSubTitleData.jobSubTitleID}`);

    return sequelize.transaction((t) => {

    return models.JobSubTitle
    .destroy(
        {
        where: {id: jobSubTitleData.jobSubTitleID},
        transaction: t
        }
    )
    .then(deletedRecordCount => {

        console.log('number of jobTitles deleted:')
        console.log(deletedRecordCount);

    })

    }).then(() => {

    res.json({
        message: `The jobSubTitleID '${jobSubTitleData.jobSubTitleID}' has been deleted successfully`,
    })

    }).catch(error => {

    console.log(error);
    res.status(500).json({
        title: 'update failed',
        error: {message: error}
    });

    })
}

function updateJobSubTitle(req,res) {
    const jobSubTitleData = req.body;
    // const id = req.params.userID;
    console.log('JOBSUBTITLE DATA:', jobSubTitleData);
    return sequelize.transaction((t) => {
        return models.JobSubTitle
            .update(
                {
                    jobSubTitleName: jobSubTitleData.jobSubTitleName,
                    description: jobSubTitleData.description
                },
                {
                    where: {id: jobSubTitleData.id},
                    transaction: t
                }
            )
            .then(updateJobSubTitle => {
                console.log('Updated JobSubTitle');
            })
        }).then(() => {
            res.json({
                message: `This jobsubtitle '${jobSubTitleData.jobSubTitleName}' has been updated successfully`
            })
        }).catch(error => {
            console.log(error);
            res.status(500).json({
                title: 'update failed',
                error: {message: error}
            });
        })
}

function insertJobTitleMap(req, res) {
    const jobTitleMap = req.body;
    console.log('MAPDATA:', jobTitleMap);
    return sequelize.transaction((t) => {
        return models.JobTitleMap
            .create(
                {
                    jobTitleID: jobTitleMap[0].jobTitleID,
                    jobSubTitleID: jobTitleMap[0].jobSubTitleID,
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
            message: `The mapping '${jobTitleMap[0].jobTitleID}' -  '${jobTitleMap[0].jobSubTitleID}' has been added successfully`,
        })

    }).catch(error => {

        console.log(error);
        res.status(500).json({
            title: 'update failed',
            error: {message: error}
        });

    })
  
}

function deleteJobTitleMap(req, res) {
    const jobTitleMap = req.body;

    return sequelize.transaction((t) => {
    return models.JobTitleMap
    .destroy(
        {
        where: {jobTitleID: jobTitleMap[0].jobTitleID, jobSubTitleID: jobTitleMap[0].jobSubTitleID},
        transaction: t
        }
    )
    .then(deletedRecordCount => {

        console.log('number of jobTitles deleted:')
        console.log(deletedRecordCount);

    })

    }).then(() => {

    res.json({
        message: `The job title mapping '${jobTitleMap[0].jobTitleID}' - '${jobTitleMap[0].jobSubTitleID}' has been deleted successfully`,
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
    updateEmployeeJobTitle: updateEmployeeJobTitle,
    insertJobTitle: insertJobTitle,
        deleteJobTitle: deleteJobTitle,
        updateJobTitle: updateJobTitle,
        insertJobSubTitle: insertJobSubTitle,
        deleteJobSubTitle: deleteJobSubTitle,
        updateJobSubTitle: updateJobSubTitle,
        insertJobTitleMap: insertJobTitleMap,
        deleteJobTitleMap: deleteJobTitleMap    
}