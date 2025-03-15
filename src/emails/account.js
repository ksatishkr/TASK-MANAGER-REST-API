const { Resend } = require("resend");
const resendApiKey=process.env.RESEND_API_KEY
const resend = new Resend(resendApiKey);
const sendWelcomeEmail = async (email, name) => {
  await resend.emails
    .send({
      to: process.env.SEND_MAIL_TO,
      from: `${email.split("@")[0]}@resend.dev`,
      subject: "Thanks for joining in!",
      text: `Webcome to the website, ${name}. Let me know how you get along with the website?`,
    })
    // .then((res) => console.log("Email sent:", res))
    // .catch((error) => console.error(error));
};
const cancelationAccount = async (email, name) => {
  await resend.emails
    .send({
      to: process.env.SEND_MAIL_TO,
      from: `${email.split("@")[0]}@resend.dev`,
      subject: "Sorry to see you go!",
      text: `Godby, ${name}. I hope to see you back sometime soon!`,
    })
    // .then((res) => console.log("Email sent:", res))
    // .catch((error) => console.error(error));
};
module.exports = { sendWelcomeEmail, cancelationAccount };
