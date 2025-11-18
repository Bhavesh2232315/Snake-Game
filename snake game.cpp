#include <bits/stdc++.h>
#include <conio.h> // key press kbhit
#include <windows.h>

using namespace std;

#define MAX_LENGTH 1000

// Directions
const char DIR_UP = 'w';
const char DIR_DOWN = 's';
const char DIR_LEFT = 'a';
const char DIR_RIGHT = 'd';

int consoleWidth, consoleHeight;

void initScreen()
{
    HANDLE hConsole = GetStdHandle(STD_OUTPUT_HANDLE); // hconsole class variable
    CONSOLE_SCREEN_BUFFER_INFO csbi;
    GetConsoleScreenBufferInfo(hConsole, &csbi); // it is a class short cut name = csbi
    consoleHeight = csbi.srWindow.Bottom - csbi.srWindow.Top + 1;
    consoleWidth = csbi.srWindow.Right - csbi.srWindow.Left + 1; // +1 for assume height and width start from 1 not from 0
}

struct Point
{
    int xCoord;
    int yCoord;
    Point()
    {
    }
    Point(int x, int y)
    {
        xCoord = x;
        yCoord = y;
    }
};

class Snake
{
    int length; // private variable length of snake
    char direction;

public:
    Point body[MAX_LENGTH]; // snake body point array
    Snake(int x, int y)
    {
        length = 1;
        body[0] = Point(x, y); // initial position of snake
        direction = DIR_RIGHT; // initial direction of snake
    }

    int getLength()
    {
        return length;
    }

    void changeDirection(char newDirection)
    {
        if (newDirection == DIR_UP && direction != DIR_DOWN)
        {
            direction = newDirection;
        }
        else if (newDirection == DIR_DOWN && direction != DIR_UP)
        {
            direction = newDirection;
        }
        else if (newDirection == DIR_LEFT && direction != DIR_RIGHT)
        {
            direction = newDirection;
        }
        else if (newDirection == DIR_RIGHT && direction != DIR_LEFT)
        {
            direction = newDirection;
        }
    }

    bool move(Point food)
    {

        for (int i = length - 1; i > 0; i--) // lenght = 4
        {
            body[i] = body[i - 1];
        }

        switch (direction)
        {
            int val;
        case DIR_UP:
            val = body[0].yCoord;
            body[0].yCoord = val - 1;
            break;
        case DIR_DOWN:
            val = body[0].yCoord;
            body[0].yCoord = val + 1;
            break;
        case DIR_RIGHT:
            val = body[0].xCoord;
            body[0].xCoord = val + 1;
            break;
        case DIR_LEFT:
            val = body[0].xCoord;
            body[0].xCoord = val - 1;
            break;
        }

        // snake bites itself
        for (int i = 1; i < length; i++)
        {
            if (body[0].xCoord == body[i].xCoord && body[0].yCoord == body[i].yCoord)
            {
                return false;
            }
        }

        // snake eats food
        if (food.xCoord == body[0].xCoord && food.yCoord == body[0].yCoord)
        {
            body[length] = Point(body[length - 1].xCoord, body[length - 1].yCoord);
            length++;
        }

        return true;
    }
};

class Board // pointer to snake object to access snake class members
{
    Snake *snake;
    const char SNAKE_BODY = 'O';
    Point food;
    const char FOOD = 'o';
    int score;

public:
    Board()
    {
        spawnFood();
        snake = new Snake(10, 10);
        score = 0;
    }

    ~Board()
    {
        delete snake;
    }

    int getScore()
    {
        return score;
    }

    void spawnFood()
    {
        int x = rand() % consoleWidth;  // random x coordinate for food
        int y = rand() % consoleHeight; // random y coordinate for food  from 0 to 99 or consoleHeight;
        food = Point(x, y);
    }

    void displayCurrentScore()
    {
        gotoxy(consoleWidth / 2, 0);
        cout << "Current Score : " << score;
    }

    void gotoxy(int x, int y)
    {
        COORD coord;
        coord.X = x;
        coord.Y = y;
        SetConsoleCursorPosition(GetStdHandle(STD_OUTPUT_HANDLE), coord); // cursor position set
    }

    void draw()
    {
        system("cls"); // clear screen
        for (int i = 0; i < snake->getLength(); i++)
        {
            gotoxy(snake->body[i].xCoord, snake->body[i].yCoord);
            cout << SNAKE_BODY;
        }
        /// -> for dynamic memory access and . for static memory access
        gotoxy(food.xCoord, food.yCoord);
        cout << FOOD;

        displayCurrentScore();
    }

    bool update()
    {
        bool isAlive = snake->move(food);
        if (isAlive == false)
        {
            return false;
        }

        if (food.xCoord == snake->body[0].xCoord && food.yCoord == snake->body[0].yCoord)
        {
            score++;
            spawnFood();
        }
        return true;
    }

    void getInput()
    {
        if (kbhit())
        {
            int key = getch();
            if (key == 'w' || key == 'W')
            {
                snake->changeDirection(DIR_UP);
            }
            else if (key == 'a' || key == 'A')
            {
                snake->changeDirection(DIR_LEFT);
            }
            else if (key == 's' || key == 'S')
            {
                snake->changeDirection(DIR_DOWN);
            }
            else if (key == 'd' || key == 'D')
            {
                snake->changeDirection(DIR_RIGHT);
            }
        }
    }
};

int main()
{
    srand(time(0));
    initScreen();
    Board *board = new Board();
    while (board->update())
    {
        board->getInput();
        board->draw();
        Sleep(100);
    }

    cout << "Game over" << endl;
    cout << "Final score is :" << board->getScore() << endl; // print final score  /// old /// board->s();
    return 0;
}