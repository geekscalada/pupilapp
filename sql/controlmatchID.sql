
-- in odds data
with s0 as (
select distinct matchid, matchidsc from oddsdata
)
, s1 as (
 select count(*) as conteo, matchid from s0
 group by matchid
)

select * from s1 order by conteo desc;

-- in iddata

with s0 as (
select distinct matchid, matchidsc from iddata
)
, s1 as (
 select count(*) as conteo, matchid from s0
 group by matchid
)

select * from s1 order by conteo desc;



