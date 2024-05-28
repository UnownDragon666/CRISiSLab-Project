#include <ArduinoJson.h>

void setup() {
    Serial.begin(9600);
}

void loop() {
    static int counter = 0;
    
    // Create a JSON document
    StaticJsonDocument<200> doc;
    doc["x"] = counter;

    // Serialize JSON to string
    char jsonBuffer[512];
    serializeJson(doc, jsonBuffer);

    // Print to serial
    Serial.println(jsonBuffer);
    
    counter++;
    delay(1000);
}
