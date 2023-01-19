const axios = require("axios").default;
const mailchimp=require("@mailchimp/mailchimp_marketing");
require("dotenv").config(); //using environment variables
//set Id audiencia or list
const list_id=process.env.ONSV_ID_AUDIENCE;
//Set mailchimp
mailchimp.setConfig({
    apiKey:process.env.API_KEY_MAIL_CHIMP,
    server:"us6"
})

class MailChimp{
    /**
     * @description: Get health status connection from mailchimp 
     */
    getAll= async()=>{
        try {
            const response=await mailchimp.ping.get();
            console.log(response);
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * @description: By default only has one public in free tier, then if
     * you dont have a bussiness plan you cannot create another list than default
     */
    addList=async()=>{
        try {
            const response=await mailchimp.lists.createList({
                name: "test",
                permission_reminder: "permission_reminder",
                email_type_option: false,
                contact: {
                  company: "onsv",
                  address1: "address1",
                  city: "Lima",
                  country: "Perú",
                },
                campaign_defaults: {
                  from_name: "Henry",
                  from_email: "elpadredelcordero@gmail.com",
                  subject: "prueba",
                  language: "es",
                },
            })
            console.log(response);
        } catch (error) {
            console.error(error);
        }
    }
    /**
     * @description: get all list from your account, 
     * the list comming like a object and has a property named list, the list is an object array
     */
    getAllLists=async()=>{
        try {
            const response = await mailchimp.lists.getAllLists();
            console.log(response);       
        } catch (error) {
            console.error(error);
        }
    }
    getAllSegments=async()=>{
        
        try {
            const response= await mailchimp.lists.listSegments(list_id);
            console.log(response);            
        } catch (error) {
            console.error(error)
        }

    }
    getSegment=async()=>{
        
    }

    addMemberToListWithTags=async(form)=>{
        const {email, topic,name} = form;
        try {
            console.log({[name]:topic});       
            await mailchimp.lists.addListMember(list_id,{
                email_address:email,
                status:"subscribed",
                tags:[name]
            });
            return {success:true,message:"User was added to list"}            
        } catch (error) {
            // error details in error.response.body
            console.log(error )
            if(error.status==400){
                return {success:false, message:error.response.body.detail}
            }else{
                return {success:false,message:"Something went wrong"}
            }

        }

    }
    addMemberToList=async(form)=>{
        //reference merge fields: https://mailchimp.com/es/help/all-the-merge-tags-cheat-sheet/ 
        const {email,name,lastname} = form;
        try {
            await mailchimp.lists.addListMember(list_id,{
                email_address:email,
                status:'subscribed',
                merge_fields:{
                    FNAME:name,
                    LNAME:lastname
                }

            });
            return {success:true,message:"User was added to list"}            
        } catch (error) {
             // error details in error.response.body
             console.log(error )
             if(error.status==400){
                 return {success:false, message:error.response.body.detail}
             }else{
                 return {success:false,message:"Something went wrong"}
             }
        }
    }

    getMemberFromList=async(subscriber_hash)=>{
        try {
            const response = await mailchimp.lists.getListMember(list_id, subscriber_hash)
            return {success:true,data:response}
        } catch (error) {
            let message="";
            //console.error(error.status)
            if(error.status==404){
                message="User not found"
            }else{
                message="Unknow error"
            }
            return {success:false,message:message}
                        
        }
    }
    updateTagsFromMemberInList=async(subscriber_hash,tag)=>{
        try {
            await mailchimp.lists.updateListMemberTags(
                list_id,subscriber_hash,{
                    tags:[{name:tag,status:"active"}]
                })
            return {success:true,message:"User updated"}
        } catch (error) {
            return {success:false,message:"Something went wrong"}
        }
    }

    /*  ZONA DE CAMPAÑAS */



   /**
    * @description:Obtiene todas las campañas de tipo regular en formato de lista
    * @example: https://mailchimp.com/developer/marketing/api/campaigns/list-campaigns/
    * @returns Un objeto de la forma {campaigns:List, total_items: int, _links: List}
    */
    getAllCampaigns=async()=>{
        try {
            let campaigns=(await mailchimp.campaigns.list()).campaigns;
            let regularCampaigns=campaigns.filter((element)=>{
                if(element.type=='regular') return element;
            })
            return {success:true,campaigns:regularCampaigns};
        } catch (error) {
            console.error(error);
            return {success:false,message:'Something wnet wrong'}
        }
    }
    /**
     * @description: Obtiene el contenido de una campaña a través de su ID
     * @example: https://mailchimp.com/developer/marketing/api/campaign-content/get-campaign-content/
     * @returns Un objeto de la forma {variate_contents: List}
     */
    getContent=async(campaignId)=>{
        const campaign_id=campaignId;
        try {
            const content= await mailchimp.campaigns.getContent(campaign_id);
            return {success:true, content};
                
        } catch (error) {
            return{success:false,message:'Something wnet wrong getting content'}
        }
    }
    /**
     * @description: Configura el contenido a enviar de la campaña
     * @param {String} content 
     * @returns : El objeto enviado de la campaña
     */
    setContent=async(campaignId,content)=>{
        try {
            const response=await mailchimp.campaigns.setContent(campaignId,{html:content});
            return {success:true,message:response};            
        } catch (error) {
            console.error(error);
            return {success: false, message:'Something went wrong setting content'};
        }
    }
    /**
     * @description: Envía la campaña identificada a través de su ID
     * @returns Un objeto vacío {} = undefined
     */
    sendCampaign=async(campaignId)=>{
        const campaign_id=campaignId;
        try {
            const response= await mailchimp.campaigns.send(campaign_id);
            return {success:true, response}
        } catch (error) {
            console.error(error);
            return {success:false,message:'Something went wrong'};
        }
    }

    getCampaignInfo=async(campaignId)=>{
        const campaign_id=campaignId;
        try {
            const response= await mailchimp.campaigns.get(campaign_id);
            console.log(response);
            return {success:true, response}
        } catch (error) {
            console.error(error);
            return {success:false,message:'Something went wrong'};
        }
    }

    deleteCampaign=async(campaignId)=>{
        try {
            await mailchimp.campaigns.remove(campaignId);
            console.log('Campaign deleted');
            return {success:true, message: 'Delete campaign succesful'}            
        } catch (error) {
            console.error(error);
            return {success:false}
        }

    }

    createCampaign=async()=>{
        //https://mailchimp.com/developer/marketing/api/campaigns/add-campaign/
        try {
            const config={
                type:'regular',
                recipients:{
                    list_id:list_id,
                    //segment_opts:{
                      //  match:'all'
                    //}
                },
                settings:{
                    title:'ONSV NewsLetter',
                    from_name:'admin',
                    reply_to:process.env.EMAIL_CAMPAIGN,
                    subject_line:'ONSV NewsLetter', 
                     
                }

            }
            const campaign= await mailchimp.campaigns.create(config);
            console.log('campaign created')
            return {success:true, message:'Create campaign successful',  campaign};
        } catch (error) {
            console.error(error);
            return {success:false,  message:'Cannot create campaign'};
        }
    }




}

module.exports = MailChimp;