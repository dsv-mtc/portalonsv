const apiCloudStorage=new (require('../api/gcp/CloudStorage'));
const apiFireStore = new (require('../api/gcp/FireStore'));

/**
 *  @param {Request} req; Request
 */
const uploadFileAndRegisterMetadata=async(req)=>{
   if(!req.files){
       return {success:false}
   }
   else{
    await checkFiles(req.files)
    await apiFireStore.saveMetadata(req)
    return {success:true}
   }

}
/**
 * @description Obtiene los documentos de la metadata de los archivos de datos abiertos
 * @returns Un Array de archivos de la forma {author: string, category1: string, category2: string,category3: string, csv: string | null,
 * pdf:string | null, excel:string | null, description:string,id:string, title:string,type:string}
 */
const getDocumentsList=async()=>{
    const results=await apiFireStore.getMetadata();
    //console.log("results",results);
    return results;
}

/**
 * 
 * @param {Object} fileObject: Objeto de la forma req.files['avatar'][0] -> File o req.files['gallery'] -> Array
 */
const checkFiles=async(fileObject)=>{
    if(fileObject['excel-file']){
        const excelFile=fileObject['excel-file'][0];
        await apiCloudStorage.uploadFile(excelFile.buffer,excelFile.originalname);
    }
    if(fileObject['pdf-file']){
        const pdfFile=fileObject['pdf-file'][0];
        await apiCloudStorage.uploadFile(pdfFile.buffer,pdfFile.originalname);
    }
    if(fileObject['csv-file']){
        const csvFile=fileObject['csv-file'][0];
        await apiCloudStorage.uploadFile(csvFile.buffer,csvFile.originalname);
    }
}


module.exports={
    uploadFileAndRegisterMetadata,
    getDocumentsList
}

