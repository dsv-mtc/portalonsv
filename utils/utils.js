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
    try {
        const response=(await axios.post("https://www.onsv.gob.pe/api/contact",form)).data
        return {success:true,message:response}
    } catch (error) {
        console.error(error);
        return {success:false, message:'Error sending email'}
    }
}
module.exports ={
    transformHttps:transformHttps,
    getAccidents:getAccidents,
    sendEmail: sendEmail
}