//Arduino code (Using  button instead of barometer)

// Define button pin
const int buttonPin = 2;
int height = 0; // Variable to store height value
int direction = 1; // 1 for increasing, -1 for decreasing

void setup() {
  pinMode(buttonPin, INPUT);
  Serial.begin(9600); // Start serial communication
}

void loop() {
  // Read the state of the button
  int buttonState = digitalRead(buttonPin);

  // Check if the button is pressed
  if (buttonState == HIGH) {
    // Increase or decrease height based on direction
    height += direction;
    
    // If height reaches 100 or 0, change direction
    if (height >= 100 || height <= 0) {
      direction *= -1; // Reverse direction
    }

    // Send height value to the Node.js server
    Serial.println(height);

    // Delay to debounce button press
    delay(100);
  }
}
