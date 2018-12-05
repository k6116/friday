
const models = require('../models/_index');
const sequelize = require('../db/sequelize').sequelize;
const Sequelize = require('sequelize');
const Treeize = require('treeize');
const moment = require('moment');
const dotevnv = require('dotenv').config(
    {path: '/.env'}
  );
const token = require('../token/token');

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

function indexEmployeesJobTitles(req, res) {

  const employeeNumber = req.params.employeeNumber;

  sequelize.query('EXECUTE resources.EmployeeRoles :employeeNumber', {replacements: {employeeNumber: employeeNumber}, type: sequelize.QueryTypes.SELECT})
  .then(results => {
    const jobTitleTree = new Treeize();
    jobTitleTree.grow(results);
    res.json({
      nested: jobTitleTree.getData(),
      flat: results
    });
  })
  .catch(error => {
    res.status(400).json({
      title: 'Error (in catch)',
      error: {message: error}
    })
  });
}


function updateEmployeesJobTitlesBulk(req, res) {

  // This function will:
  // - Add a new user to the employees table with their designated jobTitleID and jobSubTitleID
  // - Update an employee's jobTitleID and jobSubTitleID
  // The formData object array should be in this format:

  const formData = req.body;
  const userID = req.params.userID;

  // build arrays of objects for insert and update
  const insertData = [];
  const updateData = [];
  
  formData.forEach(data => {
    // insert array
    if (data.newUser && data.jobTitleID !== null) {
      insertData.push({
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: data.fullName,
        email: data.emailAddress,
        employeeNumber: data.employeeNumber,
        jobTitleID: data.jobTitleID,
        jobSubTitleID: data.jobSubTitleID,
        roleID: data.roleID,
        createdBy: userID,
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        updatedBy: userID,
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      })
    }
    // update array
    if (!data.newUser) {
      updateData.push({
        email: data.emailAddress,
        employeeNumber: data.employeeNumber,
        jobTitleID: data.jobTitleID,
        jobSubTitleID: data.jobSubTitleID,
        updatedBy: userID,
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      })
    }

  });

  console.log('insertData')
  console.log(insertData)
  console.log('updateData')
  console.log(updateData)

  return sequelize.transaction((t) => {

    return models.User.bulkCreate(
    insertData,
    {transaction: t}
    )
    .then(savedJobTitle => {

      // update the existing records
      var promises = [];
      for (var i = 0; i < updateData.length; i++) {
          var newPromise = models.User.update(
          {
            jobTitleID: updateData[i].jobTitleID,
            jobSubTitleID: updateData[i].jobSubTitleID,
            updatedBy: userID,
            updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
          },
          {
            where: { email: updateData[i].email },
            transaction: t
          }
          );
          promises.push(newPromise);
      };
      return Promise.all(promises)
      .then(updatedJobTitle => {

        console.log(`job titles updated`);
        
      });
        
    })

  }).then(() => {

    res.json({
      message: 'Your team job title have been successfully updated!'
    })

  }).catch(error => {

    // console.log(error);
    res.status(500).json({
      message: 'update failed',
      error: error
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
  deleteJobTitleMap: deleteJobTitleMap,
  indexEmployeesJobTitles: indexEmployeesJobTitles,
  updateEmployeesJobTitlesBulk: updateEmployeesJobTitlesBulk
}