const nodemailer = require('nodemailer');
const EmailTemplates = require('swig-email-templates');
const path = require('path');

function sendFTEReminder(req, res) {

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // need this
  // do not include auth / credentials
  var transporter = nodemailer.createTransport({
    host: 'smtp.cos.is.keysight.com',
    port: 25,
    secure: false
  });

  
  console.log('default path to templates folder:');
  console.log(path.join(__dirname, '/..', 'email/templates'));
  const templatePath = path.join(__dirname, '/..', 'email/templates');

  var templates = new EmailTemplates({
    root: templatePath
  });

  var context = {
    username: 'chuetzle',
    password: '!"\'<>&some-thing'
  };

  templates.render('fte-reminder.html', context, function(err, html, text, subject) {

    console.log('html:');
    console.log(html);

    let mailOptions = {
      from: '"Jarvis" <jarvis@no-reply.com>',
      to: '"Jarvis RT User" <jarvis@no-reply.com>',
      bcc: ['mike.galasso@non.keysight.com'],
      subject: 'Nodemailer Test',
      text: text,
      html: html,
      attachments: [{
        filename: 'jarivs.png',
        path: templatePath + '/jarvis.png',
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

module.exports = {
    sendFTEReminder: sendFTEReminder
};
