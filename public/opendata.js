document.addEventListener('DOMContentLoaded',()=>{
    console.log("datos  abiertos - iniciado");
   searchOpenData();
    reloadPage(); 
    checkInputFile(); 
})
function searchOpenData() {
    const opendataDiv=document.querySelector('#open-data-form-search');
   if(opendataDiv!=null){
    opendataDiv.addEventListener('submit',(e)=>{
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
    
    
}

function sendFile(){
    console.log("Detectando envío de archivos");
    const formSendFile = document.querySelector('#datosabiertos-form');
    if(formSendFile!=null){
        formSendFile.addEventListener('submit',(e)=>{
            e.preventDefault();
            const title=document.querySelector('#title');
            const description=document.querySelector('#description');
            const author=document.querySelector('#author');
            const category1=document.querySelector('#category1');
            const category2=document.querySelector('#category2');
            const category3=document.querySelector('#category3');
            const type =document.querySelector('#type');
            const excel_file=document.querySelector('#excel-file');
            const pdf_file=document.querySelector('#pdf-file');
            const csv_file=document.querySelector('#csv-file');

            const formData= new FormData();
            formData.append('title',title.value);
            formData.append('description',description.value);
            formData.append('author',author.value);
            formData.append('category1',category1.value);
            formData.append('category2',category2.value);
            formData.append('category3',category3.value);
            formData.append('type',type.value);
            if(excel_file.files[0]) formData.append('excel-file',excel_file.files[0]);
            if(pdf_file.files[0]) formData.append('excel-file',pdf_file.files[0]);
            if(csv_file.files[0]) formData.append('excel-file',csv_file.files[0]);
            fetch('/datosabiertos-admin',{
                method:'POST',
                body:formData,
                
            }).catch(e=>console.log(e))
        });
    }
}

function reloadPage(){
   const reloadButton= document.querySelector('#open-data-button-clear');
   if(reloadButton!=null){
    reloadButton.addEventListener('click',(e)=>{
        e.preventDefault();
        window.location.reload();
    })
   } 

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

 function checkInputFile(){
     console.log('Check input file')
    const formSendFile = document.querySelector('#datosabiertos-form');
    if(formSendFile!=null){
        formSendFile.addEventListener('submit',(e)=>{
            //e.preventDefault();
                    
            const excel=document.querySelector('#excel-file').files[0].name;
            const pdf=document.querySelector('#pdf-file').files[0].name;
            const csv=document.querySelector("#csv-file").files[0].name;

            const allowedExcelExtensions=/\.xlsx/;
            const allowedPdfExtensions=/\.pdf/;
            const allowedCsvExtensions=/\.csv/;

            //Excel
            if(!allowedExcelExtensions.exec(excel)){
                e.preventDefault();
                alert('Archivo EXCEL inválido')
                window.location.reload();
            }
            //CSV
            if(!allowedPdfExtensions.exec(pdf)){
                e.preventDefault();
                alert('Archivo PDF inválido')
                window.location.reload();
            }

            //PDF
            if(!allowedCsvExtensions.exec(csv)){
                e.preventDefault();
                alert('Archivo CSV inválido')
                window.location.reload();
            }
        });
        
    }

 }