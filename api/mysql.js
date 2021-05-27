const mysql=require("mysql");
const dotenv=require("dotenv");
const crypto=require("crypto-js");
dotenv.config();
const util=require("util");

const client=mysql.createConnection({
    host:process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database:process.env.DATABASE_NAME
})

class DataBase{
    constructor(){
        this.query=null;
    }
    getConnection=()=>{
        client.connect(
            (error)=>{
                if(!error){
                    console.log("connected")
                    
                }
                else{
                    console.error(error);
                    throw error
                }
            }
        )
        //Habilitamos el uso de asyn await
        this.query=util.promisify(client.query).bind(client);
    }
    getUser=async (user)=>{
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
    saveUser=async (email,password)=>{
        try {
            const passwordEncrypted=crypto.AES.encrypt(password,process.env.CRYPTO_SECRET_KEY);
            const queryString=`INSERT INTO ${process.env.USER_TABLE} (user,password) VALUES ("${email}","${passwordEncrypted}")`
            const result=await this.query(queryString)
            console.log(result);            
        } catch (error) {
            console.error(error);
            return {success:false,message:"Cannot save user"}
        }

    }
    comparePassword=(passIn,passSaved)=>{
        console.log(passSaved)
        const passwordDecrypted=crypto.AES.decrypt(passSaved,process.env.CRYPTO_SECRET_KEY).toString(crypto.enc.Utf8);
        console.log(passwordDecrypted)
        if(passIn == passwordDecrypted){
            return true;
        }
        return false;
    }
}


module.exports=DataBase;
