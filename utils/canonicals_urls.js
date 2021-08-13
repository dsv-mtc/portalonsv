
const _defaultPriority=0.5;
/**
 * 
 * @param {number} freq 
 * @returns la frecuencia en String
 */
const _getFrecuency=(freq)=>{
    switch (frec) {
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
        url:`${process.env.URL_PATH}/`,
        changefreq:_getFrecuency(3),
        priority:_defaultPriority,
        links:[
            {lang:'es',url:`${process.env.URL_PATH}/`},
            {lang:'en',url:`${process.env.URL_PATH}/en/`}
        ]
    },
    {
        url:`${process.env.URL_PATH}/noticias-eventos`,
        changefreq:_getFrecuency(3),
        priority:0.8,
        links:[
            {lang:'es',url:`${process.env.URL_PATH}/noticias-eventos`},
            {lang:'en',url:`${process.env.URL_PATH}/en/noticias-eventos`}
        ]
    },
    {
        url:`${process.env.URL_PATH}/regiones/`,
        changefreq:_getFrecuency(3),
        priority:0.8,
        links:[
            {lang:'es',url:`${process.env.URL_PATH}/regiones`},
            {lang:'en',url:`${process.env.URL_PATH}/en/regiones`}
        ]

    },
    {
        url:`${process.env.URL_PATH}/publicaciones`,
        changefreq:_getFrecuency(3),
        priority:0.8,
        links:[
            {lang:'es',url:`${process.env.URL_PATH}/publicaciones`},
            {lang:'en',url:`${process.env.URL_PATH}/en/publicaciones`}
        ]

    },
    {
        url:`${process.env.URL_PATH}/normas-legales`,
        changefreq:_getFrecuency(3),
        priority:0.8,
        links:[
            {lang:'es',url:`${process.env.URL_PATH}/normas-legales`},
            {lang:'en',url:`${process.env.URL_PATH}/en/normas-legales`}
        ]
    },
    {
        url:`${process.env.URL_PATH}/contacto`,
        changefreq:_getFrecuency(),
        priority:_defaultPriority,
        links:[
            {lang:'es',url:`${process.env.URL_PATH}/contacto`},
            {lang:'en',url:`${process.env.URL_PATH}/en/contacto`}
        ]

    }
]

const canonical_description=[
    {
        url:`${process.env.URL_PATH}/`,
        description:`El Observatorio Nacional de Seguridad Vial sistematiza, 
        analiza y difunde información sobre riesgos, causas y consecuencias de 
        los siniestros viales utilizando las buenas prácticas en la gestión de datos. 
        Tiene como finalidad servir de insumo a las entidades competentes para mejorar 
        las políticas entorno a la prevención, fiscalización y respuesta frente a la 
        ocurrencia de hechos de tránsito de manera y así garantizar el cuidado de la 
        vida y la salud de todos los usuarios y usuaris de las vías del Perú.`
    },
    {
        url:`${process.env.URL_PATH}/en`,
        description:`The National Road Safety Observatory systematizes,
        analyzes and disseminates information on risks, causes and consequences of
        road accidents using good practices in data management.
        Its purpose is to serve as an input to the competent entities to improve
        the policies around the prevention, inspection and response to the
        occurrence of traffic events in a manner and thus guarantee the care of the
        life and health of all users of the roads of Peru.`
    },
    {
        url:`${process.env.URL_PATH}/noticias-eventos`,
        description:`Noticias y eventos`
    },
    {
        url:`${process.env.URL_PATH}/en/noticias-eventos`,
        description:`News and Events`
    },
    {
        url:`${process.env.URL_PATH}/regiones/`,
        description:`Regiones`
    },
    {
        url:`${process.env.URL_PATH}/en/regiones/`,
        description:`Regions`
    },
    {
        url:`${process.env.URL_PATH}/publicaciones`,
        description:`Publicaciones`
    },
    {
        url:`${process.env.URL_PATH}/en/publicaciones`,
        description: `Publications`
    },
    {
        url:`${process.env.URL_PATH}/normas-legales`,
        description: `Normas Legales`
    },
    {
        url:`${process.env.URL_PATH}/en/normas-legales`,
        description: `Laws`
    },
    {
        url:`${process.env.URL_PATH}/contacto`,
        description:`Contacto`
    },
    {
        url:`${process.env.URL_PATH}/en/contacto`,
        description:`Contact`
    }

]



module.exports ={canonicals,canonical_description};