$(document).ready(function () {
    //servicioAccidentes();
    servicioContacto();
    servicioMapas();
});

function servicioAccidentes(){
    let accidentesId=document.getElementById("lista_accidentes");
    if(accidentesId){
        try{
            $.get("https://sratma.mtc.gob.pe/WSSRATMA/api/Mapa/listarUltimosDiezAccidentes",function(data){
                var accidentes_raw=data["lista_accidentes"]["accidentes"];
                //console.log(accidentes_raw)
                var accidentes=[];
                for(let i=0; i< accidentes_raw.length;i++){
                    let accidente={};
                    for (const propiedad in accidentes_raw[i]){
                        if(accidentes_raw[i][propiedad]!=null){
                        accidente[propiedad]=accidentes_raw[i][propiedad];
                        }
                        else{
                            accidente[propiedad]="- -";
                        }
                    }
                    accidentes.push(accidente);
                    
                }

                for(let i=0;i<accidentes.length;i++){
                    let vehiculo="";
                    for(let j=0;j<accidentes[i]["vehiculos"].length;j++){
                        if(accidentes[i]["vehiculos"][j]){
                            vehiculo+=", "+accidentes[i]["vehiculos"][j]["cod_vehiculo_involucrado"];
                        }

                    }
                    console.log("vehiculo:",vehiculo)
                    accidentes[i]["vehiculos-lista"]=vehiculo;
                }
                for(let i=0;i<accidentes.length;i++){
                    let consecuencia="";
                    for(let j=0;j<accidentes[i]["consecuencias"].length;j++){
                        if(accidentes[i]["consecuencias"][j]){
                            consecuencia+=", "+accidentes[i]["consecuencias"][j]["descripcion"];
                        }

                    }
                    accidentes[i]["descripcion-lista"]=consecuencia;
                }

                $("#lista_accidentes").empty();
                for(let i=0; i<accidentes.length;i++){
                    $("#lista_accidentes").append(`
                        <li>
                            <div class="dt-blk">
                                <span><i class="fal fa-calendar-alt"></i> ${accidentes[i]["fecha_registro"]}</span>
                                <span><i class="fal fa-clock pl-2"></i> ${accidentes[i]["hora_registro"]}</span>
                            </div>
                            <p class="mt-2">
                                Clase: ${accidentes[i]["descripcion"]} <br>
                                Lugar:  ${accidentes[i]["departamento"]} / ${accidentes[i]["provincia"]} / ${accidentes[i]["distrito"]} <br>
                                Coordenada: ${accidentes[i]["latitud"]} ${accidentes[i]["longitud"]} <br>
                                Vechiculos: ${accidentes[i]["vehiculos-lista"]}<br>
                                Consecuencias: ${accidentes[i]["descripcion-lista"]}
                            </p>
                        </li>    
                `);
                }
            });
        }catch(e){
            console.log("Un error inesperado al momento de llamar a los accidentes");
        }
    }
   
}

function servicioContacto(){
    $("#contacto-boton").click(function(e){
        e.preventDefault();
        let cuerpo={"nombre":"", "email":"","subject":"","text":""};
        cuerpo["nombre"]=$("#nombre").val();
        cuerpo["email"]=$("#correo-electronico").val();
        cuerpo["subject"]=$("#asunto").val();
        cuerpo["text"]=$("#mensaje").val();
        try {
            $.post("https://www.onsv.gob.pe/api/contact",cuerpo).done(function(res){
                //console.log("Response: ",res);
                $("#nombre").val('');
                $("#correo-electronico").val('');
                $("#asunto").val('');
                $("#mensaje").val('');
                $("#respuesta-email").append(
                    `<div class="alert alert-success alert-dismissible fade show" role="alert">
                        <strong>¡Gracias por contactar al Observatorio!</strong> 
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>`);       
            }).fail(function(error){
                console.log("error de comunicación");
                $("#respuesta-email").append(
                    `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                        <strong>Error</strong> Al parecer algo salió mal
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>`
                )
                
            });
        } catch (error) {
            console.log("Algo salió mal al intentar enviar la información al servicio");
        }
        
        
        
    });
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

