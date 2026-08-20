const multer=require("multer");
const os = require("os");
require('dotenv').config();
const path=require("path")
//https://www.npmjs.com/package/multer multer documentation
//https://cloud.google.com/appengine/docs/flexible/nodejs/using-cloud-storage gcloud documentation
let storage=null;

if(process.env.STRATEGY_MODE==='ON_PREMISE'){
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
            //nombre generado por el servidor (evita sobrescritura y path traversal)
            cb(null,`${file.fieldname.split("-")[0]}-${Date.now()}${path.extname(file.originalname).toLowerCase()}`)
        },
        fileFilter:function(_req,file,cb){
            checkFileType(file,cb)
        }
    
    })
}

if(process.env.STRATEGY_MODE==='GCP'){
    storage=multer.memoryStorage();
}


function checkFileType(file,cb){
    const fileTypes = /\.(pdf|xlsx?|csv|png|jpe?g|gif)$/i;
    const extname =fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype || '');
    if(mimeType && extname){
        return cb(null,true);
    }else{
        cb('Formato no aceptado');
    }
}

let uploader=multer({storage:storage,limits:{
    fileSize:30 * 1024 * 1024 //archivos no mayores que 10mb
}}).fields([
    {
        name:'excel-file'
    }, {
        name:'pdf-file'
    }, {
        name:'csv-file'
    }, {
        name:'img-file'
    } 
]);

module.exports=uploader