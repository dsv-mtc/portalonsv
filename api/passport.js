const passport = require("passport");
const Strategy=require("passport-local").Strategy;
const DataBase=require("./mysql");
const criptoUtils=require("../utils/criptoUtils");

const mysqlClient=new DataBase();
mysqlClient.setQuery();
passport.use('local-login', new Strategy({
    usernameField:'email',
    passwordField:'password',
    passReqToCallback:true //envía los datos request=req
},async (req,email,password,done)=>{
    const result=await mysqlClient.getUserByEmail(email)
    if(!result.success){
        return done(null,false,req.flash('login','Usuario no encontrado'))
    }
    if(result.success){
        if(!mysqlClient.comparePassword(password,result.data['password'])){
            return done(null,false,req.flash('login','Usuario o clave incorrecto'))
        }
        const userEncript=criptoUtils.encryptUserId(result.data['id']);
        return done(null,userEncript)
    }
}))

passport.serializeUser((userEncript,done)=>{
    // Anteriormente solo userId
    done(null,userEncript)
})
passport.deserializeUser(async (userEncript,done)=>{
    const userId=criptoUtils.decryptUserId(userEncript)
    const result=await mysqlClient.getUserById(userId)
    const userEncript2=criptoUtils.encryptUserId(result.data['id']);
    done(null,userEncript2);
})