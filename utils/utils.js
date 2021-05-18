const axios = require("axios").default;
const transformHttps=(element)=>{
    const patttern = /^http:/ 
    Object.keys(element).forEach(function(key){
        if(patttern.test(element[key])){
            element[key]= element[key].replace(/http:/,'https:')
            console.log(element[key]);
            //utils.transformHttps()
        }
     })
    return element
}

const getAccidents=async ()=>{
    let accidents=[]
    try {
        let results= await (await axios.get("https://sratma.mtc.gob.pe/WSSRATMA/api/Mapa/listarUltimosDiezAccidentes")).data;
        let accidents_raw= results['lista_accidentes']['accidentes'];
        accidents_raw.forEach((accident,index)=>{
            let accident_raw={}
            for(const property in accident){
                if(accident[property]!=null){
                    accident_raw[property]=accident[property];
                }else{
                    accident_raw[property]='- -';
                }
            }
            accident['vehiculos-lista']=accident['vehiculos'].map(vehiculo=>{
                return vehiculo['tipovehiculo'];
            }).toString();
            accident['descripcion-lista'] = accident['consecuencias'].map(consecuencias=>{
                return consecuencias['descripcion']
            }).toString();
            accidents.push(accident)
        })
        return accidents;        
    } catch (error) {
        console.error(error);
        return accidents;
    }

}

const sendEmail= async (form)=>{
    const cuerpo={nombre:form.nombre,email:form.mail,subject:form.subject,text:form.text}
    let message="";
    try {
        if(validationForm(cuerpo)){
            const response=(await axios.post("https://www.onsv.gob.pe/api/contact",cuerpo)).data
            if(form.lang=='en'){
                message="Thank you for contact to Observatory"
            }else{
                message="¡Gracias por contactar al Observatorio!"
            }
            
            return {success:true,message:message}
    
        }else{
            if(form.lang=='en'){
                message="Some fields are wrong, try again"
            }else{
                message="Algunos campos están mal, inténtalo de nuevo"
            }
            console.log("no se envía el correo")
            return {success:false, message:message}
        }
    } catch (error) {
        console.error(error);
        if(form.lang=='en'){
            message="something went wrong, try again"
        }else{
            message="Algo salió mal, inténtalo de nuevo"
        }
        return {success:false, message:message}
    }
}

const validationForm=(form)=>{
    const emailPattern=/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if(form.nombre=='' || form.email=='' || form.subject=='' || form.text=='' ||  !emailPattern.test(form.email)){
        return false;
    }
    return true;
}   

const deleteDiacritics= (text)=>{
    return text
    .normalize('NFD')
    .replace(/([^n\u0300-\u036f]|n(?!\u0303(?![\u0300-\u036f])))[\u0300-\u036f]+/gi,"$1")
    .normalize();
}
module.exports ={
    transformHttps:transformHttps,
    getAccidents:getAccidents,
    sendEmail: sendEmail,
    deleteDiacritics:deleteDiacritics
}