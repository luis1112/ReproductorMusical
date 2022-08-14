'use strict'
var express = require('express');
var morgan = require('morgan');
var path = require('path');
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('express-flash-notification');
const passport = require('passport');
const cors = require('cors');
const { Role,User} = require('./database');

//Inicializaciones
var app = express();
require('./lib/passport')(passport);

//Configuraciones
app.set('port',process.env.PORT||3000);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const flashOptions = {
    beforeSingleRender: function(item, callback){
      if (item.type) {
        switch(item.type) {
          case 'GOOD':
            item.type = 'Hecho';
            item.alertClass = 'alert-success';
            break;
          case 'OK':
            item.type = 'Info';
            item.alertClass = 'alert-info';
            break;
          case 'BAD':
            item.type = 'Error';
            item.alertClass = 'alert-danger';
            break;
        }
      }
      callback(null, item);
    }
  };

//Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use(session({
    secret:'reproductor',
    resave: true,
    saveUninitialized: false
}));
app.use(flash(app, flashOptions));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());


// Global variables
app.use((req, res, next) => {
    app.locals.user = req.user;  
    next();
  });

//Rutas
app.use(require('./routes/index'));
app.use('/user',require('./routes/user.route'))
app.use('/album',require('./routes/album.route'));
app.use('/artist',require('./routes/artist.route'));
app.use('/playlist',require('./routes/playlist.route'));
app.use('/song',require('./routes/song.route'));

//Public 


app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.listen(app.get('port'), () => {
    console.log('Servidor corriendo en el puerto', app.get('port'));
});

module.exports = app; //Se puede usar express en otras ficheros q incluyan app

//async function getIpClient() {
 // try {
   // const response = await axios.get('https://ipinfo.io/json');
    //console.log(response);
  //} catch (error) {
    //console.error(error);
  //}
//}

//getIpClient();