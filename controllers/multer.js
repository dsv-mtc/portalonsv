const multer=require("multer");
require('dotenv').config();
const path=require("path")
//https://www.npmjs.com/package/multer multer documentation
//https://cloud.google.com/appengine/docs/flexible/nodejs/using-cloud-storage gcloud documentation
let storage=null;

if(process.env.STRATEGY_MODE==='ON_PREMISE'){
    console.log("multer")
    storage=multer.diskStorage({
        destination: function(req,file,cb){
            let filePath="";
            const folder=file.fieldname.split("-")[0];
            // filePath=`../../docs_uploaded/public/${folder}`; //ruta original
            filePath=`../../estaticos/public/${folder}`;
            //filePath =`../docs/${folder}`;
            cb(null,path.join(__dirname,filePath));
        },
        filename:function(req,file,cb){
            //file.fieldname+path.extname(file.originalname)
            cb(null,file.originalname)
        }
    
    })
}

if(process.env.STRATEGY_MODE==='GCP'){
    storage=multer.memoryStorage();
}



let uploader=multer({storage:storage,limits:{
    fileSize:5 * 1024 * 1024 //archivos no mayores que 5mb
}}).fields([
    {name:'excel-file'},{name:'pdf-file'},{name:'csv-file'}
]);

module.exports=uploader