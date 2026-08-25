document.addEventListener('DOMContentLoaded',()=>{
	console.log('webpack - iniciado');
	pageFx();
	validationForm();
	carousel();
	back();
	search();
	getMap();
	modal();
	inlineNewsletter();
	modalCampaign();
	modalAnalytics();
	openDataForm();
	fileSelectedName()
	getMapFromForm();
	closeNavbarOnOutsideClick();
})

/**
 * @description Capa de transiciones suaves globales (opt-in, sin dependencias).
 *  - Fade-in del <body> al cargar
 *  - Reveal on scroll via IntersectionObserver sobre elementos con [data-fx]
 *  - Fade-out antes de navegar (links internos) + restauración bfcache
 * Respeta prefers-reduced-motion (el CSS neutraliza todo; aca no hacemos nada extra).
 */
function pageFx(){
  var body = document.body;
  if(!body) return;

  // 1) Fade-in al cargar
  if(body.classList.contains('fx-boot')){
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ body.classList.add('fx-in'); });
    });
  }

  // 2) Reveal on scroll opt-in
  var fxEl = document.querySelectorAll('[data-fx]');
  if(fxEl.length && 'IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){
          en.target.classList.add('fx-in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    fxEl.forEach(function(el){ io.observe(el); });
  }

  // 3) bfcache (volver con back/forward): forzar body visible
  window.addEventListener('pageshow', function(ev){
    if(ev.persisted){
      body.classList.remove('fx-out');
      body.classList.add('fx-in');
    }
  });
}
/**
 * @description: Función auxiliar utilizada en los post para el retorno al menú inmediato desde donde se originó su llamada
 */
function back(){
	if(document.getElementById('back')){
		document.getElementById('back').addEventListener('click',(e)=>{
			e.preventDefault();
			window.history.back();
		});
	}
}
/**
 * @description: Función asignada para la validación de todos los formularios con la clase needs-validation; comunmente usada en contacto y suscripción
 */
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

/**
 * @description: Función encargada de la construcción del carousel, carousel tiene como dependencia a jquery y sus
 * eventos se administran a través de eventos jquery 
 */
function carousel(){
	$('#others').owlCarousel({
		loop: true,
		margin: 24,
		nav: true,
		dots: false,
		autoplay: true,
		autoplayTimeout: 3000,
		responsive: {
			0: { items: 1 },
			600: { items: 3 },
			1000: { items: 3 }
		}
	});
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
				items: 3
			}
		}
	});
	if (document.getElementById('entornos-carousel')) {
		$('#entornos-carousel').owlCarousel({
			loop: true,
			margin: 24,
			nav: true,
			dots: false,
			autoplay: false,
			responsive: {
				0: { items: 1 },
				600: { items: 2 },
				1000: { items: 3 }
			}
		});
	}
}
/**
 * @description: Función encargada de procesar la búsqueda, en las páginas de publicaciones y normas legales, la función obtiene el segmento del menú
 * el lang para el idioa y el valor de la palabra buscada, ejecura un fetch y  entrega la data a reloadPosts y reloadTags para sobresscribir el html y ocultar
 * la información que se despliega por defecto, así como emitir una alerta en caso la información con los datos suministrados no se encuentre
 */
function search(){
	const boolSearch=/(noticias-eventos|publicaciones|normas-legales)/.test(location.href);
	
	if(boolSearch && !location.href.includes('/tag/')){
		document.getElementById("search-button").addEventListener('click',(e)=>{
			e.preventDefault();
			let filter=location.href.match(/(noticias-eventos|publicaciones|normas-legales)/)[0];
			let lang=location.href.includes('/en/')?'en':'es';
			let searchWord=document.getElementById('search-input').value;
			if(searchWord!=''){
				document.getElementById('search-alert').classList.replace('show','hide');
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
				document.getElementById('search-alert').classList.replace('show','hide');
			}

		})
	} 
}


/**
 * @description: Función encargada de procesar la búsqueda en noticias-eventos
 * @param {*} keyword : Palabra buscada
 * @param {*} pages :Página actual
 * @param {*} lang :Lenguaje de procedencia (es/en)
 * @param {*} step :Cantidad de posts visible por búsqueda
 */
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

