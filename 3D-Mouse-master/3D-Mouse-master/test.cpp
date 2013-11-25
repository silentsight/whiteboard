#include "cv.h"
#include "highgui.h"
# include <stdio.h>
#include <X11/Xlib.h>
#include <X11/Xutil.h>
#include<stdlib.h>

using namespace std;

void mouseMove(int,int);

 IplImage* GetThresholdedImage(IplImage* img)
{

    
    IplImage* imgHSV = cvCreateImage(cvGetSize(img), 8, 3);
    cvCvtColor(img, imgHSV, CV_BGR2HSV);

    IplImage* imgThreshed = cvCreateImage(cvGetSize(img), 8, 1);
    cvInRangeS(imgHSV, cvScalar(20, 130, 130), cvScalar(30, 255, 255), imgThreshed);
    cvReleaseImage(&imgHSV);
    return imgThreshed;
}


int main()
{

        CvCapture* capture = 0;
    capture = cvCaptureFromCAM(0);
 
       
    
    
    
    
    
    while(1)
    {
        
        IplImage* frame = 0;
        frame = cvQueryFrame(capture);
        
              
        
        IplImage* imgYellowThresh = GetThresholdedImage(frame);
        
        
        CvMoments *moments = (CvMoments*)malloc(sizeof(CvMoments));
        cvMoments(imgYellowThresh, moments, 1);
 
        
        double moment10 = cvGetSpatialMoment(moments, 1, 0);
        double moment01 = cvGetSpatialMoment(moments, 0, 1);
        double area = cvGetCentralMoment(moments, 0, 0);
        
        
        
        
        static int posX = 0;
        static int posY = 0;
 
        int lastX = posX;
        int lastY = posY;
 
        posX = moment10/area;
        posY = moment01/area;
        
        
        
        printf("position (%d,%d)\n", posX, posY);
        
        
        if(lastX>0 && lastY>0 && posX>0 && posY>0)
        {
            
            mouseMove(posX-lastX,-posY+lastY);
        }
        
        
            
        
        
                
        int c = cvWaitKey(10);
        if(c!=-1)
        {
            
            break;
        }
        
        
         
        cvReleaseImage(&imgYellowThresh);
        delete moments;
    }
    
    
     
    cvReleaseCapture(&capture);
    return 0;
}
        
void mouseMove(int x, int y)
{
	Display *displayMain = XOpenDisplay(NULL);

		XWarpPointer(displayMain, None, None, 0, 0, 0, 0, -x, -y);

	XCloseDisplay(displayMain);
}

   
        
        
            
        
        
                 
    
    
    



















