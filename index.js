const dotenv=require("dotenv");
const express=require("express");
const path=require("path");
const routes=require("./routes/routes");
const {hbs}=require("./controllers/hbs");
const morgan=require("morgan");
const flash= require("connect-flash");
const session=require("express-session");
const campaigns=require("./controllers/campaigns");
const passport=require("passport");
const cookieParser = require("cookie-parser");
const logger= require("./controllers/logger");
const {genKeyPair}=require("./utils/criptoUtils");
const helmet=require("helmet");

dotenv.config();
//check if keys exist
genKeyPair();
//calling database
//const mysqlClient = new (require("./api/mysql"))
//mysqlClient.getConnection();
//calling passport
//require("./api/passport")
const app=express();
//Settings

app.engine("hbs",hbs.engine);
app.set("views",path.join(__dirname,"views"));
app.set("view engine","hbs");


//Usos
app.use(morgan("dev"));
app.use(helmet());
app.use(cookieParser(process.env.SECRET_APPLICATION))
//Eliminar en producción
app.use(session({
    secret:process.env.SECRET_APPLICATION,
    resave:false,
    saveUninitialized:true,
}));
/*app.use(session({
    secret:process.env.SECRET_APPLICATION,
    resave:false,
    saveUninitialized:true,
    store:mysqlClient.sessionStore(session),
    cookie:{maxAge:1000*60*60*24} //Es igual a 1 día
}));
app.use(passport.initialize());
app.use(passport.session());*/
app.use(flash());
//reference:https://expressjs.com/es/4x/api.html#express.static
app.use(express.static(path.join(__dirname,"/public"),{
    etag:true,
    maxAge:'30 days',
    redirect:true,
}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(routes);


//cronjob

app.listen(process.env.PORT || 3000,async ()=>{
    //campaigns.sendingNewsLetter()
    //console.log(await campaigns._renderCampaign());
    logger.debug(`La aplicación se inició con éxito y a la escucha en el puerto ${process.env.PORT || 3000}`)
})