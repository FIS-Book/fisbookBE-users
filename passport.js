const passport = require('passport');
const Bearer= require('passport-http-bearer').Strategy;
const ApiKey = require('./models/apikey');

// Configuración de la estrategia Bearer
passport.use(new Bearer(
  (token, cb) => {
   ApiKey.findOne({apikey: token}, (err, user) => {
    if(err) { return cb(err);}
    if(!user){
        return cb(null, false, {message: 'Unkown apikey ' + apikey});
    } else {
        return cb(null, user);
        }   
    });
  }
))
   

module.exports = passport