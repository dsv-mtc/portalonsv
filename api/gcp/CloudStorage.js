const {Storage} = require('@google-cloud/storage');
const  str = require('string-to-stream');
//reference: https://googleapis.dev/nodejs/storage/latest/
require('dotenv').config();

class CloudStorage{
    constructor(){
        this.storage = new Storage({keyFilename:process.env.SERVICE_ACCOUNT_GCP, projectId:process.env.PROJECT_ID});
        this.bucket= this.storage.bucket('onsv');
    }

    listBuckets=async()=>{
        const [buckets]=await this.storage.getBuckets();
        buckets.forEach(bucket=>console.log(bucket.name));
    }
    uploadFile=async(file,filename)=>{
        const blob=this.bucket.file(filename);
        str(file).pipe(blob.createWriteStream({resumable:false}))
        .on('error',(error)=>{console.log(error.message)})
        .on('finish',()=>{console.log('finalizo')})
       
    }
    downloadFile=async(filename)=>{
        const blob=this.bucket.file(filename);
        const data = await blob.download()
        console.log(data);

    }

}


module.exports = CloudStorage;