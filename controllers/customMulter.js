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
				//nombre generado por el servidor (evita sobrescritura y path traversal)
				cb(null, `${file.fieldname.split("-")[0]}-${Date.now()}${path.extname(file.originalname).toLowerCase()}`)
		},
		fileFilter:function(_req,file,cb){
				checkFileType(file,cb)
		}
	})

function checkFileType(file,cb){
	const fileTypes = /\.(pdf|xlsx?|csv|png|jpe?g|gif)$/i;
	const extname = fileTypes.test( path.extname(file.originalname).toLowerCase() );
	const mimeType = fileTypes.test(file.mimetype || '');
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