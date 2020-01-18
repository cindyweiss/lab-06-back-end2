DROP TABLE IF EXISTS locations;


CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_query varchar(255),
  latitude VARCHAR(255),
  longitude VARCHAR(255)
);





heroku pg:psql -f schema.sql --app cindyscityexplorer






