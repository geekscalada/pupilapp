------------------------------------------------------------------------------------------------ STATUS DATA
DROP TABLE if exists public.streamdata;

CREATE TABLE public.streamdata (
	matchidsc varchar NOT NULL,	
	insertdate timestamp NOT NULL DEFAULT now(),
	status varchar NOT NULL
	
);

DROP TABLE if exists public.statusdata;

CREATE TABLE public.statusdata (
	matchid int4 NOT NULL,
	readDate timestamp NOT NULL,
	insertdate timestamp NOT NULL DEFAULT now(),
	status int4 NOT NULL,
	matchidsc varchar NOT NULL
);

--------------------------------------------------------------------------------------------------- ODDS DATA
---- OJO, PROBAR CON TIMESTAMP3

DROP TABLE if exists public.oddsdata;

CREATE TABLE public.oddsdata (
	matchid int4 NOT NULL,
	matchidsc varchar NOT NULL,
	insertdate timestamp NOT NULL DEFAULT now(),
	readDate timestamp(6) NOT NULL,
	typscore int4 NOT NULL,
	typparis int4 NOT NULL,
	od numeric(18, 9) NOT NULL,
	gp int4 NOT NULL,
	pid bytea NOT NULL,
	ha varchar NOT NULL,
	market varchar NOT NULL,
	qlid int4 NOT NULL,
	selection varchar NOT NULL,
	odds numeric(12, 6) NOT NULL,
	idscodds varchar NOT NULL,
	cid varchar NOT NULL,
	td varchar NOT NULL
);



----------------------------------------------------------------------------------------------------- MATCH DATA

DROP TABLE if exists public.matchdata;

CREATE TABLE public.matchdata (
	matchid int4 NOT NULL,	
	insertdate timestamp NOT NULL DEFAULT now(),
	readDate timestamp NOT NULL,
	matchevent varchar NOT NULL,
	lb varchar NOT NULL,
	icon varchar NOT NULL,
	team1 varchar NOT NULL,
	team2 varchar NOT NULL,
	tp int8 NOT NULL,
	st varchar NOT NULL,
	stcourt varchar NOT NULL,
	atribute varchar NOT NULL,
	status int2 NOT NULL,
	minut varchar NOT NULL,
	score varchar NOT NULL,
	sv int4 NOT NULL,
	ssc varchar NOT NULL,
	gsc varchar NOT NULL,
	cardyelhome int2 NOT NULL,
	cardyelaway int2 NOT NULL,
	cardredhome int2 NOT NULL,
	cardredaway int2 NOT NULL,
	cls int4 NOT NULL,
	matchidsc varchar NOT NULL
);


DROP TABLE if exists public.idData;

CREATE TABLE public.idData (
	matchid serial NOT NULL,	
	insertdate timestamp NOT NULL DEFAULT now(),
	matchidsc varchar NOT NULL
);


