'use strict'
var express = require('express');
var router = express.Router();
var passport = require('passport');

const { isLoggedIn } = require('../lib/auth');
const userController = require('../controllers/user.controller');

//Pagina de Inicio
router.get('/', (req, res) => {
    res.render('index', { title: "Magic Music" });
});

//Registro de Usuario
router.get('/signup', (req, res) => {
    res.render('auth/signup', { title: "Registro de Usuario" });
});

router.post('/signup', userController.registerUser);


//Inicio de Sesión de Usuario
router.get('/signin', (req, res) => {
    res.render('auth/signin', { title: "Inicio de Sesión" });
});

router.post('/signin', passport.authenticate('local-singin', {
    successRedirect: '/user/dashboard',
    failureRedirect: '/signin',
    failureFlash: true
}));


//Cerrar Sesión de Usuario
router.get('/logout', isLoggedIn, (req, res) => {
    req.logOut();
    res.redirect('/');
});


module.exports = router;

//function acceso(){
  //  window.location = document.formclave.clave.value + ".htm"
//}