/**
 * @description: Función encargada de la recarga de tags, redibujando la sección del sidebar
 * @param {String} response : Objeto de respuesta de consulta que contiene la propiedad tags
 */
function reloadTags(response){
	if(response.success){
		document.getElementById('sidebar-default').style.display='none';
		document.getElementById('sidebar-template').innerHTML=response.tags;  
	}else{
		document.getElementById('sidebar-template').innerHTML='';
		document.getElementById('sidebar-default').style.display='block';
	}
}
/**
 * @description: Función encargada de la recarga de posts; redibujando el contenido de las búsquedas 
 * @param {*} response : Objeto de respuesta de consulta que contiene la propiedad posts
 */
function reloadPosts(response){
	if(response.success){
		document.getElementById('default').style.display='none';
		document.getElementById('results-template').innerHTML=response.posts;
	}else{
		document.getElementById('results-template').innerHTML='';
		document.getElementById('search-alert').classList.replace('hide','show');
	}
}

/**
 * @description: Función encargada de agregar un listener de tipo change al select asociado al menú de regiones, el cual es visible en dispositivos móviles;
 *  ante la generación del evento envía el valor a la ruta /service-map; la respuesta sobreescribe los valores del formulario del contacto regional y 
 * obtiene las noticias asociadas a la región seleccionada y que coloca sobre el carousel.
 */ 
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
				document.querySelectorAll('path').forEach(x=>x.classList.replace('map-selected','map'));
				var opt=e.target.options[e.target.selectedIndex];
				var mapId=opt.getAttribute('data-map')||opt.value;
				if(document.getElementById(mapId)){
					document.getElementById(mapId).classList.replace('map','map-selected');
				}
				document.getElementById('nombre').textContent=response.regionData.NOMBRE;
				document.getElementById('telefono').textContent=response.regionData.TELEFONO;
				document.getElementById('email').textContent=response.regionData['E-MAIL'];
				setPageLink(response.regionData.WEBSITE);
				setImage(response.regionData.REGION, response.regionData.imageUrl);
				showRegionLabel(response.regionData.REGION);
				updateRegionName(response.regionData.REGION);
				document.getElementById('noti').innerHTML=response.template;
				$("#noti").trigger('destroy.owl.carousel');//owl dependencia de evento jquery
				carousel();


			})  
		})
	}
}

/**
 * @description: Función encargada de agregar un listener de tipo click a todos los paths (regiones) del mapa svg  ubicado en el menú de regiones, el cual es visible en dispositivos diferentes al móvil;
 *  ante la generación del evento envía el valor a la ruta /service-map; la respuesta sobreescribe los valores del formulario del contacto regional y 
 * obtiene las noticias asociadas a la región seleccionada y que coloca sobre el carousel.
 */ 
function getMap(){
	//By default - cargar Lima desde /services-map (consulta BD)
	if(location.href.includes('regiones')){
		let lang=location.href.includes('/en/')?'en':'es';
		fetch('/services-map',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({region:'Lima',lang})})
		.then(results=>results.json())
		.then(response=>{
			document.querySelector('svg g g path[id="Lima"]').classList.replace('map','map-selected');
			document.getElementById('nombre').textContent=response.regionData.NOMBRE || '';
			document.getElementById('telefono').textContent=response.regionData.TELEFONO || '';
			document.getElementById('email').textContent=response.regionData['E-MAIL'] || '';
			setPageLink(response.regionData.WEBSITE || '');
			setImage(response.regionData.REGION || 'Lima', response.regionData.imageUrl);
			showRegionLabel('Lima');
			updateRegionName('Lima');
			document.getElementById('noti').innerHTML=response.template;
			$("#noti").trigger('destroy.owl.carousel');
			carousel();
		})
		.catch(error=>console.error(error));

		//For click event
		if(document.querySelectorAll('path')) document.querySelectorAll('path').forEach(element=>element.addEventListener('click',(e)=>{
			e.preventDefault();
			console.log(e.target.id);
			let lang=location.href.includes('/en/')?'en':'es';
			fetch('/services-map',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({region:e.target.id,lang})})
			.then(results=>results.json())
			.then(response=>{
				document.querySelectorAll('path').forEach(x=>x.classList.replace('map-selected','map'));
				document.getElementById(e.target.id).classList.replace('map','map-selected');
				document.getElementById('nombre').textContent=response.regionData.NOMBRE;
				document.getElementById('telefono').textContent=response.regionData.TELEFONO;
				document.getElementById('email').textContent=response.regionData['E-MAIL'];
				setPageLink(response.regionData.WEBSITE);
				setImage(response.regionData.REGION, response.regionData.imageUrl);
				document.getElementById('noti').innerHTML=response.template;
				$("#noti").trigger('destroy.owl.carousel');//owl dependencia de evento jquery
				carousel();
				showRegionLabel(e.target.id);
				updateRegionName(e.target.id);
			})
			.catch(error=>console.error(error))
		}));
	}
}

