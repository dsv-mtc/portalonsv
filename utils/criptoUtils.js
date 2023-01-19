const crypto = require('crypto');
const fs = require('fs');
const path=require('path');
const logger=require('../controllers/logger');
const hash=crypto.createHash('sha256');
const base64url=require('base64url');

const genKeyPair=()=>{
if(!fs.existsSync(path.join(__dirname,'/keys/id_rsa_pub.pem')) && !fs.existsSync(path.join(__dirname,'/keys/id_rsa_priv.pem')) ){
    logger.info('Las llave públicas y privadas no existen, se procede a su creación')
    try {
        const keyPair =crypto.generateKeyPairSync('rsa',{
            modulusLength:4096, //bits - estándar para llaves RSA
            publicKeyEncoding:{
                type:'pkcs1', // public key cryptography standars 1
                format:'pem' //Formato mas común de las llaves
            },
            privateKeyEncoding:{
                type:'pkcs1',
                format:'pem'
            }
        })
        //creación de la llave pública
        fs.writeFileSync(path.join(__dirname,'/keys/id_rsa_pub.pem'),keyPair.publicKey);
        //creación de la llave privada
        fs.writeFileSync(path.join(__dirname,'/keys/id_rsa_priv.pem'),keyPair.privateKey);
            
    } catch (error) {
        logger.error(error)
    }
}else{
    logger.info('Las llaves públicas y privadas existen')
} 

}

const encryptWithPublicKey=(publicKey,message)=>{
    //calling publick key: publicKey = fs.readFileSync(path,'utf8)
    const bufferMessage=Buffer.from(message,'utf8');
    return crypto.publicEncrypt(publicKey,bufferMessage);
}
const encryptWithPrivateKey=(privateKey,message)=>{
    return crypto.privateEncrypt(privateKey,message);

}

const decryptWithPrivateKey=(privateKey,encryptedMessage)=>{
    return crypto.privateDecrypt(privateKey,encryptedMessage);
}

const decryptWithPublicKey=(publicKey,encryptedMessage)=>{
    return crypto.publicDecrypt(publicKey,encryptedMessage);
}

const signMessage=()=>{
    const dataString=process.env.DATA_TO_CRYPT;
    hash.update(dataString);
    const hashedData=hash.digest('hex');
    const senderPrivateKey=fs.readFileSync(path.join(__dirname,'/keys/id_rsa_pub.pem'),'utf8');
    const signedMessage=encryptWithPrivateKey(senderPrivateKey,hashedData);
    const packageOfDataToSend={
        algorithm:'sha256',
        originalData:JSON.parse(process.env.DATA_TO_CRYPT),
        signedAndEncryptedData:signedMessage
    }
    return  packageOfDataToSend;
}

const verifyIdentity=(receivedData)=>{
    // hash=crypto.createHash(receivedData.algorithm);
    const publicKey=fs.readFileSync(path.join(__dirname,'/keys/id_rsa_pub.pem'),'utf8');
    const decryptMessage=decryptWithPublicKey(publicKey,receivedData.signedAndEncryptedData);
    const decryptedMessageHex=decryptMessage.toString();
    const hashOfOriginal=hash.update(JSON.stringify(receivedData.originalData))
    const hashOfOriginalHex=hash.digest('hex');
    if(hashOfOriginalHex===decryptedMessageHex){
        logger.debug('Éxito, el sender es válido')
    }else{
        logger.warn('Cuidado, alguien está tratando de manipular la identidad')
    }
}

const encryptUserId=(userId)=>{
    const cryptThat=`${userId}-${process.env.DATA_TO_CRYPT}`;
    return base64url(cryptThat);
}

const decryptUserId=(userCrypted)=>{
    const decryptThat=base64url.decode(userCrypted);
    return decryptThat.split('-')[0];
}




module.exports={
    genKeyPair,
    encryptWithPublicKey,
    decryptWithPrivateKey,
    decryptWithPublicKey,
    signMessage,
    encryptUserId,
    decryptUserId

};