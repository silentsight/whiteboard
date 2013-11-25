#include<highgui.h>
# include <iostream>
#include<cv.h>
#include <X11/Xlib.h>
#include <X11/Xutil.h>
#include<stdlib.h>

using namespace std;

void mouseMove(int,int);

int main()
{

IplImage *frame,*hsv,*colordet,*temp,*gray_frame;
int x,y,z,i;
char c;
IplConvKernel* ker=cvCreateStructuringElementEx(2,2,0,0,CV_SHAPE_ELLIPSE,NULL);
IplConvKernel* ker_2=cvCreateStructuringElementEx(1,1,0,0,CV_SHAPE_ELLIPSE,NULL);
IplConvKernel* ker_3=cvCreateStructuringElementEx(3,3,0,0,CV_SHAPE_ELLIPSE,NULL);
IplConvKernel* ker_4=cvCreateStructuringElementEx(5,5,0,0,CV_SHAPE_ELLIPSE,NULL);

CvMemStorage *storage=cvCreateMemStorage(0);
CvCapture *capture=cvCreateCameraCapture(0);
cvNamedWindow("ColorDet",0);

frame=cvCreateImage(cvSize(640,480),IPL_DEPTH_8U,3);
hsv=cvCreateImage(cvGetSize(frame),IPL_DEPTH_8U,3);
colordet=cvCreateImage(cvGetSize(frame),IPL_DEPTH_8U,1);
gray_frame=cvCreateImage(cvGetSize(frame),IPL_DEPTH_8U,1);
while(1)
{
frame=cvQueryFrame(capture);

cvCvtColor(frame,hsv,CV_BGR2HSV);
for(y=0;y<hsv->height;y++)
{
uchar* ptr=(uchar*)(hsv->imageData+y*hsv->widthStep);
for(x=0;x<(hsv->width);x++)
{

if(ptr[3*x]>177||(ptr[3*x]<3)&&ptr[3*x+1]>70&&ptr[3*x+2]>80)
{
ptr[3*x+2]=0;
}
else
{ptr[3*x+1]=0;ptr[3*x+2]=100;}
}
}
cvCvtColor(hsv,frame,CV_HSV2BGR);

cvCvtColor(frame,colordet,CV_BGR2GRAY);
cvCanny(gray_frame,gray_frame,50.0,25.0,3.0);
cvMorphologyEx(colordet,colordet,temp,NULL,CV_MOP_GRADIENT,1);
cvSmooth(colordet,colordet,CV_GAUSSIAN,5,5,1,1);
cvErode(colordet,colordet,ker_2,1);
cvDilate(colordet,colordet,ker,1);
cvErode(colordet,colordet,ker_3,2);
cvErode(colordet,colordet,ker_2,3);
cvDilate(colordet,colordet,ker_4,1);
cvErode(colordet,colordet,ker_2,2);
cvCvtColor(frame,gray_frame,CV_BGR2GRAY);
		CvSeq* circles=cvHoughCircles(colordet,storage,CV_HOUGH_GRADIENT,1.0,70.0,50.0,40.0,10,60);
		
		float max_radius=0 ,max_radius_x,max_radius_y;
		int old_l=310;
		int old_r=340;
		int old_t=100;
		int old_b=140;
		
		for(i = 0; i < circles->total; i++ ) 
		{
			float* p = (float*) cvGetSeqElem( circles, i );
			CvPoint pt = cvPoint( cvRound( p[0] ), cvRound( p[1] ) );

	
		
		    if(max_radius<p[2])
		    {
		        max_radius=p[2];
		        max_radius_x=p[0];
		        max_radius_y=p[1];
		    }
		
    		if(p[0]>old_r)
	        {
	            old_r=p[0];
	            mouseMove(i-10,0);
	        }
            else if(p[0]<old_l)
	        {
	            old_l=p[0];
	            mouseMove(i+10,0);
	          
	        }
	       else
            {
                mouseMove(0,0);
            }
            
                      
		
    		/*if(p[1]>old_t)
	        {
	            old_t=p[1];
	            mouseMove(0,i+10);
	        }
            else if(p[1]<old_b)
	        {
	            old_b=p[1];
	            mouseMove(0,i-10);
	          
	        }
	       else
            {
                mouseMove(0,0);
            }*/
            
            
            	
	
        	
        }

			CvPoint max_radius_pt = cvPoint( cvRound( max_radius_x ), cvRound( max_radius_y ) );
			cvCircle(colordet,max_radius_pt,cvRound( max_radius ),CV_RGB(0x23,0x00,0xff),2,8,0);
	


cvShowImage("ColorDet",colordet);
	cvClearSeq(circles);
	
c=cvWaitKey(10);
if(c==27) break;
	}

}

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