/**
 * @description: Muestra una etiqueta con el nombre del departamento seleccionado sobre el mapa
 * @param {String} regionId: ID del departamento seleccionado
 */
function showRegionLabel(regionId){
	const label = document.getElementById('region-label');
	const pathElement = document.getElementById(regionId);
	
	if(label && pathElement){
		const svgRect = pathElement.ownerSVGElement.getBoundingClientRect();
		const pathRect = pathElement.getBoundingClientRect();
		
		label.textContent = regionId;
		label.style.display = 'block';
		label.style.left = (pathRect.left - svgRect.left + pathRect.width / 2) + 'px';
		label.style.top = (pathRect.top - svgRect.top + pathRect.height / 2) + 'px';
	}
}

/**
 * @description: Actualiza el nombre del departamento seleccionado en la sección de info
 * @param {String} regionId: ID del departamento seleccionado
 */
function updateRegionName(regionId){
	const regionNameElement = document.getElementById('region-name');
	if(regionNameElement){
		regionNameElement.textContent = regionId;
	}
	
	const breadcrumbElement = document.querySelector('.crumb');
	if(breadcrumbElement){
		breadcrumbElement.innerHTML = `Perú <span class="sep">›</span> ${regionId}`;
	}
}
/**
 * @description: Función encargada de validar si la imagen de la región seleccionada existe; si existe la despliega, y sino invoca 
 * una imagen por defecto
 * @param {String} region: Nombre de la región seleccionada, que coincide con el nombre de la imagen de la región. 
 */
function setImage(region, imageUrl){
	const imgRegion = document.getElementById('img-region');
	if(!imgRegion) return;
	const normalized = (region || 'Lima').toLowerCase()
		.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	const primary = imageUrl
		? imageUrl
		: `/assets/${normalized}.png`;
	const timeStamp = new Date().getTime();
	const [base] = primary.split('?');
	const urlConCacheBuster = `${base}?v=${timeStamp}`;
	imgRegion.innerHTML = `<img src="${urlConCacheBuster}" alt="${region || 'Lima'}" onerror="this.onerror=null;this.style.display='none'">`;
}

function setPageLink(website){
	const pageLinkEl = document.getElementById('pageLink');
	if(!pageLinkEl) return;
	if(website && website !== '#'){
		pageLinkEl.setAttribute('href', website);
		pageLinkEl.textContent = website;
	}else{
		pageLinkEl.removeAttribute('href');
		pageLinkEl.textContent = '';
	}
}
/**
 * @description: Función encargada de desplegar el modal de suscripción al portal; valida el campo de correo y envía el mismo para 
 *  su suscripción
 */
function modal(){
	$("#suscriber-modal-form").on("hidden.bs.modal",function(event){
		$("#subscriber-form").trigger("reset");
		$("#subscriber-form").removeClass("was-validated");
		$("#subscriber-form").show();
		$("#nl-success").removeClass("show");
		$("#nl-error").removeClass("show");
	});
	if(document.getElementById('subscriber-form')) document.getElementById('subscriber-form').addEventListener('submit',(e)=>{
		e.preventDefault();
		const $form=$("#subscriber-form");
		const email=($("#mail-subscriber").val()||"").trim();
		let regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		$form.addClass("was-validated");
		$("#nl-error").removeClass("show");
		if(email!=""  && regex.test(email)){
			const $btn=$form.find('[type="submit"]');
			$btn.prop('disabled',true);
			let dataToSend={
				email:email,
				name:$("#name-subscriber").val(),
				lastname:$("#lastname-subscriber").val()
			}
			$.post("/subscribe",dataToSend)
				.done(function(response){
					$("#nl-success-msg").text(response);
					$form.hide();
					$("#nl-success").addClass("show");
					setTimeout(function(){ $("#suscriber-modal-form").modal("hide"); },2600);
				})
				.fail(function(){
					$("#nl-error-msg").text('Ocurrió un error. Por favor, inténtalo nuevamente.');
					$("#nl-error").addClass("show");
				})
				.always(function(){
					$btn.prop('disabled',false);
				});
		}
	});
}

