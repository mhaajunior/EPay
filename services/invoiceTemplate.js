const keys = require('../config/keys');

module.exports = (invoice) => {
  return `<html>
    <body>
        <div>
            <h2>You got the Invoice!</h2>
            <p>Please check your invoice details below.</p>
            <p>From: ${invoice.fromName}</p>
            <p>Title: ${invoice.title}</p>
            <p>Detail: ${invoice.body}</p>
            <p>👇 Click on this link to check your invoice! 👇</p>
            <div>
                <a href="${keys.redirectDomain}">Check your invoice here</a>
            </div>
        </div>
    </body>
</html>`;
};
