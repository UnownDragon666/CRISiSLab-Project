/***** This is just for me to use when I am at home and don't have the sensor with me. **********/

#include <Wire.h>
#include <ArduinoJson.h>

float airPressure = 1006.20 * 100; // Air pressure in Pascals
int waterDensity = 1000; // Density of water in kg/m^3
float EARTHGRAVITY = 9.81; // Gravitational acceleration in m/s^2
float waterHeight;
float waterPressure;
float totalPressure;

void setup() {
  Serial.begin(9600);
  Wire.begin();
}

void loop() {
  // Generate random water height between 1 and 10 cm
  waterHeight = random(1, 11) / 100.0; // Convert cm to meters

  // Calculate water pressure
  waterPressure = waterHeight * waterDensity * EARTHGRAVITY;
  
  // Calculate total pressure
  totalPressure = airPressure + waterPressure;

  // Create a JSON document
  StaticJsonDocument<200> doc;
  doc["pressure_hpa"] = totalPressure / 100; // Convert Pa to hPa
  doc["water_height"] = waterHeight * 100; // Convert meters to cm

  // Serialize JSON to string
  char jsonBuffer[512];
  serializeJson(doc, jsonBuffer);

  // Print to serial
  Serial.println(jsonBuffer);

  delay(1000);
}
