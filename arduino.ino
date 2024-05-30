#include <Wire.h>
#include "SparkFun_LPS28DFW_Arduino_Library.h"
#include <ArduinoJson.h>

LPS28DFW pressureSensor;

uint8_t i2cAddress = LPS28DFW_I2C_ADDRESS_DEFAULT;

float airPressure = 1006.20 * 100;
int waterDensity = 1000;
float EARTHGRAVITY = 9.81;
float waterHeight;
float waterPressure;
float totalPressure;

void setup() {
  Serial.begin(9600);
  Wire.begin();

  while (pressureSensor.begin(i2cAddress) != LPS28DFW_OK) {
    delay(1000);
  }
}

void loop() {
  pressureSensor.getSensorData();

  totalPressure = pressureSensor.data.pressure.hpa * 100;
  waterPressure = totalPressure - airPressure;
  waterHeight = waterPressure / (waterDensity * EARTHGRAVITY);

  // Create a JSON document
  StaticJsonDocument<200> doc;
  doc["pressure_hpa"] = pressureSensor.data.pressure.hpa;
  doc["water_height"] = waterHeight;

  // Serialize JSON to string
  char jsonBuffer[512];
  serializeJson(doc, jsonBuffer);

  // Print to serial
  Serial.println(jsonBuffer);

  delay(1000);
}
