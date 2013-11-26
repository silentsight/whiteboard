whiteboard
==========

Realtime web-based motion tracking interactive whiteboard

The following repo contains all the files that allowed us to create a realtime web based whiteboard using an 
embedded system running on ubuntu, and using a midware to track motion of the hand as a marker.

The realtime app that registers traces is run on node.js, and transmits trhough a network in realtime using socket.io.

Using an MPU-6050, we track X and Y positions and compesate the pitch, roll and yaw to only track as if it was a mouse.

Using X11 libraries we capture serial data sent by the MPU via I2C to an Arduino moving the relative cursor using the MPU data.

With pushbuttons on the arduino we simulate cliks using X11 again and capturing it using the arduino libraries for serial
data trhough UART-USB.

Once we have our smart marker we use it in the node.js app which creates traces using paper.js, a javascript plugin for
html5 canvas, which in turn sends the data through a socket created with socket.io.

In combination and thanks to high speed rates of I2C, UART-USB and WLAN, we achieve a realtime application for the education sector completely free and under GNU license.

We tested our application on an Intel Atom embedded system N2800, which uses passive cooling and is dual core. Adittionally we used a wifi adapter to transmit data in an adhoc network. The motion data was acquired using an MPU-6050 and an Arduino Uno, using the Arduino serial libraries, wire I2C and the Kalman filter library to stabilize the MPU.

Future versions will include Position updating for more accurate results using OpenCV, tracking the marker using IR.
Also we included audio streaming in the node.js app, future versions will include MySQL to store entire lessons and
sync audio data.

Our app is aimed towards low resource real-time tele-education, our proposal of classroom 2.0.

Project presented for the Intel Cup Mexico 2013 contest, this program is distributed under the terms of the GNU General Public License.
Copyright 2013 CUCEI.
