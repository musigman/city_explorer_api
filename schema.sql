DROP TABLE IF EXISTS city_data;
DROP TABLE IF EXISTS weather;

CREATE TABLE city_data (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_query VARCHAR(255),
  city_name VARCHAR (255),
  latitude decimal,
  longitude decimal
);


CREATE TABLE weather(
  id SERIAL PRIMARY KEY,
  formatted_query VARCHAR(255),
  weather_data_slice TEXT,
  time_of_day VARCHAR(255)
);

