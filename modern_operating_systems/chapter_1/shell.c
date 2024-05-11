#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>

#define MAX_INPUT_LENGTH 1024
#define MAX_ARGS 64

// Read a line of input
char *read_line()
{
  char *line = NULL;
  ssize_t bufsize = 0;
  getline(&line, &bufsize, stdin);
  return line;
}

// Split the input line into arguments
char **split_line(char *line)
{
  char **args = malloc(MAX_ARGS * sizeof(char *));
  char *token;
  int i = 0;

  if (!args)
  {
    perror("Memory allocation error");
    exit(EXIT_FAILURE);
  }

  token = strtok(line, " \t\n");
  while (token != NULL)
  {
    args[i] = token;
    i++;
    token = strtok(NULL, " \t\n");
  }
  args[i] = NULL;
  return args;
}

// Execute the parsed command
int execute(char **args)
{
  pid_t pid, wpid;
  int status;

  pid = fork();
  if (pid == 0)
  {
    // Child process
    if (execvp(args[0], args) == -1)
    {
      perror("lsh");
    }
    exit(EXIT_FAILURE);
  }
  else if (pid < 0)
  {
    // Forking error
    perror("lsh");
  }
  else
  {
    // Parent process
    do
    {
      wpid = waitpid(pid, &status, WUNTRACED);
    } while (!WIFEXITED(status) && !WIFSIGNALED(status));
  }

  return 1; // Continue the loop
}

int main(int argc, char **argv)
{
  char *line;
  char **args;
  int status;

  do
  {
    printf("> ");
    line = read_line();
    args = split_line(line);
    status = execute(args);

    free(line);
    free(args);
  } while (status);

  return EXIT_SUCCESS;
}
