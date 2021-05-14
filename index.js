const express=require("express");
const path=require("path");
const routes=require("./routes/routes");
const hbs=require("./controllers/hbs");
const morgan=require("morgan");

const app=express();
//Settings

app.engine("hbs",hbs.engine);
app.set("views",path.join(__dirname,"views"));
app.set("view engine","hbs");


//Usos
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname,"public/assets")));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(routes);


app.listen(process.env.PORT || 3000,()=>{
    console.log("Estamos online")
})