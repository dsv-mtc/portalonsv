-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: onsv
-- ------------------------------------------------------
-- Server version	8.0.22

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accesos_rapidos`
--

DROP TABLE IF EXISTS `accesos_rapidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accesos_rapidos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idioma` varchar(2) NOT NULL COMMENT 'ES | EN',
  `orden` int NOT NULL DEFAULT '0' COMMENT 'Posicion de la tarjeta (1 y 2)',
  `eyebrow` varchar(200) DEFAULT NULL,
  `titulo` varchar(500) DEFAULT NULL,
  `descripcion` text,
  `texto_boton` varchar(200) DEFAULT NULL,
  `enlace_boton` varchar(500) DEFAULT NULL,
  `external` tinyint NOT NULL DEFAULT '0' COMMENT '1 si el enlace es http(s) externo',
  `imagen` varchar(500) DEFAULT NULL,
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_idioma_orden` (`idioma`,`orden`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accesos_rapidos`
--

LOCK TABLES `accesos_rapidos` WRITE;
/*!40000 ALTER TABLE `accesos_rapidos` DISABLE KEYS */;
INSERT INTO `accesos_rapidos` VALUES (1,'ES',1,'Formación','Educación Vial','Webinars, capacitaciones y aula virtual para fortalecer la cultura de seguridad vial en todo el país.','Ir al aula virtual','https://aulavirtual.mtc.gob.pe/seguridadvial/',1,'/img/fondo-educacion.png','2026-08-13 18:12:49','2026-08-13 18:12:49'),(2,'ES',2,'Publicación','Revista Institucional','Análisis, investigación y buenas prácticas de seguridad vial en una edición periódica del Observatorio.','Ver ediciones','/revistas',0,'/img/fondo-revista.png','2026-08-13 18:12:49','2026-08-13 18:12:49'),(3,'EN',1,'Training','Road Safety Education','Webinars, trainings and virtual classroom to strengthen road safety culture nationwide.','Go to virtual classroom','https://aulavirtual.mtc.gob.pe/seguridadvial/',1,'/img/fondo-educacion.png','2026-08-13 18:12:49','2026-08-13 18:12:49'),(4,'EN',2,'Publication','Institutional Journal','Analysis, research and road safety best practices in a periodic edition of the Observatory.','See editions','/revistas',0,'/img/fondo-revista.png','2026-08-13 18:12:49','2026-08-13 18:12:49');
/*!40000 ALTER TABLE `accesos_rapidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `actividad`
--

DROP TABLE IF EXISTS `actividad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actividad` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `idResponsable` int NOT NULL,
  `idPrograma` int DEFAULT NULL,
  `fechaInicio` date NOT NULL,
  `fechaFin` date DEFAULT NULL,
  `idEstadoActividad` int NOT NULL,
  `ponderacion` float DEFAULT '0',
  `estaActivo` tinyint(1) NOT NULL DEFAULT '1',
  `fechaRegistro` datetime NOT NULL,
  `idUsuarioRegistro` int DEFAULT NULL,
  `fechaActualizacion` datetime NOT NULL,
  `idUsuarioActualizacion` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_actividad_responsable` (`idResponsable`),
  KEY `fk_actividad_estado_actividad` (`idEstadoActividad`),
  KEY `fk_actividad_user_actualizacion` (`idUsuarioRegistro`),
  KEY `fk_actividad_programa` (`idPrograma`),
  CONSTRAINT `fk_actividad_estado_actividad` FOREIGN KEY (`idEstadoActividad`) REFERENCES `responsable` (`id`),
  CONSTRAINT `fk_actividad_programa` FOREIGN KEY (`idPrograma`) REFERENCES `programa` (`id`),
  CONSTRAINT `fk_actividad_responsable` FOREIGN KEY (`idResponsable`) REFERENCES `responsable` (`id`),
  CONSTRAINT `fk_actividad_user_actualizacion` FOREIGN KEY (`idUsuarioRegistro`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_actividad_user_registro` FOREIGN KEY (`idUsuarioRegistro`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actividad`
--

LOCK TABLES `actividad` WRITE;
/*!40000 ALTER TABLE `actividad` DISABLE KEYS */;
INSERT INTO `actividad` VALUES (1,'Evaluación del indicador y reporte de intervención','Actividad 1',1,NULL,'2023-03-31',NULL,1,0,1,'2023-03-31 04:03:57',2,'2023-03-31 04:03:57',2),(2,'Ejecución de medidas correctivas en PAS priorizados por municipalidad','Actividad 2',1,NULL,'2023-04-01',NULL,2,12,1,'2023-03-31 04:07:45',2,'2023-03-31 04:07:45',2),(4,'Asistencia técnica para el diseño del proyecto de intervención en municipalidades',NULL,1,NULL,'2023-04-03',NULL,1,12.5,1,'2023-03-31 04:12:01',2,'2023-03-31 04:12:01',2),(5,'Capacitación en gestión de vías segurars en el marco de los nuevos límites de velocidad',NULL,2,NULL,'2023-05-04',NULL,1,50,1,'2023-03-31 04:12:41',2,'2023-03-31 04:12:41',2),(7,'Identificación y priorización de zonas de concentrarción de siniestros y entornos escolares',NULL,1,NULL,'2023-05-05',NULL,1,0,1,'2023-03-31 04:25:22',2,'2023-03-31 04:25:22',2);
/*!40000 ALTER TABLE `actividad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asistencia_municipio`
--

DROP TABLE IF EXISTS `asistencia_municipio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asistencia_municipio` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idProvincia` int NOT NULL,
  `idActividad` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_asistencia_municipio_provincia` (`idProvincia`),
  KEY `fk_asistencia_municipio_actividad` (`idActividad`),
  CONSTRAINT `fk_asistencia_municipio_actividad` FOREIGN KEY (`idActividad`) REFERENCES `actividad` (`id`),
  CONSTRAINT `fk_asistencia_municipio_provincia` FOREIGN KEY (`idProvincia`) REFERENCES `provincia` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asistencia_municipio`
--

LOCK TABLES `asistencia_municipio` WRITE;
/*!40000 ALTER TABLE `asistencia_municipio` DISABLE KEYS */;
/*!40000 ALTER TABLE `asistencia_municipio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `banners`
--

DROP TABLE IF EXISTS `banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `posicion` int NOT NULL,
  `archivo` varchar(500) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `kicker_es` varchar(200) DEFAULT NULL,
  `kicker_en` varchar(200) DEFAULT NULL,
  `titulo_es` varchar(500) DEFAULT NULL,
  `titulo_en` varchar(500) DEFAULT NULL,
  `parrafo_es` varchar(2000) DEFAULT NULL,
  `parrafo_en` varchar(2000) DEFAULT NULL,
  `btn1_label_es` varchar(100) DEFAULT NULL,
  `btn1_label_en` varchar(100) DEFAULT NULL,
  `btn1_href` varchar(500) DEFAULT NULL,
  `btn2_label_es` varchar(100) DEFAULT NULL,
  `btn2_label_en` varchar(100) DEFAULT NULL,
  `btn2_href` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banners`
--

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;
INSERT INTO `banners` VALUES (1,1,'/assets/banner1.png','2026-08-03 23:07:50','2026-08-18 23:57:43','Decenio de Acción 2021–2030','Decade of Action 2021–2030','Datos que <em>salvan vidas</em> en las vías del Perú','Data that <em>saves lives</em> on Peru\'s roads','El Observatorio Nacional de Seguridad Vial sistematiza, analiza y difunde información sobre los siniestros viales para fortalecer las políticas de prevención.','The National Road Safety Observatory systematizes, analyzes and disseminates information on road accidents to strengthen prevention policies.','Ver cifras 2025','See 2025 figures','#siniestralidad','Analítica de Datos','Accidents Map','/analitica'),(2,3,'/assets/banner_2_1786816353179.png','2026-08-03 23:07:50','2026-08-18 21:45:49',NULL,'Current Campaign',NULL,'Safe road <em>environments</em>',NULL,'Learn about actions to reduce pollution and risk in high-traffic corridors.',NULL,'See more',NULL,NULL,NULL,NULL),(3,2,'/assets/banner3.png','2026-08-03 23:07:50','2026-08-18 21:45:38','Aplicativo','Application','SRAT · Visor de alerta de <em>siniestros</em>','SRAT · Accident <em>alert viewer</em>','Monitoreo georreferenciado de los hechos de tránsito a nivel nacional, en tiempo cercano al real.','Georeferenced monitoring of traffic incidents nationwide, in near real time.','Abrir visor','Open viewer','https://sratma.mtc.gob.pe/SRATMA/mapa/',NULL,NULL,NULL);
/*!40000 ALTER TABLE `banners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `capacitacion`
--

DROP TABLE IF EXISTS `capacitacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `capacitacion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `fechaCapacitacion` datetime DEFAULT NULL,
  `urlDocumento1` text,
  `urlDocumento2` text,
  `idActividad` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_capacitacion_actividad` (`idActividad`),
  CONSTRAINT `fk_capacitacion_actividad` FOREIGN KEY (`idActividad`) REFERENCES `actividad` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `capacitacion`
--

LOCK TABLES `capacitacion` WRITE;
/*!40000 ALTER TABLE `capacitacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `capacitacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria` (
  `id` int NOT NULL AUTO_INCREMENT,
  `value` varchar(40) COLLATE utf8_bin DEFAULT NULL,
  `icon` text CHARACTER SET utf8 COLLATE utf8_bin,
  `estaActivo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES (21,'Personas involucradas','/estaticos/img/youtube-icon.svg',1),(22,'Gestión de Velocidades','/estaticos/img/zoomus-icon.svg',1),(23,'Infraestructura Segura','/estaticos/img/webex-seeklogo.com-svg.svg',1),(24,'Respuesta a Siniestros','/estaticos/img/facebook.svg',1),(25,'Usuarios vulnerables','/estaticos/img/google-meet.svg',1),(26,'Vehículos Seguros','/estaticos/img/zoomus-icon.svg',1),(29,'Mapa de Calor','/estaticos/img/youtube-icon.svg',0),(31,'Siniestros',NULL,1),(32,'Personas Involucradas','',0),(33,'Vehículos Involucrados','',0);
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `componentes_tecnologicos`
--

DROP TABLE IF EXISTS `componentes_tecnologicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `componentes_tecnologicos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idioma` varchar(2) NOT NULL COMMENT 'ES | EN',
  `orden` int NOT NULL DEFAULT '0' COMMENT 'Posicion en el carrusel',
  `titulo` varchar(2000) DEFAULT NULL,
  `descripcion` text,
  `link` varchar(500) DEFAULT NULL,
  `icon` text COMMENT 'SVG path opcional. Si es NULL, el controlador aplica fallback ciclico',
  `external` tinyint NOT NULL DEFAULT '0' COMMENT '1 si el link es http(s) externo',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_idioma_orden` (`idioma`,`orden`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `componentes_tecnologicos`
--

LOCK TABLES `componentes_tecnologicos` WRITE;
/*!40000 ALTER TABLE `componentes_tecnologicos` DISABLE KEYS */;
INSERT INTO `componentes_tecnologicos` VALUES (1,'ES',1,'Entornos Viales Seguros','Programa de Incentivos a la Mejora de la Gestión Municipal 2026.','https://www.gob.pe/institucion/mtc/campa%C3%B1as/130605-entornos-viales-seguros',NULL,1,'2026-08-07 23:29:56','2026-08-18 23:42:02'),(2,'ES',2,'Visor de Mapas','Mapas georreferenciados de seguridad vial.','https://sratma.mtc.gob.pe/SRATMA/mapa/',NULL,1,'2026-08-07 23:29:56','2026-08-18 23:43:19'),(3,'ES',3,'Datos Abiertos','Datasets descargables en Excel, CSV, PDF y shapefile.','/datosabiertos',NULL,0,'2026-08-07 23:29:56','2026-08-18 23:46:54'),(4,'ES',4,'Registro de Siniestros','Reporte y consulta de siniestros de tránsito registrados.','https://www.onsv.gob.pe/srat/',NULL,1,'2026-08-07 23:29:56','2026-08-18 23:46:56'),(5,'ES',5,'Tableros BI','Inteligencia de negocio para la toma de decisiones.','/analitica',NULL,0,'2026-08-07 23:29:56','2026-08-18 23:46:58'),(6,'ES',6,'Aula Virtual','Cursos de seguridad vial.','https://aulavirtual.mtc.gob.pe/seguridadvial/',NULL,1,'2026-08-07 23:29:56','2026-08-18 23:48:49'),(7,'ES',7,'Iniciativa de Seguridad Vial Organizacional','Fomenta la seguridad vial de trabajadores, usuarios, clientes, proveedores y la comunidad de influencia de las organizaciones.','https://svo.mtc.gob.pe/#/login',NULL,1,'2026-08-07 23:29:56','2026-08-18 23:48:48'),(16,'EN',1,'School Environment','Road safety and prevention in school zones.','https://aulavirtual.mtc.gob.pe/seguridadvial/',NULL,1,'2026-08-08 00:11:35','2026-08-08 00:26:16'),(17,'EN',2,'Analytics Dashboards','Dynamic visualization of indicators and trends.','/analitica',NULL,0,'2026-08-08 00:11:35','2026-08-08 00:26:16'),(18,'EN',3,'Victim Registry','Tracking system for injured and deceased.','/analitica',NULL,0,'2026-08-08 00:11:35','2026-08-08 00:26:16'),(19,'EN',4,'Map Viewer','Georeferenced road safety maps.','/',NULL,0,'2026-08-08 00:11:35','2026-08-08 00:26:16'),(20,'EN',5,'Open Data','Downloadable datasets in Excel, CSV, PDF and shapefile.','/datosabiertos',NULL,0,'2026-08-08 00:11:35','2026-08-08 00:26:16'),(21,'EN',6,'BI Dashboards','Business intelligence for decision making.','#',NULL,0,'2026-08-08 00:11:35','2026-08-08 00:26:16'),(22,'EN',7,'Accident Records','Reporting and querying registered traffic crashes.','#',NULL,0,'2026-08-08 00:11:35','2026-08-08 00:26:16'),(23,'EN',8,'Analytics','Dashboards and road safety indicators.','#',NULL,0,'2026-08-08 00:11:35','2026-08-08 00:26:16'),(24,'EN',9,'SRAT','Traffic crash alert viewer.','https://sratma.mtc.gob.pe/SRATMA/mapa/',NULL,1,'2026-08-08 00:11:35','2026-08-08 00:26:16');
/*!40000 ALTER TABLE `componentes_tecnologicos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `entornos_viales`
--

DROP TABLE IF EXISTS `entornos_viales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entornos_viales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `badge_es` varchar(255) DEFAULT NULL,
  `badge_en` varchar(255) DEFAULT NULL,
  `titulo_es` varchar(255) DEFAULT NULL,
  `titulo_en` varchar(255) DEFAULT NULL,
  `descripcion_es` text,
  `descripcion_en` text,
  `imagen_url` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `orden` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entornos_viales`
--

LOCK TABLES `entornos_viales` WRITE;
/*!40000 ALTER TABLE `entornos_viales` DISABLE KEYS */;
/*!40000 ALTER TABLE `entornos_viales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_actividad`
--

DROP TABLE IF EXISTS `estado_actividad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_actividad` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) NOT NULL,
  `estaActivo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_actividad`
--

LOCK TABLES `estado_actividad` WRITE;
/*!40000 ALTER TABLE `estado_actividad` DISABLE KEYS */;
INSERT INTO `estado_actividad` VALUES (1,'En inicio',1),(2,'Ejecutando',1),(3,'Terminado',1),(4,'Estado 1',1),(5,'Nuevo estado actividad',1);
/*!40000 ALTER TABLE `estado_actividad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evento`
--

DROP TABLE IF EXISTS `evento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evento` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8_bin NOT NULL,
  `idTipoEvento` int DEFAULT NULL,
  `organizedBy` varchar(255) COLLATE utf8_bin NOT NULL,
  `place` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `shortDescription` text COLLATE utf8_bin,
  `description` text COLLATE utf8_bin,
  `startTime` datetime NOT NULL,
  `endTime` datetime DEFAULT NULL,
  `price` float DEFAULT NULL,
  `imageUrl` text COLLATE utf8_bin,
  `reunionLink` text COLLATE utf8_bin,
  `facebookLink` text COLLATE utf8_bin,
  `youtubeLink` text COLLATE utf8_bin,
  `twitterLink` text COLLATE utf8_bin,
  `anotherLink` text COLLATE utf8_bin,
  `isActive` tinyint(1) DEFAULT '1',
  `direccion` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idTipoEvento` (`idTipoEvento`),
  CONSTRAINT `evento_ibfk_1` FOREIGN KEY (`idTipoEvento`) REFERENCES `tipo_evento` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evento`
--

LOCK TABLES `evento` WRITE;
/*!40000 ALTER TABLE `evento` DISABLE KEYS */;
/*!40000 ALTER TABLE `evento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `files`
--

DROP TABLE IF EXISTS `files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `files` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(500) COLLATE utf8_bin NOT NULL,
  `author` varchar(500) COLLATE utf8_bin NOT NULL,
  `description` text COLLATE utf8_bin NOT NULL,
  `idCategoria` int DEFAULT NULL,
  `idTipo` int DEFAULT NULL,
  `category2` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `category3` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `excelfile` varchar(500) COLLATE utf8_bin DEFAULT NULL,
  `pdffile` varchar(500) COLLATE utf8_bin DEFAULT NULL,
  `csvfile` varchar(500) COLLATE utf8_bin DEFAULT NULL,
  `shapefile` varchar(500) COLLATE utf8_bin DEFAULT NULL,
  `fecha` varchar(500) COLLATE utf8_bin DEFAULT NULL,
  `estaActivo` tinyint DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_file_categoria` (`idCategoria`),
  KEY `fk_file_tipo` (`idTipo`),
  CONSTRAINT `files_ibfk_1` FOREIGN KEY (`idCategoria`) REFERENCES `categoria` (`id`),
  CONSTRAINT `files_ibfk_2` FOREIGN KEY (`idTipo`) REFERENCES `tipo` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `files`
--

LOCK TABLES `files` WRITE;
/*!40000 ALTER TABLE `files` DISABLE KEYS */;
INSERT INTO `files` VALUES (62,'HISTORICO DE SINIESTROS DE TRÁNSITO 2008-2025 (Preliminar)','ONSV','Resumen histórico de información de siniestros de tránsito, ocurridos a nivel nacional, 2008 - 2025. Las cifras toman como fuente de información los Anuarios Estadísticos de la PNP. Nota: Las cifras del periodo 2025 son preliminares de Enero a Octubre',31,6,NULL,NULL,'/assets/datos/datos_1787095491329.xlsx','null','null','null','2025-12-18',1),(63,'SINIESTROS DE TRANSITO FATALES 2021-2025 (preliminar)','ONSV','Detalle de siniestros de tránsito con consecuencias fatales, ocurridos a nivel nacional, 2021 - 2025 (preliminar)',31,6,NULL,NULL,'/assets/datos/datos_1787095599618.xlsx','null','null','null','2026-02-27',1),(64,'VEHÍCULOS INVOLUCRADOS EN SINIESTROS DE TRÁNSITO FATALES 2021-2025 (preliminar)','ONSV','Detalle de los vehículos involucrados en siniestros de tránsito con consecuencias fatales, ocurridos a nivel nacional, 2021 - 2025 (preliminar)',33,6,NULL,NULL,'/assets/datos/datos_1787095643018.xlsx','null','null','null','2026-02-27',1),(65,'PERSONAS INVOLUCRADAS EN SINIESTROS DE TRÁNSITO FATALES 2021-2025 (PRELIMINAR)','ONSV','Detalle de personas involucradas en siniestros de tránsito con consecuencias fatales, ocurridos a nivel nacional, 2021 - 2025 (preliminar)',32,6,NULL,NULL,'/assets/datos/datos_1787095675339.xlsx','null','null','null','2026-02-27',1);
/*!40000 ALTER TABLE `files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `footer`
--

DROP TABLE IF EXISTS `footer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `footer` (
  `telefono` varchar(20) COLLATE utf8_bin DEFAULT NULL,
  `email` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `direccion` varchar(150) COLLATE utf8_bin DEFAULT NULL,
  `piePagina` text COLLATE utf8_bin,
  `horario` text COLLATE utf8_bin,
  `descripcion` varchar(500) COLLATE utf8_bin DEFAULT NULL,
  `seccion` varchar(150) COLLATE utf8_bin DEFAULT NULL,
  `enlace` varchar(500) COLLATE utf8_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `footer`
--

LOCK TABLES `footer` WRITE;
/*!40000 ALTER TABLE `footer` DISABLE KEYS */;
INSERT INTO `footer` VALUES ('(01) 615-7800','onsv@mtc.gob.pe','Jr. Zorritos 1203, Cercado de Lima','Gobierno. Todos los derechos reservados.','L–V · 9:00 a 18:00','Sistematiza, analiza y difunde información sobre los siniestros viales para servir de insumo a la prevención, fiscalización y respuesta.',NULL,NULL),(NULL,NULL,NULL,NULL,NULL,NULL,'Publicaciones','/publicaciones'),(NULL,NULL,NULL,NULL,NULL,NULL,'Datos abiertos','/datosabiertos'),(NULL,NULL,NULL,NULL,NULL,NULL,'Normas legales','/normas-legales');
/*!40000 ALTER TABLE `footer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `identificacion_priorizacion`
--

DROP TABLE IF EXISTS `identificacion_priorizacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `identificacion_priorizacion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idProvincia` int NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `tipoVia` varchar(40) NOT NULL,
  `detalle` text,
  `latitud` varchar(20) DEFAULT NULL,
  `longitud` varchar(20) DEFAULT NULL,
  `idActividad` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_identificacion_priorizacion_provincia` (`idProvincia`),
  KEY `fk_identificacion_priorizacion_actividad` (`idActividad`),
  CONSTRAINT `fk_identificacion_priorizacion_actividad` FOREIGN KEY (`idActividad`) REFERENCES `actividad` (`id`),
  CONSTRAINT `fk_identificacion_priorizacion_provincia` FOREIGN KEY (`idProvincia`) REFERENCES `provincia` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `identificacion_priorizacion`
--

LOCK TABLES `identificacion_priorizacion` WRITE;
/*!40000 ALTER TABLE `identificacion_priorizacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `identificacion_priorizacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `indicador`
--

DROP TABLE IF EXISTS `indicador`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `indicador` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text,
  `idUnidadMedida` int NOT NULL,
  `porcentaje` float NOT NULL,
  `estaActivo` tinyint(1) NOT NULL DEFAULT '1',
  `fechaRegistro` datetime NOT NULL,
  `idUsuarioRegistro` int DEFAULT NULL,
  `fechaActualizacion` datetime NOT NULL,
  `idUsuarioActualizacion` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_indicador_unidad_medida` (`idUnidadMedida`),
  KEY `fk_indicador_user_actualizacion` (`idUsuarioRegistro`),
  CONSTRAINT `fk_indicador_unidad_medida` FOREIGN KEY (`idUnidadMedida`) REFERENCES `unidad_medida` (`id`),
  CONSTRAINT `fk_indicador_user_actualizacion` FOREIGN KEY (`idUsuarioRegistro`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_indicador_user_registro` FOREIGN KEY (`idUsuarioRegistro`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `indicador`
--

LOCK TABLES `indicador` WRITE;
/*!40000 ALTER TABLE `indicador` DISABLE KEYS */;
INSERT INTO `indicador` VALUES (1,'Indicador 1','Indicador 1',2,123,1,'2023-03-30 07:21:04',2,'2023-03-30 07:21:04',2),(2,'Indicador 2',NULL,2,12,1,'2023-03-30 07:21:34',2,'2023-03-30 07:21:34',2),(4,'Indicador 3',NULL,1,123,1,'2023-03-31 04:22:46',2,'2023-03-31 04:22:46',2),(5,'Indicador de hoy','123esdf',1,324,1,'2023-05-11 16:37:43',2,'2023-05-11 16:37:43',2),(6,'Otro indicador de hoy','asdfasdfasd',1,10,1,'2023-05-11 16:38:01',2,'2023-05-11 16:38:01',2),(7,'Indicador 11-05-2023',NULL,1,12,1,'2023-05-11 16:38:53',2,'2023-05-11 16:38:53',2);
/*!40000 ALTER TABLE `indicador` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logs`
--

DROP TABLE IF EXISTS `logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action` varchar(50) NOT NULL,
  `entity` varchar(100) NOT NULL,
  `entity_id` int DEFAULT NULL,
  `description` text NOT NULL,
  `user_id` int NOT NULL,
  `user_email` varchar(200) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=721 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logs`
--

LOCK TABLES `logs` WRITE;
/*!40000 ALTER TABLE `logs` DISABLE KEYS */;
INSERT INTO `logs` VALUES (1,'created','Tipo',15,'Se creó el tipo \'Blog\'',2,'onsv@mtc.gob.pe','2026-07-20 21:12:31'),(2,'updated','Evento',23,'Se actualizó el evento \'Campaña nueva prueba\'',2,'onsv@mtc.gob.pe','2026-07-20 21:26:43'),(3,'updated','Evento',23,'Se actualizó el evento \'Campaña nueva prueba\'',2,'onsv@mtc.gob.pe','2026-07-20 21:27:03'),(4,'updated','Evento',23,'Se actualizó el evento \'Campaña nueva prueba\'',2,'onsv@mtc.gob.pe','2026-07-20 21:36:57'),(5,'updated','Evento',23,'Se actualizó el evento \'Campaña nueva prueba\'',2,'onsv@mtc.gob.pe','2026-07-20 21:43:05'),(6,'updated','Evento',23,'Se actualizó el evento \'Campaña nueva prueba\'',2,'onsv@mtc.gob.pe','2026-07-20 21:48:46'),(7,'updated','Evento',23,'Se actualizó el evento \'Campaña nueva prueba\'',2,'onsv@mtc.gob.pe','2026-07-20 22:07:07'),(8,'updated','Cifras',1,'Se actualizaron las cifras',2,'onsv@mtc.gob.pe','2026-07-22 19:29:26'),(9,'updated','Región',2,'Se actualizó el nombre del encargado, el celular del encargado, el correo del encargado de la región de Áncash',2,'onsv@mtc.gob.pe','2026-07-22 19:36:48'),(10,'created','Evento',27,'Se creó el evento \'DIA MUNDIAL DE LA BICICLETA\'',2,'onsv@mtc.gob.pe','2026-07-22 19:50:08'),(11,'updated','Evento',26,'Se actualizó el evento \'ENTREVISTA INTERNACIONAL\'',2,'onsv@mtc.gob.pe','2026-07-22 19:51:00'),(12,'updated','Evento',27,'Se actualizó el evento \'DIA MUNDIAL DE LA BICICLETA\'',2,'onsv@mtc.gob.pe','2026-07-22 19:54:55'),(13,'updated','Evento',26,'Se actualizó el evento \'ENTREVISTA INTERNACIONAL\'',2,'onsv@mtc.gob.pe','2026-07-22 19:55:14'),(14,'updated','Evento',26,'Se actualizó el evento \'ENTREVISTA INTERNACIONAL\'',2,'onsv@mtc.gob.pe','2026-07-22 19:55:34'),(15,'updated','Evento',26,'Se actualizó el evento \'ENTREVISTA INTERNACIONAL\'',2,'onsv@mtc.gob.pe','2026-07-22 19:55:50'),(16,'updated','Evento',27,'Se actualizó el evento \'DIA MUNDIAL DE LA BICICLETA\'',2,'onsv@mtc.gob.pe','2026-07-22 19:56:08'),(17,'updated','Evento',27,'Se actualizó el evento \'DIA MUNDIAL DE LA BICICLETA\'',2,'onsv@mtc.gob.pe','2026-07-22 19:59:48'),(18,'updated','Revista',1,'Se actualizó la revista \'Cambio de Título\'',2,'onsv@mtc.gob.pe','2026-07-22 20:03:23'),(19,'deleted','Revista',5,'Se eliminó la revista \'Kawsaypacha: Sociedad y Medio Ambiente\'',2,'onsv@mtc.gob.pe','2026-07-22 20:05:51'),(20,'updated','Misión/Visión',1,'Se actualizó Misión y Visión',2,'onsv@mtc.gob.pe','2026-07-22 20:13:44'),(21,'updated','Misión/Visión',1,'Se actualizó Misión y Visión',2,'onsv@mtc.gob.pe','2026-07-22 20:13:49'),(22,'updated','Misión/Visión',1,'Se actualizó Misión y Visión',2,'onsv@mtc.gob.pe','2026-07-22 20:14:12'),(23,'updated','Menú',1,'Se actualizó el menú \'Siniestros\'',2,'onsv@mtc.gob.pe','2026-07-22 20:19:51'),(24,'updated','Menú',1,'Se actualizó el menú \'Siniestros\'',2,'onsv@mtc.gob.pe','2026-07-22 20:20:43'),(25,'created','Dataset',59,'Se creó el dataset \'prueba\'',2,'onsv@mtc.gob.pe','2026-07-22 20:21:56'),(26,'updated','Dataset',59,'Se actualizó el dataset \'prueba\'',2,'onsv@mtc.gob.pe','2026-07-22 20:23:40'),(27,'updated','Misión/Visión',1,'Se actualizó Misión y Visión',2,'onsv@mtc.gob.pe','2026-07-22 20:23:41'),(28,'updated','Misión/Visión',1,'Se actualizó Misión y Visión',2,'onsv@mtc.gob.pe','2026-07-22 20:23:59'),(29,'updated','Menú',1,'Se actualizó el menú \'Siniestros3333\'',2,'onsv@mtc.gob.pe','2026-07-22 20:27:04'),(30,'updated','Menú',1,'Se actualizó el menú \'Siniestros\'',2,'onsv@mtc.gob.pe','2026-07-22 20:32:47'),(31,'updated','Popup',1,'Se actualizó el popup',2,'onsv@mtc.gob.pe','2026-07-22 20:33:32'),(32,'updated','Dataset',58,'Se actualizó el dataset \'SINIESTROS D\'',2,'onsv@mtc.gob.pe','2026-07-22 20:34:48'),(33,'updated','Dataset',58,'Se actualizó el dataset \'SINIESTROS DE TRANSITO FATALES 2021-2025 (preliminar)\'',2,'onsv@mtc.gob.pe','2026-07-22 20:35:15'),(34,'updated','Tipo',6,'Se actualizó el tipo \'DATASETtttt\'',2,'onsv@mtc.gob.pe','2026-07-22 20:36:37'),(35,'updated','Tipo',6,'Se actualizó el tipo \'DATASET\'',2,'onsv@mtc.gob.pe','2026-07-22 20:36:56'),(36,'created','Revista',7,'Se creó la revista \'CASCOS SEGUROS\'',2,'onsv@mtc.gob.pe','2026-07-22 20:58:09'),(37,'created','Revista',8,'Se creó la revista \'NUEVO DSV\'',2,'onsv@mtc.gob.pe','2026-07-22 21:00:33'),(38,'updated','Revista',6,'Se actualizó la revista \'Educación\'',2,'onsv@mtc.gob.pe','2026-07-27 21:48:24'),(39,'updated','Revista',1,'Se actualizó la revista \'Cambio de Título\'',2,'onsv@mtc.gob.pe','2026-07-27 21:59:29'),(40,'updated','Red Social',2,'Se actualizó la red social \'Twitter\'',2,'onsv@mtc.gob.pe','2026-07-27 22:36:59'),(41,'updated','Red Social',3,'Se actualizó la red social \'YouTube\'',2,'onsv@mtc.gob.pe','2026-07-27 22:37:06'),(42,'updated','Cifras',1,'Se actualizaron las cifras',2,'onsv@mtc.gob.pe','2026-07-30 15:00:34'),(43,'updated','Cifras',1,'Se actualizaron las cifras',2,'onsv@mtc.gob.pe','2026-07-30 15:00:35'),(44,'updated','Cifras',1,'Se actualizaron las cifras',2,'onsv@mtc.gob.pe','2026-07-30 15:00:58'),(45,'updated','Cifras',1,'Se actualizaron las cifras',2,'onsv@mtc.gob.pe','2026-07-30 15:01:06'),(46,'updated','Cifras',1,'Se actualizaron las cifras',2,'onsv@mtc.gob.pe','2026-07-30 15:01:32'),(47,'updated','Cifras',1,'Se actualizaron las cifras',2,'onsv@mtc.gob.pe','2026-07-30 15:02:03'),(48,'updated','Cifras',1,'Se actualizaron las cifras',2,'onsv@mtc.gob.pe','2026-07-30 15:02:21'),(49,'updated','Cifras',1,'Se actualizaron las cifras',2,'onsv@mtc.gob.pe','2026-07-30 15:03:18'),(50,'updated','Región',26,'Se actualizó la imagen de la región de Lima Metropolitana',2,'onsv@mtc.gob.pe','2026-07-30 15:06:21'),(51,'updated','Región',26,'Se actualizó la región de Lima Metropolitana',2,'onsv@mtc.gob.pe','2026-07-30 15:06:26'),(52,'updated','Región',26,'Se actualizó la imagen de la región de Lima Metropolitana',2,'onsv@mtc.gob.pe','2026-07-30 15:07:43'),(53,'updated','Región',26,'Se actualizó la región de Lima Metropolitana',2,'onsv@mtc.gob.pe','2026-07-30 15:07:45'),(54,'updated','Cifras',1,'Se actualizaron las cifras',2,'onsv@mtc.gob.pe','2026-07-30 15:08:45'),(55,'updated','Cifras',1,'Se actualizaron las cifras',2,'onsv@mtc.gob.pe','2026-07-30 15:09:17'),(56,'updated','Región',26,'Se actualizó la región de Lima Metropolitana',2,'onsv@mtc.gob.pe','2026-07-30 15:09:32'),(57,'updated','Región',26,'Se actualizó la región de Lima Metropolitana',2,'onsv@mtc.gob.pe','2026-07-30 15:12:05'),(58,'updated','Región',26,'Se actualizó la región de Lima Metropolitana',2,'onsv@mtc.gob.pe','2026-07-30 15:12:34'),(59,'updated','Región',26,'Se actualizó la imagen de la región de Lima Metropolitana',2,'onsv@mtc.gob.pe','2026-07-30 15:13:05'),(60,'updated','Región',26,'Se actualizó la región de Lima Metropolitana',2,'onsv@mtc.gob.pe','2026-07-30 15:13:07'),(61,'updated','Región',26,'Se actualizó la región de Lima Metropolitana',2,'onsv@mtc.gob.pe','2026-07-30 15:15:53'),(62,'updated','Región',2,'Se actualizó el celular del encargado de la región de Áncash',2,'onsv@mtc.gob.pe','2026-07-30 15:16:14'),(63,'updated','Región',3,'Se actualizó el nombre del encargado, el celular del encargado, el correo del encargado de la región de Apurímac',2,'onsv@mtc.gob.pe','2026-07-30 15:17:31'),(64,'updated','Región',2,'Se actualizó la imagen de la región de Áncash',2,'onsv@mtc.gob.pe','2026-07-30 15:18:18'),(65,'updated','Región',2,'Se actualizó la región de Áncash',2,'onsv@mtc.gob.pe','2026-07-30 15:18:31'),(66,'created','Evento',28,'Se creó el evento \'CASCOS \'',2,'onsv@mtc.gob.pe','2026-07-30 15:18:45'),(67,'updated','Región',2,'Se actualizó la imagen de la región de Áncash',2,'onsv@mtc.gob.pe','2026-07-30 15:18:48'),(68,'updated','Región',2,'Se actualizó la imagen de la región de Áncash',2,'onsv@mtc.gob.pe','2026-07-30 15:19:01'),(69,'updated','Región',2,'Se actualizó la región de Áncash',2,'onsv@mtc.gob.pe','2026-07-30 15:19:03'),(70,'updated','Publicación noticias',0,'Se deshabilitó la publicación \'6840d6725d30e40c752152b7\'',2,'onsv@mtc.gob.pe','2026-07-30 15:19:37'),(71,'updated','Publicación noticias',0,'Se habilitó la publicación \'6840d6725d30e40c752152b7\'',2,'onsv@mtc.gob.pe','2026-07-30 15:19:38'),(72,'updated','Publicación notas-prensa',0,'Se deshabilitó la publicación \'692dd5f3d7fcd10f9cbb3585\'',2,'onsv@mtc.gob.pe','2026-07-30 15:19:59'),(73,'updated','Publicación notas-prensa',0,'Se habilitó la publicación \'692dd5f3d7fcd10f9cbb3585\'',2,'onsv@mtc.gob.pe','2026-07-30 15:20:06'),(74,'created','Evento',29,'Se creó el evento \'Campaña Cascos\'',2,'onsv@mtc.gob.pe','2026-07-30 15:22:40'),(75,'updated','Evento',28,'Se actualizó el evento \'CASCOS \'',2,'onsv@mtc.gob.pe','2026-07-30 15:22:41'),(76,'updated','Evento',27,'Se actualizó el evento \'DIA MUNDIAL DE LA BICICLETA\'',2,'onsv@mtc.gob.pe','2026-07-30 15:23:34'),(77,'created','Tipo Revista',7,'Se creó el tipo de revista \'Seguridad Vial\'',2,'onsv@mtc.gob.pe','2026-07-30 15:27:27'),(78,'updated','Revista',7,'Se actualizó la revista \'CASCOS SEGUROS\'',2,'onsv@mtc.gob.pe','2026-07-30 15:27:43'),(79,'updated','Tipo Revista',2,'Se actualizó el tipo de revista \'Derecho ambiental\'',2,'onsv@mtc.gob.pe','2026-07-30 15:36:00'),(80,'created','Tipo Revista',8,'Se creó el tipo de revista \'Analista\'',2,'onsv@mtc.gob.pe','2026-07-30 15:36:24'),(81,'updated','Revista',8,'Se actualizó la revista \'NUEVO DSV\'',2,'onsv@mtc.gob.pe','2026-07-30 15:36:39'),(82,'updated','Menú',28,'Se actualizó el menú \'ENTORNOS VIALES\'',2,'onsv@mtc.gob.pe','2026-07-30 15:42:54'),(83,'updated','Submenú',2,'Se actualizó el submenú \'SINIESTRO\'',2,'onsv@mtc.gob.pe','2026-07-30 15:45:47'),(84,'updated','Submenú',2,'Se actualizó el submenú \'SINIESTRO2222\'',2,'onsv@mtc.gob.pe','2026-07-30 15:46:27'),(85,'updated','Submenú',17,'Se actualizó el submenú \'LICENCIAS DE CONDUCIR\'',2,'onsv@mtc.gob.pe','2026-07-30 15:47:46'),(86,'deleted','Dataset',59,'Se eliminó el dataset \'prueba\'',2,'onsv@mtc.gob.pe','2026-07-30 15:50:02'),(87,'created','Dataset',60,'Se creó el dataset \'CASCOS NUEVOS\'',2,'onsv@mtc.gob.pe','2026-07-30 15:52:42'),(88,'updated','Dataset',60,'Se actualizó el dataset \'CASCOS NUEVOS\'',2,'onsv@mtc.gob.pe','2026-07-30 15:52:48'),(89,'updated','Dataset',60,'Se actualizó el dataset \'CASCOS NUEVOS\'',2,'onsv@mtc.gob.pe','2026-07-30 15:53:22'),(90,'updated','Dataset',58,'Se actualizó el dataset \'SINIESTROS DE TRANSITO FATALES 2021-2025 (preliminar)\'',2,'onsv@mtc.gob.pe','2026-07-30 15:53:48'),(91,'updated','Dataset',58,'Se actualizó el dataset \'SINIESTROS DE TRANSITO FATALES 2021-2025 (preliminar)\'',2,'onsv@mtc.gob.pe','2026-07-30 15:54:01'),(92,'created','Dataset',61,'Se creó el dataset \'THF\'',2,'onsv@mtc.gob.pe','2026-07-30 15:54:27'),(93,'updated','Dataset',61,'Se actualizó el dataset \'THF\'',2,'onsv@mtc.gob.pe','2026-07-30 15:54:32'),(94,'updated','Usuario',5,'Se actualizó el usuario \'test1@test.com\'',2,'onsv@mtc.gob.pe','2026-07-30 15:56:19'),(95,'updated','Usuario',5,'Se actualizó el usuario \'test1@test.com\'',2,'onsv@mtc.gob.pe','2026-07-30 15:56:23'),(96,'created','Usuario',9,'Se creó el usuario \'dsv.com\'',2,'onsv@mtc.gob.pe','2026-07-30 15:56:52'),(97,'updated','Usuario',5,'Se actualizó el usuario \'test1@test.com\'',2,'onsv@mtc.gob.pe','2026-07-30 15:57:07'),(98,'updated','Usuario',9,'Se actualizó el usuario \'dsv.com\'',2,'onsv@mtc.gob.pe','2026-07-30 15:57:25'),(99,'updated','Menú',4,'Se actualizó el menú \'Nuevo menu 1\'',2,'onsv@mtc.gob.pe','2026-07-30 15:58:18'),(100,'updated','Menú',4,'Se actualizó el menú \'Nuevo menu 1\'',2,'onsv@mtc.gob.pe','2026-07-30 15:58:22'),(101,'updated','Usuario',5,'Se actualizó el usuario \'test1@test.com\'',2,'onsv@mtc.gob.pe','2026-07-30 15:58:31'),(102,'updated','Dataset',61,'Se actualizó el dataset \'THF\'',2,'onsv@mtc.gob.pe','2026-07-30 15:59:16'),(103,'updated','Dataset',61,'Se actualizó el dataset \'THF\'',2,'onsv@mtc.gob.pe','2026-07-30 15:59:59'),(104,'updated','Dataset',60,'Se actualizó el dataset \'CASCOS NUEVOS\'',2,'onsv@mtc.gob.pe','2026-07-30 16:00:20'),(105,'updated','Dataset',58,'Se actualizó el dataset \'SINIESTROS DE TRANSITO FATALES 2021-2025 (preliminar)\'',2,'onsv@mtc.gob.pe','2026-07-30 16:02:35'),(106,'created','Red Social',4,'Se creó la red social \'Tik Tok\'',2,'onsv@mtc.gob.pe','2026-07-30 16:03:12'),(107,'updated','Red Social',4,'Se actualizó la red social \'Tik Tok\'',2,'onsv@mtc.gob.pe','2026-07-30 16:03:25'),(108,'updated','Red Social',4,'Se actualizó la red social \'Tik Tok\'',2,'onsv@mtc.gob.pe','2026-07-30 16:03:28'),(109,'updated','Red Social',4,'Se actualizó la red social \'Tik Tok\'',2,'onsv@mtc.gob.pe','2026-07-30 16:03:32'),(110,'updated','Entorno Vial',1,'Se actualizó el entorno vial \'Título del Programa 1\'',2,'onsv@mtc.gob.pe','2026-07-30 16:06:03'),(111,'updated','Entorno Vial',1,'Se actualizó el entorno vial \'Título del Programa 1\'',2,'onsv@mtc.gob.pe','2026-07-30 16:06:06'),(112,'updated','Usuario',5,'Se actualizó el usuario \'test1@test.com\'',2,'onsv@mtc.gob.pe','2026-07-30 16:07:04'),(113,'created','Entorno Vial',3,'Se creó el entorno vial \'ISVO\'',2,'onsv@mtc.gob.pe','2026-07-30 16:07:05'),(114,'updated','Entorno Vial',3,'Se actualizó el entorno vial \'ISVO\'',2,'onsv@mtc.gob.pe','2026-07-30 16:07:21'),(115,'updated','Entorno Vial',3,'Se actualizó el entorno vial \'ISVO\'',2,'onsv@mtc.gob.pe','2026-07-30 16:07:28'),(116,'updated','Usuario',5,'Se actualizó el usuario \'test1@test.com\'',2,'onsv@mtc.gob.pe','2026-07-30 16:07:32'),(117,'updated','Publicación normas-legales',0,'Se deshabilitó la publicación \'660acee249d8950d26f8b430\'',2,'onsv@mtc.gob.pe','2026-07-30 16:07:36'),(118,'updated','Publicación normas-legales',0,'Se habilitó la publicación \'660acee249d8950d26f8b430\'',2,'onsv@mtc.gob.pe','2026-07-30 16:07:53'),(119,'updated','Usuario',9,'Se actualizó el usuario \'dsv.com\'',2,'onsv@mtc.gob.pe','2026-07-30 16:07:56'),(120,'updated','Usuario',8,'Se actualizó el usuario \'test@test.com\'',2,'onsv@mtc.gob.pe','2026-07-30 16:09:00'),(121,'updated','Usuario',8,'Se actualizó el usuario \'test@test.com\'',2,'onsv@mtc.gob.pe','2026-07-30 16:09:03'),(122,'updated','Red Social',4,'Se actualizó la red social \'Tik Tok\'',2,'onsv@mtc.gob.pe','2026-07-30 16:11:14'),(123,'updated','Submenú',2,'Se actualizó el submenú \'SINIESTRO2222\'',2,'onsv@mtc.gob.pe','2026-07-30 16:13:45'),(124,'updated','Submenú',2,'Se actualizó el submenú \'SINIESTRO2222\'',2,'onsv@mtc.gob.pe','2026-07-30 16:13:48'),(125,'updated','Menú',1,'Se actualizó el menú \'Siniestros\'',2,'onsv@mtc.gob.pe','2026-07-30 16:13:52'),(126,'updated','Menú',1,'Se actualizó el menú \'Siniestros\'',2,'onsv@mtc.gob.pe','2026-07-30 16:13:55'),(127,'created','Entorno Vial',4,'Se creó el entorno vial \'NUEVO PROGRAMA\'',2,'onsv@mtc.gob.pe','2026-07-30 16:14:34'),(128,'updated','Revista',7,'Se actualizó la revista \'CASCOS SEGUROS\'',2,'onsv@mtc.gob.pe','2026-07-30 16:14:41'),(129,'updated','Revista',7,'Se actualizó la revista \'CASCOS SEGUROS\'',2,'onsv@mtc.gob.pe','2026-07-30 16:15:00'),(130,'created','Revista',9,'Se creó la revista \'nuevo\'',2,'onsv@mtc.gob.pe','2026-07-30 16:16:05'),(131,'updated','Revista',9,'Se actualizó la revista \'nuevo\'',2,'onsv@mtc.gob.pe','2026-07-30 16:16:24'),(132,'updated','Dataset',57,'Se actualizó el dataset \'VEHÍCULOS INVOLUCRADOS EN SINIESTROS DE TRÁNSITO FATALES 2021-2025 (preliminar)\'',2,'onsv@mtc.gob.pe','2026-07-30 16:30:49'),(133,'updated','Dataset',61,'Se actualizó el dataset \'THF\'',2,'onsv@mtc.gob.pe','2026-07-30 16:32:26'),(134,'updated','Región',2,'Se actualizó la imagen de la región de Áncash',2,'onsv@mtc.gob.pe','2026-07-31 16:19:27'),(135,'updated','Región',2,'Se actualizó la región de Áncash',2,'onsv@mtc.gob.pe','2026-07-31 16:19:29'),(136,'updated','Región',2,'Se actualizó la imagen de la región de Áncash',2,'onsv@mtc.gob.pe','2026-07-31 16:19:57'),(137,'updated','Región',2,'Se actualizó la región de Áncash',2,'onsv@mtc.gob.pe','2026-07-31 16:20:00'),(138,'updated','Región',2,'Se actualizó la imagen de la región de Áncash',2,'onsv@mtc.gob.pe','2026-07-31 16:20:25'),(139,'updated','Región',2,'Se actualizó la región de Áncash',2,'onsv@mtc.gob.pe','2026-07-31 16:20:26'),(140,'updated','Región',2,'Se actualizó la imagen de la región de Áncash',2,'onsv@mtc.gob.pe','2026-07-31 16:49:08'),(141,'updated','Región',2,'Se actualizó la región de Áncash',2,'onsv@mtc.gob.pe','2026-07-31 16:49:10'),(142,'updated','Red Social',2,'Se actualizó la red social \'Twitter\'',2,'onsv@mtc.gob.pe','2026-07-31 19:18:25'),(143,'updated','Red Social',3,'Se actualizó la red social \'YouTube\'',2,'onsv@mtc.gob.pe','2026-07-31 19:18:53'),(144,'updated','Red Social',4,'Se actualizó la red social \'Tik Tok\'',2,'onsv@mtc.gob.pe','2026-07-31 19:19:51'),(145,'updated','Región',2,'Se actualizó la imagen de la región de Áncash',2,'onsv@mtc.gob.pe','2026-07-31 19:20:18'),(146,'updated','Región',2,'Se actualizó la región de Áncash',2,'onsv@mtc.gob.pe','2026-07-31 19:20:20'),(147,'updated','Región',2,'Se actualizó la imagen de la región de Áncash',2,'onsv@mtc.gob.pe','2026-07-31 19:22:11'),(148,'updated','Región',2,'Se actualizó la región de Áncash',2,'onsv@mtc.gob.pe','2026-07-31 19:22:13'),(149,'updated','Región',2,'Se actualizó la imagen de la región de Áncash',2,'onsv@mtc.gob.pe','2026-07-31 21:19:04'),(150,'updated','Región',2,'Se actualizó la región de Áncash',2,'onsv@mtc.gob.pe','2026-07-31 21:19:05'),(151,'updated','Región',2,'Se actualizó la imagen de la región de Áncash',2,'onsv@mtc.gob.pe','2026-07-31 21:26:14'),(152,'updated','Región',2,'Se actualizó la región de Áncash',2,'onsv@mtc.gob.pe','2026-07-31 21:26:15'),(153,'updated','Región',2,'Se actualizó la imagen de la región de Áncash',2,'onsv@mtc.gob.pe','2026-07-31 22:29:20'),(154,'updated','Región',2,'Se actualizó la región de Áncash',2,'onsv@mtc.gob.pe','2026-07-31 22:29:21'),(155,'updated','Región',2,'Se actualizó la imagen de la región de Áncash',2,'onsv@mtc.gob.pe','2026-07-31 22:29:46'),(156,'updated','Región',2,'Se actualizó la región de Áncash',2,'onsv@mtc.gob.pe','2026-07-31 22:29:48'),(157,'updated','Cifras',1,'Se actualizaron las cifras',2,'onsv@mtc.gob.pe','2026-08-01 13:42:27'),(158,'updated','Cifras',1,'Se actualizaron las cifras',2,'onsv@mtc.gob.pe','2026-08-01 13:42:38'),(159,'updated','Cifras',1,'Se actualizaron las cifras',2,'onsv@mtc.gob.pe','2026-08-01 13:46:52'),(160,'updated','Cifras',1,'Se actualizaron las cifras',2,'onsv@mtc.gob.pe','2026-08-01 13:50:49'),(161,'updated','Región',2,'Se actualizó la región de Áncash',2,'onsv@mtc.gob.pe','2026-08-01 13:54:59'),(162,'deleted','Región',2,'Se eliminó la imagen de la región de Áncash',2,'onsv@mtc.gob.pe','2026-08-01 14:16:21'),(163,'updated','Región',2,'Se actualizó la región de Áncash',2,'onsv@mtc.gob.pe','2026-08-01 14:16:23'),(164,'updated','Región',2,'Se actualizó la imagen de la región de Áncash',2,'onsv@mtc.gob.pe','2026-08-01 14:23:05'),(165,'updated','Región',2,'Se actualizó la región de Áncash',2,'onsv@mtc.gob.pe','2026-08-01 14:23:06'),(166,'deleted','Región',2,'Se eliminó la imagen de la región de Áncash',2,'onsv@mtc.gob.pe','2026-08-01 14:23:29'),(167,'updated','Región',2,'Se actualizó la región de Áncash',2,'onsv@mtc.gob.pe','2026-08-01 14:23:31'),(168,'updated','Región',2,'Se actualizó la imagen de la región de Áncash',2,'onsv@mtc.gob.pe','2026-08-01 14:24:02'),(169,'updated','Región',2,'Se actualizó la región de Áncash',2,'onsv@mtc.gob.pe','2026-08-01 14:24:03'),(170,'deleted','Región',2,'Se eliminó la imagen de la región de Áncash',2,'onsv@mtc.gob.pe','2026-08-01 14:29:25'),(171,'updated','Región',2,'Se actualizó la región de Áncash',2,'onsv@mtc.gob.pe','2026-08-01 14:29:27'),(172,'updated','Región',2,'Se actualizó la imagen de la región de Áncash',2,'onsv@mtc.gob.pe','2026-08-01 14:29:43'),(173,'updated','Región',2,'Se actualizó la región de Áncash',2,'onsv@mtc.gob.pe','2026-08-01 14:29:45'),(174,'updated','Dataset',61,'Se actualizó el dataset \'THF\'',2,'onsv@mtc.gob.pe','2026-08-01 14:52:34'),(175,'updated','Dataset',61,'Se actualizó el dataset \'THF\'',2,'onsv@mtc.gob.pe','2026-08-01 15:00:09'),(176,'updated','Dataset',56,'Se actualizó el dataset \'PERSONAS INVOLUCRADAS EN SINIESTROS DE TRÁNSITO FATALES 2021-2025 (PRELIMINAR)\'',2,'onsv@mtc.gob.pe','2026-08-01 15:00:17'),(177,'updated','Usuario',5,'Se actualizó el usuario \'test1@test.com\'',2,'onsv@mtc.gob.pe','2026-08-01 15:01:47'),(178,'updated','Usuario',3,'Se actualizó el usuario \'consejero-regional@mtc.gob.pe\'',2,'onsv@mtc.gob.pe','2026-08-01 15:01:57'),(179,'updated','Usuario',3,'Se actualizó el usuario \'consejero-regional@mtc.gob.pe\'',2,'onsv@mtc.gob.pe','2026-08-01 15:02:05'),(180,'updated','Usuario',3,'Se actualizó el usuario \'consejero-regional@mtc.gob.pe\'',2,'onsv@mtc.gob.pe','2026-08-01 15:06:25'),(181,'created','Entorno Vial',5,'Se creó el entorno vial \'Nuevo de ejemplo\'',2,'onsv@mtc.gob.pe','2026-08-01 15:15:07'),(182,'updated','Menú',4,'Se actualizó el menú \'Nuevo menu 1\'',2,'onsv@mtc.gob.pe','2026-08-01 15:19:37'),(183,'updated','Menú',5,'Se actualizó el menú \'Nuevo menu 2\'',2,'onsv@mtc.gob.pe','2026-08-01 15:19:55'),(184,'updated','Menú',27,'Se actualizó el menú \'CAPACITACION A CONDUCTORES\'',2,'onsv@mtc.gob.pe','2026-08-01 15:30:02'),(185,'created','Menú',29,'Se creó el menú \'prueba\'',2,'onsv@mtc.gob.pe','2026-08-01 15:30:53'),(186,'created','Revista',10,'Se creó la revista \'Prueba 1\'',2,'onsv@mtc.gob.pe','2026-08-01 16:08:34'),(187,'updated','Revista',7,'Se actualizó la revista \'CASCOS SEGUROS\'',2,'onsv@mtc.gob.pe','2026-08-01 16:09:55'),(188,'updated','Revista',8,'Se actualizó la revista \'NUEVO DSV\'',2,'onsv@mtc.gob.pe','2026-08-01 16:10:01'),(189,'updated','Revista',9,'Se actualizó la revista \'nuevo\'',2,'onsv@mtc.gob.pe','2026-08-01 16:10:06'),(190,'updated','Revista',3,'Se actualizó la revista \'Revista de Psicología\'',2,'onsv@mtc.gob.pe','2026-08-01 16:18:40'),(191,'updated','Revista',6,'Se actualizó la revista \'Educación\'',2,'onsv@mtc.gob.pe','2026-08-01 16:19:15'),(192,'updated','Revista',2,'Se actualizó la revista \'Derecho PUCP\'',2,'onsv@mtc.gob.pe','2026-08-01 16:20:12'),(193,'updated','Revista',1,'Se actualizó la revista \'Cambio de Título\'',2,'onsv@mtc.gob.pe','2026-08-01 16:20:57'),(194,'deleted','Revista',8,'Se eliminó la revista \'NUEVO DSV\'',2,'onsv@mtc.gob.pe','2026-08-01 16:22:18'),(195,'deleted','Revista',10,'Se eliminó la revista \'Prueba 1\'',2,'onsv@mtc.gob.pe','2026-08-01 16:22:27'),(196,'deleted','Revista',7,'Se eliminó la revista \'CASCOS SEGUROS\'',2,'onsv@mtc.gob.pe','2026-08-01 16:22:32'),(197,'deleted','Revista',9,'Se eliminó la revista \'nuevo\'',2,'onsv@mtc.gob.pe','2026-08-01 16:22:35'),(198,'updated','Tipo Revista',2,'Se actualizó el tipo de revista \'Derecho\'',2,'onsv@mtc.gob.pe','2026-08-01 16:23:38'),(199,'created','Revista',11,'Se creó la revista \'Revista del Medio Ambiente\'',2,'onsv@mtc.gob.pe','2026-08-01 16:24:04'),(200,'updated','Revista',11,'Se actualizó la revista \'Revista del Medio Ambiente\'',2,'onsv@mtc.gob.pe','2026-08-01 16:25:07'),(201,'updated','Menú',28,'Se actualizó el menú \'ENTORNOS VIALES\'',2,'onsv@mtc.gob.pe','2026-08-01 17:27:47'),(202,'deleted','Región',26,'Se eliminó la imagen de la región de Lima Metropolitana',2,'onsv@mtc.gob.pe','2026-08-03 17:50:24'),(203,'updated','Región',26,'Se actualizó la imagen de la región de Lima Metropolitana',2,'onsv@mtc.gob.pe','2026-08-03 17:50:44'),(204,'updated','Región',26,'Se actualizó la región de Lima Metropolitana',2,'onsv@mtc.gob.pe','2026-08-03 17:50:45'),(205,'deleted','Región',26,'Se eliminó la imagen de la región de Lima Metropolitana',2,'onsv@mtc.gob.pe','2026-08-03 17:50:54'),(206,'updated','Región',26,'Se actualizó la imagen de la región de Lima Metropolitana',2,'onsv@mtc.gob.pe','2026-08-03 17:51:07'),(207,'updated','Región',26,'Se actualizó la región de Lima Metropolitana',2,'onsv@mtc.gob.pe','2026-08-03 17:51:08'),(208,'created','Tipo Revista',9,'Se creó el tipo de revista \'Seguridad Vial\'',2,'onsv@mtc.gob.pe','2026-08-03 17:54:48'),(209,'created','Revista',12,'Se creó la revista \'CASCOS TUTORIAL\'',2,'onsv@mtc.gob.pe','2026-08-03 17:56:03'),(210,'updated','Menú',29,'Se actualizó el menú \'prueba\'',2,'onsv@mtc.gob.pe','2026-08-03 19:18:09'),(211,'created','Submenú',56,'Se creó el submenú \'prueba 1\'',2,'onsv@mtc.gob.pe','2026-08-03 19:19:25'),(212,'updated','Submenú',56,'Se actualizó el submenú \'prueba 1\'',2,'onsv@mtc.gob.pe','2026-08-03 19:19:56'),(213,'updated','Submenú',56,'Se actualizó el submenú \'prueba 1\'',2,'onsv@mtc.gob.pe','2026-08-03 19:20:09'),(214,'updated','Menú',29,'Se actualizó el menú \'prueba\'',2,'onsv@mtc.gob.pe','2026-08-03 19:20:29'),(215,'updated','Dataset',60,'Se actualizó el dataset \'CASCOS NUEVOS\'',2,'onsv@mtc.gob.pe','2026-08-03 19:21:29'),(216,'deleted','Dataset',61,'Se eliminó el dataset \'THF\'',2,'onsv@mtc.gob.pe','2026-08-03 19:22:11'),(217,'updated','Dataset',57,'Se actualizó el dataset \'VEHÍCULOS INVOLUCRADOS EN SINIESTROS DE TRÁNSITO FATALES 2021-2025 (preliminar)\'',2,'onsv@mtc.gob.pe','2026-08-03 19:23:12'),(218,'updated','Usuario',5,'Se actualizó el usuario \'test1@test.com\'',2,'onsv@mtc.gob.pe','2026-08-03 19:24:11'),(219,'updated','Usuario',5,'Se actualizó el usuario \'test1@test.com\'',2,'onsv@mtc.gob.pe','2026-08-03 19:24:14'),(220,'created','Usuario',10,'Se creó el usuario \'prueba.com\'',2,'onsv@mtc.gob.pe','2026-08-03 19:25:02'),(221,'updated','Usuario',10,'Se actualizó el usuario \'prueba.com\'',2,'onsv@mtc.gob.pe','2026-08-03 19:25:10'),(222,'updated','Usuario',10,'Se actualizó el usuario \'prueba.com\'',2,'onsv@mtc.gob.pe','2026-08-03 19:25:14'),(223,'updated','Usuario',10,'Se actualizó el usuario \'prueba@.com\'',2,'onsv@mtc.gob.pe','2026-08-03 19:26:13'),(224,'updated','Usuario',10,'Se actualizó el usuario \'prueba@gmail.com\'',2,'onsv@mtc.gob.pe','2026-08-03 19:26:58'),(225,'updated','Misión/Visión',1,'Se actualizó Misión y Visión',2,'onsv@mtc.gob.pe','2026-08-03 19:35:26'),(226,'updated','Dataset',57,'Se actualizó el dataset \'VEHÍCULOS INVOLUCRADOS EN SINIESTROS DE TRÁNSITO FATALES 2021-2025 (preliminar)\'',2,'onsv@mtc.gob.pe','2026-08-03 19:42:18'),(227,'updated','Cifras',1,'Se actualizaron las cifras',2,'onsv@mtc.gob.pe','2026-08-03 19:52:05'),(228,'updated','Evento',28,'Se actualizó el evento \'CASCOS \'',2,'onsv@mtc.gob.pe','2026-08-03 20:18:04'),(229,'updated','Usuario',7,'Se actualizó el usuario \'nuevo-usuario@mtc.gob.pe\'',2,'onsv@mtc.gob.pe','2026-08-03 20:21:19'),(230,'updated','Usuario',7,'Se actualizó el usuario \'nuevo-usuario@mtc.gob.pe\'',2,'onsv@mtc.gob.pe','2026-08-03 20:21:23'),(231,'deleted','Rol',24,'Se eliminó el rol \'ddddddddddddddd\'',2,'onsv@mtc.gob.pe','2026-08-03 20:21:34'),(232,'updated','Rol',14,'Se actualizó el rol \'grtrtrw\'',2,'onsv@mtc.gob.pe','2026-08-03 20:21:41'),(233,'deleted','Programa',2,'Se eliminó el programa \'Título del Programa 2\'',2,'onsv@mtc.gob.pe','2026-08-03 20:23:34'),(234,'updated','Programa',1,'Se actualizó el programa \'Título del Programa 1\'',2,'onsv@mtc.gob.pe','2026-08-03 20:24:14'),(235,'updated','Menú',1,'Se actualizó el menú \'Siniestros1\'',2,'onsv@mtc.gob.pe','2026-08-03 20:37:03'),(236,'updated','Submenú',6,'Se actualizó el submenú \'SINIESTROS\'',2,'onsv@mtc.gob.pe','2026-08-03 20:37:25'),(237,'updated','Región',2,'Se actualizó la región de Áncash',2,'onsv@mtc.gob.pe','2026-08-03 20:43:05'),(238,'updated','Región',4,'Se actualizó el nombre del encargado, el celular del encargado, el correo del encargado de la región de Arequipa',2,'onsv@mtc.gob.pe','2026-08-03 20:44:00'),(239,'updated','Región',2,'Se actualizó el celular del encargado de la región de Áncash',2,'onsv@mtc.gob.pe','2026-08-03 20:44:29'),(240,'updated','Región',2,'Se actualizó el nombre del encargado, el celular del encargado, el correo del encargado, el enlace de la página de la región de Áncash',2,'onsv@mtc.gob.pe','2026-08-03 20:45:37'),(241,'updated','Región',2,'Se actualizó el nombre del encargado, el celular del encargado, el correo del encargado, el enlace de la página de la región de Áncash',2,'onsv@mtc.gob.pe','2026-08-03 20:46:15'),(242,'updated','Usuario',5,'Se actualizó el usuario \'test1@test.com\'',2,'onsv@mtc.gob.pe','2026-08-03 20:54:40'),(243,'updated','Usuario',7,'Se actualizó el usuario \'nuevo-usuario@mtc.gob.pe\'',2,'onsv@mtc.gob.pe','2026-08-03 20:55:48'),(244,'updated','Dataset',56,'Se actualizó el dataset \'PERSONAS INVOLUCRADAS EN SINIESTROS DE TRÁNSITO FATALES 2021-2025 (PRELIMINAR)\'',2,'onsv@mtc.gob.pe','2026-08-04 14:48:37'),(245,'updated','Dataset',56,'Se actualizó el dataset \'PERSONAS INVOLUCRADAS EN SINIESTROS DE TRÁNSITO FATALES 2021-2025 (PRELIMINAR)\'',2,'onsv@mtc.gob.pe','2026-08-04 14:49:18'),(246,'deleted','Tipo Revista',7,'Se eliminó el tipo de revista \'Seguridad Vial\'',2,'onsv@mtc.gob.pe','2026-08-04 14:52:18'),(247,'updated','Programa',1,'Se actualizó el programa \'Título del Programa 1\'',2,'onsv@mtc.gob.pe','2026-08-04 14:58:59'),(248,'updated','Banners',0,'Se actualizó el orden de los banners',2,'onsv@mtc.gob.pe','2026-08-04 14:59:36'),(249,'updated','Banners',0,'Se actualizó el orden de los banners',2,'onsv@mtc.gob.pe','2026-08-04 14:59:38'),(250,'created','Evento',30,'Se creó el evento \'DASD\'',2,'onsv@mtc.gob.pe','2026-08-04 15:11:42'),(251,'created','Evento',31,'Se creó el evento \'EEEE\'',2,'onsv@mtc.gob.pe','2026-08-04 15:12:17'),(252,'updated','Submenú',2,'Se actualizó el submenú \'SINIESTRO2222\'',2,'onsv@mtc.gob.pe','2026-08-04 15:29:10'),(253,'updated','Evento',29,'Se actualizó el evento \'Campaña Cascos\'',2,'onsv@mtc.gob.pe','2026-08-04 22:33:18'),(254,'updated','Submenú',4,'Se actualizó el submenú \'RESUMEN-123\'',2,'onsv@mtc.gob.pe','2026-08-04 22:39:00'),(255,'updated','Menú',4,'Se actualizó el menú \'Nuevo menu 1\'',2,'onsv@mtc.gob.pe','2026-08-04 22:40:18'),(256,'updated','Submenú',29,'Se actualizó el submenú \'prueba 1\'',2,'onsv@mtc.gob.pe','2026-08-04 22:41:00'),(257,'updated','Submenú',29,'Se actualizó el submenú \'prueba 1\'',2,'onsv@mtc.gob.pe','2026-08-04 22:41:25'),(258,'updated','Menú',4,'Se actualizó el menú \'Nuevo menu 1\'',2,'onsv@mtc.gob.pe','2026-08-04 22:43:24'),(259,'updated','Submenú',56,'Se actualizó el submenú \'prueba 1\'',2,'onsv@mtc.gob.pe','2026-08-04 22:44:02'),(260,'updated','Dataset',57,'Se actualizó el dataset \'VEHÍCULOS INVOLUCRADOS EN SINIESTROS DE TRÁNSITO FATALES 2021-2025 (preliminar)\'',2,'onsv@mtc.gob.pe','2026-08-04 22:45:51'),(261,'updated','Banner',2,'Se actualizaron los textos del banner (es)',2,'onsv@mtc.gob.pe','2026-08-04 22:54:45'),(262,'updated','Dataset',58,'Se actualizó el dataset \'SINIESTROS DE TRANSITO FATALES 2021-2025 (preliminar)\'',2,'onsv@mtc.gob.pe','2026-08-04 22:58:07'),(263,'updated','Región',22,'Se actualizó el nombre del encargado, el celular del encargado, el correo del encargado de la región de San Martín',2,'onsv@mtc.gob.pe','2026-08-04 23:01:48'),(264,'updated','Programa',1,'Se actualizó el programa \'Título del Programa 1\'',2,'onsv@mtc.gob.pe','2026-08-04 23:04:07'),(265,'updated','Usuario',5,'Se actualizó el usuario \'test1@test.com\'',2,'onsv@mtc.gob.pe','2026-08-04 23:15:56'),(266,'updated','Usuario',5,'Se actualizó el usuario \'test1@test.com\'',2,'onsv@mtc.gob.pe','2026-08-04 23:16:26'),(267,'updated','Programa',3,'Se actualizó el programa \'ISVO\'',2,'onsv@mtc.gob.pe','2026-08-04 23:37:53'),(268,'updated','Programa',3,'Se actualizó el programa \'ISVO\'',2,'onsv@mtc.gob.pe','2026-08-04 23:38:09'),(269,'updated','Programa',3,'Se actualizó el programa \'ISVO\'',2,'onsv@mtc.gob.pe','2026-08-04 23:38:11'),(270,'updated','Programa',3,'Se actualizó el programa \'ISVO\'',2,'onsv@mtc.gob.pe','2026-08-04 23:38:11'),(271,'updated','Programa',3,'Se actualizó el programa \'ISVO\'',2,'onsv@mtc.gob.pe','2026-08-04 23:38:26'),(272,'updated','Programa',1,'Se actualizó el programa \'Título del Programa 1\'',2,'onsv@mtc.gob.pe','2026-08-04 23:40:35'),(273,'updated','Programa',1,'Se actualizó el programa \'Título del Programa 1\'',2,'onsv@mtc.gob.pe','2026-08-04 23:40:36'),(274,'updated','Programa',1,'Se actualizó el programa \'Título del Programa 1\'',2,'onsv@mtc.gob.pe','2026-08-04 23:40:36'),(275,'updated','Programa',1,'Se actualizó el programa \'Título del Programa 1\'',2,'onsv@mtc.gob.pe','2026-08-04 23:40:36'),(276,'updated','Programa',1,'Se actualizó el programa \'Título del Programa 1\'',2,'onsv@mtc.gob.pe','2026-08-04 23:40:36'),(277,'updated','Programa',1,'Se actualizó el programa \'Título del Programa 1\'',2,'onsv@mtc.gob.pe','2026-08-04 23:40:36'),(278,'updated','Programa',1,'Se actualizó el programa \'Título del Programa 1\'',2,'onsv@mtc.gob.pe','2026-08-04 23:40:36'),(279,'updated','Programa',1,'Se actualizó el programa \'Título del Programa 1\'',2,'onsv@mtc.gob.pe','2026-08-04 23:40:36'),(280,'updated','Programa',1,'Se actualizó el programa \'Título del Programa 1\'',2,'onsv@mtc.gob.pe','2026-08-04 23:40:36'),(281,'updated','Programa',1,'Se actualizó el programa \'Título del Programa 1\'',2,'onsv@mtc.gob.pe','2026-08-04 23:40:36'),(282,'updated','Programa',1,'Se actualizó el programa \'Título del Programa 1\'',2,'onsv@mtc.gob.pe','2026-08-04 23:40:36'),(283,'updated','Programa',1,'Se actualizó el programa \'Título del Programa 1\'',2,'onsv@mtc.gob.pe','2026-08-04 23:40:36'),(284,'updated','Programa',1,'Se actualizó el programa \'Título del Programa 1\'',2,'onsv@mtc.gob.pe','2026-08-04 23:40:36'),(285,'created','YouTube Video',1,'Se creó el video de YouTube \'PE  Omitir navegación Buscar    Acceder Videotutorial - Curso Seguridad Vial para Conductores para reducción de Puntos\'',2,'onsv@mtc.gob.pe','2026-08-10 16:20:19'),(286,'created','YouTube Video',2,'Se creó el video de YouTube \'PE  Omitir navegación Buscar    Acceder PRIMERA SESIÓN. HACIA LA CREACIÓN DE LA AGENCIA DE TRANSITO Y SEGURIDAD VIAL\'',2,'onsv@mtc.gob.pe','2026-08-10 16:21:09'),(287,'created','YouTube Video',3,'Se creó el video de YouTube \'Capacitación Virtual - La Importancia de la Educación Vial en la Movilidad Segura\'',2,'onsv@mtc.gob.pe','2026-08-10 16:21:48'),(288,'updated','Red Social',1,'Se actualizó la red social \'Facebook\'',2,'onsv@mtc.gob.pe','2026-08-10 16:22:20'),(289,'updated','Red Social',2,'Se actualizó la red social \'Twitter\'',2,'onsv@mtc.gob.pe','2026-08-10 16:22:32'),(290,'updated','Red Social',3,'Se actualizó la red social \'YouTube\'',2,'onsv@mtc.gob.pe','2026-08-10 16:22:42'),(291,'updated','Red Social',4,'Se actualizó la red social \'Tik Tok\'',2,'onsv@mtc.gob.pe','2026-08-10 16:23:07'),(292,'updated','YouTube Video',2,'Se actualizó el video de YouTube \'PE  Omitir navegación Buscar    Acceder PRIMERA SESIÓN. HACIA LA CREACIÓN DE LA AGENCIA DE TRANSITO Y SEGURIDAD VIAL\'',2,'onsv@mtc.gob.pe','2026-08-10 16:24:01'),(293,'updated','YouTube Video',1,'Se actualizó el video de YouTube \'PE  Omitir navegación Buscar    Acceder Videotutorial - Curso Seguridad Vial para Conductores para reducción de Puntos\'',2,'onsv@mtc.gob.pe','2026-08-10 16:24:14'),(294,'created','Evento',32,'Se creó el evento \'PLAN PILOTO ITS\'',2,'onsv@mtc.gob.pe','2026-08-10 20:26:02'),(295,'updated','Menú',24,'Se actualizó el menú \'SINIESTRALIDAD FATAL (ONSV)\'',2,'onsv@mtc.gob.pe','2026-08-10 20:33:48'),(296,'updated','Submenú',46,'Se actualizó el submenú \'INSPECCIONES TECNICAS\'',2,'onsv@mtc.gob.pe','2026-08-10 20:37:10'),(297,'updated','Submenú',49,'Se actualizó el submenú \'Resumen\'',2,'onsv@mtc.gob.pe','2026-08-10 20:37:51'),(298,'updated','Dataset',55,'Se actualizó el dataset \'HISTORICO DE SINIESTROS DE TRÁNSITO 2008-2025 (Preliminar)\'',2,'onsv@mtc.gob.pe','2026-08-10 20:42:55'),(299,'updated','Programa',3,'Se actualizó el programa \'ISVO\'',2,'onsv@mtc.gob.pe','2026-08-10 20:45:13'),(300,'updated','Programa',3,'Se actualizó el programa \'ISVO\'',2,'onsv@mtc.gob.pe','2026-08-10 20:48:03'),(301,'updated','Programa',3,'Se actualizó el programa \'ISVO\'',2,'onsv@mtc.gob.pe','2026-08-10 20:48:46'),(302,'updated','Programa',3,'Se actualizó el programa \'ISVO\'',2,'onsv@mtc.gob.pe','2026-08-10 20:49:03'),(303,'created','YouTube Video',4,'Se creó el video de YouTube \'SEGUNDA SESIÓN. HACIA LA CREACIÓN DE LA AGENCIA DE TRANSITO Y SEGURIDAD VIAL.\'',2,'onsv@mtc.gob.pe','2026-08-10 20:56:19'),(304,'created','YouTube Video',5,'Se creó el video de YouTube \'prueba 2\'',2,'onsv@mtc.gob.pe','2026-08-10 20:57:57'),(305,'created','YouTube Video',6,'Se creó el video de YouTube \'prueba 4\'',2,'onsv@mtc.gob.pe','2026-08-10 20:58:05'),(306,'created','YouTube Video',7,'Se creó el video de YouTube \'prueba 5\'',2,'onsv@mtc.gob.pe','2026-08-10 20:58:13'),(307,'created','YouTube Video',8,'Se creó el video de YouTube \'curso\'',2,'onsv@mtc.gob.pe','2026-08-10 21:57:16'),(308,'created','YouTube Video',9,'Se creó el video de YouTube \'clase b curso\'',2,'onsv@mtc.gob.pe','2026-08-10 21:57:32'),(309,'created','YouTube Video',10,'Se creó el video de YouTube \'clase a\'',2,'onsv@mtc.gob.pe','2026-08-10 21:57:45'),(310,'created','YouTube Video',11,'Se creó el video de YouTube \'curso para no profesionales\'',2,'onsv@mtc.gob.pe','2026-08-10 21:57:55'),(311,'created','YouTube Video',12,'Se creó el video de YouTube \'curso para profesionales\'',2,'onsv@mtc.gob.pe','2026-08-10 21:58:03'),(312,'created','Componente',25,'Se creó el componente tecnológico \'\'',2,'onsv@mtc.gob.pe','2026-08-10 22:00:07'),(313,'updated','Componente',25,'Se actualizó el componente tecnológico \'NUEVO COMPONENTE\'',2,'onsv@mtc.gob.pe','2026-08-10 22:00:28'),(314,'updated','Componente',25,'Se actualizó el componente tecnológico \'NUEVO COMPONENTE\'',2,'onsv@mtc.gob.pe','2026-08-10 22:01:13'),(315,'deleted','Componente',25,'Se eliminó el componente tecnológico \'NUEVO COMPONENTE\'',2,'onsv@mtc.gob.pe','2026-08-10 22:01:34'),(316,'created','YouTube Video',13,'Se creó el video de YouTube \'NUEVO\'',2,'onsv@mtc.gob.pe','2026-08-11 23:19:39'),(317,'created','YouTube Video',14,'Se creó el video de YouTube \'NUEVO PARA PAGINACION\'',2,'onsv@mtc.gob.pe','2026-08-11 23:20:42'),(318,'created','YouTube Video',15,'Se creó el video de YouTube \'PRUEBA 2\'',2,'onsv@mtc.gob.pe','2026-08-11 23:21:21'),(319,'created','YouTube Video',16,'Se creó el video de YouTube \'PRUEBA 3\'',2,'onsv@mtc.gob.pe','2026-08-11 23:21:28'),(320,'created','YouTube Video',17,'Se creó el video de YouTube \'PRUEBA 4\'',2,'onsv@mtc.gob.pe','2026-08-11 23:21:36'),(321,'created','YouTube Video',18,'Se creó el video de YouTube \'PRUEBA 5\'',2,'onsv@mtc.gob.pe','2026-08-11 23:21:44'),(322,'created','YouTube Video',19,'Se creó el video de YouTube \'PRUEBA 6\'',2,'onsv@mtc.gob.pe','2026-08-11 23:21:53'),(323,'updated','Programa',3,'Se actualizó el programa \'ISVO\'',2,'onsv@mtc.gob.pe','2026-08-12 21:14:12'),(324,'updated','Programa',8,'Se actualizó el programa \'Orientación a Víctimas\'',2,'onsv@mtc.gob.pe','2026-08-12 21:15:25'),(325,'updated','Programa',3,'Se actualizó el programa \'ISVO\'',2,'onsv@mtc.gob.pe','2026-08-12 21:16:20'),(326,'updated','Programa',8,'Se actualizó el programa \'Orientación a Víctimas\'',2,'onsv@mtc.gob.pe','2026-08-12 21:16:28'),(327,'updated','Programa',3,'Se actualizó el programa \'ISVO\'',2,'onsv@mtc.gob.pe','2026-08-12 21:46:21'),(328,'updated','Programa',8,'Se actualizó el programa \'Orientación a Víctimas\'',2,'onsv@mtc.gob.pe','2026-08-12 21:46:27'),(329,'updated','Programa',1,'Se actualizó el programa \'Título del Programa 1\'',2,'onsv@mtc.gob.pe','2026-08-12 22:06:50'),(330,'updated','Programa',1,'Se actualizó el programa \'Título del Programa 1\'',2,'onsv@mtc.gob.pe','2026-08-12 22:07:14'),(331,'updated','Programa',1,'Se actualizó el programa \'Título del Programa 1\'',2,'onsv@mtc.gob.pe','2026-08-12 22:08:36'),(332,'updated','Programa',1,'Se actualizó el programa \'Título del Programa 1\'',2,'onsv@mtc.gob.pe','2026-08-12 22:36:39'),(333,'updated','Programa',3,'Se actualizó el programa \'ISVO\'',2,'onsv@mtc.gob.pe','2026-08-12 22:36:43'),(334,'updated','Programa',8,'Se actualizó el programa \'Orientación a Víctimas\'',2,'onsv@mtc.gob.pe','2026-08-12 22:36:49'),(335,'created','YouTube Video',20,'Se creó el video de YouTube \'nuevo\'',2,'onsv@mtc.gob.pe','2026-08-12 22:59:32'),(336,'created','YouTube Video',21,'Se creó el video de YouTube \'nuevo 2\'',2,'onsv@mtc.gob.pe','2026-08-12 22:59:38'),(337,'created','YouTube Video',22,'Se creó el video de YouTube \'nuevo 3\'',2,'onsv@mtc.gob.pe','2026-08-12 22:59:43'),(338,'updated','Programa',4,'Se actualizó el programa \'NUEVO PROGRAMA\'',2,'onsv@mtc.gob.pe','2026-08-12 23:03:31'),(339,'updated','Programa',8,'Se actualizó el programa \'Orientación a Víctimas\'',2,'onsv@mtc.gob.pe','2026-08-12 23:14:04'),(340,'created','Programa',9,'Se creó el programa \'ORIENTACÓN A VICTIMAS PRUBA\'',2,'onsv@mtc.gob.pe','2026-08-12 23:16:10'),(341,'updated','Programa',9,'Se actualizó el programa \'ORIENTACÓN A VICTIMAS PRUBA\'',2,'onsv@mtc.gob.pe','2026-08-12 23:17:07'),(342,'created','Popup slide',2,'Se creó un slide del popup',2,'onsv@mtc.gob.pe','2026-08-13 18:17:22'),(343,'updated','Popup slide',2,'Se actualizó un slide del popup',2,'onsv@mtc.gob.pe','2026-08-13 18:17:42'),(344,'created','Popup slide',3,'Se creó un slide del popup',2,'onsv@mtc.gob.pe','2026-08-13 18:17:44'),(345,'updated','Popup slide',3,'Se actualizó un slide del popup',2,'onsv@mtc.gob.pe','2026-08-13 18:18:13'),(346,'created','Programa',10,'Se creó el programa \'NO SE PUEDE MÁS\'',2,'onsv@mtc.gob.pe','2026-08-13 21:08:30'),(347,'created','Subitem menú',15,'Se creó el subitem \'Prueba\' en aplicaciones',2,'onsv@mtc.gob.pe','2026-08-13 21:15:48'),(348,'updated','Subitem menú',15,'Se actualizó el subitem del menú',2,'onsv@mtc.gob.pe','2026-08-13 21:16:04'),(349,'created','Subitem menú',16,'Se creó el subitem \'New test created\' en normas-legales',2,'onsv@mtc.gob.pe','2026-08-13 21:17:29'),(350,'updated','Subitem menú',16,'Se actualizó el subitem del menú',2,'onsv@mtc.gob.pe','2026-08-13 21:17:44'),(351,'updated','Popup',1,'Se actualizó el estado del popup',2,'onsv@mtc.gob.pe','2026-08-13 21:17:51'),(352,'updated','Popup',1,'Se actualizó el estado del popup',2,'onsv@mtc.gob.pe','2026-08-13 21:17:55'),(353,'updated','Subitem menú',16,'Se actualizó el subitem del menú',2,'onsv@mtc.gob.pe','2026-08-13 21:18:02'),(354,'created','Popup slide',4,'Se creó un slide del popup',2,'onsv@mtc.gob.pe','2026-08-13 21:18:04'),(355,'updated','Subitem menú',15,'Se actualizó el subitem del menú',2,'onsv@mtc.gob.pe','2026-08-13 21:18:04'),(356,'updated','Popup slide',4,'Se actualizó un slide del popup',2,'onsv@mtc.gob.pe','2026-08-13 21:18:42'),(357,'updated','Popup',0,'Se actualizó el orden de los slides del popup',2,'onsv@mtc.gob.pe','2026-08-13 21:18:50'),(358,'updated','Popup',0,'Se actualizó el orden de los slides del popup',2,'onsv@mtc.gob.pe','2026-08-13 21:18:51'),(359,'updated','Subitem menú',15,'Se actualizó el subitem del menú',2,'onsv@mtc.gob.pe','2026-08-13 21:21:23'),(360,'updated','Subitem menú',16,'Se actualizó el subitem del menú',2,'onsv@mtc.gob.pe','2026-08-13 21:21:26'),(361,'updated','Subitem menú',16,'Se actualizó el subitem del menú',2,'onsv@mtc.gob.pe','2026-08-13 21:21:38'),(362,'updated','Subitem menú',15,'Se actualizó el subitem del menú',2,'onsv@mtc.gob.pe','2026-08-13 21:21:40'),(363,'updated','Misión/Visión',1,'Se actualizó Misión y Visión',2,'onsv@mtc.gob.pe','2026-08-13 21:28:00'),(364,'updated','Misión/Visión',1,'Se actualizó Misión y Visión',2,'onsv@mtc.gob.pe','2026-08-13 21:28:29'),(365,'updated','Popup slide',4,'Se actualizó un slide del popup',2,'onsv@mtc.gob.pe','2026-08-13 22:34:34'),(366,'updated','Popup slide',1,'Se actualizó un slide del popup',2,'onsv@mtc.gob.pe','2026-08-13 22:37:59'),(367,'created','Popup slide',5,'Se creó un slide del popup',2,'onsv@mtc.gob.pe','2026-08-13 22:38:00'),(368,'updated','Popup slide',5,'Se actualizó un slide del popup',2,'onsv@mtc.gob.pe','2026-08-13 22:38:31'),(369,'updated','Popup slide',2,'Se actualizó un slide del popup',2,'onsv@mtc.gob.pe','2026-08-13 22:45:08'),(370,'updated','Popup slide',5,'Se actualizó un slide del popup',2,'onsv@mtc.gob.pe','2026-08-13 22:47:35'),(371,'updated','Popup slide',5,'Se actualizó un slide del popup',2,'onsv@mtc.gob.pe','2026-08-13 23:02:49'),(372,'updated','Popup slide',5,'Se actualizó un slide del popup',2,'onsv@mtc.gob.pe','2026-08-13 23:02:51'),(373,'created','Popup slide',6,'Se creó un slide del popup',2,'onsv@mtc.gob.pe','2026-08-13 23:03:11'),(374,'deleted','Popup slide',6,'Se eliminó un slide del popup',2,'onsv@mtc.gob.pe','2026-08-13 23:03:14'),(375,'updated','Popup slide',4,'Se actualizó un slide del popup',2,'onsv@mtc.gob.pe','2026-08-13 23:29:33'),(376,'updated','Popup slide',2,'Se actualizó un slide del popup',2,'onsv@mtc.gob.pe','2026-08-13 23:29:46'),(377,'updated','Popup slide',5,'Se actualizó un slide del popup',2,'onsv@mtc.gob.pe','2026-08-13 23:29:58'),(378,'updated','Popup slide',5,'Se actualizó un slide del popup',2,'onsv@mtc.gob.pe','2026-08-13 23:40:40'),(379,'created','Subitem menú',17,'Se creó el subitem \'nuevo\' en normas-legales',2,'onsv@mtc.gob.pe','2026-08-14 20:39:29'),(380,'deleted','Subitem menú',17,'Se eliminó un subitem del menú',2,'onsv@mtc.gob.pe','2026-08-14 20:39:48'),(381,'updated','Subitem menú',16,'Se actualizó el subitem del menú',2,'onsv@mtc.gob.pe','2026-08-14 20:39:50'),(382,'updated','Subitem menú',16,'Se actualizó el subitem del menú',2,'onsv@mtc.gob.pe','2026-08-14 20:40:06'),(383,'created','Subitem menú',18,'Se creó el subitem \'CURSO MOTOCICLETA\' en educacion-vial',2,'onsv@mtc.gob.pe','2026-08-14 20:41:26'),(384,'deleted','Subitem menú',18,'Se eliminó un subitem del menú',2,'onsv@mtc.gob.pe','2026-08-14 20:41:52'),(385,'updated','Subitem menú',11,'Se actualizó el subitem del menú',2,'onsv@mtc.gob.pe','2026-08-14 20:42:55'),(386,'updated','Subitem menú',11,'Se actualizó el subitem del menú',2,'onsv@mtc.gob.pe','2026-08-14 20:42:56'),(387,'updated','Subitem menú',15,'Se actualizó el subitem del menú',2,'onsv@mtc.gob.pe','2026-08-14 20:43:26'),(388,'updated','Subitem menú',15,'Se actualizó el subitem del menú',2,'onsv@mtc.gob.pe','2026-08-14 20:43:29'),(389,'updated','Subitem menú',15,'Se actualizó el subitem del menú',2,'onsv@mtc.gob.pe','2026-08-14 20:43:31'),(390,'updated','Subitem menú',15,'Se actualizó el subitem del menú',2,'onsv@mtc.gob.pe','2026-08-14 20:43:48'),(391,'created','Evento',33,'Se creó el evento \'ULTIMA PRUEBA\'',2,'onsv@mtc.gob.pe','2026-08-14 20:50:47'),(392,'updated','Evento',33,'Se actualizó el evento \'ULTIMA PRUEBA\'',2,'onsv@mtc.gob.pe','2026-08-14 20:51:22'),(393,'updated','Evento',33,'Se actualizó el evento \'ULTIMA PRUEBA\'',2,'onsv@mtc.gob.pe','2026-08-14 20:51:47'),(394,'updated','Cifras',1,'Se actualizaron las cifras',2,'onsv@mtc.gob.pe','2026-08-14 20:57:57'),(395,'updated','Cifras',1,'Se actualizaron las cifras',2,'onsv@mtc.gob.pe','2026-08-14 20:58:36'),(396,'updated','Cifras',1,'Se actualizaron las cifras',2,'onsv@mtc.gob.pe','2026-08-14 20:59:07'),(397,'updated','Cifras',1,'Se actualizaron las cifras',2,'onsv@mtc.gob.pe','2026-08-14 20:59:37'),(398,'updated','Subitem menú',13,'Se actualizó el subitem del menú',2,'onsv@mtc.gob.pe','2026-08-14 21:01:02'),(399,'updated','Publicación publicaciones',0,'Se deshabilitó la publicación \'6a7119527ff6a522f9aba997\'',2,'onsv@mtc.gob.pe','2026-08-14 21:01:19'),(400,'updated','Subitem menú',13,'Se actualizó el subitem del menú',2,'onsv@mtc.gob.pe','2026-08-14 21:01:45'),(401,'updated','Publicación publicaciones',0,'Se habilitó la publicación \'6a7119527ff6a522f9aba997\'',2,'onsv@mtc.gob.pe','2026-08-14 21:01:48'),(402,'updated','Submenú',14,'Se actualizó el submenú \'INSPECCIONES TECNICAS\'',2,'onsv@mtc.gob.pe','2026-08-14 21:02:17'),(403,'updated','Banner',2,'Se actualizó la imagen del banner',2,'onsv@mtc.gob.pe','2026-08-14 21:03:09'),(404,'updated','Banner',2,'Se actualizaron los textos del banner (es)',2,'onsv@mtc.gob.pe','2026-08-14 21:03:37'),(405,'created','Usuario',11,'Se creó el usuario \'dpaz-prov@mtc.gob.pe\'',2,'onsv@mtc.gob.pe','2026-08-14 21:07:43'),(406,'updated','Región',5,'Se actualizó la imagen de la región de Ayacucho',11,'dpaz-prov@mtc.gob.pe','2026-08-14 21:08:57'),(407,'updated','Región',5,'Se actualizó el nombre del encargado, el celular del encargado, el correo del encargado de la región de Ayacucho',11,'dpaz-prov@mtc.gob.pe','2026-08-14 21:09:00'),(408,'updated','Subitem menú',8,'Se actualizó el subitem del menú',11,'dpaz-prov@mtc.gob.pe','2026-08-14 21:10:34'),(409,'updated','Subitem menú',12,'Se actualizó el subitem del menú',2,'onsv@mtc.gob.pe','2026-08-14 21:13:23'),(410,'updated','Subitem menú',11,'Se actualizó el subitem del menú',2,'onsv@mtc.gob.pe','2026-08-14 21:13:25'),(411,'updated','Subitem menú',13,'Se actualizó el subitem del menú',2,'onsv@mtc.gob.pe','2026-08-14 21:13:26'),(412,'updated','Subitem menú',14,'Se actualizó el subitem del menú',2,'onsv@mtc.gob.pe','2026-08-14 21:13:26'),(413,'updated','Subitem menú',12,'Se actualizó el subitem del menú',2,'onsv@mtc.gob.pe','2026-08-14 21:13:44'),(414,'updated','Subitem menú',13,'Se actualizó el subitem del menú',2,'onsv@mtc.gob.pe','2026-08-14 21:13:44'),(415,'updated','Subitem menú',11,'Se actualizó el subitem del menú',2,'onsv@mtc.gob.pe','2026-08-14 21:13:45'),(416,'updated','Subitem menú',14,'Se actualizó el subitem del menú',2,'onsv@mtc.gob.pe','2026-08-14 21:13:45'),(417,'updated','Evento',33,'Se actualizó el evento \'ULTIMA PRUEBA\'',2,'onsv@mtc.gob.pe','2026-08-14 21:16:48'),(418,'updated','Evento',33,'Se actualizó el evento \'ULTIMA PRUEBA\'',2,'onsv@mtc.gob.pe','2026-08-14 21:17:22'),(419,'updated','Banner',2,'Se actualizó la imagen del banner',2,'onsv@mtc.gob.pe','2026-08-15 17:52:32'),(420,'updated','Banner',2,'Se actualizaron los textos del banner (es)',2,'onsv@mtc.gob.pe','2026-08-15 17:52:36'),(421,'updated','Evento',32,'Se actualizó el evento \'PLAN PILOTO ITS\'',2,'onsv@mtc.gob.pe','2026-08-15 17:53:15'),(422,'updated','Cifras',1,'Se actualizaron las cifras',2,'onsv@mtc.gob.pe','2026-08-18 21:43:01'),(423,'updated','Banners',0,'Se actualizó el orden de los banners',2,'onsv@mtc.gob.pe','2026-08-18 21:45:38'),(424,'updated','Banner',2,'Se actualizaron los textos del banner (es)',2,'onsv@mtc.gob.pe','2026-08-18 21:45:49'),(425,'updated','Banner',2,'Se actualizaron los textos del banner (es)',2,'onsv@mtc.gob.pe','2026-08-18 21:46:07'),(426,'deleted','Popup slide',5,'Se eliminó un slide del popup',2,'onsv@mtc.gob.pe','2026-08-18 21:47:27'),(427,'deleted','Popup slide',2,'Se eliminó un slide del popup',2,'onsv@mtc.gob.pe','2026-08-18 21:47:30'),(428,'deleted','Popup slide',3,'Se eliminó un slide del popup',2,'onsv@mtc.gob.pe','2026-08-18 21:47:32'),(429,'deleted','Popup slide',4,'Se eliminó un slide del popup',2,'onsv@mtc.gob.pe','2026-08-18 21:47:35'),(430,'updated','Popup slide',1,'Se actualizó un slide del popup',2,'onsv@mtc.gob.pe','2026-08-18 21:48:09'),(431,'deleted','Programa',1,'Se eliminó el programa \'Título del Programa 1\'',2,'onsv@mtc.gob.pe','2026-08-18 21:48:38'),(432,'deleted','Programa',4,'Se eliminó el programa \'NUEVO PROGRAMA\'',2,'onsv@mtc.gob.pe','2026-08-18 21:48:43'),(433,'deleted','Programa',5,'Se eliminó el programa \'Nuevo de ejemplo\'',2,'onsv@mtc.gob.pe','2026-08-18 21:48:46'),(434,'deleted','Programa',8,'Se eliminó el programa \'Orientación a Víctimas\'',2,'onsv@mtc.gob.pe','2026-08-18 21:48:54'),(435,'deleted','Programa',9,'Se eliminó el programa \'ORIENTACÓN A VICTIMAS PRUBA\'',2,'onsv@mtc.gob.pe','2026-08-18 21:48:58'),(436,'deleted','Programa',10,'Se eliminó el programa \'NO SE PUEDE MÁS\'',2,'onsv@mtc.gob.pe','2026-08-18 21:49:10'),(437,'deleted','Programa',3,'Se eliminó el programa \'ISVO\'',2,'onsv@mtc.gob.pe','2026-08-18 21:49:19'),(438,'updated','Programa',6,'Se actualizó el programa \'Entornos Viales\'',2,'onsv@mtc.gob.pe','2026-08-18 21:51:10'),(439,'deleted','YouTube Video',7,'Se eliminó el video de YouTube \'prueba 5\'',2,'onsv@mtc.gob.pe','2026-08-18 21:51:48'),(440,'deleted','YouTube Video',6,'Se eliminó el video de YouTube \'prueba 4\'',2,'onsv@mtc.gob.pe','2026-08-18 21:51:50'),(441,'deleted','YouTube Video',5,'Se eliminó el video de YouTube \'prueba 2\'',2,'onsv@mtc.gob.pe','2026-08-18 21:51:52'),(442,'deleted','YouTube Video',14,'Se eliminó el video de YouTube \'NUEVO PARA PAGINACION\'',2,'onsv@mtc.gob.pe','2026-08-18 21:51:54'),(443,'deleted','YouTube Video',13,'Se eliminó el video de YouTube \'NUEVO\'',2,'onsv@mtc.gob.pe','2026-08-18 21:51:56'),(444,'deleted','YouTube Video',15,'Se eliminó el video de YouTube \'PRUEBA 2\'',2,'onsv@mtc.gob.pe','2026-08-18 21:52:02'),(445,'deleted','YouTube Video',16,'Se eliminó el video de YouTube \'PRUEBA 3\'',2,'onsv@mtc.gob.pe','2026-08-18 21:52:05'),(446,'deleted','YouTube Video',17,'Se eliminó el video de YouTube \'PRUEBA 4\'',2,'onsv@mtc.gob.pe','2026-08-18 21:52:07'),(447,'deleted','YouTube Video',18,'Se eliminó el video de YouTube \'PRUEBA 5\'',2,'onsv@mtc.gob.pe','2026-08-18 21:52:09'),(448,'deleted','YouTube Video',19,'Se eliminó el video de YouTube \'PRUEBA 6\'',2,'onsv@mtc.gob.pe','2026-08-18 21:52:11'),(449,'updated','Subitem menú',0,'Se actualizó el orden del menú',2,'onsv@mtc.gob.pe','2026-08-18 21:52:56'),(450,'updated','Subitem menú',0,'Se actualizó el orden del menú',2,'onsv@mtc.gob.pe','2026-08-18 21:52:57'),(451,'updated','Subitem menú',0,'Se actualizó el orden del menú',2,'onsv@mtc.gob.pe','2026-08-18 21:52:58'),(452,'deleted','YouTube Video',8,'Se eliminó el video de YouTube \'curso\'',2,'onsv@mtc.gob.pe','2026-08-18 21:53:38'),(453,'deleted','YouTube Video',9,'Se eliminó el video de YouTube \'clase b curso\'',2,'onsv@mtc.gob.pe','2026-08-18 21:53:41'),(454,'deleted','YouTube Video',20,'Se eliminó el video de YouTube \'nuevo\'',2,'onsv@mtc.gob.pe','2026-08-18 21:53:43'),(455,'deleted','YouTube Video',21,'Se eliminó el video de YouTube \'nuevo 2\'',2,'onsv@mtc.gob.pe','2026-08-18 21:53:45'),(456,'deleted','YouTube Video',22,'Se eliminó el video de YouTube \'nuevo 3\'',2,'onsv@mtc.gob.pe','2026-08-18 21:53:48'),(457,'deleted','YouTube Video',10,'Se eliminó el video de YouTube \'clase a\'',2,'onsv@mtc.gob.pe','2026-08-18 21:53:55'),(458,'deleted','YouTube Video',11,'Se eliminó el video de YouTube \'curso para no profesionales\'',2,'onsv@mtc.gob.pe','2026-08-18 21:53:57'),(459,'deleted','YouTube Video',12,'Se eliminó el video de YouTube \'curso para profesionales\'',2,'onsv@mtc.gob.pe','2026-08-18 21:53:59'),(460,'updated','Región',2,'Se actualizó el nombre del encargado, el celular del encargado, el correo del encargado de la región de Áncash',2,'onsv@mtc.gob.pe','2026-08-18 21:57:06'),(461,'updated','Región',5,'Se actualizó el nombre del encargado, el celular del encargado, el correo del encargado, el enlace de la página de la región de Ayacucho',2,'onsv@mtc.gob.pe','2026-08-18 21:57:57'),(462,'updated','Región',4,'Se actualizó el nombre del encargado, el celular del encargado, el correo del encargado, el enlace de la página de la región de Arequipa',2,'onsv@mtc.gob.pe','2026-08-18 21:58:45'),(463,'updated','Región',1,'Se actualizó el nombre del encargado, el celular del encargado, el correo del encargado, el enlace de la página de la región de Amazonas',2,'onsv@mtc.gob.pe','2026-08-18 21:59:40'),(464,'updated','Región',3,'Se actualizó el nombre del encargado, el celular del encargado, el correo del encargado, el enlace de la página de la región de Apurímac',2,'onsv@mtc.gob.pe','2026-08-18 22:00:42'),(465,'updated','Región',7,'Se actualizó el nombre del encargado, el celular del encargado, el correo del encargado, el enlace de la página de la región de Callao',2,'onsv@mtc.gob.pe','2026-08-18 22:01:54'),(466,'updated','Región',10,'Se actualizó el nombre del encargado, el celular del encargado, el correo del encargado, el enlace de la página de la región de Huánuco',2,'onsv@mtc.gob.pe','2026-08-18 22:02:37'),(467,'updated','Región',8,'Se actualizó el nombre del encargado, el celular del encargado, el correo del encargado, el enlace de la página de la región de Cusco',2,'onsv@mtc.gob.pe','2026-08-18 22:03:32'),(468,'updated','Misión/Visión',1,'Se actualizó Misión y Visión',2,'onsv@mtc.gob.pe','2026-08-18 22:08:26'),(469,'deleted','Componente',9,'Se eliminó el componente tecnológico \'SRAT\'',2,'onsv@mtc.gob.pe','2026-08-18 22:10:22'),(470,'created','Componente',26,'Se creó el componente tecnológico \'\'',2,'onsv@mtc.gob.pe','2026-08-18 22:11:45'),(471,'deleted','Componente',26,'Se eliminó el componente tecnológico \'\'',2,'onsv@mtc.gob.pe','2026-08-18 22:12:23'),(472,'created','Componente',27,'Se creó el componente tecnológico \'\'',2,'onsv@mtc.gob.pe','2026-08-18 22:12:48'),(473,'updated','Red Social',4,'Se actualizó la red social \'Tik Tok\'',2,'onsv@mtc.gob.pe','2026-08-18 22:13:04'),(474,'deleted','Evento',33,'Se eliminó el evento \'ULTIMA PRUEBA\'',2,'onsv@mtc.gob.pe','2026-08-18 22:13:22'),(475,'deleted','Evento',32,'Se eliminó el evento \'PLAN PILOTO ITS\'',2,'onsv@mtc.gob.pe','2026-08-18 22:13:28'),(476,'deleted','Evento',31,'Se eliminó el evento \'EEEE\'',2,'onsv@mtc.gob.pe','2026-08-18 22:13:30'),(477,'deleted','Evento',30,'Se eliminó el evento \'DASD\'',2,'onsv@mtc.gob.pe','2026-08-18 22:13:33'),(478,'deleted','Evento',29,'Se eliminó el evento \'Campaña Cascos\'',2,'onsv@mtc.gob.pe','2026-08-18 22:13:35'),(479,'deleted','Evento',26,'Se eliminó el evento \'ENTREVISTA INTERNACIONAL\'',2,'onsv@mtc.gob.pe','2026-08-18 22:13:39'),(480,'deleted','Evento',23,'Se eliminó el evento \'Campaña nueva prueba\'',2,'onsv@mtc.gob.pe','2026-08-18 22:13:42'),(481,'deleted','Evento',24,'Se eliminó el evento \'CAMPAÑA NUEVO PORTAL \'',2,'onsv@mtc.gob.pe','2026-08-18 22:13:45'),(482,'updated','Misión/Visión',1,'Se actualizó Misión y Visión',2,'onsv@mtc.gob.pe','2026-08-18 22:14:31'),(483,'deleted','Evento',21,'Se eliminó el evento \'Eventos de Ciclista TTT\'',2,'onsv@mtc.gob.pe','2026-08-18 22:14:39'),(484,'deleted','Evento',28,'Se eliminó el evento \'CASCOS \'',2,'onsv@mtc.gob.pe','2026-08-18 22:14:41'),(485,'deleted','Evento',27,'Se eliminó el evento \'DIA MUNDIAL DE LA BICICLETA\'',2,'onsv@mtc.gob.pe','2026-08-18 22:14:42'),(486,'deleted','Evento',25,'Se eliminó el evento \'EVENTO EN SEGURIDAD VIAL\'',2,'onsv@mtc.gob.pe','2026-08-18 22:14:44'),(487,'deleted','Evento',22,'Se eliminó el evento \'Evento CicloParqueo\'',2,'onsv@mtc.gob.pe','2026-08-18 22:14:46'),(488,'deleted','Evento',20,'Se eliminó el evento \'Eventos de Ciclista\'',2,'onsv@mtc.gob.pe','2026-08-18 22:14:47'),(489,'deleted','Evento',19,'Se eliminó el evento \'Evento lunes\'',2,'onsv@mtc.gob.pe','2026-08-18 22:14:49'),(490,'deleted','Evento',18,'Se eliminó el evento \'Nueva entrevista con direccion\'',2,'onsv@mtc.gob.pe','2026-08-18 22:14:51'),(491,'deleted','Evento',17,'Se eliminó el evento \'Nuevo evento con ck editor\'',2,'onsv@mtc.gob.pe','2026-08-18 22:14:53'),(492,'deleted','Evento',16,'Se eliminó el evento \'Entrevista a alguien importante\'',2,'onsv@mtc.gob.pe','2026-08-18 22:14:55'),(493,'deleted','Evento',15,'Se eliminó el evento \'Campaña martesa\'',2,'onsv@mtc.gob.pe','2026-08-18 22:14:58'),(494,'deleted','Evento',10,'Se eliminó el evento \'Nuevo evento 4\'',2,'onsv@mtc.gob.pe','2026-08-18 22:15:12'),(495,'deleted','Evento',9,'Se eliminó el evento \'Entrevista proxima\'',2,'onsv@mtc.gob.pe','2026-08-18 22:15:14'),(496,'deleted','Evento',8,'Se eliminó el evento \'Evento campaña proxima\'',2,'onsv@mtc.gob.pe','2026-08-18 22:15:16'),(497,'deleted','Evento',7,'Se eliminó el evento \'Evento tipo evento\'',2,'onsv@mtc.gob.pe','2026-08-18 22:15:18'),(498,'deleted','Evento',6,'Se eliminó el evento \'EVENTTO EJEMPLO\'',2,'onsv@mtc.gob.pe','2026-08-18 22:15:20'),(499,'deleted','Evento',5,'Se eliminó el evento \'Nuevo evento 3\'',2,'onsv@mtc.gob.pe','2026-08-18 22:15:22'),(500,'deleted','Evento',4,'Se eliminó el evento \'Nuevo evento 3\'',2,'onsv@mtc.gob.pe','2026-08-18 22:15:24'),(501,'deleted','Evento',3,'Se eliminó el evento \'Nuevo evento 2\'',2,'onsv@mtc.gob.pe','2026-08-18 22:15:25'),(502,'deleted','Evento',2,'Se eliminó el evento \'Evento importante con bold e italic\'',2,'onsv@mtc.gob.pe','2026-08-18 22:15:27'),(503,'deleted','Evento',1,'Se eliminó el evento \'Evento importante 2\'',2,'onsv@mtc.gob.pe','2026-08-18 22:15:28'),(504,'deleted','Evento',11,'Se eliminó el evento \'Nuevo evento 5\'',2,'onsv@mtc.gob.pe','2026-08-18 22:15:30'),(505,'deleted','Evento',12,'Se eliminó el evento \'Nuevo evento 7\'',2,'onsv@mtc.gob.pe','2026-08-18 22:15:32'),(506,'deleted','Evento',13,'Se eliminó el evento \'Evento lunes\'',2,'onsv@mtc.gob.pe','2026-08-18 22:15:33'),(507,'deleted','Evento',14,'Se eliminó el evento \'Evento con gif\'',2,'onsv@mtc.gob.pe','2026-08-18 22:15:36'),(508,'deleted','Revista',12,'Se eliminó la revista \'CASCOS TUTORIAL\'',2,'onsv@mtc.gob.pe','2026-08-18 22:15:39'),(509,'created','Revista',13,'Se creó la revista \'dfsfsd\'',2,'onsv@mtc.gob.pe','2026-08-18 22:16:08'),(510,'deleted','Revista',13,'Se eliminó la revista \'dfsfsd\'',2,'onsv@mtc.gob.pe','2026-08-18 22:16:54'),(511,'updated','Menú',1,'Se actualizó el menú \'ESTADISTICA DE SINIESTRALIDAD\'',2,'onsv@mtc.gob.pe','2026-08-18 22:29:41'),(512,'updated','Menú',2,'Se actualizó el menú \'CONCESIONARIAS\'',2,'onsv@mtc.gob.pe','2026-08-18 22:30:05'),(513,'updated','Menú',3,'Se actualizó el menú \'AUTORIZACION\'',2,'onsv@mtc.gob.pe','2026-08-18 22:30:12'),(514,'updated','Menú',4,'Se actualizó el menú \'CAPACITACION A CONDUCTORES\'',2,'onsv@mtc.gob.pe','2026-08-18 22:30:38'),(515,'deleted','Menú',5,'Se eliminó el menú \'Nuevo menu 2\'',2,'onsv@mtc.gob.pe','2026-08-18 22:30:46'),(516,'deleted','Menú',8,'Se eliminó el menú \'Nueva categoria 5\'',2,'onsv@mtc.gob.pe','2026-08-18 22:30:48'),(517,'deleted','Menú',9,'Se eliminó el menú \'Nuevo menu 3\'',2,'onsv@mtc.gob.pe','2026-08-18 22:30:51'),(518,'deleted','Menú',10,'Se eliminó el menú \'MAPA DE CALOR\'',2,'onsv@mtc.gob.pe','2026-08-18 22:30:55'),(519,'updated','Menú',10,'Se actualizó el menú \'ENTORNOS VIALES\'',2,'onsv@mtc.gob.pe','2026-08-18 22:31:12'),(520,'deleted','Menú',12,'Se eliminó el menú \'PRUEBA MENU\'',2,'onsv@mtc.gob.pe','2026-08-18 22:31:17'),(521,'deleted','Menú',12,'Se eliminó el menú \'PRUEBA MENU\'',2,'onsv@mtc.gob.pe','2026-08-18 22:31:35'),(522,'deleted','Menú',25,'Se eliminó el menú \'AUTORIZACIONES\'',2,'onsv@mtc.gob.pe','2026-08-18 22:31:48'),(523,'deleted','Menú',29,'Se eliminó el menú \'prueba\'',2,'onsv@mtc.gob.pe','2026-08-18 22:31:54'),(524,'deleted','Menú',29,'Se eliminó el menú \'prueba\'',2,'onsv@mtc.gob.pe','2026-08-18 22:31:58'),(525,'deleted','Menú',29,'Se eliminó el menú \'prueba\'',2,'onsv@mtc.gob.pe','2026-08-18 22:32:06'),(526,'deleted','Menú',12,'Se eliminó el menú \'PRUEBA MENU\'',2,'onsv@mtc.gob.pe','2026-08-18 22:32:21'),(527,'deleted','Menú',12,'Se eliminó el menú \'PRUEBA MENU\'',2,'onsv@mtc.gob.pe','2026-08-18 22:32:25'),(528,'deleted','Menú',12,'Se eliminó el menú \'PRUEBA MENU\'',2,'onsv@mtc.gob.pe','2026-08-18 22:32:28'),(529,'deleted','Menú',12,'Se eliminó el menú \'PRUEBA MENU\'',2,'onsv@mtc.gob.pe','2026-08-18 22:32:32'),(530,'deleted','Menú',12,'Se eliminó el menú \'PRUEBA MENU\'',2,'onsv@mtc.gob.pe','2026-08-18 22:32:34'),(531,'deleted','Menú',12,'Se eliminó el menú \'PRUEBA MENU\'',2,'onsv@mtc.gob.pe','2026-08-18 22:32:37'),(532,'deleted','Menú',12,'Se eliminó el menú \'PRUEBA MENU\'',2,'onsv@mtc.gob.pe','2026-08-18 22:32:40'),(533,'deleted','Menú',12,'Se eliminó el menú \'PRUEBA MENU\'',2,'onsv@mtc.gob.pe','2026-08-18 22:32:43'),(534,'deleted','Menú',20,'Se eliminó el menú \'Nueva categoria creada\'',2,'onsv@mtc.gob.pe','2026-08-18 22:32:47'),(535,'deleted','Menú',21,'Se eliminó el menú \'Nueva categoria creada\'',2,'onsv@mtc.gob.pe','2026-08-18 22:32:51'),(536,'deleted','Menú',12,'Se eliminó el menú \'PRUEBA MENU\'',2,'onsv@mtc.gob.pe','2026-08-18 22:32:57'),(537,'updated','Menú',12,'Se actualizó el menú \'MOVILIDAD ACTIVA\'',2,'onsv@mtc.gob.pe','2026-08-18 22:33:19'),(538,'deleted','Menú',23,'Se eliminó el menú \'ESTADISTICA DE SINIESTRALIDAD\'',2,'onsv@mtc.gob.pe','2026-08-18 22:33:30'),(539,'deleted','Menú',24,'Se eliminó el menú \'SINIESTRALIDAD FATAL (ONSV)\'',2,'onsv@mtc.gob.pe','2026-08-18 22:33:37'),(540,'updated','Menú',24,'Se actualizó el menú \'SINIESTRALIDAD FATAL (ONSV)\'',2,'onsv@mtc.gob.pe','2026-08-18 22:33:54'),(541,'deleted','Menú',25,'Se eliminó el menú \'AUTORIZACIONES\'',2,'onsv@mtc.gob.pe','2026-08-18 22:34:01'),(542,'deleted','Menú',26,'Se eliminó el menú \'MOVILIDAD ACTIVA\'',2,'onsv@mtc.gob.pe','2026-08-18 22:34:08'),(543,'deleted','Menú',26,'Se eliminó el menú \'MOVILIDAD ACTIVA\'',2,'onsv@mtc.gob.pe','2026-08-18 22:34:12'),(544,'deleted','Menú',26,'Se eliminó el menú \'MOVILIDAD ACTIVA\'',2,'onsv@mtc.gob.pe','2026-08-18 22:34:16'),(545,'deleted','Menú',26,'Se eliminó el menú \'MOVILIDAD ACTIVA\'',2,'onsv@mtc.gob.pe','2026-08-18 22:34:19'),(546,'deleted','Menú',26,'Se eliminó el menú \'MOVILIDAD ACTIVA\'',2,'onsv@mtc.gob.pe','2026-08-18 22:34:22'),(547,'deleted','Menú',26,'Se eliminó el menú \'MOVILIDAD ACTIVA\'',2,'onsv@mtc.gob.pe','2026-08-18 22:34:24'),(548,'deleted','Menú',26,'Se eliminó el menú \'MOVILIDAD ACTIVA\'',2,'onsv@mtc.gob.pe','2026-08-18 22:34:27'),(549,'deleted','Menú',29,'Se eliminó el menú \'prueba\'',2,'onsv@mtc.gob.pe','2026-08-18 22:34:31'),(550,'deleted','Menú',29,'Se eliminó el menú \'prueba\'',2,'onsv@mtc.gob.pe','2026-08-18 22:34:36'),(551,'deleted','Menú',29,'Se eliminó el menú \'prueba\'',2,'onsv@mtc.gob.pe','2026-08-18 22:34:39'),(552,'deleted','Menú',27,'Se eliminó el menú \'CAPACITACION A CONDUCTORES\'',2,'onsv@mtc.gob.pe','2026-08-18 22:34:46'),(553,'deleted','Menú',27,'Se eliminó el menú \'CAPACITACION A CONDUCTORES\'',2,'onsv@mtc.gob.pe','2026-08-18 22:34:50'),(554,'updated','Menú',23,'Se actualizó el menú \'ESTADISTICA DE SINIESTRALIDAD\'',2,'onsv@mtc.gob.pe','2026-08-18 22:35:09'),(555,'updated','Menú',4,'Se actualizó el menú \'CAPACITACION A CONDUCTORES\'',2,'onsv@mtc.gob.pe','2026-08-18 22:35:14'),(556,'updated','Menú',10,'Se actualizó el menú \'ENTORNOS VIALES\'',2,'onsv@mtc.gob.pe','2026-08-18 22:35:17'),(557,'updated','Menú',4,'Se actualizó el menú \'CAPACITACION A CONDUCTORES\'',2,'onsv@mtc.gob.pe','2026-08-18 22:35:26'),(558,'updated','Menú',10,'Se actualizó el menú \'ENTORNOS VIALES\'',2,'onsv@mtc.gob.pe','2026-08-18 22:35:32'),(559,'deleted','Menú',25,'Se eliminó el menú \'AUTORIZACIONES\'',2,'onsv@mtc.gob.pe','2026-08-18 22:35:40'),(560,'updated','Menú',25,'Se actualizó el menú \'AUTORIZACIONES\'',2,'onsv@mtc.gob.pe','2026-08-18 22:35:46'),(561,'updated','Menú',26,'Se actualizó el menú \'MOVILIDAD ACTIVA\'',2,'onsv@mtc.gob.pe','2026-08-18 22:35:52'),(562,'updated','Menú',27,'Se actualizó el menú \'CAPACITACION A CONDUCTORES\'',2,'onsv@mtc.gob.pe','2026-08-18 22:36:02'),(563,'updated','Menú',28,'Se actualizó el menú \'ENTORNOS VIALES\'',2,'onsv@mtc.gob.pe','2026-08-18 22:36:07'),(564,'updated','Menú',29,'Se actualizó el menú \'prueba\'',2,'onsv@mtc.gob.pe','2026-08-18 22:36:11'),(565,'updated','Submenú',4,'Se actualizó el submenú \'SINIESTRALIDAD\'',2,'onsv@mtc.gob.pe','2026-08-18 22:39:08'),(566,'updated','Submenú',6,'Se actualizó el submenú \'VEHICULOS\'',2,'onsv@mtc.gob.pe','2026-08-18 22:40:00'),(567,'updated','Submenú',7,'Se actualizó el submenú \'USUARIOS\'',2,'onsv@mtc.gob.pe','2026-08-18 22:40:37'),(568,'updated','Submenú',14,'Se actualizó el submenú \'SINIESTRALIDAD: LIMA METROPOLITANA CALLAO\'',2,'onsv@mtc.gob.pe','2026-08-18 22:41:15'),(569,'updated','Submenú',19,'Se actualizó el submenú \'VEHICULOS: LIMA METROPOLITANA CALLAO\'',2,'onsv@mtc.gob.pe','2026-08-18 22:41:47'),(570,'updated','Submenú',20,'Se actualizó el submenú \'GRADO DE SEVERIDAD\'',2,'onsv@mtc.gob.pe','2026-08-18 22:42:04'),(571,'deleted','Submenú',56,'Se eliminó el submenú \'\'',2,'onsv@mtc.gob.pe','2026-08-18 22:42:31'),(572,'deleted','Submenú',38,'Se eliminó el submenú \'\'',2,'onsv@mtc.gob.pe','2026-08-18 22:43:19'),(573,'deleted','Submenú',40,'Se eliminó el submenú \'\'',2,'onsv@mtc.gob.pe','2026-08-18 22:43:25'),(574,'updated','Submenú',20,'Se actualizó el submenú \'USUARIOS: LIMA METROPOLITANA CALLAO\'',2,'onsv@mtc.gob.pe','2026-08-18 22:44:05'),(575,'deleted','Submenú',21,'Se eliminó el submenú \'\'',2,'onsv@mtc.gob.pe','2026-08-18 22:45:04'),(576,'updated','Submenú',49,'Se actualizó el submenú \'RESUMEN\'',2,'onsv@mtc.gob.pe','2026-08-18 22:45:22'),(577,'created','YouTube Video',23,'Se creó el video de YouTube \'Capacitación Virtual para Especialistas de Seguridad Vial de la Región Callao - Sesión I\'',2,'onsv@mtc.gob.pe','2026-08-18 22:45:30'),(578,'updated','Submenú',50,'Se actualizó el submenú \'SINIESTROS\'',2,'onsv@mtc.gob.pe','2026-08-18 22:45:49'),(579,'updated','Submenú',51,'Se actualizó el submenú \'INVOLUCRADOS\'',2,'onsv@mtc.gob.pe','2026-08-18 22:46:20'),(580,'updated','Submenú',22,'Se actualizó el submenú \'AUTORIZACIONES EN TRANSPORTE TERRESTRE\'',2,'onsv@mtc.gob.pe','2026-08-18 22:46:32'),(581,'created','YouTube Video',24,'Se creó el video de YouTube \'Capacitación Virtual para Especialistas de Seguridad Vial de la Región Callao - Sesión II\'',2,'onsv@mtc.gob.pe','2026-08-18 22:46:36'),(582,'deleted','Submenú',29,'Se eliminó el submenú \'\'',2,'onsv@mtc.gob.pe','2026-08-18 22:46:46'),(583,'deleted','Submenú',2,'Se eliminó el submenú \'\'',2,'onsv@mtc.gob.pe','2026-08-18 22:47:36'),(584,'created','YouTube Video',25,'Se creó el video de YouTube \'TERCERA SESIÓN. HACIA LA CREACIÓN DE LA AGENCIA DE TRANSITO Y SEGURIDAD VIAL.\'',2,'onsv@mtc.gob.pe','2026-08-18 22:47:52'),(585,'deleted','Submenú',34,'Se eliminó el submenú \'\'',2,'onsv@mtc.gob.pe','2026-08-18 22:48:09'),(586,'deleted','Submenú',35,'Se eliminó el submenú \'\'',2,'onsv@mtc.gob.pe','2026-08-18 22:48:13'),(587,'deleted','Submenú',36,'Se eliminó el submenú \'\'',2,'onsv@mtc.gob.pe','2026-08-18 22:48:18'),(588,'deleted','Submenú',37,'Se eliminó el submenú \'\'',2,'onsv@mtc.gob.pe','2026-08-18 22:48:22'),(589,'deleted','Submenú',39,'Se eliminó el submenú \'\'',2,'onsv@mtc.gob.pe','2026-08-18 22:48:24'),(590,'created','YouTube Video',26,'Se creó el video de YouTube \'CUARTA SESIÓN. HACIA LA CREACIÓN DE LA AGENCIA DE TRANSITO Y SEGURIDAD VIAL.\'',2,'onsv@mtc.gob.pe','2026-08-18 22:48:32'),(591,'updated','Submenú',46,'Se actualizó el submenú \'INSPECCIONES TECNICAS\'',2,'onsv@mtc.gob.pe','2026-08-18 22:48:39'),(592,'deleted','Submenú',17,'Se eliminó el submenú \'\'',2,'onsv@mtc.gob.pe','2026-08-18 22:49:03'),(593,'deleted','Submenú',22,'Se eliminó el submenú \'\'',2,'onsv@mtc.gob.pe','2026-08-18 22:49:24'),(594,'updated','Submenú',41,'Se actualizó el submenú \'Siniestros\'',2,'onsv@mtc.gob.pe','2026-08-18 22:49:50'),(595,'updated','Submenú',43,'Se actualizó el submenú \'Usuarios de Vías\'',2,'onsv@mtc.gob.pe','2026-08-18 22:49:56'),(596,'updated','Submenú',42,'Se actualizó el submenú \'Vehículos\'',2,'onsv@mtc.gob.pe','2026-08-18 22:50:05'),(597,'updated','Submenú',44,'Se actualizó el submenú \'Grado de Severidad\'',2,'onsv@mtc.gob.pe','2026-08-18 22:50:14'),(598,'updated','Submenú',45,'Se actualizó el submenú \'Mapa de Siniestros\'',2,'onsv@mtc.gob.pe','2026-08-18 22:50:20'),(599,'deleted','Submenú',49,'Se eliminó el submenú \'\'',2,'onsv@mtc.gob.pe','2026-08-18 22:50:37'),(600,'deleted','Submenú',50,'Se eliminó el submenú \'\'',2,'onsv@mtc.gob.pe','2026-08-18 22:50:41'),(601,'deleted','Submenú',51,'Se eliminó el submenú \'\'',2,'onsv@mtc.gob.pe','2026-08-18 22:50:46'),(602,'updated','Submenú',52,'Se actualizó el submenú \'Curso de Seguridad Vial\'',2,'onsv@mtc.gob.pe','2026-08-18 22:51:55'),(603,'updated','Submenú',52,'Se actualizó el submenú \'CURSO DE SEGURIDAD VIAL\'',2,'onsv@mtc.gob.pe','2026-08-18 22:52:08'),(604,'updated','Submenú',53,'Se actualizó el submenú \'ANALISIS DE PERCEPCION\'',2,'onsv@mtc.gob.pe','2026-08-18 22:52:56'),(605,'deleted','Submenú',27,'Se eliminó el submenú \'\'',2,'onsv@mtc.gob.pe','2026-08-18 22:53:37'),(606,'updated','Submenú',55,'Se actualizó el submenú \'ANALITICA\'',2,'onsv@mtc.gob.pe','2026-08-18 22:54:38'),(607,'deleted','Submenú',28,'Se eliminó el submenú \'\'',2,'onsv@mtc.gob.pe','2026-08-18 22:54:58'),(608,'deleted','Menú',26,'Se eliminó el menú \'MOVILIDAD ACTIVA\'',2,'onsv@mtc.gob.pe','2026-08-18 22:57:44'),(609,'deleted','Menú',26,'Se eliminó el menú \'MOVILIDAD ACTIVA\'',2,'onsv@mtc.gob.pe','2026-08-18 22:57:49'),(610,'created','Submenú',57,'Se creó el submenú \'RESUMEN\'',2,'onsv@mtc.gob.pe','2026-08-18 22:57:50'),(611,'deleted','Menú',25,'Se eliminó el menú \'AUTORIZACIONES\'',2,'onsv@mtc.gob.pe','2026-08-18 22:57:53'),(612,'deleted','Menú',29,'Se eliminó el menú \'prueba\'',2,'onsv@mtc.gob.pe','2026-08-18 22:58:04'),(613,'deleted','Menú',28,'Se eliminó el menú \'ENTORNOS VIALES\'',2,'onsv@mtc.gob.pe','2026-08-18 22:58:12'),(614,'deleted','Submenú',52,'Se eliminó el submenú \'\'',2,'onsv@mtc.gob.pe','2026-08-18 22:58:40'),(615,'deleted','Menú',27,'Se eliminó el menú \'CAPACITACION A CONDUCTORES\'',2,'onsv@mtc.gob.pe','2026-08-18 22:58:46'),(616,'deleted','Menú',28,'Se eliminó el menú \'ENTORNOS VIALES\'',2,'onsv@mtc.gob.pe','2026-08-18 22:58:49'),(617,'deleted','Menú',25,'Se eliminó el menú \'AUTORIZACIONES\'',2,'onsv@mtc.gob.pe','2026-08-18 22:58:55'),(618,'deleted','Menú',23,'Se eliminó el menú \'ESTADISTICA DE SINIESTRALIDAD\'',2,'onsv@mtc.gob.pe','2026-08-18 22:59:06'),(619,'deleted','Menú',25,'Se eliminó el menú \'AUTORIZACIONES\'',2,'onsv@mtc.gob.pe','2026-08-18 22:59:14'),(620,'deleted','Menú',26,'Se eliminó el menú \'MOVILIDAD ACTIVA\'',2,'onsv@mtc.gob.pe','2026-08-18 22:59:28'),(621,'created','Submenú',58,'Se creó el submenú \'CURSO DE SEGURIDAD VIAL\'',2,'onsv@mtc.gob.pe','2026-08-18 22:59:32'),(622,'deleted','Menú',25,'Se eliminó el menú \'AUTORIZACIONES\'',2,'onsv@mtc.gob.pe','2026-08-18 22:59:36'),(623,'deleted','Menú',26,'Se eliminó el menú \'MOVILIDAD ACTIVA\'',2,'onsv@mtc.gob.pe','2026-08-18 23:00:51'),(624,'updated','Menú',26,'Se actualizó el menú \'MOVILIDAD ACTIVA\'',2,'onsv@mtc.gob.pe','2026-08-18 23:01:01'),(625,'deleted','Menú',26,'Se eliminó el menú \'MOVILIDAD ACTIVA\'',2,'onsv@mtc.gob.pe','2026-08-18 23:01:05'),(626,'updated','Menú',26,'Se actualizó el menú \'MOVILIDAD ACTIVA\'',2,'onsv@mtc.gob.pe','2026-08-18 23:01:10'),(627,'deleted','Menú',26,'Se eliminó el menú \'MOVILIDAD ACTIVA\'',2,'onsv@mtc.gob.pe','2026-08-18 23:01:38'),(628,'deleted','Menú',28,'Se eliminó el menú \'ENTORNOS VIALES\'',2,'onsv@mtc.gob.pe','2026-08-18 23:01:53'),(629,'updated','Menú',28,'Se actualizó el menú \'LIBRE 1\'',2,'onsv@mtc.gob.pe','2026-08-18 23:02:31'),(630,'updated','Menú',26,'Se actualizó el menú \'LIBRE 2\'',2,'onsv@mtc.gob.pe','2026-08-18 23:02:53'),(631,'updated','Menú',25,'Se actualizó el menú \'LIBRE 3\'',2,'onsv@mtc.gob.pe','2026-08-18 23:03:28'),(632,'created','Submenú',59,'Se creó el submenú \'SINIESTROS\'',2,'onsv@mtc.gob.pe','2026-08-18 23:03:46'),(633,'created','Submenú',60,'Se creó el submenú \'INVOLUCRADOS\'',2,'onsv@mtc.gob.pe','2026-08-18 23:04:04'),(634,'deleted','Submenú',53,'Se eliminó el submenú \'\'',2,'onsv@mtc.gob.pe','2026-08-18 23:04:27'),(635,'updated','Submenú',46,'Se actualizó el submenú \'INSPECCIONES TECNICAS\'',2,'onsv@mtc.gob.pe','2026-08-18 23:05:16'),(636,'updated','Submenú',47,'Se actualizó el submenú \'LICENCIAS DE CONDUCIR\'',2,'onsv@mtc.gob.pe','2026-08-18 23:05:30'),(637,'updated','Submenú',48,'Se actualizó el submenú \'AUTORIZACIONES EN TRANSPORTE TERRESTRE\'',2,'onsv@mtc.gob.pe','2026-08-18 23:05:38'),(638,'updated','Submenú',60,'Se actualizó el submenú \'INVOLUCRADOS\'',2,'onsv@mtc.gob.pe','2026-08-18 23:05:52'),(639,'created','Submenú',61,'Se creó el submenú \'ANALISIS DE PERCEPCION\'',2,'onsv@mtc.gob.pe','2026-08-18 23:07:56'),(640,'updated','Submenú',55,'Se actualizó el submenú \'ANALITICA\'',2,'onsv@mtc.gob.pe','2026-08-18 23:09:33'),(641,'deleted','Dataset',60,'Se eliminó el dataset \'CASCOS NUEVOS\'',2,'onsv@mtc.gob.pe','2026-08-18 23:12:20'),(642,'deleted','Dataset',54,'Se eliminó el dataset \'PRUEBA 45\'',2,'onsv@mtc.gob.pe','2026-08-18 23:12:25'),(643,'deleted','Dataset',53,'Se eliminó el dataset \'PRUEBA 2\'',2,'onsv@mtc.gob.pe','2026-08-18 23:12:27'),(644,'deleted','Dataset',15,'Se eliminó el dataset \'Paro de transportistas Paro de transportistas Paro de transportistas Paro de transportistas Paro de transportistas Paro de transportistas Paro de transportistas Paro de transportistas Paro de transpor\'',2,'onsv@mtc.gob.pe','2026-08-18 23:12:30'),(645,'deleted','Dataset',14,'Se eliminó el dataset \'Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto Lorem Ipsum ha sido el texto de relleno estandar de las industrias cuando un impresor N del T persona que se dedica \'',2,'onsv@mtc.gob.pe','2026-08-18 23:12:33'),(646,'deleted','Dataset',13,'Se eliminó el dataset \'ejemplo de titulo\'',2,'onsv@mtc.gob.pe','2026-08-18 23:12:35'),(647,'deleted','Dataset',9,'Se eliminó el dataset \'Nuestro único signo vital\'',2,'onsv@mtc.gob.pe','2026-08-18 23:12:37'),(648,'deleted','Dataset',8,'Se eliminó el dataset \'Medida responde a la crisis internacional que afecta el precio de combustibles y de los alimentos\'',2,'onsv@mtc.gob.pe','2026-08-18 23:12:40'),(649,'deleted','Dataset',7,'Se eliminó el dataset \'¿Dónde puedo conseguirlo?\'',2,'onsv@mtc.gob.pe','2026-08-18 23:12:44'),(650,'deleted','Tipo',11,'Se eliminó el tipo \'Tipo 64\'',2,'onsv@mtc.gob.pe','2026-08-18 23:18:21'),(651,'updated','Categoría',21,'Se actualizó la categoría \'Personas involucradas\'',2,'onsv@mtc.gob.pe','2026-08-18 23:20:31'),(652,'deleted','Categoría',32,'Se eliminó la categoría \'Personas Involucradas\'',2,'onsv@mtc.gob.pe','2026-08-18 23:20:56'),(653,'updated','Categoría',29,'Se actualizó la categoría \'Mapa de Calor\'',2,'onsv@mtc.gob.pe','2026-08-18 23:21:16'),(654,'updated','Categoría',33,'Se actualizó la categoría \'Vehículos Involucrados\'',2,'onsv@mtc.gob.pe','2026-08-18 23:21:35'),(655,'updated','Categoría',32,'Se actualizó la categoría \'Personas Involucradas\'',2,'onsv@mtc.gob.pe','2026-08-18 23:21:39'),(656,'deleted','Dataset',55,'Se eliminó el dataset \'HISTORICO DE SINIESTROS DE TRÁNSITO 2008-2025 (Preliminar)\'',2,'onsv@mtc.gob.pe','2026-08-18 23:22:42'),(657,'created','Dataset',62,'Se creó el dataset \'HISTORICO DE SINIESTROS DE TRÁNSITO 2008-2025 (Preliminar)\'',2,'onsv@mtc.gob.pe','2026-08-18 23:25:03'),(658,'deleted','Dataset',58,'Se eliminó el dataset \'SINIESTROS DE TRANSITO FATALES 2021-2025 (preliminar)\'',2,'onsv@mtc.gob.pe','2026-08-18 23:25:58'),(659,'deleted','Dataset',57,'Se eliminó el dataset \'VEHÍCULOS INVOLUCRADOS EN SINIESTROS DE TRÁNSITO FATALES 2021-2025 (preliminar)\'',2,'onsv@mtc.gob.pe','2026-08-18 23:26:00'),(660,'deleted','Dataset',56,'Se eliminó el dataset \'PERSONAS INVOLUCRADAS EN SINIESTROS DE TRÁNSITO FATALES 2021-2025 (PRELIMINAR)\'',2,'onsv@mtc.gob.pe','2026-08-18 23:26:02'),(661,'created','Dataset',63,'Se creó el dataset \'SINIESTROS DE TRANSITO FATALES 2021-2025 (preliminar)\'',2,'onsv@mtc.gob.pe','2026-08-18 23:26:46'),(662,'created','Dataset',64,'Se creó el dataset \'VEHÍCULOS INVOLUCRADOS EN SINIESTROS DE TRÁNSITO FATALES 2021-2025 (preliminar)\'',2,'onsv@mtc.gob.pe','2026-08-18 23:27:24'),(663,'created','Dataset',65,'Se creó el dataset \'PERSONAS INVOLUCRADAS EN SINIESTROS DE TRÁNSITO FATALES 2021-2025 (PRELIMINAR)\'',2,'onsv@mtc.gob.pe','2026-08-18 23:28:00'),(664,'updated','Dataset',64,'Se actualizó el dataset \'VEHÍCULOS INVOLUCRADOS EN SINIESTROS DE TRÁNSITO FATALES 2021-2025 (preliminar)\'',2,'onsv@mtc.gob.pe','2026-08-18 23:28:17'),(665,'updated','Dataset',62,'Se actualizó el dataset \'HISTORICO DE SINIESTROS DE TRÁNSITO 2008-2025 (Preliminar)\'',2,'onsv@mtc.gob.pe','2026-08-18 23:28:28'),(666,'updated','Dataset',63,'Se actualizó el dataset \'SINIESTROS DE TRANSITO FATALES 2021-2025 (preliminar)\'',2,'onsv@mtc.gob.pe','2026-08-18 23:28:35'),(667,'deleted','Tipo',9,'Se eliminó el tipo \'Tipo 4\'',2,'onsv@mtc.gob.pe','2026-08-18 23:29:12'),(668,'deleted','Tipo',14,'Se eliminó el tipo \'Dataset\'',2,'onsv@mtc.gob.pe','2026-08-18 23:29:22'),(669,'updated','Tipo',12,'Se actualizó el tipo \'INFORME\'',2,'onsv@mtc.gob.pe','2026-08-18 23:29:39'),(670,'updated','Tipo',15,'Se actualizó el tipo \'BLOG\'',2,'onsv@mtc.gob.pe','2026-08-18 23:29:44'),(671,'deleted','Usuario',5,'Se eliminó el usuario \'test1@test.com\'',2,'onsv@mtc.gob.pe','2026-08-18 23:30:05'),(672,'deleted','Usuario',3,'Se eliminó el usuario \'consejero-regional@mtc.gob.pe\'',2,'onsv@mtc.gob.pe','2026-08-18 23:30:17'),(673,'deleted','Usuario',7,'Se eliminó el usuario \'nuevo-usuario@mtc.gob.pe\'',2,'onsv@mtc.gob.pe','2026-08-18 23:30:22'),(674,'deleted','Usuario',10,'Se eliminó el usuario \'prueba@gmail.com\'',2,'onsv@mtc.gob.pe','2026-08-18 23:30:25'),(675,'deleted','Rol',13,'Se eliminó el rol \'sadfasdfasdf\'',2,'onsv@mtc.gob.pe','2026-08-18 23:30:31'),(676,'deleted','Rol',14,'Se eliminó el rol \'grtrtrw\'',2,'onsv@mtc.gob.pe','2026-08-18 23:30:33'),(677,'deleted','Rol',15,'Se eliminó el rol \'sadfasdfasdf\'',2,'onsv@mtc.gob.pe','2026-08-18 23:30:35'),(678,'deleted','Rol',16,'Se eliminó el rol \'asdfads\'',2,'onsv@mtc.gob.pe','2026-08-18 23:30:36'),(679,'deleted','Rol',17,'Se eliminó el rol \'adsfasdf \'',2,'onsv@mtc.gob.pe','2026-08-18 23:30:38'),(680,'deleted','Rol',23,'Se eliminó el rol \'asdfasdf\'',2,'onsv@mtc.gob.pe','2026-08-18 23:30:39'),(681,'deleted','Rol',25,'Se eliminó el rol \'asdfasd\'',2,'onsv@mtc.gob.pe','2026-08-18 23:30:41'),(682,'deleted','Rol',29,'Se eliminó el rol \'Creador planes regionales\'',2,'onsv@mtc.gob.pe','2026-08-18 23:30:45'),(683,'deleted','Rol',26,'Se eliminó el rol \'test1\'',2,'onsv@mtc.gob.pe','2026-08-18 23:30:46'),(684,'deleted','Rol',30,'Se eliminó el rol \'test\'',2,'onsv@mtc.gob.pe','2026-08-18 23:30:49'),(685,'deleted','Rol',9,'Se eliminó el rol \'test\'',2,'onsv@mtc.gob.pe','2026-08-18 23:30:50'),(686,'deleted','Rol',30,'Se eliminó el rol \'test\'',2,'onsv@mtc.gob.pe','2026-08-18 23:30:52'),(687,'deleted','Rol',30,'Se eliminó el rol \'test\'',2,'onsv@mtc.gob.pe','2026-08-18 23:30:55'),(688,'updated','Rol',30,'Se actualizó el rol \'Test\'',2,'onsv@mtc.gob.pe','2026-08-18 23:31:07'),(689,'updated','Rol',31,'Se actualizó el rol \'Usuario\'',2,'onsv@mtc.gob.pe','2026-08-18 23:31:18'),(690,'created','Usuario',12,'Se creó el usuario \'gcervantes-prov@mtc.gob.pe\'',2,'onsv@mtc.gob.pe','2026-08-18 23:31:57'),(691,'deleted','Usuario',9,'Se eliminó el usuario \'dsv.com\'',2,'onsv@mtc.gob.pe','2026-08-18 23:32:08'),(692,'deleted','Usuario',8,'Se eliminó el usuario \'test@test.com\'',2,'onsv@mtc.gob.pe','2026-08-18 23:32:13'),(693,'created','Usuario',13,'Se creó el usuario \'wquispec-prov@mtc.gob.pe\'',2,'onsv@mtc.gob.pe','2026-08-18 23:32:36'),(694,'updated','Subitem menú',8,'Se actualizó el subitem del menú',2,'onsv@mtc.gob.pe','2026-08-18 23:34:49'),(695,'updated','Misión/Visión',1,'Se actualizó Misión y Visión',2,'onsv@mtc.gob.pe','2026-08-18 23:37:52'),(696,'updated','Misión/Visión',1,'Se actualizó Misión y Visión',2,'onsv@mtc.gob.pe','2026-08-18 23:37:54'),(697,'updated','Componente',1,'Se actualizó el componente tecnológico \'Entornos Viales Seguros\'',2,'onsv@mtc.gob.pe','2026-08-18 23:42:02'),(698,'updated','Componente',2,'Se actualizó el componente tecnológico \'Visor de Mapas\'',2,'onsv@mtc.gob.pe','2026-08-18 23:43:19'),(699,'updated','Componente',1,'Se actualizó el componente tecnológico \'Entornos Viales Seguros\'',2,'onsv@mtc.gob.pe','2026-08-18 23:46:51'),(700,'updated','Componente',2,'Se actualizó el componente tecnológico \'Visor de Mapas\'',2,'onsv@mtc.gob.pe','2026-08-18 23:46:52'),(701,'updated','Componente',3,'Se actualizó el componente tecnológico \'Datos Abiertos\'',2,'onsv@mtc.gob.pe','2026-08-18 23:46:54'),(702,'updated','Componente',4,'Se actualizó el componente tecnológico \'Registro de Siniestros\'',2,'onsv@mtc.gob.pe','2026-08-18 23:46:56'),(703,'updated','Componente',5,'Se actualizó el componente tecnológico \'Tableros BI\'',2,'onsv@mtc.gob.pe','2026-08-18 23:46:58'),(704,'updated','Componente',7,'Se actualizó el componente tecnológico \'Iniciativa de Seguridad Vial Organizacional\'',2,'onsv@mtc.gob.pe','2026-08-18 23:48:48'),(705,'updated','Componente',6,'Se actualizó el componente tecnológico \'Aula Virtual\'',2,'onsv@mtc.gob.pe','2026-08-18 23:48:49'),(706,'updated','Componente',7,'Se actualizó el componente tecnológico \'Iniciativa de Seguridad Vial Organizacional\'',2,'onsv@mtc.gob.pe','2026-08-18 23:49:02'),(707,'updated','Componente',8,'Se actualizó el componente tecnológico \'\'',2,'onsv@mtc.gob.pe','2026-08-18 23:49:03'),(708,'updated','Componente',27,'Se actualizó el componente tecnológico \'\'',2,'onsv@mtc.gob.pe','2026-08-18 23:49:04'),(709,'deleted','Componente',27,'Se eliminó el componente tecnológico \'\'',2,'onsv@mtc.gob.pe','2026-08-18 23:49:24'),(710,'deleted','Componente',8,'Se eliminó el componente tecnológico \'\'',2,'onsv@mtc.gob.pe','2026-08-18 23:49:26'),(711,'deleted','Revista',4,'Se eliminó la revista \'Anthropologica\'',2,'onsv@mtc.gob.pe','2026-08-18 23:52:28'),(712,'deleted','Revista',3,'Se eliminó la revista \'Revista de Psicología\'',2,'onsv@mtc.gob.pe','2026-08-18 23:52:30'),(713,'deleted','Revista',2,'Se eliminó la revista \'Derecho PUCP\'',2,'onsv@mtc.gob.pe','2026-08-18 23:52:33'),(714,'deleted','Revista',1,'Se eliminó la revista \'Cambio de Título\'',2,'onsv@mtc.gob.pe','2026-08-18 23:52:35'),(715,'deleted','Revista',11,'Se eliminó la revista \'Revista del Medio Ambiente\'',2,'onsv@mtc.gob.pe','2026-08-18 23:52:37'),(716,'deleted','Revista',6,'Se eliminó la revista \'Educación\'',2,'onsv@mtc.gob.pe','2026-08-18 23:52:38'),(717,'updated','Banner',1,'Se actualizaron los textos del banner (es)',2,'onsv@mtc.gob.pe','2026-08-18 23:56:18'),(718,'updated','Banner',1,'Se actualizaron los textos del banner (es)',2,'onsv@mtc.gob.pe','2026-08-18 23:57:00'),(719,'updated','Banner',1,'Se actualizaron los textos del banner (es)',2,'onsv@mtc.gob.pe','2026-08-18 23:57:43'),(720,'updated','Región',2,'Se actualizó la región de Áncash',2,'onsv@mtc.gob.pe','2026-08-19 00:34:34');
/*!40000 ALTER TABLE `logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu`
--

DROP TABLE IF EXISTS `menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `descripcion` varchar(100) COLLATE utf8_bin DEFAULT NULL COMMENT 'descripcion del menu',
  `urlImagen` text COLLATE utf8_bin,
  `observacion` varchar(255) COLLATE utf8_bin DEFAULT NULL COMMENT 'obbservacion del menu',
  `estaActivo` tinyint(1) DEFAULT '1',
  `create_time` datetime DEFAULT NULL COMMENT 'Create Time',
  `update_time` datetime DEFAULT NULL COMMENT 'Update Time',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='menu';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu`
--

LOCK TABLES `menu` WRITE;
/*!40000 ALTER TABLE `menu` DISABLE KEYS */;
INSERT INTO `menu` VALUES (1,'ESTADISTICA DE SINIESTRALIDAD','/assets/menu/menu_1787092179646.png',NULL,1,NULL,'2026-08-18 17:29:41'),(2,'CONCESIONARIAS','/assets/menu/menu_1787092204453.png',NULL,1,NULL,'2026-08-18 17:30:05'),(3,'AUTORIZACION','/estaticos/img/IMAGENGRUPO_aUTORIZACIONES_LICENCIAS.png',NULL,0,NULL,'2026-08-18 17:30:12'),(4,'CAPACITACION A CONDUCTORES','/assets/menu/menu_1787092237885.png',NULL,1,NULL,'2026-08-18 17:35:26'),(10,'ENTORNOS VIALES','/assets/menu/menu_1787092271065.png',NULL,1,'2023-01-30 10:35:09','2026-08-18 17:35:32'),(12,'MOVILIDAD ACTIVA','/assets/menu/menu_1787092396721.jpg',NULL,1,'2023-01-30 15:50:03','2026-08-18 17:33:19'),(24,'SINIESTRALIDAD FATAL (ONSV)','/assets/menu/menu_1786394027759.png',NULL,0,NULL,'2026-08-18 17:33:54'),(25,'LIBRE 3',NULL,NULL,0,NULL,'2026-08-18 18:03:28'),(26,'LIBRE 2',NULL,NULL,0,NULL,'2026-08-18 18:02:53'),(28,'LIBRE 1','/assets/menu/menu_1785605267743.jpg',NULL,0,'2026-07-18 14:05:07','2026-08-18 18:02:31');
/*!40000 ALTER TABLE `menu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_subitems`
--

DROP TABLE IF EXISTS `menu_subitems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_subitems` (
  `id` int NOT NULL AUTO_INCREMENT,
  `seccion` varchar(30) NOT NULL COMMENT 'quienes-somos | comunicaciones | publicaciones | educacion-vial',
  `orden` int NOT NULL DEFAULT '0',
  `label_es` varchar(200) NOT NULL DEFAULT '',
  `label_en` varchar(200) NOT NULL DEFAULT '',
  `url` varchar(500) NOT NULL DEFAULT '',
  `external` tinyint NOT NULL DEFAULT '0' COMMENT '1 = abrir en nueva pestana (target=_blank)',
  `isActive` tinyint NOT NULL DEFAULT '1',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_seccion_orden` (`seccion`,`orden`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_subitems`
--

LOCK TABLES `menu_subitems` WRITE;
/*!40000 ALTER TABLE `menu_subitems` DISABLE KEYS */;
INSERT INTO `menu_subitems` VALUES (1,'quienes-somos',1,'¿Quienes somos?','Who we are?','/quienes-somos#quienes-somos',0,1,'2026-08-13 21:14:28','2026-08-13 21:14:28'),(2,'quienes-somos',2,'Misión','Mission','/quienes-somos#mision',0,1,'2026-08-13 21:14:28','2026-08-13 21:14:28'),(3,'quienes-somos',3,'Visión','Vision','/quienes-somos#vision',0,1,'2026-08-13 21:14:28','2026-08-13 21:14:28'),(4,'quienes-somos',4,'Valores','Values','/quienes-somos#valores',0,1,'2026-08-13 21:14:28','2026-08-13 21:14:28'),(5,'quienes-somos',5,'Componentes Tecnológicos','Tech Components','/quienes-somos#componentes',0,1,'2026-08-13 21:14:28','2026-08-13 21:14:28'),(6,'comunicaciones',1,'Noticias','News','/comunicaciones/noticias',0,1,'2026-08-13 21:14:28','2026-08-13 21:14:28'),(7,'comunicaciones',2,'Nota de prensa','Press release','/comunicaciones/nota-prensa',0,1,'2026-08-13 21:14:28','2026-08-13 21:14:28'),(8,'comunicaciones',3,'Eventos','Events','/comunicaciones/eventos',1,1,'2026-08-13 21:14:28','2026-08-18 23:34:49'),(9,'publicaciones',1,'Publicaciones','Publications','/publicaciones',0,1,'2026-08-13 21:14:28','2026-08-13 21:14:28'),(10,'publicaciones',2,'Revistas','Journals','/revistas',0,1,'2026-08-13 21:14:28','2026-08-13 21:14:28'),(11,'educacion-vial',2,'Webinars','Webinars','/webinars',0,1,'2026-08-13 21:14:28','2026-08-18 21:52:58'),(12,'educacion-vial',3,'Capacitaciones','Trainings','/capacitaciones',0,1,'2026-08-13 21:14:28','2026-08-18 21:52:57'),(13,'educacion-vial',4,'peru-in-world','PERU-IN-world','/peru-in-world',1,1,'2026-08-13 21:14:28','2026-08-18 21:52:56'),(14,'educacion-vial',1,'Aula Virtual','Virtual Room','https://aulavirtual.mtc.gob.pe/seguridadvial/',1,1,'2026-08-13 21:14:28','2026-08-18 21:52:58'),(15,'aplicaciones',1,'Prueba','Test','/analitica',1,0,'2026-08-13 21:15:48','2026-08-14 20:43:48'),(16,'normas-legales',1,'Nueva prueba creada','New test created','/analitica',0,0,'2026-08-13 21:17:29','2026-08-14 20:40:06');
/*!40000 ALTER TABLE `menu_subitems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nivel_siniestralidad`
--

DROP TABLE IF EXISTS `nivel_siniestralidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nivel_siniestralidad` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nivel_siniestralidad`
--

LOCK TABLES `nivel_siniestralidad` WRITE;
/*!40000 ALTER TABLE `nivel_siniestralidad` DISABLE KEYS */;
INSERT INTO `nivel_siniestralidad` VALUES (1,'Lesionado'),(2,'Accidentado'),(3,'Fallecido');
/*!40000 ALTER TABLE `nivel_siniestralidad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nivel_siniestralidad_region`
--

DROP TABLE IF EXISTS `nivel_siniestralidad_region`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nivel_siniestralidad_region` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idRegion` int NOT NULL,
  `idNivelSiniestralidad` int NOT NULL,
  `cantidad` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_nivel_siniestralidad_region_region` (`idRegion`),
  KEY `fk_nivel_siniestralidad_region_nivel_siniestralidad` (`idNivelSiniestralidad`),
  CONSTRAINT `fk_nivel_siniestralidad_region_nivel_siniestralidad` FOREIGN KEY (`idNivelSiniestralidad`) REFERENCES `nivel_siniestralidad` (`id`),
  CONSTRAINT `fk_nivel_siniestralidad_region_region` FOREIGN KEY (`idRegion`) REFERENCES `regiones` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nivel_siniestralidad_region`
--

LOCK TABLES `nivel_siniestralidad_region` WRITE;
/*!40000 ALTER TABLE `nivel_siniestralidad_region` DISABLE KEYS */;
INSERT INTO `nivel_siniestralidad_region` VALUES (1,1,1,12),(2,1,2,11),(3,1,3,20),(4,3,1,60),(5,3,2,40),(6,3,3,15),(7,4,1,0),(8,4,2,0),(9,4,3,0),(10,5,1,23),(11,5,2,15),(12,5,3,60),(13,6,1,0),(14,6,2,0),(15,6,3,0),(16,7,1,0),(17,7,2,0),(18,7,3,0),(19,8,1,0),(20,8,2,0),(21,8,3,0),(22,9,1,0),(23,9,2,0),(24,9,3,0),(25,10,1,0),(26,10,2,0),(27,10,3,0),(28,11,1,30),(29,11,2,50),(30,11,3,30),(31,12,1,0),(32,12,2,0),(33,12,3,0),(34,13,1,0),(35,13,2,0),(36,13,3,0),(37,14,1,0),(38,14,2,0),(39,14,3,0),(40,15,1,0),(41,15,2,0),(42,15,3,0),(43,26,1,0),(44,26,2,0),(45,26,3,0),(46,16,1,0),(47,16,2,0),(48,16,3,0),(49,17,1,0),(50,17,2,0),(51,17,3,0),(52,18,1,0),(53,18,2,0),(54,18,3,0),(55,19,1,0),(56,19,2,0),(57,19,3,0),(58,20,1,0),(59,20,2,0),(60,20,3,0),(61,21,1,0),(62,21,2,0),(63,21,3,0),(64,22,1,0),(65,22,2,0),(66,22,3,0),(67,23,1,0),(68,23,2,0),(69,23,3,0),(70,24,1,0),(71,24,2,0),(72,24,3,0),(73,25,1,0),(74,25,2,0),(75,25,3,0),(76,2,1,0),(77,2,2,0),(78,2,3,0);
/*!40000 ALTER TABLE `nivel_siniestralidad_region` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `objetivo`
--

DROP TABLE IF EXISTS `objetivo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `objetivo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text,
  `periodoInicial` varchar(255) NOT NULL,
  `periodoFinal` varchar(255) NOT NULL,
  `idPlanIncentivo` int NOT NULL,
  `idIndicador` int NOT NULL,
  `estaActivo` tinyint(1) NOT NULL DEFAULT '1',
  `fechaRegistro` datetime NOT NULL,
  `idUsuarioRegistro` int DEFAULT NULL,
  `fechaActualizacion` datetime NOT NULL,
  `idUsuarioActualizacion` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_meta_plan_incentivo` (`idPlanIncentivo`),
  KEY `fk_meta_indicador` (`idIndicador`),
  KEY `fk_meta_user_actualizacion` (`idUsuarioRegistro`),
  CONSTRAINT `fk_meta_indicador` FOREIGN KEY (`idIndicador`) REFERENCES `indicador` (`id`),
  CONSTRAINT `fk_meta_plan_incentivo` FOREIGN KEY (`idPlanIncentivo`) REFERENCES `programa` (`id`),
  CONSTRAINT `fk_meta_user_actualizacion` FOREIGN KEY (`idUsuarioRegistro`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_meta_user_registro` FOREIGN KEY (`idUsuarioRegistro`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `objetivo`
--

LOCK TABLES `objetivo` WRITE;
/*!40000 ALTER TABLE `objetivo` DISABLE KEYS */;
/*!40000 ALTER TABLE `objetivo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagina`
--

DROP TABLE IF EXISTS `pagina`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagina` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `seccion1` text COLLATE utf8_bin,
  `seccion2` text COLLATE utf8_bin,
  `seccion3` text COLLATE utf8_bin,
  `create_time` datetime DEFAULT NULL,
  `update_time` datetime DEFAULT NULL,
  `idioma` char(2) COLLATE utf8_bin DEFAULT NULL,
  `seccion4` text COLLATE utf8_bin,
  `seccion5` text COLLATE utf8_bin,
  `seccion6` text COLLATE utf8_bin,
  `seccion7` text COLLATE utf8_bin,
  `seccion8` text COLLATE utf8_bin,
  `seccion9` text COLLATE utf8_bin,
  `seccion10` text COLLATE utf8_bin,
  `seccion11` text COLLATE utf8_bin,
  `seccion12` text COLLATE utf8_bin,
  `seccion13` text COLLATE utf8_bin,
  `seccion14` text COLLATE utf8_bin,
  `seccion15` text COLLATE utf8_bin,
  `seccion16` text COLLATE utf8_bin,
  `seccion17` text COLLATE utf8_bin,
  `seccion18` text COLLATE utf8_bin,
  `seccion19` text COLLATE utf8_bin,
  `seccion20` text COLLATE utf8_bin,
  `seccion21` text COLLATE utf8_bin,
  `seccion22` text COLLATE utf8_bin,
  `seccion23` text COLLATE utf8_bin,
  `seccion24` text COLLATE utf8_bin,
  `seccion25` text COLLATE utf8_bin,
  `seccion26` text COLLATE utf8_bin,
  `seccion27` text COLLATE utf8_bin,
  `seccion28` text COLLATE utf8_bin,
  `seccion29` text COLLATE utf8_bin,
  `seccion30` text COLLATE utf8_bin,
  `seccion31` text COLLATE utf8_bin,
  `seccion32` text COLLATE utf8_bin,
  `seccion33` text COLLATE utf8_bin,
  `seccion34` text COLLATE utf8_bin,
  `seccion35` text COLLATE utf8_bin,
  `seccion36` varchar(500) COLLATE utf8_bin DEFAULT NULL COMMENT 'Comp1 link',
  `seccion37` varchar(500) COLLATE utf8_bin DEFAULT NULL COMMENT 'Comp2 link',
  `seccion38` varchar(500) COLLATE utf8_bin DEFAULT NULL COMMENT 'Comp3 link',
  `seccion39` varchar(500) COLLATE utf8_bin DEFAULT NULL COMMENT 'Comp4 link',
  `seccion40` varchar(500) COLLATE utf8_bin DEFAULT NULL COMMENT 'Comp5 link',
  `seccion41` varchar(500) COLLATE utf8_bin DEFAULT NULL COMMENT 'Comp6 link',
  `seccion42` varchar(500) COLLATE utf8_bin DEFAULT NULL COMMENT 'Comp7 link',
  `seccion43` varchar(500) COLLATE utf8_bin DEFAULT NULL COMMENT 'Comp8 link',
  `seccion44` varchar(500) COLLATE utf8_bin DEFAULT NULL COMMENT 'Comp9 link',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='paginan de mision y vision';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagina`
--

LOCK TABLES `pagina` WRITE;
/*!40000 ALTER TABLE `pagina` DISABLE KEYS */;
INSERT INTO `pagina` VALUES (1,'<p>El Observatorio Nacional de Seguridad Vial se crea mediante Decreto Legislativo 1216-2015, que tendrá como como base de datos primaria al Registro de Accidentes de Tránsito de la Policía Nacional del Perú, al Registro Sanitario de Víctimas de Accidentes de Tránsito del Ministerio de Salud, y al Registro Forense de Víctimas de Accidentes de Tránsito del Instituto de Medicina Legal y Ciencias Forenses del Ministerio Público. Asimismo, articula todas las bases de datos secundarias, de las diversas instituciones públicas y privadas, Gobiernos Regionales y Gobiernos Locales, en materia de seguridad vial.<p>\n\n<p>El Observatorio Nacional de Seguridad Vial entra en funcionamiento el primer trimestre del año 2021, y se convierte en el mecanismo de articulación intersectorial e intergubernamental que tiene por objeto consolidar información en materia de seguridad vial para la toma de decisiones que contribuyan a la implementación de la Política Nacional de Seguridad Vial.<p>\n\n<p>Articula y facilita los mecanismos tecnológicos para el proceso de integración de los registros de información de las bases de datos de las instituciones participantes como fuente primaria, así como otras producidas por el Poder Ejecutivo, Gobiernos Regionales, Locales, y entidades públicas y privadas, que resulten relevantes para la gestión de información de asuntos relacionados a la ocurrencia de accidentes de tránsito.<p>\n\n<p>Diseña y define las metodologías, formatos y estándares necesarios para la recolección de datos de accidentes de tránsito generadas por parte de las autoridades competentes en tránsito, transporte y seguridad vial; así como realizar el procesamiento de información correspondiente.<p>\n\n<p>Actualmente es administrado y gestionado por la Dirección de Seguridad Vial de la Dirección General de Políticas y Regulación en Transporte Multimodal del Ministerio de Transportes y Comunicaciones.<p>','<p>El Observatorio Nacional de Seguridad Vial busca ser el líder en el conocimiento de información, estandariza y de calidad, en materia de seguridad vial, alineada al enfoque de Sistema Seguro, que promueve y establece que las muertes y lesiones graves en el tránsito son inaceptables.<p>','<p>Brindar información relevante, así como, realizar el monitoreo y seguimiento de los datos en materia de seguridad vial, cuyo análisis se convierta en fuente para la elaboración y evaluación de las políticas públicas, programas, proyectos e intervenciones para una adecuada toma de decisiones, por arte de las instituciones involucradas, que impacten en la reducción de la siniestralidad y sus víctimas a nivel nacional.<p>',NULL,NULL,'ES','Componentes tecnológicos','<p>Actuamos con ética, honestidad y coherencia en la gestión de la información pública. Creemos en la transparencia, el compromiso, la vocación de servicio, el trabajo articulado y la innovación para reducir la siniestralidad y proteger la vida de las personas en las vías.<p>','Entorno Escolar','Seguridad vial y prevención en zonas escolares.','Tableros Analítica','Visualización dinámica de indicadores y tendencias.','Registro de Víctimas','Sistema de seguimiento de lesionados y fallecidos.','Visor de Mapas','Mapas georreferenciados de seguridad vial.','INTEGRIDAD','Actuamos con ética, honestidad y coherencia en la gestión de la información pública.','TRANSPARENCIA','Promovemos el acceso abierto a datos confiables de seguridad vial para toda la ciudadanía.','COMPROMISO','Trabajamos por reducir la siniestralidad y proteger la vida de las personas en las vías.','VOCACIÓN DE SERVICIO','Orientamos nuestro esfuerzo a las necesidades de las instituciones y de la población.','TRABAJO ARTICULADO','Fomentamos la coordinación intersectorial e intergubernamental basada en evidencia.','INNOVACIÓN','Incorporamos tecnología y análisis de datos para una mejor toma de decisiones.','Datos Abiertos','Datasets descargables en Excel, CSV, PDF y shapefile.','Tableros BI','Inteligencia de negocio para la toma de decisiones.','Registros Accidentes','Reporte y consulta de siniestros de tránsito registrados.','Analítica','Tableros e indicadores de seguridad vial.','SRAT','Visor de alerta de siniestros de tránsito.','https://aulavirtual.mtc.gob.pe/seguridadvial/','/analitica','/analitica','https://sratma.mtc.gob.pe/SRATMA/mapa/','/datosabiertos','','','','https://sratma.mtc.gob.pe/SRATMA/mapa/'),(2,'The ONSV centralizes road safety information in Peru.','Reduce road crashes through data and analysis.','To be the national reference in road safety data.','2022-08-11 00:00:00','2022-08-09 00:00:00','EN','Technological components','We act with ethics, honesty and consistency in the management of public information. We believe in transparency, commitment, service vocation, articulated work and innovation to reduce road crashes and protect lives on the roads.','School Environment','Road safety and prevention in school zones.','Analytics Dashboards','Dynamic visualization of indicators and trends.','Victim Registry','Tracking system for injured and deceased.','Map Viewer','Georeferenced road safety maps.','INTEGRITY','We act with ethics, honesty and consistency in the management of public information.','TRANSPARENCY','We promote open access to reliable road safety data for all citizens.','COMMITMENT','We work to reduce road crashes and protect people\'s lives on the roads.','SERVICE VOCATION','We focus our efforts on the needs of institutions and the population.','ARTICULATED WORK','We foster intersectoral and intergovernmental coordination based on evidence.','INNOVATION','We incorporate technology and data analysis for better decision making.','Open Data','Downloadable datasets in Excel, CSV, PDF and shapefile.','BI Dashboards','Business intelligence for decision making.','Accident Records','Reporting and querying registered traffic crashes.','Analytics','Dashboards and road safety indicators.','SRAT','Traffic crash alert viewer.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `pagina` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parametro`
--

DROP TABLE IF EXISTS `parametro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parametro` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lesionado` int DEFAULT NULL,
  `accidente` int DEFAULT NULL,
  `fallecido` int DEFAULT NULL,
  `mensaje1` text COLLATE utf8_bin,
  `mensaje2` text COLLATE utf8_bin,
  `fuente_siniestro` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `porcentaje_siniestro` varchar(20) COLLATE utf8_bin DEFAULT NULL,
  `fuente_lesiones` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `porcentaje_lesiones` varchar(20) COLLATE utf8_bin DEFAULT NULL,
  `fuente_muertes` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `porcentaje_muertes` varchar(20) COLLATE utf8_bin DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parametro`
--

LOCK TABLES `parametro` WRITE;
/*!40000 ALTER TABLE `parametro` DISABLE KEYS */;
INSERT INTO `parametro` VALUES (1,55328,88243,3400,'*Cifras período 2025','** En el año 2024 se registraron las siguientes cifras: Siniestros: 86,757 - Lesionados: 56,747 - Fallecidos: 3,002','Fuente PNP: 2025','+1.7% vs 2024','Fuente PNP: 2025','-2.6% vs 2024','Fuente PNP: 2025','+12.4% vs 2024');
/*!40000 ALTER TABLE `parametro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permission`
--

DROP TABLE IF EXISTS `permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `value` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permission`
--

LOCK TABLES `permission` WRITE;
/*!40000 ALTER TABLE `permission` DISABLE KEYS */;
INSERT INTO `permission` VALUES (1,'content_management.read'),(2,'content_management.create'),(3,'content_management.update'),(4,'content_management.delete'),(5,'consejo_regional.read'),(6,'plan_regional.read'),(7,'plan_regional.create'),(8,'plan_regional.update'),(9,'plan_regional.delete');
/*!40000 ALTER TABLE `permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personas_capacitacion`
--

DROP TABLE IF EXISTS `personas_capacitacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personas_capacitacion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idProvincia` int NOT NULL,
  `tipoDocumento` varchar(40) NOT NULL,
  `numeroDocumento` varchar(40) NOT NULL,
  `representante` varchar(255) DEFAULT NULL,
  `cargo` varchar(40) DEFAULT NULL,
  `idCapacitacion` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_personas_capacitacion_provincia` (`idProvincia`),
  KEY `fk_personas_capacitacion_actividad` (`idCapacitacion`),
  CONSTRAINT `fk_personas_capacitacion_actividad` FOREIGN KEY (`idCapacitacion`) REFERENCES `actividad` (`id`),
  CONSTRAINT `fk_personas_capacitacion_provincia` FOREIGN KEY (`idProvincia`) REFERENCES `provincia` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personas_capacitacion`
--

LOCK TABLES `personas_capacitacion` WRITE;
/*!40000 ALTER TABLE `personas_capacitacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `personas_capacitacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `popup`
--

DROP TABLE IF EXISTS `popup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `popup` (
  `id` int NOT NULL AUTO_INCREMENT,
  `posicion` int NOT NULL DEFAULT '1',
  `titulo` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `imagen` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  `contenido` text COLLATE utf8_bin,
  `observacion` text COLLATE utf8_bin,
  `create_time` datetime DEFAULT NULL,
  `update_time` datetime DEFAULT NULL,
  `estado` char(1) COLLATE utf8_bin DEFAULT NULL,
  `enlace` text COLLATE utf8_bin,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `popup`
--

LOCK TABLES `popup` WRITE;
/*!40000 ALTER TABLE `popup` DISABLE KEYS */;
INSERT INTO `popup` VALUES (1,1,'undefined','/assets/popup/popup_1787089675022.png','undefined','observacion123485',NULL,'2026-08-18 16:48:09','1','https://www.gob.pe/institucion/mtc/campa%C3%B1as/130605-entornos-viales-seguros');
/*!40000 ALTER TABLE `popup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `popup_bak`
--

DROP TABLE IF EXISTS `popup_bak`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `popup_bak` (
  `id` int NOT NULL DEFAULT '0',
  `titulo` varchar(50) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  `imagen` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  `contenido` text CHARACTER SET utf8 COLLATE utf8_bin,
  `observacion` text CHARACTER SET utf8 COLLATE utf8_bin,
  `create_time` datetime DEFAULT NULL,
  `update_time` datetime DEFAULT NULL,
  `estado` char(1) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  `enlace` text CHARACTER SET utf8 COLLATE utf8_bin
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `popup_bak`
--

LOCK TABLES `popup_bak` WRITE;
/*!40000 ALTER TABLE `popup_bak` DISABLE KEYS */;
INSERT INTO `popup_bak` VALUES (1,'undefined','/assets/popup/popup_mesa_de_trabajo.png','undefined','observacion123485',NULL,'2026-07-22 15:33:32','1','https://www.gob.pe/institucion/mtc/noticias/735174-mtc-restringira-circulacion-de-vehiculos-de-carga-por-la-carretera-central-en-semana-santa');
/*!40000 ALTER TABLE `popup_bak` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programa`
--

DROP TABLE IF EXISTS `programa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `programa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text,
  `enlace` text,
  `imagen` varchar(500) DEFAULT NULL,
  `idObjetivo` int DEFAULT NULL,
  `idIndicador` int DEFAULT NULL,
  `estaActivo` tinyint(1) NOT NULL DEFAULT '1',
  `fechaRegistro` datetime NOT NULL,
  `idUsuarioRegistro` int DEFAULT NULL,
  `fechaActualizacion` datetime NOT NULL,
  `idUsuarioActualizacion` int DEFAULT NULL,
  `periodoInicio` varchar(200) DEFAULT NULL,
  `periodoFin` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_plan_incentivo_user_actualizacion` (`idUsuarioRegistro`),
  KEY `fk_programa_indicador` (`idIndicador`),
  KEY `fk_programa_objetivo` (`idObjetivo`),
  CONSTRAINT `fk_plan_incentivo_user_actualizacion` FOREIGN KEY (`idUsuarioRegistro`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_plan_incentivo_user_registro` FOREIGN KEY (`idUsuarioRegistro`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_programa_indicador` FOREIGN KEY (`idIndicador`) REFERENCES `indicador` (`id`),
  CONSTRAINT `fk_programa_objetivo` FOREIGN KEY (`idObjetivo`) REFERENCES `objetivo` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programa`
--

LOCK TABLES `programa` WRITE;
/*!40000 ALTER TABLE `programa` DISABLE KEYS */;
INSERT INTO `programa` VALUES (6,'entornos-viales','Entornos Viales','El Ministerio de Transportes y Comunicaciones (MTC), a través de la Dirección de Seguridad Vial (DSV), impulsa la iniciativa Entornos Viales Seguros, orientada a transformar los espacios urbanos de mayor riesgo en zonas más seguras, ordenadas y accesibles para todos.','https://www.gob.pe/institucion/mtc/campa%C3%B1as/130605-entornos-viales-seguros','/assets/programas/programa_1787089862257.png',NULL,NULL,1,'2026-08-01 12:52:40',NULL,'2026-08-18 16:51:10',NULL,NULL,NULL);
/*!40000 ALTER TABLE `programa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `provincia`
--

DROP TABLE IF EXISTS `provincia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `provincia` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) NOT NULL,
  `capital` varchar(200) NOT NULL,
  `geometria` varchar(255) DEFAULT NULL,
  `idRegion` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_provincia_region` (`idRegion`),
  CONSTRAINT `fk_provincia_region` FOREIGN KEY (`idRegion`) REFERENCES `regiones` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provincia`
--

LOCK TABLES `provincia` WRITE;
/*!40000 ALTER TABLE `provincia` DISABLE KEYS */;
/*!40000 ALTER TABLE `provincia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `publicaciones_estado`
--

DROP TABLE IF EXISTS `publicaciones_estado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `publicaciones_estado` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ghost_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `habilitado` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ghost_tipo` (`ghost_id`,`tipo`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `publicaciones_estado`
--

LOCK TABLES `publicaciones_estado` WRITE;
/*!40000 ALTER TABLE `publicaciones_estado` DISABLE KEYS */;
INSERT INTO `publicaciones_estado` VALUES (1,'6840d6725d30e40c752152b7','noticias',1,'2026-07-30 15:19:37','2026-07-30 15:19:38'),(3,'692dd5f3d7fcd10f9cbb3585','notas-prensa',1,'2026-07-30 15:19:59','2026-07-30 15:20:06'),(5,'660acee249d8950d26f8b430','normas-legales',1,'2026-07-30 16:07:36','2026-07-30 16:07:53'),(7,'6a7119527ff6a522f9aba997','publicaciones',1,'2026-08-14 21:01:19','2026-08-14 21:01:48');
/*!40000 ALTER TABLE `publicaciones_estado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `redes_sociales`
--

DROP TABLE IF EXISTS `redes_sociales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `redes_sociales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `red` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `redes_sociales`
--

LOCK TABLES `redes_sociales` WRITE;
/*!40000 ALTER TABLE `redes_sociales` DISABLE KEYS */;
INSERT INTO `redes_sociales` VALUES (1,'Facebook','https://www.facebook.com/onsvPE','/assets/redes/fb-logo.png',1),(2,'Twitter','https://x.com/onsvPE','/assets/redes/red_1785525504892.png',1),(3,'YouTube','https://www.youtube.com/channel/UCdNz5eyTZClohkpJgk4oa2Q','/assets/redes/red_1785525532917.png',1),(4,'Tik Tok','https://www.tiktok.com/@mtc_gobperu','/assets/redes/red_1785525590715.png',0);
/*!40000 ALTER TABLE `redes_sociales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `regiones`
--

DROP TABLE IF EXISTS `regiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `regiones` (
  `id` int NOT NULL,
  `value` varchar(255) COLLATE utf8_bin NOT NULL,
  `slug` varchar(255) COLLATE utf8_bin NOT NULL,
  `geometria` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `nombreEncargado` varchar(200) COLLATE utf8_bin DEFAULT NULL,
  `celularEncargado` varchar(40) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  `correoEncargado` varchar(200) COLLATE utf8_bin DEFAULT NULL,
  `imageUrl` text COLLATE utf8_bin,
  `pageLink` text COLLATE utf8_bin,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `regiones`
--

LOCK TABLES `regiones` WRITE;
/*!40000 ALTER TABLE `regiones` DISABLE KEYS */;
INSERT INTO `regiones` VALUES (1,'Amazonas','amazonas',NULL,'Ing. Segundo Mejía Sánchez','(041) 312358','smejia@drtcamazonas.gob.pe','/estaticos/img/amazonas.png',' https://mesadepartes.drtcamazonas.gob.pe/public/'),(2,'Áncash','ancash',NULL,'Abog. Fredy Russmelt Alvarado Tarazona','(043) 421767','direccion@drtcancash.gob.pe','/assets/ancash.png?v=1785594584055','https://www.gob.pe/regionancash'),(3,'Apurímac','apurimac',NULL,'Ing. Antonio Ibañez Escalante','983696967','drtc@regionapurimac.gob.pe','/estaticos/img/apurimac.png','https://regionapurimac.gob.pe/mesadepartesvirtual/'),(4,'Arequipa','arequipa',NULL,'Carlos Alberto Ramos Vera','(054) 382860','cramos@regionarequipa.gob.pe','/estaticos/img/arequipa.png','mesadepartesvirtual.grtc@regionarequipa.gob.pe'),(5,'Ayacucho','ayacucho',NULL,'Beltrán Barzola Ayala','(066) 283441','-','/assets/ayacucho.png?v=1786741737538',' https://drtcayacucho.gob.pe/mesavirtual.html'),(6,'Cajamarca','cajamarca',NULL,'Ronal Salazar Chávez','(076)363472','rsalazar@drtccajamarca.gob.pe','/estaticos/img/cajamarca.png',NULL),(7,'Callao','callao',NULL,'José Antonio Espinoza Huerta','012060430','jespinoza@regioncallao.gob.pe','/estaticos/img/callao.png','http://mesavirtual.regioncallao.gob.pe/consultaGRC/'),(8,'Cusco','cusco',NULL,'Ing. Saúl Nieto Gamboa','984672954','gerencia@drtccusco gob.pe','/estaticos/img/cusco.png','https://mvtransportes.regioncusco.gob.pe/tramite/virtual'),(9,'Huancavelica','huancavelica',NULL,'Arq. Ivan Justo Mendoza Artica','968277482','direccion@drtchuancavelica.gob.pe; ivan.mendoza.artica@gmail.com','/estaticos/img/huancavelica.png',NULL),(10,'Huánuco','huanuco',NULL,'Luisiño Inocente Rosas Herrera','062513402','direccionregional@drtchco.gob.pe','/estaticos/img/huanuco.png','tramite@drtchco.gob.pe'),(11,'Ica','ica',NULL,'Abog. Mario Carlos Uribe Flores','932 767 620','Uribefloresmariocarlos@gmail.com','/estaticos/img/ica.png',NULL),(12,'Junín','junin',NULL,'Alejandro Oviedo Echevarría','970340504','aoviedo@drtcjunin.gob.pe','/estaticos/img/junin.png','http://drtcjunin.gob.pe/'),(13,'La Libertad','la-libertad',NULL,'Edith Chuco Gutierrez','993133033','gerencia@grtclalibertad.gob.pe','/estaticos/img/la libertad.png',NULL),(14,'Lambayeque','lambayeque',NULL,'Abog. Delver Gonzales Tapia','(074)208301','grtransportes@regionlambayeque.gob.pe','/estaticos/img/lambayeque.png',NULL),(15,'Lima','lima-provincia',NULL,'José Eduardo Pretel Saldaña','943990699','jpretel@regionlima.gob.pe','/estaticos/img/lima.png',NULL),(16,'Loreto','loreto',NULL,'Rafaiel Pezo Díaz','937609704','drtc@regionloreto.gob.pe, milagrosmiluska22@gmail.com','/estaticos/img/loreto.png',NULL),(17,'Madre de Dios','madre-de-dios',NULL,NULL,NULL,NULL,'/estaticos/img/madre de dios.png',NULL),(18,'Moquegua','moquegua',NULL,NULL,NULL,NULL,'/estaticos/img/moquegua.png',NULL),(19,'Pasco','pasco',NULL,NULL,NULL,NULL,'/estaticos/img/pasco.png',NULL),(20,'Piura','piura',NULL,'Luis Fernando Vega Palacios','(073)328561 ó 984585915','lvegap@drtcp.gob.pe','/estaticos/img/piura.png',NULL),(21,'Puno','puno',NULL,NULL,NULL,NULL,'/estaticos/img/puno.png',NULL),(22,'San Martín','san-martin',NULL,'San Martin','987654321','sanmartin@gob.com.pe','/estaticos/img/san martin.png',NULL),(23,'Tacna','tacna',NULL,NULL,NULL,NULL,'/estaticos/img/tacna.png',NULL),(24,'Tumbes','tumbes',NULL,'Ing. Carlos David Farfán Mariñas','949482145','fcarlos@transportestumbes.gob.pe','/estaticos/img/tumbes.png',NULL),(25,'Ucayali','ucayali',NULL,NULL,NULL,NULL,NULL,NULL),(26,'Lima Metropolitana','lima-metropolitana',NULL,'Dirección de Seguridad Vial','+511 615-7800','onsv@mtc.gob.pe','/assets/lima metropolitana.png?v=1785779467187','https://www.onsv.gob.pe/');
/*!40000 ALTER TABLE `regiones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rel_user_role_permission`
--

DROP TABLE IF EXISTS `rel_user_role_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rel_user_role_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `permissionId` int NOT NULL,
  `roleId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_user_role_permission_permission` (`permissionId`),
  KEY `fk_user_role_permission_role` (`roleId`),
  CONSTRAINT `fk_user_role_permission_permission` FOREIGN KEY (`permissionId`) REFERENCES `permission` (`id`),
  CONSTRAINT `fk_user_role_permission_role` FOREIGN KEY (`roleId`) REFERENCES `user_role` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rel_user_role_permission`
--

LOCK TABLES `rel_user_role_permission` WRITE;
/*!40000 ALTER TABLE `rel_user_role_permission` DISABLE KEYS */;
INSERT INTO `rel_user_role_permission` VALUES (1,1,1),(2,2,1),(3,3,1),(4,4,1),(5,5,1),(6,6,1),(7,7,1),(8,8,1),(9,9,1),(16,5,2),(17,6,2),(18,7,2),(19,8,2),(20,9,2);
/*!40000 ALTER TABLE `rel_user_role_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `responsable`
--

DROP TABLE IF EXISTS `responsable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `responsable` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `entidad` varchar(255) NOT NULL,
  `estaActivo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `responsable`
--

LOCK TABLES `responsable` WRITE;
/*!40000 ALTER TABLE `responsable` DISABLE KEYS */;
INSERT INTO `responsable` VALUES (1,'Municipio de Breña','MTC',1),(2,'Municipio de Barranca','MTC',1),(3,'Persona 3','MTCD',1),(4,'Persona 4','MTC',1),(5,'Nuevo responsable','MTC',1);
/*!40000 ALTER TABLE `responsable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `revistas`
--

DROP TABLE IF EXISTS `revistas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `revistas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `tema` varchar(100) DEFAULT NULL,
  `imagen_url` varchar(500) DEFAULT NULL,
  `pdf_url` varchar(500) DEFAULT NULL,
  `esta_activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `idTemaRevista` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `revistas`
--

LOCK TABLES `revistas` WRITE;
/*!40000 ALTER TABLE `revistas` DISABLE KEYS */;
/*!40000 ALTER TABLE `revistas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8 COLLATE utf8_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('2JwbffLbt7KnnaKQNjP4mrGeIe1X4s4l',1787237108,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2026-08-20T14:45:07.062Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{}}'),('Vqt0SkgTKNqL1oQcOJ0s3-0xj9MXxS9V',1787237727,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2026-08-20T14:30:43.281Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{}}'),('id273MVLAsdwxln7hpd4_9UgqL95U6sf',1787183909,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2026-08-19T21:39:39.963Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{\"user\":\"Mi17cHJvcGllZGFkOidPTlNWJyxhdXRvcjonSGVucnkgTWVkaW5hIFJvZHLDrWd1ZXonLGNvbnRhY3RvOidobWVkaW5hckB1bmkucGUnfQ\"}}');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sub_actividad`
--

DROP TABLE IF EXISTS `sub_actividad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sub_actividad` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `fechaInicio` date NOT NULL,
  `fechaFin` date DEFAULT NULL,
  `idActividad` int NOT NULL,
  `pdfFileUrl` text,
  `excelFileUrl` text,
  `csvFileUrl` text,
  `estaActivo` tinyint(1) NOT NULL DEFAULT '1',
  `fechaRegistro` datetime NOT NULL,
  `idUsuarioRegistro` int DEFAULT NULL,
  `fechaActualizacion` datetime NOT NULL,
  `idUsuarioActualizacion` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_sub_actividad_actividad` (`idActividad`),
  KEY `fk_sub_actividad_user_actualizacion` (`idUsuarioRegistro`),
  CONSTRAINT `fk_sub_actividad_actividad` FOREIGN KEY (`idActividad`) REFERENCES `actividad` (`id`),
  CONSTRAINT `fk_sub_actividad_user_actualizacion` FOREIGN KEY (`idUsuarioRegistro`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sub_actividad_user_registro` FOREIGN KEY (`idUsuarioRegistro`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sub_actividad`
--

LOCK TABLES `sub_actividad` WRITE;
/*!40000 ALTER TABLE `sub_actividad` DISABLE KEYS */;
INSERT INTO `sub_actividad` VALUES (1,'Sub actividad 1','2023-12-21','2023-12-22',4,NULL,'/estaticos/excel/archivo-excel.xlsx','/estaticos/csv/archivo-csv.csv',1,'2023-03-31 05:49:03',2,'2023-03-31 05:49:03',2),(2,'Sub actividad 2','2023-02-13','2023-02-14',7,'/estaticos/pdf/archivo-pdf.pdf','/estaticos/excel/archivo-excel.xlsx','/estaticos/csv/archivo-csv.csv',1,'2023-03-31 05:50:02',2,'2023-03-31 05:50:02',2),(3,'Sub actividad 3','2023-06-14',NULL,1,NULL,NULL,NULL,1,'2023-03-31 05:50:55',2,'2023-03-31 05:50:55',2),(4,'Sub actividad 4','2023-12-12',NULL,1,NULL,'/estaticos/excel/archivo-excel.xlsx','/estaticos/csv/archivo-csv.csv',1,'2023-03-31 07:15:10',2,'2023-03-31 07:15:10',2);
/*!40000 ALTER TABLE `sub_actividad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subactividades_asistencia_municipio`
--

DROP TABLE IF EXISTS `subactividades_asistencia_municipio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subactividades_asistencia_municipio` (
  `id` int NOT NULL AUTO_INCREMENT,
  `etapa` varchar(200) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `fechaRealizacion` date DEFAULT NULL,
  `urlDocumento` text,
  `urlVideo` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subactividades_asistencia_municipio`
--

LOCK TABLES `subactividades_asistencia_municipio` WRITE;
/*!40000 ALTER TABLE `subactividades_asistencia_municipio` DISABLE KEYS */;
/*!40000 ALTER TABLE `subactividades_asistencia_municipio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `submenu`
--

DROP TABLE IF EXISTS `submenu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `submenu` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `descripcion` varchar(100) COLLATE utf8_bin DEFAULT NULL COMMENT 'sub menu',
  `observacion` varchar(100) COLLATE utf8_bin DEFAULT NULL COMMENT 'observacion menu',
  `create_time` datetime DEFAULT NULL COMMENT 'Create Time',
  `update_time` datetime DEFAULT NULL COMMENT 'Update Time',
  `menu_id` int DEFAULT NULL,
  `rutabi` mediumtext CHARACTER SET utf8 COLLATE utf8_bin COMMENT 'ruta de iframe o ruta del bi',
  `linkvideo` text COLLATE utf8_bin,
  `linkpdf` text COLLATE utf8_bin,
  `estado` int DEFAULT NULL,
  `imagen` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `menu_id` (`menu_id`),
  CONSTRAINT `menu_id` FOREIGN KEY (`menu_id`) REFERENCES `menu` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='submenu';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submenu`
--

LOCK TABLES `submenu` WRITE;
/*!40000 ALTER TABLE `submenu` DISABLE KEYS */;
INSERT INTO `submenu` VALUES (4,'SINIESTRALIDAD',NULL,NULL,'2026-08-18 17:39:08',1,'https://app.powerbi.com/view?r=eyJrIjoiNmNjM2EwNzUtNDA0My00ODY0LWI1NGUtODgyZjlkOWVhNDU5IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9&pageName=5df93c0c69acca182922','https://app.powerbi.com/view?r=eyJrIjoiNmNjM2EwNzUtNDA0My00ODY0LWI1NGUtODgyZjlkOWVhNDU5IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9&pageName=5df93c0c69acca182922','https://app.powerbi.com/view?r=eyJrIjoiNmNjM2EwNzUtNDA0My00ODY0LWI1NGUtODgyZjlkOWVhNDU5IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9&pageName=5df93c0c69acca182922',1,'/assets/menu/menu_1787092747012.png'),(6,'VEHICULOS',NULL,NULL,'2026-08-18 17:40:00',1,'https://app.powerbi.com/view?r=eyJrIjoiNmNjM2EwNzUtNDA0My00ODY0LWI1NGUtODgyZjlkOWVhNDU5IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9&pageName=a133fa58d44bbc3df61d','https://app.powerbi.com/view?r=eyJrIjoiNmNjM2EwNzUtNDA0My00ODY0LWI1NGUtODgyZjlkOWVhNDU5IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9&pageName=a133fa58d44bbc3df61d','https://app.powerbi.com/view?r=eyJrIjoiNmNjM2EwNzUtNDA0My00ODY0LWI1NGUtODgyZjlkOWVhNDU5IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9&pageName=a133fa58d44bbc3df61d',1,'/assets/menu/menu_1787092799878.png'),(7,'USUARIOS',NULL,NULL,'2026-08-18 17:40:37',1,'https://app.powerbi.com/view?r=eyJrIjoiNmNjM2EwNzUtNDA0My00ODY0LWI1NGUtODgyZjlkOWVhNDU5IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9&pageName=ccd0b666eb5cee31c0c6','https://app.powerbi.com/view?r=eyJrIjoiNmNjM2EwNzUtNDA0My00ODY0LWI1NGUtODgyZjlkOWVhNDU5IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9&pageName=ccd0b666eb5cee31c0c6','https://app.powerbi.com/view?r=eyJrIjoiNmNjM2EwNzUtNDA0My00ODY0LWI1NGUtODgyZjlkOWVhNDU5IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9&pageName=ccd0b666eb5cee31c0c6',1,'/assets/menu/menu_1787092836285.png'),(14,'SINIESTRALIDAD: LIMA METROPOLITANA CALLAO',NULL,'2022-08-25 10:36:11','2026-08-18 17:41:15',1,'https://app.powerbi.com/view?r=eyJrIjoiMzk1ODkwNWUtZTExNC00MzRhLWFhZjgtOTYxNWQyM2I4ODIxIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9','https://app.powerbi.com/view?r=eyJrIjoiMzk1ODkwNWUtZTExNC00MzRhLWFhZjgtOTYxNWQyM2I4ODIxIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9','https://app.powerbi.com/view?r=eyJrIjoiMzk1ODkwNWUtZTExNC00MzRhLWFhZjgtOTYxNWQyM2I4ODIxIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9',1,'/assets/menu/menu_1787092874757.png'),(19,'VEHICULOS: LIMA METROPOLITANA CALLAO',NULL,'2022-08-25 11:24:14','2026-08-18 17:41:47',1,'https://app.powerbi.com/view?r=eyJrIjoiOWQ1MjJhMmUtODE3Ny00MjRhLWE4MmEtZmJiMTk4ZTA5ZDdhIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9','https://app.powerbi.com/view?r=eyJrIjoiOWQ1MjJhMmUtODE3Ny00MjRhLWE4MmEtZmJiMTk4ZTA5ZDdhIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9','https://app.powerbi.com/view?r=eyJrIjoiOWQ1MjJhMmUtODE3Ny00MjRhLWE4MmEtZmJiMTk4ZTA5ZDdhIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9',1,'/assets/menu/menu_1787092898662.png'),(20,'USUARIOS: LIMA METROPOLITANA CALLAO',NULL,'2022-08-25 11:25:54','2026-08-18 17:44:05',1,'https://app.powerbi.com/view?r=eyJrIjoiOWE3ZWVlMzktNDA3MS00NWQ5LThiY2YtN2M1MmRmYTA3MzVlIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9','https://app.powerbi.com/view?r=eyJrIjoiOWE3ZWVlMzktNDA3MS00NWQ5LThiY2YtN2M1MmRmYTA3MzVlIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9','https://app.powerbi.com/view?r=eyJrIjoiOWE3ZWVlMzktNDA3MS00NWQ5LThiY2YtN2M1MmRmYTA3MzVlIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9',1,'/assets/menu/menu_1787093036712.png'),(41,'Siniestros',NULL,'2026-07-20 16:08:39','2026-08-18 17:49:50',24,'https://app.powerbi.com/view?r=eyJrIjoiYzJiMDMxYTctMDdkNy00MzMwLWIyNGEtZDM4ZWZhMmQ1NWRiIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9','https://app.powerbi.com/view?r=eyJrIjoiYzJiMDMxYTctMDdkNy00MzMwLWIyNGEtZDM4ZWZhMmQ1NWRiIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9','https://app.powerbi.com/view?r=eyJrIjoiYzJiMDMxYTctMDdkNy00MzMwLWIyNGEtZDM4ZWZhMmQ1NWRiIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9',0,'/estaticos/img/IMAGENES PARA LA WEB DEL ONSV_ACCIDENTES.png'),(42,'Vehículos',NULL,'2026-07-20 16:08:39','2026-08-18 17:50:05',24,'https://app.powerbi.com/view?r=eyJrIjoiYjBhYzhkNzMtZGFiYS00OWNjLWExNTQtNzAyNjdhZGIyM2ExIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9','https://app.powerbi.com/view?r=eyJrIjoiYjBhYzhkNzMtZGFiYS00OWNjLWExNTQtNzAyNjdhZGIyM2ExIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9','https://app.powerbi.com/view?r=eyJrIjoiYjBhYzhkNzMtZGFiYS00OWNjLWExNTQtNzAyNjdhZGIyM2ExIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9',0,'/estaticos/img/VEHICULOS SEGUROS.png'),(43,'Usuarios de Vías',NULL,'2026-07-20 16:08:39','2026-08-18 17:49:56',24,'https://app.powerbi.com/view?r=eyJrIjoiNzYwYjRiNDItMGJjZi00ZGIzLWE1ZjItMzM0NjI0YWU0ZmI2IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9','https://app.powerbi.com/view?r=eyJrIjoiNzYwYjRiNDItMGJjZi00ZGIzLWE1ZjItMzM0NjI0YWU0ZmI2IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9','https://app.powerbi.com/view?r=eyJrIjoiNzYwYjRiNDItMGJjZi00ZGIzLWE1ZjItMzM0NjI0YWU0ZmI2IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9',0,'/estaticos/img/usauriosvias.png'),(44,'Grado de Severidad',NULL,'2026-07-20 16:08:39','2026-08-18 17:50:14',24,'https://app.powerbi.com/view?r=eyJrIjoiMDQ5ZWQ1YmEtMzM1MC00NGI3LTgxMTEtZWQ1MjEwOTM4Y2RiIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9','https://app.powerbi.com/view?r=eyJrIjoiMDQ5ZWQ1YmEtMzM1MC00NGI3LTgxMTEtZWQ1MjEwOTM4Y2RiIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9','https://app.powerbi.com/view?r=eyJrIjoiMDQ5ZWQ1YmEtMzM1MC00NGI3LTgxMTEtZWQ1MjEwOTM4Y2RiIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9',0,'/estaticos/img/IMAGENES PARA LA WEB DEL ONSV_GRADO DE SEVERIDAD.png'),(45,'Mapa de Siniestros',NULL,'2026-07-20 16:08:39','2026-08-18 17:50:20',24,'https://app.powerbi.com/view?r=eyJrIjoiZDQ1NzMyMWMtMDExNi00OGU3LWE3YjktN2ZhZDc4ZDk1ZTUyIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9','https://app.powerbi.com/view?r=eyJrIjoiZDQ1NzMyMWMtMDExNi00OGU3LWE3YjktN2ZhZDc4ZDk1ZTUyIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9','https://app.powerbi.com/view?r=eyJrIjoiZDQ1NzMyMWMtMDExNi00OGU3LWE3YjktN2ZhZDc4ZDk1ZTUyIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9',0,'/estaticos/img/IMAGENES PARA LA WEB DEL ONSV_MAPA DE ACCIDENTES.png'),(46,'INSPECCIONES TECNICAS',NULL,'2026-07-20 16:08:39','2026-08-18 18:05:16',3,'https://www.onsv.gob.pe/analitica/','https://www.onsv.gob.pe/analitica/','https://www.onsv.gob.pe/analitica/',0,'/estaticos/img/IMAGENES PARA LA WEB DEL ONSV_en construcción 4.png'),(47,'LICENCIAS DE CONDUCIR',NULL,'2026-07-20 16:08:39','2026-08-18 18:05:30',3,'https://www.onsv.gob.pe/analitica/','https://www.onsv.gob.pe/analitica/','https://www.onsv.gob.pe/analitica/',0,'/estaticos/img/IMAGENES PARA LA WEB DEL ONSV_en construcción 5.png'),(48,'AUTORIZACIONES EN TRANSPORTE TERRESTRE',NULL,'2026-07-20 16:08:39','2026-08-18 18:05:38',3,'https://www.onsv.gob.pe/analitica/','https://www.onsv.gob.pe/analitica/','https://www.onsv.gob.pe/analitica/',0,'/estaticos/img/IMAGENES PARA LA WEB DEL ONSV_en construcción 6.png'),(54,'PUBLICACIONES',NULL,'2026-07-20 16:08:39','2026-07-20 16:08:39',26,'https://plantilla.techsyse.pe/movilidadactiva/','https://plantilla.techsyse.pe/movilidadactiva/','https://plantilla.techsyse.pe/movilidadactiva/',0,'/estaticos/img/Imagen7.jpg'),(55,'ANALITICA',NULL,'2026-07-20 16:08:39','2026-08-18 18:09:33',12,'https://app.powerbi.com/view?r=eyJrIjoiYWIwMTkyNGUtZmZlZi00ODZmLThhNDctY2U3MjY1Mjc5YzJjIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9','-','-',1,'/assets/menu/menu_1787093673667.jpg'),(57,'RESUMEN',NULL,'2026-08-18 17:57:50','2026-08-18 17:57:50',2,'https://app.powerbi.com/view?r=eyJrIjoiZTViMzIxODgtMzZiYS00Njc3LWJlMWMtYTk2Y2ZjZmMzNDljIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9','https://app.powerbi.com/view?r=eyJrIjoiZTViMzIxODgtMzZiYS00Njc3LWJlMWMtYTk2Y2ZjZmMzNDljIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9','https://app.powerbi.com/view?r=eyJrIjoiZTViMzIxODgtMzZiYS00Njc3LWJlMWMtYTk2Y2ZjZmMzNDljIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9',1,'/assets/menu/menu_1787093869028.png'),(58,'CURSO DE SEGURIDAD VIAL',NULL,'2026-08-18 17:59:32','2026-08-18 17:59:32',4,'https://app.powerbi.com/view?r=eyJrIjoiN2U3ZWQ5MGUtYTM4NS00Y2I3LThhMDUtZTljZGM4OTE0ZGMyIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9','-','-',1,'/assets/menu/menu_1787093955314.png'),(59,'SINIESTROS',NULL,'2026-08-18 18:03:46','2026-08-18 18:03:46',2,'https://app.powerbi.com/view?r=eyJrIjoiZmIzNGIzZjctMWZhNy00ODdjLWI2YjAtNTdiOGVhY2Y5MjBlIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9','https://app.powerbi.com/view?r=eyJrIjoiZmIzNGIzZjctMWZhNy00ODdjLWI2YjAtNTdiOGVhY2Y5MjBlIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9','https://app.powerbi.com/view?r=eyJrIjoiZmIzNGIzZjctMWZhNy00ODdjLWI2YjAtNTdiOGVhY2Y5MjBlIiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9',1,'/assets/menu/menu_1787094224987.png'),(60,'INVOLUCRADOS',NULL,'2026-08-18 18:04:04','2026-08-18 18:05:52',2,'https://app.powerbi.com/view?r=eyJrIjoiMDkxYjRjYzQtYjYzMC00YTBiLTk4MWYtNTgwMmNmZWViMTc3IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9','https://app.powerbi.com/view?r=eyJrIjoiMDkxYjRjYzQtYjYzMC00YTBiLTk4MWYtNTgwMmNmZWViMTc3IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9','https://app.powerbi.com/view?r=eyJrIjoiMDkxYjRjYzQtYjYzMC00YTBiLTk4MWYtNTgwMmNmZWViMTc3IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9',1,'/assets/menu/menu_1787094351114.png'),(61,'ANALISIS DE PERCEPCION',NULL,'2026-08-18 18:07:56','2026-08-18 18:07:56',10,'https://app.powerbi.com/view?r=eyJrIjoiNmMyMDY0YTMtOGRiOS00YWZmLTkzNTEtZTJhODk0YmZhYjA1IiwidCI6IjUzYWNiMjY1LTkxMjgtNDQ2ZC1hNWJlLWI4Mzg2MDBhYTY1NyJ9','-','-',1,'/assets/menu/menu_1787094475879.png');
/*!40000 ALTER TABLE `submenu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo`
--

DROP TABLE IF EXISTS `tipo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `value` varchar(40) COLLATE utf8_bin DEFAULT NULL,
  `estaActivo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo`
--

LOCK TABLES `tipo` WRITE;
/*!40000 ALTER TABLE `tipo` DISABLE KEYS */;
INSERT INTO `tipo` VALUES (6,'DATASET',1),(7,'RECURSO',1),(12,'INFORME',1),(15,'BLOG',1);
/*!40000 ALTER TABLE `tipo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_evento`
--

DROP TABLE IF EXISTS `tipo_evento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_evento` (
  `id` int NOT NULL AUTO_INCREMENT,
  `value` varchar(40) COLLATE utf8_bin NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_evento`
--

LOCK TABLES `tipo_evento` WRITE;
/*!40000 ALTER TABLE `tipo_evento` DISABLE KEYS */;
INSERT INTO `tipo_evento` VALUES (1,'Campaña',1),(2,'Evento',1),(3,'Entrevista',1);
/*!40000 ALTER TABLE `tipo_evento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipos_revista`
--

DROP TABLE IF EXISTS `tipos_revista`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipos_revista` (
  `id` int NOT NULL AUTO_INCREMENT,
  `value` varchar(255) NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipos_revista`
--

LOCK TABLES `tipos_revista` WRITE;
/*!40000 ALTER TABLE `tipos_revista` DISABLE KEYS */;
INSERT INTO `tipos_revista` VALUES (1,'Educación',1),(2,'Derecho',1),(3,'Psicología',1),(4,'Antropología',1),(5,'Medio Ambiente',1),(6,'Economía',1),(8,'Analista',1),(9,'Seguridad Vial',1);
/*!40000 ALTER TABLE `tipos_revista` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unidad_medida`
--

DROP TABLE IF EXISTS `unidad_medida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unidad_medida` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `estaActivo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unidad_medida`
--

LOCK TABLES `unidad_medida` WRITE;
/*!40000 ALTER TABLE `unidad_medida` DISABLE KEYS */;
INSERT INTO `unidad_medida` VALUES (1,'Eficiencia',1),(2,'Efectividad',1),(3,'Eficacia',1);
/*!40000 ALTER TABLE `unidad_medida` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_role`
--

DROP TABLE IF EXISTS `user_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `value` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_role`
--

LOCK TABLES `user_role` WRITE;
/*!40000 ALTER TABLE `user_role` DISABLE KEYS */;
INSERT INTO `user_role` VALUES (1,'Administrador'),(2,'Consejero Regional'),(30,'Test'),(31,'Usuario');
/*!40000 ALTER TABLE `user_role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user` varchar(500) COLLATE utf8_bin NOT NULL,
  `password` varchar(500) COLLATE utf8_bin NOT NULL,
  `idUserRole` int DEFAULT NULL,
  `estaActivo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idUserRole` (`idUserRole`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`idUserRole`) REFERENCES `user_role` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'onsv@mtc.gob.pe','$2b$10$jlYQZOhC/W6dqOe6OlG2kueXQewGqRXPFMaTqSI23NCRl/tr8FcUq',1,1),(11,'dpaz-prov@mtc.gob.pe','$2b$10$uyHZUm9zjuEUiYT2zFBt3O0d/UrydC9qnauMNeRtI9wsR9UvCYywm',1,1),(12,'gcervantes-prov@mtc.gob.pe','$2b$10$bRABTNHde6Lhb7E3EBttfOYnGedC6L2UXqEbEJt/I3s.vhjGdQi/.',1,1),(13,'wquispec-prov@mtc.gob.pe','$2b$10$PtWqvg2A53/JlvkAZugJ8.Jpv1x3LIrqsZWvLQF.sOhzxE9D4qmvi',1,1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `youtube_videos`
--

DROP TABLE IF EXISTS `youtube_videos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `youtube_videos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `seccion` varchar(20) NOT NULL COMMENT 'home | webinars | capacitaciones',
  `titulo` varchar(200) NOT NULL,
  `descripcion` text,
  `video_url` varchar(500) NOT NULL COMMENT 'URL completa de YouTube (youtu.be/ID, watch?v=ID, embed/ID, shorts/ID)',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_seccion` (`seccion`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `youtube_videos`
--

LOCK TABLES `youtube_videos` WRITE;
/*!40000 ALTER TABLE `youtube_videos` DISABLE KEYS */;
INSERT INTO `youtube_videos` VALUES (1,'home','Curso Seguridad Vial para Conductores para reducción de Puntos','','https://www.youtube.com/watch?v=0YAt9MWHyY8','2026-08-10 16:20:19','2026-08-10 16:24:14'),(2,'webinars','PRIMERA SESIÓN. HACIA LA CREACIÓN DE LA AGENCIA DE TRANSITO Y SEGURIDAD VIAL','Tema: Durante la Primera mesa de trabajo se discutieron los alcances de la Agencia en torno a la infraestructura, entorno vial, gestión de velocidades y seguridad vehicular. A partir de los aportes de las y los representantes se determinó la importancia de crear una entidad con capacidad de supervisión del cumplimiento de las entidades competentes. Lugar: Auditorio Qapaq Ñan – MTC Fecha: 26 de abril del 2022','https://www.youtube.com/watch?v=sDB_7BY1Nmk','2026-08-10 16:21:09','2026-08-10 16:24:01'),(3,'capacitaciones','Capacitación Virtual - La Importancia de la Educación Vial en la Movilidad Segura','Capacitación Virtual sobre la Importancia de la Educación Vial en la Movilidad Segura en el marco de la Semana de la Educación Vial, dirigido a autoridades, docentes, gestores educativos, especialistas de seguridad vial y público en general.','https://www.youtube.com/watch?v=YUyb5s8l7zM','2026-08-10 16:21:48','2026-08-10 16:21:48'),(4,'webinars','SEGUNDA SESIÓN. HACIA LA CREACIÓN DE LA AGENCIA DE TRANSITO Y SEGURIDAD VIAL.','Tema: Durante la segunda mesa, las y los representantes manifestaron sus perspectivas sobre los alcances de la Agencia en relación con la supervisión, fiscalización y respuesta frente a siniestros de tránsito. Como resultado, se resalta la importancia de la Agencia como articulador de las estrategias y planes multisectoriales, en los tres niveles de gobierno. Lugar: Auditorio Qapaq Ñan – MTC\nFecha: 11 de mayo del 2022','https://www.youtube.com/watch?v=9E-KhPDQ5Pc','2026-08-10 20:56:19','2026-08-10 20:56:19'),(23,'capacitaciones','Capacitación Virtual para Especialistas de Seguridad Vial de la Región Callao - Sesión I','Con el objetivo de fortalecer las capacidades en seguridad vial en los distintos niveles de gobierno, se capacitaron a especialistas del Gobierno Regional del Callao desde un enfoque de usuarios vulnerables y gestión de velocidades para mitigar daños y efectos que provocan los siniestros viales.','https://www.youtube.com/watch?v=lBET02k7WOo','2026-08-18 22:45:30','2026-08-18 22:45:30'),(24,'capacitaciones','Capacitación Virtual para Especialistas de Seguridad Vial de la Región Callao - Sesión II','Con el objetivo de fortalecer las capacidades en seguridad vial en los distintos niveles de gobierno, se capacitaron a especialistas del Gobierno Regional del Callao desde un enfoque de usuarios vulnerables y gestión de velocidades para mitigar daños y efectos que provocan los siniestros viales.','https://www.youtube.com/watch?v=r2qY50ewM2k','2026-08-18 22:46:36','2026-08-18 22:46:36'),(25,'webinars','TERCERA SESIÓN. HACIA LA CREACIÓN DE LA AGENCIA DE TRANSITO Y SEGURIDAD VIAL.','Tema: Durante la tercera mesa, las y los representantes discutieron acerca de los alcances de la Agencia en torno a la articulación y liderazgo de la gestión de seguridad vial en los tres niveles de gobierno. A través de sus aportes, se delimitó la necesidad de abordar la seguridad vial desde un enfoque territorial y descentralizado. Lugar: Auditorio Qapaq Ñan – MTC Fecha: 10 de mayo del 2022','https://youtu.be/p-R4-4gaefU?si=wMoWRabvl0Q_FQ_3','2026-08-18 22:47:52','2026-08-18 22:47:52'),(26,'webinars','CUARTA SESIÓN. HACIA LA CREACIÓN DE LA AGENCIA DE TRANSITO Y SEGURIDAD VIAL.','Tema: Finalmente, la cuarta mesa de trabajo se orientó a dar a conocer a las y los representantes de gremios del sector, los principales objetivos y funciones a cargo de la Agencia. Cada uno de los encuentros anteriores ha contribuido notablemente a la definición y análisis de estos objetivos y funciones que fueron recogidos a través de un proyecto de ley. Lugar: Auditorio Qapaq Ñan – MTC Fecha: 17 de mayo del 2022','https://youtu.be/c5KQbZE126k?si=R0mQhEM76Z--sbIH','2026-08-18 22:48:32','2026-08-18 22:48:32');
/*!40000 ALTER TABLE `youtube_videos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'onsv'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-19 10:00:45
