const sequelize = require('../db/sequelize').sequelize;
const moment = require('moment');
const nodemailer = require('nodemailer');
const EmailTemplates = require('swig-email-templates');
const path = require('path');
const _ = require('lodash');
const models = require('../models/_index')
const Op = sequelize.Op;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const transporter = nodemailer.createTransport({
  host: 'smtp.cos.is.keysight.com',
  port: 25,
  secure: false
});

const env = process.env.ENVIRONMENT;
const templatePath = path.join(__dirname, '/..', 'email/templates');
const logoPath = path.join(__dirname,'/../..','dist/assets')
const templates = new EmailTemplates({
  root: templatePath
});


function sendFTEReminder(req, res) {

  models.User.findAll({
    attributes: ['email'],
    where: {
      email: {
        [Op.ne]: null
      }
    }
  }).then(users => {
    let emails = '';
    for (var user in users) {       
        emails = emails + users[user].email + ';';        
  }  
});


  // Q1 = 11,12,1   Q2 = 2,3,4   Q3 = 5,6,7   Q4 = 8,9,10 
  // Moment months are 0 indexed
  
  let monthRange = '';
  let quarter = '';
  if (moment().month() == 10 ) { // NOV
      monthRange = 'Nov - Jan';
      quarter = 'First'
  } else if (moment().month() == 1) { // FEB
      monthRange = 'Feb - Apr';
      quarter = 'Second'
  } else if (moment().month() == 4) { // MAY
      monthRange = 'May - Jul';
      quarter = 'Third'
  } else if (moment().month() == 7) { // AUG
      monthRange = 'Aug - Oct';
      quarter = 'Fourth'
  }

  
  console.log('default path to templates folder:');
  console.log(path.join(__dirname, '/..', 'email/templates'));

  templates.render('fte-reminder.html', null, function(err, html, text, subject) {

    // prevent email blast from non-Prod
    if (env === 'dev') {     
        emails = '';
    } 

    let mailOptions = {
      from: '"Jarvis" <jarvis@no-reply.com>',
      to: '"Jarvis RT User" <jarvis@no-reply.com>',
      bcc: [emails], 
      subject: 'FTE Quarterly Reminder',
      text: text,
      html: html.replace('{monthRange}',monthRange).replace('{quarter}',quarter).replace('{year}',moment().year().toString()),
      attachments: [{
        filename: 'JarvisLogo.png',
        path: logoPath + '/JarvisLogo.png',
        cid: 'unique@kreata.ee' //same cid value as in the html img src
      }]
    };
   
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res.json({
          message: 'email failed',
          error: error
        });
      } else {
        res.json({
          message: 'email was successfull'
        });
      }
    });
  });
}

function sendRequestProject(req, res) {

  const userID = req.params.userID;
  const ownerID = req.params.ownerID;
  const projectName = req.params.projectName;

  models.User.findOne({
    attributes: ['fullName','email'],
    where: {
      email: {
        [Op.ne]: null          
      },
      id: {
        [Op.eq]: userID
      }
    }
  }).then(userRequestor => {
  if (userRequestor) {

    models.User.findOne({
      attributes: ['fullName','email'],
      where: {
        email: {
          [Op.ne]: null          
        },
        id: {
          [Op.eq]: ownerID
        }
      }
    }).then(userOwner => {

      if (userOwner) {     

       templates.render('request-project.html', null, function(err, html, text, subject) {      
        
        let mailOptions = {
          from: '"Jarvis" <jarvis@no-reply.com>',
          to: userOwner.email,
          bcc: userRequestor.email,
          subject: 'Request for Project Participation',
          text: text,
          html: html.replace('{owner}', userOwner.fullName).replace('{requestor}', userRequestor.fullName).replace('{project}', projectName),
          attachments: [{
            filename: 'JarvisLogo.png',
            path: logoPath + '/JarvisLogo.png',
            cid: 'unique@kreata.ee' //same cid value as in the html img src
          }]
        };
           
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            res.json({
              message: 'email failed',
              error: error
            });
          } else {
            res.json({
              message: 'email was successfull'
            });
          }
        });
      });
    } else {
      res.json({
        message: 'Email Address Not Found on Project Owner'
      });
     }
  });
 } else {
  res.json({
    message: 'Email Address Not Found on Requestor'
  });
 }
});
}

function sendProjectApproval(req, res) {

  const userID = req.params.userID;
  const ownerID = req.params.ownerID;
  const projectName = req.params.projectName;
  const approved = req.params.approved;
  const comment = req.params.comment;

  models.User.findOne({
    attributes: ['fullName','email'],
    where: {
      email: {
        [Op.ne]: null          
      },
      id: {
        [Op.eq]: userID
      }
    }
  }).then(userRequestor => {
  if (userRequestor) {

    models.User.findOne({
      attributes: ['fullName','email'],
      where: {
        email: {
          [Op.ne]: null          
        },
        id: {
          [Op.eq]: ownerID
        }
      }
    }).then(userOwner => {

      if (userOwner) {     

        var template = 'approve-project.html';
        var msg = 'Project Participation Granted';
        if (approved === 'false') {  
          template = 'deny-project.html';
          msg = 'Project Participation Denied'; 
        }

       templates.render(template, null, function(err, html, text, subject) {      
        
        let mailOptions = {
          from: '"Jarvis" <jarvis@no-reply.com>',
          to: userRequestor.email,
          bcc: userOwner.email,
          subject: msg,
          text: text,
          html: html.replace('{requestor}', userRequestor.fullName).replace('{project}', projectName).replace('{comment}', comment),
          attachments: [{
            filename: 'JarvisLogo.png',
            path: logoPath + '/JarvisLogo.png',
            cid: 'unique@kreata.ee' //same cid value as in the html img src
          }]
        };
           
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            res.json({
              message: 'email failed',
              error: error
            });
          } else {
            res.json({
              message: 'email was successfull'
            });
          }
        });
      });
    } else {
      res.json({
        message: 'Email Address Not Found on Project Owner'
      });
     }
  });
 } else {
  res.json({
    message: 'Email Address Not Found on Requestor'
  });
 }
});
}

module.exports = {
    sendFTEReminder: sendFTEReminder,
    sendRequestProject: sendRequestProject,
    sendProjectApproval: sendProjectApproval
};
