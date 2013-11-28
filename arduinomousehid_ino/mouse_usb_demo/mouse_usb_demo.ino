/* Arduino USB Mouse HID demo */

/* Author: Darran Hunt
 * Release into the public domain.
 */

struct {
    uint8_t buttons;
    int8_t x;
    int8_t y;
    int8_t wheel;	/* Not yet implemented */
} mouseReport;

uint8_t nullReport[4] = { 0, 0, 0, 0 };

int equis = 0;
int ye = 0;
int mousex;
int mousey;
void setup();
void loop();

void setup() 
{
    Serial.begin(9600);
    delay(200);
    pinMode(2, INPUT);
    pinMode(3, INPUT);
    digitalWrite(2,1);
    digitalWrite(3,1);
}

/* Move the mouse in a clockwise square every 5 seconds */
void loop() 
{
    //int ind;
    //delay(5000);
    
    if(digitalRead(2) !=1) {
    
    mouseReport.buttons = 1;
    }
    if(digitalRead(3) !=1) {
    mouseReport.buttons = 2;
    }
    
    if(equis==analogRead(0)) { mouseReport.x=0; }
    else { 
    
    mousex = 0; int lastx;
    lastx = mousex;
    mousex = map(analogRead(0),0,1023,-127,127);
    mouseReport.x = mousex - lastx;
    }
    if(ye==analogRead(1)){ mouseReport.y=0;}
    else {
    mousey = 0; int lasty;
    lasty = mousey;
    mousex = map(analogRead(1),0,1023,-127,127);
    mouseReport.y = -lasty + mousey;
    }
    

    mouseReport.wheel = 0; 
    
      //Serial.println(equis);
      //Serial.println(ye);
	Serial.write((uint8_t *)&mouseReport, 4);
	Serial.write((uint8_t *)&nullReport, 4);
    
    equis = analogRead(0);
    ye = analogRead(1);
    mouseReport.buttons = 0;
    mouseReport.x = 0;
    mouseReport.y = 0;
}
