#include <X11/Xlib.h>
#include <X11/Xutil.h>
#include "arduino-serial.c"

void mouseMove(int x, int y)
{
    Display *displayMain = XOpenDisplay(NULL);

    XWarpPointer(displayMain, None, None, 0, 0, 0, 0, -x, -y);

    XCloseDisplay(displayMain);
}

int main()
{
	while(1)
	{
		char serd = ardser("-b 9600 -p /dev/ttyACM0 -r");		
		printf("datafrom serial: ", serd);
		//mouseMove(posX-lastX,-posY+lastY);
	}
}

