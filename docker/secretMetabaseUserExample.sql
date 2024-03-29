-- CREATE USER FOR METABASE

CREATE ROLE myuser NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT LOGIN PASSWORD 'mypass';
GRANT SELECT ON TABLE public.iddata TO myuser;
GRANT SELECT ON TABLE public.matchdata TO myuser;
GRANT SELECT ON TABLE public.oddsdata TO myuser;
GRANT SELECT ON TABLE public.statusdata TO myuser;
GRANT SELECT ON TABLE public.streamdata TO myuser;