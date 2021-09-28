select to_char(readdate, 'YYYY-MM-DD HH24:MI:SS.MS') as date_ms, * from oddsdata o

where matchid = '5' and
market = '¿Resultado exacto?' and 
selection = '1-2'

order by date_ms
--limit 1

