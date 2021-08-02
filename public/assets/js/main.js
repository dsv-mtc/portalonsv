$(document).ready(function () {
   validationForm();
    carousel();
    back();
    search();
    search2();
    getMap();
    modal();
    openDataForm();
    fileSelectedName()
    getMapFromForm();
});

function back(){
    $("#back").click(function (e) { 
        e.preventDefault();
        window.history.back();
    });
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
    $("#search-button").click(function (e) { 
        e.preventDefault();
        const currentUrl=$(location).attr("href");
        let filter=""
        let lang="es";
        console.log(currentUrl)
        if(currentUrl.includes("publicaciones")){
            filter ="publicaciones";
        }else if(currentUrl.includes('normas-legales')){
            filter="normas-legales"
        }

        if(currentUrl.includes("/en/")){
            lang="en";
        }
        //console.log(filter)
        let searchWord=$("#search-input").val();
        if(searchWord!=""){
            $("#search-alert").removeClass("show");
            $("#search-alert").addClass("hide");
            $.post("/search",{search:searchWord, filter:filter,lang:lang}).done(function(response){
               reloadPosts(response);
               reloadTags(response);
            })
        }else{
            $("#search-alert").removeClass("show");
            $("#search-alert").addClass("hide");
        }
        //console.log(searchWord)

});
}
/**
 * @description: Search aplicado a noticias y eventos
 */
function search2(){
    $("#search-button2").click(function (e) { 
        e.preventDefault();
        const currentUrl=$(location).attr("href");
        let filter=""
        let lang="es";
        console.log(currentUrl)
        if(currentUrl.includes("noticias-eventos")){
            filter ="noticias-eventos";
        }
        if(currentUrl.includes("/en/")){
            lang="en";
        }
        //console.log(filter)
        let searchWord=$("#search-input").val();
        if(searchWord!=""){
            $("#search-alert").removeClass("show");
            $("#search-alert").addClass("hide");
            $.post("/search",{search:searchWord, filter:filter,lang:lang}).done(function(response){
               reloadPosts(response);
            })
        }else{
            $("#search-alert").removeClass("show");
            $("#search-alert").addClass("hide");
        }
        //console.log(searchWord)

});
}

function reloadTags(response){
    if(response.success){
        $("#sidebar-default").hide();
        $("#sidebar-template").empty();
        $("#sidebar-template").append(response.tags);    
    }else{
        $("#sidebar-template").empty();
        $("#sidebar-default").show();
    }
}
 function reloadPosts(response){
    if(response.success){
        $("#default").hide();
        $("#results-template").empty();
        $("#results-template").append(response.posts);
    }else{
        $("#results-template").empty();
        $("#search-alert").removeClass("hide");
        $("#search-alert").addClass("show");
        $("#default").show();
    }
 }

function getMapFromForm(){
    const currentPage=$(location).attr("href");
    let lang="es";
    if(currentPage.includes("/en/")){
        lang="en";
    }
    if(currentPage.includes('regiones')){
        $("#select-region").change(function (e) { 
            e.preventDefault();
            const region=e.target.value
            $.post("/services-map",{region:region,lang:lang}).done(function(response){
                console.log(response)
                $("#nombre").val(response.regionData.NOMBRE);
                $("#telefono").val(response.regionData.TELEFONO);
                $("#email").val(response.regionData['E-MAIL']);
                setImage(response.regionData.REGION);
                $("#noti").empty();
                $("#noti").append(response.template);
                $("#noti").trigger('destroy.owl.carousel');
                carousel();
            })
            
        });
    }
}


function getMap(){
    //By default
    const currentPage=$(location).attr("href");
    if(currentPage.includes('regiones')){
        let lima=document.querySelectorAll('svg g g path')[4];
        lima.classList.remove('map');
        lima.classList.add('map-selected');
        $("#nombre").val('JOSÉ EDUARDO PRETEL SALDAÑA');
        $("#telefono").val('943990699');
        $("#email").val('jpretel@regionlima.gob.pe');
        setImage('lima'); 
    }
    //For click event
    $("path").click(function (e) { 
        e.preventDefault();
        const currentUrl=$(location).attr("href");
        let lang="es";
        if(currentUrl.includes("/en/")){
            lang="en";
        }
        const region=e.target.id
        $.post("/services-map",{region:region,lang:lang}).done(function(response){
            //console.log(response.template)
            $("path").removeClass("map-selected");
            $("path").addClass("map");
            $("#"+region).removeClass("map")
            $("#"+region).addClass("map-selected")
            $("#nombre").val(response.regionData.NOMBRE);
            $("#telefono").val(response.regionData.TELEFONO);
            $("#email").val(response.regionData['E-MAIL']);
            setImage(response.regionData.REGION);
            $("#noti").empty();
            $("#noti").append(response.template);
            $("#noti").trigger('destroy.owl.carousel');
            carousel();
        })
    });
}

function setImage(region){
    $("#img-region").empty();
    let ruta="";
    $.get("/img/regiones/"+region.toLowerCase()+".png")
        .done(function(){
            ruta =`/img/regiones/${region.toLowerCase()}.png"`;
            $("#img-region").append(`<img src="${ruta}"></img>`);
        })
        .fail(function(){
            ruta="/img/regiones/escudo.jpg";
            $("#img-region").append(`<img src="${ruta}"></img>`);
        });
}

function modal(){
    $("#suscriber-modal-form").on("hidden.bs.modal",function(event){
        $("#subscriber-form").trigger("reset");
        $("#subscriber-form").removeClass("was-validated");
    });
   $("#subscriber-form").submit(function (e) { 
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
