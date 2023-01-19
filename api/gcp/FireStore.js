const { Firestore} = require('@google-cloud/firestore');
require('dotenv').config();
const crypto=require("crypto-js");
const logger= require("../../controllers/logger");
const moment=require('moment');

class CloudFirestore{ 
    constructor(){
        this.firestore = new Firestore({keyFilename:process.env.SERVICE_ACCOUNT_GCP, projectId:process.env.PROJECT_ID})
        this.collection =this.firestore.collection('users');
        this.collectionMetadata = this.firestore.collection('metadata');
        this.doc=null;
    }

    /**
     * 
     * @param {string} email 
     * @returns Retorna un usuario {id:string,email:string, password:string}
     */
    getUserByEmail=async (email)=>{
        const snapshot=await this.collection.where('email','==',email).get();
        const result=snapshot.docs.length>0?snapshot.docs[0]:null;
        if(result){
            return {success:true,data:result.data()};
        }else{
            return {success:false, message:'user doesnt exist'};
        }
    }

    getUserById=async(userId='1')=>{
        const snapshot =  await this.collection.where('id','==',userId.toString()).get();
        this.doc = snapshot.docs.length>0?snapshot.docs[0]:null;
        if(this.doc){
            return {success:true,data:this.doc.data()}
        }else{
            return {success:false,message:'user doesnt exist'}
        }

    }

    comparePassword=async (passIn,passSaved)=>{
        const passwordDecrypted=crypto.AES.decrypt(passSaved,process.env.CRYPTO_SECRET_KEY).toString(crypto.enc.Utf8);
        if(passIn == passwordDecrypted){
            return true;
        }
        return false;
    }
    /**
     * @description: Usado para guardar usuario
     * @param {string} email: El correo del usuario 
     * @param {string} password : La clave del usuario
     * @returns 
     */
    saveUser=async (email,password)=>{
        try {
            const passwordEncrypted=crypto.AES.encrypt(password,process.env.CRYPTO_SECRET_KEY);
            const docToSend={
                id:'1',
                email:email,
                password:passwordEncrypted.toString()
            }
            await this.getUserById();
            if(this.doc){
                await this.doc.ref.set(docToSend);
                return {success:true, data:'update user'}
            }else{
                await this.collection.add(docToSend)
                return {success:true,data:'save user'}
            }            
        } catch (error) {
            return {success:false,message:'Cannot save or update user'}
        }




    }

    /**
     * 
     * @param {Request} req: Request de la consulta 
     */
    saveMetadata=async(req)=>{
        const {pdfFile,excelFile,csvFile}=this.getNamesFiles(req);
        const basicUrlPath='https://storage.cloud.google.com/onsv';
        const metadata=req.body;
        const doc=this.collectionMetadata.doc();
        const id=doc.id;
        metadata.id=id;
        metadata.excelfile=excelFile?`${basicUrlPath}/${excelFile}`:null;
        metadata.pdffile=pdfFile?`${basicUrlPath}/${pdfFile}`:null;
        metadata.csvfile=csvFile?`${basicUrlPath}/${csvFile}`:null;
        metadata.date=moment().format('DD/MM/YYYY');   
        doc.set(metadata);

    }
    getMetadata=async()=>{
        return (await this.collectionMetadata.get()).docs.map(e=>e.data());
    }

    /**
     * 
     * @param {{category:string,order_by:string,ask:string}} searchValues 
     */
    getMetadataByQuery=async(searchValues)=>{
        let order_by='date';
        let order_desc='desc';
            if(searchValues.order_by=='2'){
                order_by='title'
            }
    
        if(searchValues.ask=='2'){
            order_desc='asc'
        }
        const categories=['category1','category2','category3'];
        let snapshot=[];
        let i=0;
        do {
            snapshot=await this.collectionMetadata.where(categories[i],'==',searchValues.category).orderBy(order_by).get();
            i++;           
        } while (snapshot.docs.length===0 && i<3);
        if(snapshot.docs.length>0){
            return snapshot.docs.map(e=>e.data());
        }else{
            return [];
        }


        
    }

    

    /**
     * 
     * @param {Request} req 
     */
    getNamesFiles(req){
        let excelFile=null;
        let pdfFile=null;
        let csvFile=null;
        if(req.files['excel-file']){
            excelFile=req.files['excel-file'][0].originalname;
        }
        if(req.files['pdf-file']){
            pdfFile=req.files['pdf-file'][0].originalname;
        }
        if(req.files['csv-file']){
            csvFile=req.files['csv-file'][0].originalname;
        }

        return {excelFile,pdfFile,csvFile}
    }
}

module.exports =CloudFirestore;

