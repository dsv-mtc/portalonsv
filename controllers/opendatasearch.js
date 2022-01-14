const MiniSearch=require("minisearch");
const apiFireStore=new(require("../api/gcp/FireStore"));

class OpenData {
    
    /**
     * 
     * @param {{
     * search:string,
     * category:string,
     * order_by:string,
     * ask:string}} search
     */
    searchMetadaByGcp=async(search)=>{
       const result=await apiFireStore.getMetadataByQuery(search);
       return result;
    }
    /**
     * 
     * @param {{
     * search:string,
     * category:string,
     * order_by:string,
     * ask:string}} search
     */
    searchMetadataByMysql=async(search)=>{

    }
}

module.exports= OpenData;