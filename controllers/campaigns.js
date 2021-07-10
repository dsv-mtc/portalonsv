const cron=require("node-cron");
const apiMailChimp=new (require("../api/mail-chimp"));
const apiGhost=new (require("../api/ghost"));
const {hbs2}= require("../controllers/hbs");
const fs=require("fs");
const path= require("path");

const sendingNewsLetter=()=>{
    //send newsletter every sunday, this function wil be executed in the main file index
    // reference: https://www.digitalocean.com/community/tutorials/nodejs-cron-jobs-by-examples#step-2-%E2%80%94-building-the-backend-server-and-scheduling-a-task
    const task=cron.schedule('* * * * *',async ()=>{
      
        const data=await  _getCampaignId();
       if(data.success){
            if(data.info.status =='save' || data.info.status =='paused' || data.info.status =='scheduled' || data.info.status=='draft' ){
                sendCampaignv1(data.info.id);
            }else{
                sendCampaignV2(data.info.id)
            }
       }else{
           console.log(data.message);
       }
   })
   task.start(); 
}

const updateCampaign=async(campaignId)=>{
    const post = await apiGhost.getPosts(8,"tags,authors","featured:false", "published_at DESC");
    const dataGhost={post,lang:'es'};
    const template = fs.readFileSync(path.join(__dirname,"../views/pages/newsletter.hbs"),'utf-8');
    let compiled=hbs2.compile(template);
    const content =compiled(dataGhost);
    return await apiMailChimp.setContent(campaignId,content);

}
/**
 * @description: Use el método cuando la campaña existe y no ha sido enviada
 * @param {*} campaignId: Id de la campaña  
 * @returns El resultado de la campaña enviada
 */
const sendCampaignv1=async (campaignId)=>{
    const updateContent= await updateCampaign(campaignId);
    if(updateContent.success){
        console.info('campaign updated');
        const campaignSended= await apiMailChimp.sendCampaign(campaignId);
        if(campaignSended.success){
            console.info('campaign sended');
        }else{
            console.error(campaignSended.message);
        }
    }else{
        console.error(updateContent.message);
        await sendCampaignV3();
    }
    
}

/**
 * @description: La campaña existe y ha sido enviada, se debe eliminar, crear y enviar
 * @param {*} campaignId : Id de la campaña
 */
const sendCampaignV2=async(campaignId)=>{
    const response= await apiMailChimp.deleteCampaign(campaignId);
    if(response.success){
        console.info(response.message);
        const  result=await apiMailChimp.createCampaign();
        if(result.success){
            console.info(result.message);
            const newCampaignId=result.campaign.id;
            await sendCampaignv1(newCampaignId);
        }else{
            console.error(result.message);
        }
    }else{
        console.log('Cannot delete campaign')
    }

}
/**
 * @description: No existe campaña y debe se crearse y enviarse
 */
const sendCampaignV3=async()=>{
    const result= await apiMailChimp.createCampaign();
    if(result.success){
        console.info(result.message);
        const newCampaignId= result.campaign.id;
        await sendCampaignv1(newCampaignId);
    }else{
        console.error(result.message);
    }
}


const _getCampaignId=async()=>{
    const response= await apiMailChimp.getAllCampaigns(); //Obtenemos todas las campañas
    
    if(response.success){
        //caso:2 existen campañas en consecuencia existe un id
        if(response.campaigns && response.campaigns.length>0){
            const campaign=response.campaigns[0];
            return {success:true,info:{id:campaign.id,status:campaign.status}}
        }else{
            return {success:false, message:"Doesn't found some campaign"};
        }
    }else{
      return response;
    }

}


module.exports={sendingNewsLetter}