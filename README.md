# InstaJSON
## Installation
You can run this localhost if you want, just start it up with a command like:
	`MONGOLAB_URI='mongodb://heroku_app1234:random_password@dbh00.mongolab.com:27007/heroku_app1234' node app.js`

replacing `MONGO_DSN` with a formatted MongoDB DSN 

However, the preferred method is just deploying it quickly to Heroku. It's a simple 5 step process:

1. Fork or Clone this repo
2. Create a new Heroku App

 `heroku create --stack cedar`

3. Add a MongoLab database

 `heroku addons:add mongolab:starter`

4. Push to Heroku

 `git push heroku master`

5. Visit the URL Heroku tells you your app was deployed to
## Requirements

* Express
* Jade
* instagram-node-lib
* mongoose

## Copyright
Released under GPL