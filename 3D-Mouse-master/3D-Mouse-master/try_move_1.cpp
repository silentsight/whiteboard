#include <X11/Xlib.h>
#include <X11/Xutil.h>

#include<stdlib.h>

void mouseMove(int,int);
int main()
{
    int i=0;
    while(1)
    {
    
        mouseMove(i+1,i+1); 
    
    }


}
//yeah works at last :)
void mouseMove(int x, int y)
{
	Display *displayMain = XOpenDisplay(NULL);

	//if(displayMain == NULL)
	//{
		//fprintf(stderr, "Error Opening the Display !!!\n");
		//exit(EXIT_FAILURE);
	//}

	XWarpPointer(displayMain, None, None, 0, 0, 0, 0, x, y);

	XCloseDisplay(displayMain);
}
