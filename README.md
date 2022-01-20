#   **CONSIDERACIONES GENERALES**
La aplicación responde a una actualización de servicios de la plataforma onsv no a una nueva actualización; en consecuencia se asume que existe:
-   Node js instalado (verificar)
-   Mysql instalado (verificar)
-   Ghost instalado (verificar)
-   Nginx instalado (verificar)

Si alguno de los componentes de la lista no se encuentra presente, reportar a los encargados correspondientes.


#   **PROCESO DE INSTALACIÓN**

##  CÓDIGO FUENTE
-   Clonar el código fuente:   
<code>
    git clone https://gitlab.com/onsvgroup/onsv-express.git  
 </code>
 Si se solicita usuario y password colocar **onsvdev@gmail.com** y **onsvdeveloper** respectivamente.
 -  Luego de la clonación ingresa a la carpeta clonada e instala las dependencias con :  
             <code>npm install</code>
 - Luego de instalar las dependencias, se requiere de un paquete de control de la aplicación; esto con el fin de asegurar que la aplicación se reiniciará automáticamente cuando exista una falla, para ello se usará [PM2][pm2] y lo instalamos de la siguiente forma:  
            <code>npm install pm2 -g</code>
-   El código fuente se ha manejado en 5 ambientes que influyen en el valor de la variable **URL_PATH**; la cual es la ruta base de conexión del host y que se usa para el parseo de las direcciones de la aplicación, así como la conexión a la base de datos; en consecuencia los valores según ambiente son:
    -   Localhost (HOST windows): http://localhost:3000
    -   Ubuntu multipass (Host Ubuntu como VM): http://172.26.80.163
    -   GCloud: https://onsv-dot-pruebasfiisuni.ue.r.appspot.com
    -   Desarrollo MTC: http://dvonsv.mtc.gob.pe
    -   Producción MTC  https://onsv.gob.pe
-   La aplicación utiliza webpack para la generación de los archivos estáticos; en consecuencia, si se modifica algún archivo js o css ejecutar:  
<code>npm run webpack</code>

## PM2
-   Ingresamos a la carpeta clonada
-   Ejecutamos <code> pm2 start index.js</code>; la aplicación se se ejecutará por defecto en el puerto 3000 o en un puerto asignado por el servidor.
-   **Observación1**: Se puede ver la lista de aplicaciones con <code>pm2 list</code> 
-   **Observación2**: Se pueden visualizar los logs con <code>pm2 logs 'name'</code> ; siendo name el nombre de la aplicación; el name se obtiene del campo name al ejecutar la observación 1.
-   **Observación3**: En ocasiones se requiere realizar cambios en el código fuente con lo cual debemos de actualizarlo; para ello cuando realicemos nuestros cambios debemos de reiniciar la aplicación con <code>pm2 restart 'name'</code>. Siendo name un campo que se obtiene al ejecutar la obsr. 1.
Si la aplicación no muestra nuestros cambios debemos de revisar los logs; existe la posibilidad que nginx haya tomado el puerto y nuestra aplicación esté en bucle sin ejecutar los cambios para ello debemos de hacer kill del proceso:  
Obtenemos el **PID** del proceso con <code> sudo lsof -i:3000</code> y lo finalizamos con: <code>sudo kill -9 'PID'</code> siendo PID el valor del proceso.


## NGINX
[Nginx][nginx] es un servidor web de código abierto que es usado como proxy inverso, cache de HTTP, y balanceador de carga; dentro de la plataforma ha sido utilizado para la configuración SSL y el proxy pass de la aplicación ghost (ONSV). Tiene 3 componentes importantes:
-   **nginx.conf**: Archivo general de configuración de nginx, en el se concentran todos los websites habilitados.
-   **sites-available**: Carpeta que contiene todos los websites disponibles en el servidor. 
-   **sites-enabled**: Carpeta que contiene todos los websites disponibles y habilitados de la aplicación.

