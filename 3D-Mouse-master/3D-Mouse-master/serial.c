#include <stdio.h>   /* Standard input/output definitions */
#include <string.h>  /* String function definitions */
#include <unistd.h>  /* UNIX standard function definitions */
#include <fcntl.h>   /* File control definitions */
#include <errno.h>   /* Error number definitions */
#include <termios.h> /* POSIX terminal control definitions */

/*
 * 'open_port()' - Open serial port 1.
 *
 * Returns the file descriptor on success or -1 on error.
 */

int 
read_port(void);

int main(){
printf("Serial data:",read_port());
}

int
read_port(void)
{
    int fd = open("/dev/ttyACM0", O_RDONLY | O_NOCTTY);
    if (fd == -1)
    {
        /* Could not open the port. */
        perror("open_port: Unable to open /dev/ttyACM0 - ");
    }

    char buffer[32];
	struct termios tty;
        memset (&tty, 0, sizeof tty);
	cfsetospeed (&tty, B9600);
        cfsetispeed (&tty, B9600);
    int n = read(fd, buffer, sizeof(buffer));
    if (n < 0)
        fputs("read failed!\n", stderr);
    return (fd);
}
