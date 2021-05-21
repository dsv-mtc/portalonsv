$(document).ready(function () {
   validationForm();
    carousel();
    back();
    search();
    getMap();
});

function back(){
    $("#back").click(function (e) { 
        e.preventDefault();
        console.log("back")
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
        }else{
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
                if(response){
                    $("#default").hide();
                    $("#results-template").empty();
                    $("#results-template").append(response);
                }else{
                    $("#results-template").empty();
                    $("#search-alert").removeClass("hide");
                    $("#search-alert").addClass("show");
                    
                    $("#default").show();
                }
            })
        }else{
            $("#search-alert").removeClass("show");
            $("#search-alert").addClass("hide");
        }
        //console.log(searchWord)

});
}

function getMap(){
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
    console.log(region)
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

