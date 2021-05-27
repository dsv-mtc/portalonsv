const passport = require("passport");
const Strategy=require("passport-local").Strategy;
const DataBase=require("./mysql");

const mysqlClient=new DataBase();

mysqlClient.getConnection();

passport.use('local-login', new Strategy({
    usernameField:'email',
    passwordField:'password',
    passReqToCallback:true //envía los datos request=req
},async (req,email,password,done)=>{
    const result=await mysqlClient.getUser(email)
    if(!result.success){
        return done(null,false,req.flash('login','Usuario no encontrado'))
    }
    if(result.success){
        if(!mysqlClient.comparePassword(password,result.data['password'])){
            return done(null,false,req.flash('login','Usuario o clave incorrecto'))
        }
        return done(null,result.data['user'])
    }
}))

passport.serializeUser((user,done)=>{
    console.log(user)
    done(null,user)
})
passport.deserializeUser(async (user,done)=>{
    const result=await mysqlClient.getUser(user)
    done(null,result.data);
})