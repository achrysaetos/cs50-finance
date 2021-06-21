# CS50 Finance

The classic CS50 finance web app for stock portfolio management — but fully adapted for Node.js and MongoDB (originally used Flask and SQL).

*Don't forget to add your database url and your api key to `config.js` or set them as environment variables.*

**To start:** run `DEBUG=cs50-finance:* npm run devstart` and go to http://localhost:3000.

**IMPORTANT:** `npm install` to install all dependencies
* npm install consolidate and swig to avoid using pug as the templating engine
* npm install mongoose to connect to a database for users and features
* npm install bcryptjs, body-parser, and express-validator in order to securely authenticate users
* npm install express-session in order to track user sessions
* npm install xmlhttprequest in order to get json from http url
* npm install compression and helmet to get ready for deployment

DEPLOYED!
