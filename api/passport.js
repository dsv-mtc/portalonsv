const passport = require("passport");
const Strategy=require("passport-local").Strategy;
const DataBase=require("./mysql");

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
        return done(null,result.data['id'])
    }
}))

passport.serializeUser((userId,done)=>{
    done(null,userId)
})
passport.deserializeUser(async (userId,done)=>{
    const result=await mysqlClient.getUserById(userId)
    done(null,result.data.id);
})