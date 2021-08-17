
const _defaultPriority=0.5;
/**
 * 
 * @param {number} freq 
 * @returns la frecuencia en String
 */
const _getFrecuency=(freq)=>{
    switch (freq) {
        case 0:
            return 'always';
        case 1:
            return 'hourly';
        case 2:
            return 'daily';
        case 3:
            return 'weekly';
        case 4:
            return 'monthly';
        case 5:
            return 'yearly';
        default:
            return 'never';
    }
}

const canonicals=[
    {
        url:`/`,
        httpProtocol:['get'],
        changefreq:_getFrecuency(3),
        priority:_defaultPriority,
        links:[
            {lang:'es',url:`/`},
            {lang:'en',url:`/en/`}
        ]
    },
    {
        url:`/noticias-eventos`,
        httpProtocol:['get'],
        changefreq:_getFrecuency(3),
        priority:0.8,
        links:[
            {lang:'es',url:`/noticias-eventos`},
            {lang:'en',url:`/en/noticias-eventos`}
        ]
    },
    {
        url:`/regiones/`,
        httpProtocol:['get'],
        changefreq:_getFrecuency(3),
        priority:0.8,
        links:[
            {lang:'es',url:`/regiones/`},
            {lang:'en',url:`/en/regiones/`}
        ]

    },
    {
        url:`/publicaciones/`,
        httpProtocol:['get'],
        changefreq:_getFrecuency(3),
        priority:0.8,
        links:[
            {lang:'es',url:`/publicaciones/`},
            {lang:'en',url:`/en/publicaciones/`}
        ]

    },
    {
        url:`/normas-legales/`,
        httpProtocol:['get'],
        changefreq:_getFrecuency(3),
        priority:0.8,
        links:[
            {lang:'es',url:`/normas-legales/`},
            {lang:'en',url:`/en/normas-legales/`}
        ]
    },
    {
        url:`/contacto/`,
        httpProtocol:['get','post'],
        changefreq:_getFrecuency(),
        priority:_defaultPriority,
        links:[
            {lang:'es',url:`/contacto/`},
            {lang:'en',url:`/en/contacto/`}
        ]

    },
    {
        url:`/datosabiertos/`,
        httpProtocol:['get'],
        changefreq:_getFrecuency(3),
        priority:0.8,
        links:[
            {lang:'es',url:`/datosabiertos/`},
            {lang:'en',url:`/en/datosabiertos/`}
        ]
    },
]

const canonical_description=[
    {
        url:`/`,
        title:'Observatorio Nacional de Seguridad Vial',
        description:`El Observatorio Nacional de Seguridad Vial sistematiza,analiza y difunde información sobre riesgos, causas y consecuencias de los siniestros viales utilizando las buenas prácticas en la gestión de datos. Tiene como finalidad servir de insumo a las entidades competentes para mejorar las políticas entorno a la prevención, fiscalización y respuesta frente a la ocurrencia de hechos de tránsito de manera y así garantizar el cuidado de la vida y la salud de todos los usuarios y usuaris de las vías del Perú.`
    },
    {
        url:`/en/`,
        title:'Observatorio Nacional de Seguridad Vial',
        description:`The National Road Safety Observatory systematizes, analyzes and disseminates information on risks, causes and consequences of road accidents using good practices in data management. Its purpose is to serve as an input to the competent entities to improve the policies around the prevention, inspection and response to the  occurrence of traffic events in a manner and thus guarantee the care of the life and health of all users of the roads of Peru.`
    },
    {
        url:`/noticias-eventos/`,
        title:'ONSV - Noticias y Eventos',
        description:`Noticias y eventos`
    },
    {
        url:`/en/noticias-eventos/`,
        title:'ONSV - News and Events',
        description:`News and Events`
    },
    {
        url:`/regiones/`,
        title:'ONSV - Regiones',
        description:`Regiones`
    },
    {
        url:`/en/regiones/`,
        title:'ONSV - Regions',
        description:`Regions`
    },
    {
        url:`/publicaciones/`,
        title:'ONSV - Publicaciones',
        description:`Publicaciones`
    },
    {
        url:`/en/publicaciones/`,
        title:'ONSV - Publications',
        description: `Publications`
    },
    {
        url:`/normas-legales/`,
        title:'ONSV - Normas Legales',
        description: `Normas Legales`
    },
    {
        url:`/en/normas-legales/`,
        title:'ONSV - Laws',
        description: `Laws`
    },
    {
        url:`/contacto/`,
        title:'ONSV - Contacto',
        description:`Contacto`
    },
    {
        url:`/en/contacto/`,
        title:'ONSV - Contact',
        description:`Contact`
    }

]



module.exports ={canonicals,canonical_description};