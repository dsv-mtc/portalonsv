$(document).ready(function () {
   validationForm();
    carousel();
    back();
    search();
    getMap();
    modal();
    openDataForm();
    fileSelectedName()
    getMapFromForm();
});

function back(){
    if(document.getElementById('back')){
        document.getElementById('back').addEventListener('click',(e)=>{
            e.preventDefault();
            window.history.back();
        });
    }
}

function validationForm(){
    window.addEventListener('load', function() {
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
      var forms = document.getElementsByClassName('needs-validation');
      // Loop over them and prevent submission
      Array.prototype.filter.call(forms, function(form) {
        form.addEventListener('submit', function(event) {
          if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
          }
          form.classList.add('was-validated');
        }, false);
      });
    }, false); 
}

function carousel(){
    $('#noti').owlCarousel({
        loop:true,
        margin: 6,
        nav:true,
        dots: false,
        autoplay: true,
        autoplayHoverPause: true,
        responsive:{
            0:{
                items:1
            },
            600:{
                items:2
            },
            1000:{
                items:3
            },
            1280: {
                items: 4
            }
        }
    });
}

function search(){
    const boolSearch=/(noticias-eventos|publicaciones|normas-legales)/.test(location.href);
    if(boolSearch){
        document.getElementById("search-button").addEventListener('click',(e)=>{
            e.preventDefault();
            let filter=location.href.match(/(noticias-eventos|publicaciones|normas-legales)/)[0];
            let lang=location.href.includes('/en/')?'en':'es';
            let searchWord=document.getElementById('search-input').value;
            if(searchWord!=''){
                document.getElementById('search-alert').classList.remove('show');
                document.getElementById('search-alert').classList.add('hide');
                fetch('/search',{
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body:JSON.stringify({filter,lang,search:searchWord})
                })
                .then(results=>{
                    return results.json()
                })
                .then(data=>{
                    if(filter!='noticias-eventos'){
                        reloadPosts(data);
                        reloadTags(data);
    
                    }else{
                        reloadPosts(data);
                    }
                
                })
                .catch(errors=>{
                    console.error(errors);
                }) 
            }else{
                document.getElementById('search-alert').classList.remove('show');
                document.getElementById('search-alert').classList.add('hide');
            }

        })
    } 
}

function searchNoticiasEventos(keyword,pages,lang,step){
    let [pag_prev,pag_page,pag_next]=pages.split('_');
    pag_prev=pag_prev==''?null:parseInt(pag_prev);
    pag_next=pag_next==''?null:parseInt(pag_next);
    pag_page=parseInt(pag_page);
    fetch('/search',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({filter:'noticias-eventos',lang,search:keyword,page:pag_page,prev:pag_prev,next:pag_next,step})
    })
    .then(results=>{
        return results.json()
    })
    .then(data=>{
      reloadPosts(data);
    
    })
    .catch(errors=>{
        console.error(errors);
    })
}

function reloadTags(response){
    if(response.success){
        document.getElementById('sidebar-default').style.display='none';
        document.getElementById('sidebar-template').innerHTML=response.tags;  
    }else{
        document.getElementById('sidebar-template').innerHTML='';
        document.getElementById('sidebar-default').style.display='block';
    }
}
 function reloadPosts(response){
    if(response.success){
        document.getElementById('default').style.display='none';
        document.getElementById('results-template').innerHTML=response.posts;
        /*
        $("#default").hide();
        $("#results-template").empty();
        $("#results-template").append(response.posts);
        */
    }else{
        document.getElementById('results-template').innerHTML='';
        document.getElementById('search-alert').classList.replace('hide','show');
        /*
        $("#results-template").empty();
        $("#search-alert").removeClass("hide");
        $("#search-alert").addClass("show");
        $("#default").show();
        */
    }
 }

