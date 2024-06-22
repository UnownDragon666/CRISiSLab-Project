#include <Wire.h>
#include "SparkFun_LPS28DFW_Arduino_Library.h"
#include <ArduinoJson.h>

LPS28DFW pressureSensor;

uint8_t i2cAddress = LPS28DFW_I2C_ADDRESS_DEFAULT;

float airPressure = 1029.8 * 100; //Air Pressure that the barometer outputs when not under water. (In the air)
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

  //Water Height Calculation Math
  totalPressure = pressureSensor.data.pressure.hpa * 100;
  waterPressure = totalPressure - airPressure;
  waterHeight = waterPressure / (waterDensity * EARTHGRAVITY) * 100;

  StaticJsonDocument<200> doc;
  doc["pressure_hpa"] = pressureSensor.data.pressure.hpa;
  doc["water_height"] = waterHeight;

  char jsonBuffer[512];
  serializeJson(doc, jsonBuffer);

  Serial.println(jsonBuffer);

  delay(10);
}
