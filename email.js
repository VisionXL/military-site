const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
        host: 'mail.usmarine.site',
        port: 465,
        auth: {
            user: "baseauthority@mail.usmarine.site",
            pass: "80wytRH60y"
        }
})

message = {
        from: "flexzyboi@gmail.com",
        to: "baseauthority@mail.usmarine.site",
        // to: "jflexzyofficial@yahoo.com",

        subject: "Subject",
        text: "Hello SMTP Email"
   }
transporter.sendMail(message, function(err, info){
        if (err) {
          console.log(err)
        } else {
          console.log(info);
        }
    })