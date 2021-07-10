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