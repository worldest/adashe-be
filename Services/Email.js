function sendEmail(mailObject) {

  let ElasticEmail = require('@elasticemail/elasticemail-client');

  let defaultClient = ElasticEmail.ApiClient.instance;
  let apikey = defaultClient.authentications['apikey'];
  apikey.apiKey = "0A7960B12AC9D27ED8AC46AF39610BD1A60871827CFF80104A013916558A152ABD6D8E68D5FE360410B3AC2EE615A567";
  let api = new ElasticEmail.EmailsApi();
  let mailDetails = {
    from: 'mails@plazar.com',
    to: mailObject.email,
    subject: mailObject.subject,
    text: mailObject.message
  };
  const message_ = `
    <center>
        <br /><br />
        <img src='https://cdn.dribbble.com/users/1005103/screenshots/4951068/security.gif' width='95%' style='margin: 20px auto' />
                                 
        <br />
        <p style='line-height: 1.5'>
        <br />
            ${mailDetails.text}
        <br />
        </p>
        <br />
        <hr />
        <p>Plazar</p> 
        <!--<img src="https://payload-x.com/wp-content/uploads/2023/03/cropped-default-54x72.png" width="100px" />-->
    </center>
    `;

  let email = ElasticEmail.EmailMessageData.constructFromObject({
    Recipients: [
      {
        Email: mailObject.email
      }
    ],
    Content: {
      Body: [
        ElasticEmail.BodyPart.constructFromObject({
          ContentType: "HTML",
          Content: message_
        })
      ],
      Subject: mailObject.subject,
      From: `${mailObject.from || "Plazar"} <mails@plazar.com>`
    }
  });
  let res;
  let callback = function (error, data, response) {
    if (error) {
      res = false
    } else {

      res = true
    }
  };

  api.emailsPost(email, callback)
  return res;
}
async function sendEmailExternal(mailObject) {
  console.log("sending...")
  let ElasticEmail = require('@elasticemail/elasticemail-client');

  let defaultClient = ElasticEmail.ApiClient.instance;
  let apikey = defaultClient.authentications['apikey'];
  apikey.apiKey = "0A7960B12AC9D27ED8AC46AF39610BD1A60871827CFF80104A013916558A152ABD6D8E68D5FE360410B3AC2EE615A567";
  let api = new ElasticEmail.EmailsApi();

  const message_ = mailObject.message;

  let email = ElasticEmail.EmailMessageData.constructFromObject({
    Recipients: [
      {
        Email: mailObject.email
      }
    ],
    Content: {
      Body: [
        ElasticEmail.BodyPart.constructFromObject({
          ContentType: "HTML",
          Content: message_
        })
      ],
      Subject: mailObject.subject,
      From: `${mailObject.from || "Plazar"} <mails@Plazar.com>`
    }
  });
  let res;
  let callback = function (error, data, response) {
    if (error) {
      console.log(error)
      res = false
      return false
    } else {

      res = data
      return data
    }
  };

  api.emailsPost(email, callback)
  return res;
}


// const SibApiV3Sdk = require('@getbrevo/brevo');

// let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// let apiKey = apiInstance.authentications['apiKey'];
// apiKey.apiKey = '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';

// let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();


async function sendEmailBrevo(mailObject) {
  // const message_ = `
  //   <center>
  //       <br /><br />
  //       <img src='https://cdn.dribbble.com/users/1005103/screenshots/4951068/security.gif' width='95%' style='margin: 20px auto' />

  //       <br />
  //       <p style='line-height: 1.5'>
  //       <br />
  //           ${mailObject.message}
  //       <br />
  //       </p>
  //       <br />
  //       <hr />
  //       <p>Plazar</p> 
  //       <!--<img src="https://payload-x.com/wp-content/uploads/2023/03/cropped-default-54x72.png" width="100px" />-->
  //   </center>
  //   `;

  // sendSmtpEmail.subject = mailObject.subject;
  // sendSmtpEmail.htmlContent = message_;
  // sendSmtpEmail.sender = { "name": "Plazar", "email": "mails@Plazar.com" };
  // sendSmtpEmail.to = [{ "email": mailObject.email }];

  // apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
  //   console.log('API called successfully. Returned data: ' + JSON.stringify(data));

  // }, function (error) {
  //   console.error(error);
  // });
}

async function sendEmailBrevoHappy(mailObject) {
  // const message_ = `
  //   <center>
  //       <br /><br />
  //       <img src='https://i.pinimg.com/originals/db/5a/f0/db5af0e59e914c91f51f90fee302dc51.gif' width='95%' style='margin: 20px auto' />

  //       <br />
  //       <p style='line-height: 1.5; font-size: 18px'>
  //       <br />
  //           ${mailObject.message}
  //       <br />
  //       </p>
  //       <br />
  //       <hr />
  //       <p>Plazar</p> 
  //       <!--<img src="https://payload-x.com/wp-content/uploads/2023/03/cropped-default-54x72.png" width="100px" />-->
  //   </center>
  //   `;

  // sendSmtpEmail.subject = mailObject.subject;
  // sendSmtpEmail.htmlContent = message_;
  // sendSmtpEmail.sender = { "name": "Plazar", "email": "mails@Plazar.com" };
  // sendSmtpEmail.to = [{ "email": mailObject.email }];

  // apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
  //   console.log('API called successfully. Returned data: ' + JSON.stringify(data));

  // }, function (error) {
  //   console.error(error);
  // });
}
module.exports = { sendEmail, sendEmailExternal, sendEmailBrevo, sendEmailBrevoHappy }