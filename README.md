#   PROCESO DE INSTALACIÓN
-   Descargar el código fuente
-   Revisar la consistencia de las variables de entorno del archivo .env; si las condiciones siguen siendo las mismas, no modificar
-   Son de vital importancia revisar las variables URL_PATH y las asociadas a la base de datos y mailchinp
-   Usar la secuencia de comando npm install --> instala todas las dependencias
-   Usar la secuencia de comando npm run webpack --> crea los assets estáticos js y css


#   MAILCHIMP
-   Se logró la conexión y ya se almacena usuarios por tag en la plataforma
-   El template indica se encuentra en la view/pages/newsletter
-   Se implementó la estrategia por envío RSS y no por envío de campaña regular haciendo uso de una tarea de tipo cron

#   PERSONALIZACIÓN DE REGIONES

#   MIGRACIÓN
-   Falta template de tags

#   DATOS ABIERTOS
-   Se debe definir si será on premise o cloud.

#   FUNCIONALIDADES
-   Implementar un spinner time para evitar las rellamadas constantes

#   DATOS ABIERTOS
-   Se implementó la vista general pero no los card-body de cada uno de ellos
-   Se implementó la interfaz de logeo, se va requerir mysql
-   Se implementó los middlewares de control de acceso de usuario