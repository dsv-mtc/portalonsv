const {createLogger, format,transports} = require('winston');
const path=require('path');

//https://www.npmjs.com/package/winston#filtering-info-objects
module.exports = createLogger({
    format:format.combine(
        format.simple(),
        format.timestamp(),
        format.printf(mensaje=> `[${mensaje.timestamp}] ${mensaje.level} ${mensaje.message}`),
        format.colorize({all:true})
    ),
    transports:[
        new transports.File({
            maxsize:5120000,
            maxFiles:5,
            filename:path.join(__dirname,'../logs/onsv.log'),
            level:'error'
        }),
        new transports.Console({
            level:'debug',
        })
    ]
})