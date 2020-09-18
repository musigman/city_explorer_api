DROP TABLE IF EXISTS city_data;

CREATE TABLE city_data (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_query VARCHAR(255),
  city_name VARCHAR (255),
  latitude decimal,
  longitude decimal
);
INSERT INTO locations (search_query) VALUES ('West Jordan');
