const mysql=require("mysql");
const dotenv=require("dotenv");
const crypto=require("crypto-js");
dotenv.config();
const util=require("util");
const logger=require('../controllers/logger');
const  MySQLStore = require('express-mysql-session');
const dataConnection={
    host:process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database:process.env.DATABASE_NAME
}

const client=mysql.createConnection(dataConnection)

class DataBase{
    constructor(){
        this.query=null;
    }
    getConnection=()=>{
        client.connect(
            (error)=>{
                if(!error){
                    logger.info('La base de datos está conectada');
                    
                }
                else{
                    logger.error(error);
                    throw error
                }
            }
        )
        
    }
    setQuery=()=>{
    //Habilitamos el uso de asyn await
    this.query=util.promisify(client.query).bind(client);
    }
    getUserByEmail=async (user)=>{
        try {
            const queryString=`SELECT * FROM ${process.env.USER_TABLE} WHERE user="${user}" `;
            let result=await this.query(queryString)
            if(result.length>0){
                return {success:true,data:result[0]}    
            }else{
                return {success:false,message:"User not found"}
            }

        } catch (error) {
            console.error(error)
            return {success:false,message:"Cannot get user"}
        }

        
    }

    getUserById=async (id)=>{
        try {
            const queryString=`SELECT * FROM ${process.env.USER_TABLE} WHERE id="${id}" `;
            let result=await this.query(queryString)
            if(result.length>0){
                return {success:true,data:result[0]}    
            }else{
                return {success:false,message:"User not found"}
            }

        } catch (error) {
            console.error(error)
            return {success:false,message:"Cannot get user"}
        }
    }
    /**
     * @description: Guarda un usuario dentro de las tablas que es de tipo admin
     * @param {string} email: cuenta de correo para el registro 
     * @param {string} password clave asignada a la cuenta de correo
     * @returns 
     */
    saveUser=async (email,password)=>{
        try {
            const passwordEncrypted=crypto.AES.encrypt(password,process.env.CRYPTO_SECRET_KEY);
            const queryString=`INSERT INTO ${process.env.USER_TABLE} (user,password) VALUES ("${email}","${passwordEncrypted}")`
            const result=await this.query(queryString)
            return {success:true,data:result};   
        } catch (error) {
            console.error(error);
            return {success:false,message:"Cannot save user"}
        }

    }
    /**
     * @description: Compara el password ingresado con el password guardado en tabla
     * @param {string} passIn: Password ingresado 
     * @param {string} passSaved: Password guardado en tabla
     * @returns 
     */
    comparePassword=(passIn,passSaved)=>{
        const passwordDecrypted=crypto.AES.decrypt(passSaved,process.env.CRYPTO_SECRET_KEY).toString(crypto.enc.Utf8);
        if(passIn == passwordDecrypted){
            return true;
        }
        return false;
    }

    getDocuments=async ()=>{
        const queryString=`SELECT * FROM ${process.env.DOCUMENTS_TABLE} `;
        try {
            const results=await this.query(queryString);
            return {success:true,data:results}            
        } catch (error) {
            console.error(error);
            return {success:false,message:"No se pudo recuperar los datos, recargue la página"}
        }


    }
    getDocument=()=>{
        //
    }

    getDocumentsByTitle=async (title)=>{
        const queryString=`SELECT * FROM ${process.env.DOCUMENTS_TABLE} WHERE  category1='${title}' OR category2='${title}' OR category3='${title}' `;
        try {
            const results=await this.query(queryString);
            return {success:true,data:results}            
        } catch (error) {
            console.error(error);
            return {success:false,message:"No se pudo recuperar los datos, recargue la página"}
        }
    }


    saveDocument=async (data)=>{
        try {
            const {title,author,description,category1,category2,category3,type,excelfile,pdffile,csvfile} = data;
            const queryString=`INSERT INTO ${process.env.DOCUMENTS_TABLE} 
                (title,author,description,category1,category2,category3,type,excelfile,pdffile,csvfile) 
                VALUES ("${title}","${author}","${description}","${category1}","${category2}","${category3}","${type}","${excelfile}","${pdffile}","${csvfile}")`
            await this.query(queryString);
            return {success:true,message:"El documento ha sido guardado"}
        } catch (error) {
            console.error(error);
            return {success:false,message:"Al parecer algo salió mal, comuníquese con el administrador de la plataforma"}
        }
    }

    //MANEJO DE SESIONES
    //doc: https://www.cleverclouds.im/es/blog/2018/06/guardar-la-sesi%C3%B3n-en-mysql-para-el-framework-express-en-node

    sessionStore= (session)=>{
        MySQLStore(session);
        let sessionStoreVar = new MySQLStore(dataConnection);
        return sessionStoreVar;
    }
}


module.exports=DataBase;