La configuración básica de ghost contenida en nginx es:
``` 
server {
    listen 0.0.0.0:80;
    server_name onsv.gob.pe;
    access_log /var/log/nginx/onsv.log;

    location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header HOST $http_host;
        proxy_set_header X-NginX-Proxy true;

        proxy_pass http://127.0.0.1:2369;
        proxy_redirect off;
    }
}
```


Buscamos este segmento en las carpetas **sites-available**, **sites-enabled** o **nginx.conf**; en caso de no encontrar el segmento o archivo reportarlo, Observación (el archivo debería encontrarse dentro de la carpeta sites-available). Cuando encontramos el segmento lo modificamos a:

``` 
server {
    listen 0.0.0.0:5000;
    server_name onsv.gob.pe;
    access_log /var/log/nginx/onsv.log;

    location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header HOST $http_host;
        proxy_set_header X-NginX-Proxy true;

        proxy_pass http://127.0.0.1:2369;
        proxy_redirect off;
    }
}
```

Asumiento que el archivo se encuentra dentro de **sites-available** y que se llama **onsv.gob.pe** requerimos realizar una copia del mismo, para ello ejecutamos:

<code> cp onsv.gob.pe onsv.express</code>

Abrimos el archivo copiado con:

<code> sudo nano onsv.express </code>

Modificamos el archivo para obtener el siguiente resultado: 
``` 
server {
    listen 0.0.0.0:80;
    server_name onsv.gob.pe;
    access_log /var/log/nginx/onsv.log;

    location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header HOST $http_host;
        proxy_set_header X-NginX-Proxy true;

        proxy_pass http://127.0.0.1:3000;
        proxy_redirect off;
    }
}
```
Nos situamos dentro de la carpeta **sites-enabled** y creamos un enlace de referencia del archivo **onsv.express**, con el siguiente comando:  
<code>sudo ln -s ../sites-available/onsv.express .</code>  
Salimos de la carpeta **sites-enabled** y abrimos el archivo **nginx.conf** con:  
<code>sudo nano nginx.conf</code> y agregamos dentro de la sección **http**:
```
http{
    ...
    include /etc/nginx/sites-enabled/onsv.express;
}
```
Guardamos y  verificamos que el archivo esté correcto con: <code> sudo nginx -t</code>; si obtenemos un mensaje exitoso procedemos a reiniciar nginx con: <code> sudo nginx -s reload</code>

## MYSQL
-   Accedemos a mysql con usuario root (solicitar las credenciales).
-   Creamos un nuevo usuario y damos privilegios de administrador:
```
CREATE USER 'onsv'@'localhost' IDENTIFIED BY 'user_onsv2021#HMR';
GRANT ALL PRIVILEGES ON *.* TO 'onsv'@'localhost'   WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON *.* TO 'onsv'@'%'   WITH GRANT OPTION;
FLUSH PRIVILEGES;
```
El usuario onsv está preparado incluso para la conexión remota; podemos encontrar mayores detalles [aquí][conexion-remota].

Debemos de crear la base de datos **onsv** y las tablas **user** y **files**
```
CREATE SCHEMA `onsv` DEFAULT CHARACTER SET utf8 COLLATE utf8_bin ;

#luego de crear la base de datos ejecutar el siguiente script

USE onsv;
create table if not exists files (
id int auto_increment not null, 
title varchar(500) not null, 
author varchar(500) not null,
description text not null,
category1 varchar(100) not null,
category2 varchar(100),
category3 varchar(100),
type varchar(100) not null,
excelfile varchar(500),
pdffile varchar(500),
csvfile varchar(500),
primary key (id) 
);
 create table users (
 id int not null auto_increment, 
 user varchar(500) not null,
 password varchar(500) not null, 
 primary key (id)
 );
```
Dependiendo de la versión de mysql (8.0.22) y de las configuraciones el script podría no ser aplicable o presentar algún tipo de error; finalmente se debe obtener las tablas.

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



[pm2]:"https://github.com/Unitech/pm2"
[nginx]:"https://www.nginx.com/resources/wiki/"
[conexion-remota]:"https://medium.com/code-kings/mysql-how-to-connect-to-your-ubuntu-vm-remotely-using-mysql-workbench-from-oracle-e280602d7ff9"