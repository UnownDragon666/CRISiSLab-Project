#include <Wire.h>
#include "SparkFun_LPS28DFW_Arduino_Library.h"

LPS28DFW pressureSensor;

uint8_t i2cAddress = LPS28DFW_I2C_ADDRESS_DEFAULT;

float airPressure = 1006.20 * 100;
int waterDensity = 1000;
float EARTHGRAVITY = 9.81;
float waterHeight;
float waterPressure;
float totalPressure;

void setup() {
  Serial.begin(115200);
  Serial.println("LPS28DFW Example 1 - Basic Readings!");

  Wire.begin();

  while (pressureSensor.begin(i2cAddress) != LPS28DFW_OK) {
    Serial.println("Error: LPS28DFW not connected, check wiring and I2C address!");
    delay(1000);
  }

  Serial.println("LPS28DFW connected!");
}

void loop() {
  pressureSensor.getSensorData();

  totalPressure = pressureSensor.data.pressure.hpa * 100;
  waterPressure = totalPressure - airPressure;
  waterHeight = waterPressure / (waterDensity * EARTHGRAVITY);
  Serial.print("\n");
  Serial.print(pressureSensor.data.pressure.hpa);
  Serial.print("\n");
  Serial.print(waterHeight);
  
  delay(500);
}