function getMapFromForm(){
    let lang=location.href.includes('/en/')?'en':'es';
    if(location.href.includes('regiones')){
        document.getElementById('select-region').addEventListener('change',(e)=>{
            e.preventDefault();
            fetch('/services-map',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({region:e.target.value,lang})
            })
            .then(results=>{
                return results.json();
            })
            .then(response=>{
                document.getElementById('nombre').value=response.regionData.NOMBRE;
                document.getElementById('telefono').value=response.regionData.TELEFONO;
                document.getElementById('email').value=response.regionData['E-MAIL'];
                setImage(response.regionData.REGION);
                document.getElementById('noti').innerHTML=response.template;
                $("#noti").trigger('destroy.owl.carousel');//owl dependencia de evento jquery
                carousel();


            })  
        })
    }
}


function getMap(){
    //By default
    if(location.href.includes('regiones')){
        document.querySelector('svg g g path[id="Lima"]').classList.replace('map','map-selected');
        document.getElementById('nombre').value='JOSÉ EDUARDO PRETEL SALDAÑA';
        document.getElementById('telefono').value='943990699';
        document.getElementById('email').value='jpretel@regionlima.gob.pe';
        setImage('Lima');
    }
    //For click event
    if(document.querySelectorAll('path')) document.querySelectorAll('path').forEach(element=>element.addEventListener('click',(e)=>{
        e.preventDefault();
        let lang=location.href.includes('/en/')?'en':'es';
        fetch('/services-map',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({region:e.target.id,lang})})
        .then(results=>results.json())
        .then(response=>{
            document.querySelectorAll('path').forEach(x=>x.classList.replace('map-selected','map'));
            document.getElementById(e.target.id).classList.replace('map','map-selected');
            document.getElementById('nombre').value=response.regionData.NOMBRE;
            document.getElementById('telefono').value=response.regionData.TELEFONO;
            document.getElementById('email').value=response.regionData['E-MAIL'];
            setImage(response.regionData.REGION);
            document.getElementById('noti').innerHTML=response.template;
            $("#noti").trigger('destroy.owl.carousel');//owl dependencia de evento jquery
            carousel();
        })
        .catch(error=>console.error(error))
    })); 
}

function setImage(region){
    document.getElementById('img-region').innerHTML='';
    fetch(`/img/regiones/${region.toLowerCase()}.png`,{method:'GET'})
    .then(results=>results)
    .then(response=>{
        if(response.status==200) document.getElementById('img-region').innerHTML=`<img src="/img/regiones/${region.toLowerCase()}.png"></img>`;
        if(response.status!=200) document.getElementById('img-region').innerHTML=`<img src="/img/regiones/escudo.jpg"></img>`;    
    })
    .catch(error=>{
        console.log(error);
    })
}

function modal(){
    $("#suscriber-modal-form").on("hidden.bs.modal",function(event){
        $("#subscriber-form").trigger("reset");
        $("#subscriber-form").removeClass("was-validated");
    });
    document.getElementById('subscriber-form').addEventListener('submit',(e)=>{
        e.preventDefault();
        const email =$("#mail-subscriber").val()
        let regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if(email!=""  && regex.test(email)){
        let dataToSend={
            email:email,
            name:$("#name-subscriber").val(),
            lastname:$("#lastname-subscriber").val()
         }
         $.post("/subscribe",dataToSend).done(function(response){
             $("#suscriber-modal-form").modal("hide");
         })
       }
    });
}

function openDataForm(){
    //Clean inputs
    $("#open-data-button-clear").click(function (e) { 
        e.preventDefault();
        $("#open-data-form").trigger("reset");
    });
    //get results
    $("#open-data-form").submit(function (e) { 
        e.preventDefault();
        let dataToSend={
            search:$("#search-data").val(),
            category:$("#category-data").val(),
            order_by:$("#order-data").val(),
            ask:$("#ask-data").val()
        }
        $.post("/datosabiertos",dataToSend).done(function(response){
            console.log(response);
        });
    });

}

function fileSelectedName(){
    $(".custom-file-input").on("change", function() {
        var fileName = $(this).val().split("\\").pop();
        $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
      });
}
