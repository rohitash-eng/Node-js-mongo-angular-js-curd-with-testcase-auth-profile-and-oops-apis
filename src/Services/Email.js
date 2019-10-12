require('dotenv')

const nodemailer = require('nodemailer')

class Email {
  send (options) {

    let mailConfig

    if (process.env.NODE_ENV === 'production') {
      mailConfig = {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'testersingh89@gmail.com',
          pass: '12345678'
        }
      }
    } else {
      mailConfig = {
        host: 'smtp.gmail.com',        
        port: 587,        
        auth: {
          user: 'testersingh89@gmail.com',
          pass: '123565@2014'
        },
        logger: false,
        debug: false // include SMTP traffic in the logs
      }
    }
    
    let transporter = nodemailer.createTransport(mailConfig)

    let mailOptions = {
      from: {
        name: 'Tester Singh Jaat',
        email: 'testersingh89@gmail.com'
      },
      to: options.user.email,
      subject: options.subject,
      html: options.content
    }

    transporter.sendMail(mailOptions, (error, info) => {
      if (process.env.NODE_ENV !== 'dev') {
        return {error :"Please set email configuration."};
      }
      if (error) {
        console.log(error)
      } else {
        console.log('Email sent: ' + info.response)
        console.log(nodemailer.getTestMessageUrl(info))
      }     
    })
  }
}

module.exports = new Email()
