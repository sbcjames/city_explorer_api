DROP TABLE IF EXISTS locations, weather;

CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_query VARCHAR(255),
  latitude DECIMAL,
  longitude DECIMAL
);

CREATE TABLE weather (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  forecast VARCHAR(255),
  time_stamp VARCHAR(255)
);