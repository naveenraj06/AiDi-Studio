-- Seeds a "Weather & News Sample" project so every screen (projects, API
-- resources, widgets, dashboard canvas, public dashboard) has realistic
-- content out of the box. Uses two free, keyless, CORS-enabled public APIs —
-- Open-Meteo for weather and Hacker News for stories — which the frontend
-- fetches live in the browser for this project's widgets.
--
-- Run once against your Supabase database, e.g.:
--   psql "$SUPABASE_DB_URL" -f supabase/seed_sample_data.sql
-- or paste the whole file into the Supabase SQL editor. Safe to re-run: it
-- no-ops if the sample project already exists for the target owner.
--
-- Change v_owner_email below if you want to seed a different account.

do $$
declare
  v_owner_email text := 'samyukthakalaiselvi2096@gmail.com';
  v_owner_id uuid;
  v_owner_name text;
  v_project_id uuid;
  v_weather_id uuid;
  v_news_id uuid;
  v_w_temp uuid;
  v_w_wind uuid;
  v_w_current uuid;
  v_w_news uuid;
  v_dashboard_id uuid;
begin
  select id, coalesce(raw_user_meta_data->>'name', split_part(email, '@', 1))
    into v_owner_id, v_owner_name
  from auth.users
  where email = v_owner_email;

  if v_owner_id is null then
    raise exception 'No auth.users row found for %. Sign up that account first, or edit v_owner_email in this script.', v_owner_email;
  end if;

  if exists (select 1 from projects where owner_id = v_owner_id and name = 'Weather & News Sample') then
    raise notice 'Sample project already exists for %, skipping.', v_owner_email;
    return;
  end if;

  insert into projects (name, icon, color, plan, owner_id)
  values ('Weather & News Sample', '🌦️', '#fbbf24', 'free', v_owner_id)
  returning id into v_project_id;

  insert into project_members (project_id, user_id, name, email, role)
  values (v_project_id, v_owner_id, v_owner_name, v_owner_email, 'owner');

  insert into billing (project_id, plan, status, seats, price_per_seat)
  values (v_project_id, 'free', 'active', 1, 0);

  insert into api_resources (project_id, name, url, method, auth_type, status, last_tested_at, last_test_latency_ms, imported_from)
  values (
    v_project_id,
    'Open-Meteo Weather',
    'https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.01&current=temperature_2m,wind_speed_10m&daily=temperature_2m_max,wind_speed_10m_max&timezone=auto&forecast_days=6',
    'GET', 'none', 'healthy', now(), 96, 'manual'
  )
  returning id into v_weather_id;

  insert into api_resources (project_id, name, url, method, auth_type, status, last_tested_at, last_test_latency_ms, imported_from)
  values (
    v_project_id,
    'Hacker News Top Stories',
    'https://hacker-news.firebaseio.com/v0/topstories.json',
    'GET', 'none', 'healthy', now(), 140, 'manual'
  )
  returning id into v_news_id;

  insert into widgets (project_id, name, type, is_template, resource_id, mapping, fine_tune)
  values (
    v_project_id, 'Live Temperature Forecast', 'line', false, v_weather_id,
    '[{"field":"daily.time","role":"x-axis"},{"field":"daily.temperature_2m_max","role":"y-axis"}]'::jsonb,
    '{"title":"Live Temperature Forecast","color":"#8b5cf6","showLegend":true,"showPoints":true,"refreshInterval":60}'::jsonb
  )
  returning id into v_w_temp;

  insert into widgets (project_id, name, type, is_template, resource_id, mapping, fine_tune)
  values (
    v_project_id, 'Wind Speed Forecast', 'bar', false, v_weather_id,
    '[{"field":"daily.time","role":"x-axis"},{"field":"daily.wind_speed_10m_max","role":"y-axis"}]'::jsonb,
    '{"title":"Wind Speed Forecast","color":"#22d3ee","showLegend":true,"showPoints":true,"refreshInterval":60}'::jsonb
  )
  returning id into v_w_wind;

  insert into widgets (project_id, name, type, is_template, resource_id, mapping, fine_tune)
  values (
    v_project_id, 'Current Temperature — NYC', 'stat', false, v_weather_id,
    '[{"field":"current.temperature_2m","role":"value"},{"field":"current.wind_speed_10m","role":"label"}]'::jsonb,
    '{"title":"Current Temperature — NYC","color":"#34d399","showLegend":true,"showPoints":true,"refreshInterval":60}'::jsonb
  )
  returning id into v_w_current;

  insert into widgets (project_id, name, type, is_template, resource_id, mapping, fine_tune)
  values (
    v_project_id, 'Top Hacker News Stories', 'table', false, v_news_id,
    '[{"field":"title","role":"label"},{"field":"score","role":"value"},{"field":"descendants","role":"value"}]'::jsonb,
    '{"title":"Top Hacker News Stories","color":"#fbbf24","showLegend":true,"showPoints":true,"refreshInterval":60}'::jsonb
  )
  returning id into v_w_news;

  insert into dashboards (project_id, name, slug, status)
  values (v_project_id, 'Weather & News Live', 'weather-news-live-' || substr(md5(random()::text), 1, 6), 'published')
  returning id into v_dashboard_id;

  insert into dashboard_tiles (dashboard_id, widget_id, position, col_span, row_span)
  values
    (v_dashboard_id, v_w_temp, 0, 2, 1),
    (v_dashboard_id, v_w_wind, 1, 2, 1),
    (v_dashboard_id, v_w_current, 2, 2, 1),
    (v_dashboard_id, v_w_news, 3, 2, 1);

  raise notice 'Seeded "Weather & News Sample" project (%) for %', v_project_id, v_owner_email;
end $$;
