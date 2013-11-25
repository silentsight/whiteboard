#include <iostream>
#include <stdlib.h>
#include <windows.h>

using namespace std;
void curPos(int, int);

int main()
{
      system("CLS");
      curPos(10,10);
      cout << "10,10" << endl;
      system("PAUSE");
      return 0;
}

void curPos(int x, int y) {
  HANDLE hStdout;
  CONSOLE_SCREEN_BUFFER_INFO csbiInfo;
  hStdout=GetStdHandle(STD_OUTPUT_HANDLE);
  GetConsoleScreenBufferInfo(hStdout, &csbiInfo);
  csbiInfo.dwCursorPosition.X=x;
  csbiInfo.dwCursorPosition.Y=y;
  SetConsoleCursorPosition(hStdout, csbiInfo.dwCursorPosition);
}
