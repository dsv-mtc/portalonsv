$(document).ready(function () {
   validationForm();
    servicioMapas();
    back();
});

function back(){
    $("#back").click(function (e) { 
        e.preventDefault();
        console.log("back")
        window.history.back();
    });
}

function validationForm(){
    'use strict';
    window.addEventListener('load', function() {
      // Fetch all the forms we want to apply custom Bootstrap validation styles to
      var forms = document.getElementsByClassName('needs-validation');
      // Loop over them and prevent submission
      var validation = Array.prototype.filter.call(forms, function(form) {
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


function servicioMapas(){
    let containerId=document.getElementById('container');
    if(containerId){
        try {
            new Datamap({
                element: document.getElementById('container'),
                    scope:'per',
                    width: "600px",
                    height:"600px",
                    setProjection: function(element) {
                        var projection = d3.geo.mercator()
                        .center([-75.5, -10])
                        .rotate([0, 0])
                        .scale(1200)
                        .translate([element.offsetWidth/2, element.offsetHeight/2]);
                        var path = d3.geo.path()
                        .projection(projection);
                        return {path: path, projection: projection};
                        },
                    done:function(datamap){
                        datamap.svg.selectAll('.datamaps-subunit').on('click',function(geography){
                            $("path").removeClass("activePath");
                            this.classList.add('activePath');
                            let regionParametro=geography.properties.name;
                            if(regionParametro=="Junín"){regionParametro="JUNIN"}
                            let regiones=[];
                            regiones=data['REGIONES'];
                            let region={"REGION": "","DIRECCION": "","WEBSITE": "","NOMBRE": "","CARGO ": "","E-MAIL": "","TELEFONO": ""};
                            for(let i= 0; i<regiones.length;i++){
                                if(regiones[i]['REGION']==regionParametro.toUpperCase()){
                                    region=regiones[i];
                                    }   
                            }
                            $("#img-region").empty();
                            var ruta="";
                            $.get("../assets/img/regiones/"+region["REGION"].toLowerCase()+".png")
                                .done(function(){
                                    ruta =`../assets/img/regiones/${region["REGION"].toLowerCase()}.png"`;
                                    $("#img-region").append(`<img src="${ruta}"></img>`);

                                })
                                .fail(function(){
                                    ruta="../assets/img/regiones/escudo.jpg"
                                    $("#img-region").append(`<img src="${ruta}"></img>`);

                                });
                            document.getElementsByName('nombre')[0].value= region["NOMBRE"];
                            document.getElementsByName('telefono')[0].value= region["TELEFONO"];
                            document.getElementsByName('Email')[0].value= region["E-MAIL"];
                            document.getElementsByName('nombre')[1].value= region["NOMBRE"];
                            document.getElementsByName('telefono')[1].value= region["TELEFONO"];
                            document.getElementsByName('Email')[1].value= region["E-MAIL"];
                        })
                    },
                    fills:{
                        defaultFill:"#c8c8c8"
                    },
                    geographyConfig:{
                        popupOnHover:true,
                        highlightOnHover: false
                    }
            });   
        } catch (error) {
            console.log("No se encuentra en la zona de mapas")
        }
    }

}

