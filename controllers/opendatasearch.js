const MiniSearch=require("minisearch");
const apiFireStore=new(require("../api/gcp/FireStore"));
const DataBase = require('../api/mysql');
const mysqlClient = new DataBase();

mysqlClient.setQuery();

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
    searchMetadataByMysql=async(valueSearch)=>{
        let documents = {success:false, data:[]};
        console.log(valueSearch)
        if(valueSearch.category!='0' || valueSearch.category!=0){
            console.log("entramos")
            documents = await mysqlClient.getDocumentsByTitle(valueSearch.category);
        }else{
            documents = await mysqlClient.getDocuments();
        }

        let miniSearch = new MiniSearch({
            fields:['title'],
            storeFields:['id','title','author','description','category1','category2','category3','excelfile','pdffile','csvfile']
        });
        let searchResults='';
        if(documents.success && valueSearch.search!=''){
            miniSearch.addAll(documents.data);
            searchResults = miniSearch.search(valueSearch.search,{fuzzy:0.2});
            if(searchResults.length ==0){
                let suggestions= miniSearch.autoSuggest(valueSearch.search,{fuzzy:0.2});
                if(suggestions.length==0){
                    return {success:false,posts:[]}
                }else{
                    searchResults = miniSearch.search(suggestions[0].suggestion,{fuzzy:0.2});
                    return {success:true, posts:searchResults}
                }
            }else{
                return {success:true, posts:searchResults}
            }
        }else if(documents.success && valueSearch.search==''){
            return {success:true,posts:documents.data}
        }
        else {
            
            return {success:false,posts:[]}
        }

    }

   
}

module.exports= OpenData;