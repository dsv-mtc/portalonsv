const multer=require("multer");
const path=require("path")

const storage=multer.diskStorage({
    destination: function(req,file,cb){
        let filePath="";
        const folder=file.fieldname.split("-")[0]
        filePath=`../../docs_uploaded/${folder}`
        cb(null,path.join(__dirname,filePath));
    },
    filename:function(req,file,cb){
        //file.fieldname+path.extname(file.originalname)
        cb(null,file.originalname)
    }

})

let uploader=multer({storage:storage}).fields([
    {name:'excel-file'},{name:'pdf-file'},{name:'csv-file'}
]);

module.exports=uploader