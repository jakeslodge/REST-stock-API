var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
var path = require('path');
const swaggerUI = require('swagger-ui-express');
yaml = require('yamljs');
swaggerDocument=yaml.load('./swagger.yaml');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const helmet = require('helmet');
const options = require('./knexfile.js');
const knex = require('knex')(options);
const axios = require('axios').default;
var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var stocksRouter = require('./routes/stocks');

//https
const fs = require('fs');
const https = require('https');
const privateKey = fs.readFileSync('./sslcert/cert.key','utf8');
const certificate = fs.readFileSync('./sslcert/cert.pem','utf8');
const credentials = {
key: privateKey,
cert: certificate
};

var app = express();
app.use(cors())
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use((req, res, next) => {
  req.db = knex
  next()
  })
//app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/stocks', stocksRouter);
app.use('/',swaggerUI.serve,swaggerUI.setup(swaggerDocument))


//knex tester
app.get('/knex', function(req,res,next) {
  req.db.raw("SELECT VERSION()").then(
  (version) => console.log((version[0][0]))
  ).catch((err) => { console.log( err); throw err })
  res.send("Version Logged successfully");
  });


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).json({error:true,message:"not found"})
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Redirect from http port 80 to https
var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(3000);


// const server = https.createServer(credentials,app);
// server.listen(443);




module.exports = app;
