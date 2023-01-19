const multer = require("multer");
const os = require("os");
require('dotenv').config();
const path=require("path");

let storage= multer
	.diskStorage({
		destination: function(req,file,cb){
			let filePath="";
			const folder=file.fieldname.split("-")[0];
			filePath=`../public/estaticos/${folder}`;
			cb(null,path.join(__dirname,filePath));
		},
		filename:function(req,file,cb){
				//file.fieldname+path.extname(file.originalname)
				cb(null,file.originalname)
		},
		fileFilter:function(_req,file,cb){
				checkFileType(file,cb)
		}
	})

function checkFileType(file,cb){
	const fileTypes = /pdf|xlxs|csv|png|jpg|jpeg/;
	const extname = fileTypes.test(	path.extname(file.originalname).toLowerCase() );
	const mimeType = fileTypes.test(file.mimeType);
	if(mimeType && extname) return cb(null,true)
	cb('Formato no aceptado')
}

let customUploader =
    multer({
			storage,
			limits:{
					fileSize:30 * 1024 * 1024 //archivos no mayores que 10mb
			}
		})
		.fields([
			{
				name:'excel-file'
			}, 
			{
				name:'pdf-file'
			}, 
			{
				name:'csv-file'
			}, 
			{
				name:'img-file'
			} 
    ]);

module.exports=customUploader