#   PROCESO DE INSTALACIÓN
-   Descargar el código fuente
-   Revisar la consistencia de las variables de entorno del archivo .env; si las condiciones siguen siendo las mismas, no modificar
-   Son de vital importancia revisar las variables URL_PATH y las asociadas a la base de datos y mailchinp
-   Usar la secuencia de comando npm install --> instala todas las dependencias
-   Usar la secuencia de comando npm run webpack --> crea los assets estáticos js y css

# SITEMAP
-   La generación del sitemap tiene dos mecanismos de creación; v1 y v2, haciendo uso de v1 se debe emplear sitemap.XMLToWeb(res)

#   MAILCHIMP
-   Se logró la conexión y ya se almacena usuarios por tag en la plataforma
-   El template indica se encuentra en la view/pages/newsletter
-   Se implementó la estrategia por envío RSS y no por envío de campaña regular haciendo uso de una tarea de tipo cron

#   PERSONALIZACIÓN DE REGIONES

#   CONEXIÓN DE MYSQL
-   Ingresar la siguiente data dentro de index.js luego de la sentencia de conexión: 
    mysqlClient.setQuery();
    mysqlClient.saveUser('elpadredelcordero@gmail.com','123456') || mysqlClient.saveUser('elpadredelcordero@gmail.com','admin')
-   Reemplazar los valores de prueba por el valor real del admin de ONSV

# CRYPTO UTILS
- variable de entorno : DATA_TO_CRYPT="{propiedad:'ONSV',autor:'Henry Medina Rodríguez',contacto:'hmedinar@uni.pe'}"


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