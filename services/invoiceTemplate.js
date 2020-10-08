const keys = require('../config/keys');

module.exports = (invoice) => {
  return `<html>
    <body>
        <div>
            <h3>You got the Invoice!!!!</h3>
            <p>Please check your invoice details below 👇</p>
            <p>${invoice.body}</p>
            <p>👇 Click on this link to check your invoice!! 👇</p>
            <div>
                <a href="${keys.redirectDomain}">Check your invoice here</a>
            </div>
        </div>
    </body>
</html>`;
};
