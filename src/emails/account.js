const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
    to: email,
    from: 'andersbraath1@gmail.com',
    subject: 'Thanks for joining our task manager app!',
    text: `Welcome to the app, ${name}. Let me know if you enjoy the app or have any issues with the app.`

    });
}


const sendCancelationEmail = (email, name) => {
    sgMail.send({
    to: email,
    from: 'andersbraath1@gmail.com',
    subject: 'We`re sorry to see you go!',
    text: `Hey, ${name}. We would like to keep you as a customer. Please let us know if we can make it up to you. How does 50% OFF sound?`

    });
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}