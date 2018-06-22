
CREATE TABLE fa.fa_process (
	id                   int  NOT NULL  AUTO_INCREMENT,
	create_time          timestamp   DEFAULT CURRENT_TIMESTAMP ,
	file                 varchar(100)    ,
	table_value          longtext    ,
	user_id              int    ,
	CONSTRAINT pk_fa_process PRIMARY KEY ( id )
 ) engine=InnoDB;

CREATE TABLE fa.sys_file (
	id                   int  NOT NULL  AUTO_INCREMENT,
	create_time          timestamp   DEFAULT CURRENT_TIMESTAMP ,
	original_name        varchar(100)    ,
	encoding             varchar(100)    ,
	mime_type            varchar(100)    ,
	destination          varchar(100)    ,
	file_name            varchar(100)    ,
	path                 varchar(100)    ,
	size                 varchar(100)    ,
	CONSTRAINT pk_sys_file PRIMARY KEY ( id )
 ) engine=InnoDB;

CREATE TABLE fa.sys_user (
	id                   int  NOT NULL  AUTO_INCREMENT,
	username             varchar(100)    ,
	password             varchar(100)    ,
	create_time          timestamp   DEFAULT CURRENT_TIMESTAMP ,
	CONSTRAINT pk_sys_user PRIMARY KEY ( id )
 ) engine=InnoDB;
