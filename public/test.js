document.addEventListener('DOMContentLoaded',()=>{
    console.log("datos  abiertos - iniciado");
    searchOpenData();
    reloadPage();  
})
function searchOpenData() {
   document.querySelector('#open-data-form').addEventListener('submit',(e)=>{
        e.preventDefault();        
        const search = document.querySelector('#search-data').value;
        const category=document.querySelector('#category-data').value;
        const lang='es'
        fetch('/datosabiertos',{
            method:'POST',
            headers: {'Content-Type':'application/json'},
            body:JSON.stringify({lang,search,category} )
        })
        .then(results=>{
            return results.json();
        })
        .then(data =>{
           // console.log(data);
           reloadPosts(data);
        })
        .catch(errors=>{
            console.log(errors);
        })


   });
    
}

function reloadPage(){
    document.querySelector('#open-data-button-clear').addEventListener('click',(e)=>{
        e.preventDefault();
        window.location.reload();
    })
}

function reloadPosts(response){
    if(response.success){
        document.getElementById('default').style.display='none';
        document.getElementById('results-template').innerHTML=response.posts;
    }else{
        document.getElementById('results-template').innerHTML='';
        //document.getElementById('search-alert').classList.replace('hide','show');
    }
 }