/**
 * @description: Suscripción inline del inicio (.news-form): intercepta el envío para no navegar a /subscribe
 *  y muestra la misma confirmación estilizada del newsletter (clases nl-* globales).
 */
function inlineNewsletter(){
	if(document.querySelector('.news-form')){
		document.querySelectorAll('.news-form').forEach(f=>{
			f.addEventListener('submit',(e)=>{
				e.preventDefault();
				const input=f.querySelector('input[type="email"]');
				const email=(input&&input.value||"").trim();
				let regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
				$("#news-error").removeClass("show");
				if(email==="" || !regex.test(email)){
					$("#news-error-msg").text('Por favor ingrese un correo válido');
					$("#news-error").addClass("show");
					return;
				}
				const $btn=$(f).find('[type="submit"]');
				$btn.prop('disabled',true);
				$.post("/subscribe",{email:email})
					.done(function(response){
						$("#news-success-msg").text(response);
						$(f).hide();
						$("#news-success").addClass("show");
					})
					.fail(function(){
						$btn.prop('disabled',false);
						$("#news-error-msg").text('Ocurrió un error. Por favor, inténtalo nuevamente.');
						$("#news-error").addClass("show");
					});
			});
		});
	}
}

/**
 * @description: Función encargada del despliegue del modal del menún inicio | home; por defecto se auto ejecutan; si desea cambiar el comportamiento
 * cambie el valor show por hide
 */
function modalCampaign(){
	if(document.querySelector("#campaign-modal")) {
		if (typeof popupStatusM === 'undefined' || popupStatusM == 1) {
			$('#campaign-modal').modal('show');
		}
	}
}
/**
 * @description: Función encargada del despliegue del modal del menú analítica por defecto se auto ejecutan; si desea cambiar el comportamiento
 * cambie el valor show por hide
 */
function modalAnalytics(){
	if(document.querySelector("#analytic-modal"))  $('#analytic-modal').modal('show');
}

function openDataForm(){
	//Clean inputs
	if(document.getElementById('open-data-button-clear')) document.getElementById('open-data-button-clear').addEventListener('click',(e)=>{
		e.preventDefault();
		document.getElementById('open-data-form').reset();
	});
	//get results
	if(document.getElementById('open-data-form')) document.getElementById('open-data-form').addEventListener('submit',(e)=>{
		e.preventDefault();
		let dataToSend={
			search:$("#search-data").val(),
			category:$("#category-data").val(),
			order_by:$("#order-data").val(),
			ask:$("#ask-data").val()
		}
		fetch('/datosabiertos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(dataToSend)})
		.then(results=>results.json())
		.then(response=>{
		console.log(response);
		})
		.catch(error=>console.error(error));
	});
}

function fileSelectedName(){
	$(".custom-file-input").on("change", function() {
		var fileName = $(this).val().split("\\").pop();
		$(this).siblings(".custom-file-label").addClass("selected").html(fileName);
	});
}

/**
 * @description Cierra el menú hamburguesa (#navbarResponsive) al hacer clic fuera de él
 *              y al redimensionar el viewport a >=992px (p.ej. al rotar a PC).
 *              Usa el toggler nativo de Bootstrap para colapsar.
 */
function closeNavbarOnOutsideClick(){
	var navbarCollapse = document.getElementById('navbarResponsive');
	var toggler = document.querySelector('#mainNav .navbar-toggler');
	if(!navbarCollapse || !toggler) return;
	document.addEventListener('click', function(e){
		if(navbarCollapse.classList.contains('show')){
			if(!navbarCollapse.contains(e.target) && !toggler.contains(e.target)){
				toggler.click();
			}
		}
	});
	window.addEventListener('resize', function(){
		if(window.innerWidth >= 992 && navbarCollapse.classList.contains('show')){
			toggler.click();
		}
	});
}
