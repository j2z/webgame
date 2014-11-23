

paper.install(window);

/* How long the saber "trail" is */
var PATH_LENGTH = 6;

/* how far your saber can go in the timer interval before it plays
 * "swish" instead of "hummm" */
var THRESHOLD = 30;

/* amount of times a sound can be played over itself */
var CONCURRENT_SOUNDS = 5;

/* frames until another swing sound can be played */
var SWING_COOLDOWN = 15;
/* frames until another hum sound can be played */
var HUM_COOLDOWN = 25;

/* change of spawning a trainee every spawn */
var PADAWAN_CHANCE = 0.2;

/* how long the sub-peanuts are invicible after being released from the peanut shell */
/* otherwise, they'll imediately die */
var INV_COOLDOWN = 15;

var GRAVITY = 0.15;

var START_LIVES = 3;

var gameOver = true;

/* the path of the lightsaber */
var myPath;

/* current position of the mouse */
var mousePoint;

/* Sounds */
/* Apparently you can't have a single Audio object playing over itself,
 * so create an array of sounds for each actual sound */
var hum = [];
var humIndex = 0;

var swing1 = [];
var swing1Index = 0;

var swing2 = [];
var swing2Index = 0;

var hit1 = [];
var hit1Index = 0;

var hit2 = [];
var hit2Index = 0;

var scream = [];
var screamIndex = 0;

for (var i = 0; i < CONCURRENT_SOUNDS; i++)
{
    hum.push(new Audio('audio/hum.wav'));
    swing1.push(new Audio('audio/swing.wav'));
    swing2.push(new Audio('audio/swing2.wav'));
    hit1.push(new Audio('audio/hit1.wav'));
    hit2.push(new Audio('audio/hit2.wav'));
    scream.push(new Audio('audio/scream.wav'));
}

/* sound cooldowns */
var swingTimer = 0;
var humTimer = 0;

/* how far your saber has moved since the last time step */
var sumDelta;

/* how long until the next spawn */
var nextSpawn = 0;

/* how fast things spawn */
var spawnRate = 1;

/* whole peanuts (with shell) */
var peanutsWhole = [];
/* individual peanuts */
var peanutsInd = [];

/* trainees and their "parts" */
var padawans = [];
var padawanParts = [];

/* score and objects to the display the score */
var score = 0;
var scoreText;
var highScore = 0;
var highScoreText;

/* lives and images representing lives */
var lives;
var lifeImg = [];

function gameLoop() {
    /* if game is over, don't run game logic */
    if (gameOver)
    {
        paper.view.draw();
        return;
    }
    
    /* update saber arc */
    myPath.add(mousePoint);
    myPath.removeSegment(0);
    
    /* play swoosh based on the speed */
    if (swingTimer <= 0)
    {
        if (sumDelta > THRESHOLD)
        {
            playSwing();
            swingTimer = SWING_COOLDOWN;
        }
    }
    else
    {
        swingTimer--;
    }
    
    /* play the hummm sound */
    if (humTimer <= 0)
    {
        playHum();
        humTimer = HUM_COOLDOWN;
    }
    else
    {
        humTimer--;
    }
    
    /* reset saber distance traveled */
    sumDelta = 0;
    
    if (nextSpawn <= 0)
    {
        /* spawn either trainee or peanut */
        if (Math.random() < PADAWAN_CHANCE)
        {
            var newPadawan = new Raster('img/youngling.png');
            newPadawan.position = new Point(Math.random()*(view.bounds.right-200) + 100, view.bounds.bottom);
            newPadawan.xVel = Math.random() - 0.5;
            newPadawan.yVel = -11;
            newPadawan.angVel = Math.random() * 4 - 2;
            padawans.push(newPadawan);
        }
        else
        {
            var newPeanut = new Raster('img/peanut_full.png');
            newPeanut.position = new Point(Math.random()*(view.bounds.right-300) + 150, view.bounds.bottom);
            newPeanut.xVel = Math.random() * 6 - 3;
            newPeanut.yVel = -11;
            newPeanut.angVel = Math.random() * 4 - 2;
            peanutsWhole.push(newPeanut);
        }
        
        /* generate next spawn time and increase spawn rate */
        nextSpawn = Math.random() * 20 / spawnRate + 40;
        spawnRate = spawnRate + 0.1;
    }
    else
    {
        /* if not time to spawn, count down */
        nextSpawn--;
    }

    /* Next loops are pretty much the same.
     * If the object is off the bottom of the screen, remove it.
     * Otherwise, update it's position and rotation based on physics */
    
    for (var i = 0; i < padawanParts.length; i++)
    {
        if (padawanParts[i].position.y > view.bounds.bottom)
        {
            padawanParts[i].remove();
            padawanParts.splice(i, 1);
        }
        else
        {
            padawanParts[i].position.x = padawanParts[i].position.x + padawanParts[i].xVel;
            padawanParts[i].position.y = padawanParts[i].position.y + padawanParts[i].yVel;
            padawanParts[i].rotate(padawanParts[i].angVel);
            padawanParts[i].yVel = padawanParts[i].yVel + GRAVITY;

        }
    }
    
    for (var i = 0; i < padawans.length; i++)
    {
        if (padawans[i].position.y > view.bounds.bottom)
        {
            padawans[i].remove();
            padawans.splice(i, 1);
        }
        else
        {
            if (padawans[i].contains(mousePoint))
            {
                /* cut him into 2 pieces!*/
                var padawanTop = new Raster('img/youngling_top.png');
                padawanTop.position = padawans[i].position;
                padawanTop.position.x = padawanTop.position.x + Math.random() * 4 - 2;
                padawanTop.xVel = padawans[i].xVel + Math.random() * 4;
                padawanTop.yVel = padawans[i].yVel;
                padawanTop.angVel = Math.random() * 4 - 2;
                padawanParts.push(padawanTop);
                
                var padawanBottom = new Raster('img/youngling_bottom.png');
                padawanBottom.position = padawans[i].position;
                padawanBottom.position.x = padawanBottom.position.x + Math.random() * 4 - 2;
                padawanBottom.xVel = padawans[i].xVel + Math.random() * (-4);
                padawanBottom.yVel = padawans[i].yVel;
                padawanBottom.angVel = Math.random() * 4 - 2;
                padawanParts.push(padawanBottom);
                
                padawans[i].remove();
                padawans.splice(i, 1);
                playHit();
                playScream();
                
                loseLife();
                
                continue;
            }

            padawans[i].position.x = padawans[i].position.x + padawans[i].xVel;
            padawans[i].position.y = padawans[i].position.y + padawans[i].yVel;
            padawans[i].rotate(padawans[i].angVel);
            padawans[i].yVel = padawans[i].yVel + GRAVITY;

        }
    }
    
    for (var i = 0; i < peanutsInd.length; i++)
    {
        if (peanutsInd[i].position.y > view.bounds.bottom)
        {
            peanutsInd[i].remove();
            peanutsInd.splice(i, 1);
        }
        else
        {
            if (peanutsInd[i].invTimer <= 0)
            {
                if (peanutsInd[i].contains(mousePoint))
                {
                    peanutsInd[i].remove();
                    peanutsInd.splice(i, 1);
                    playHit();
                    
                    addScore();
                    
                    /*
                    var newPeanut1 = new Raster('img/peanut_individual.png');
                    newPeanut1.position = peanutsWhole[i].position;
                    newPeanut1.position.x = newPeanut1.position.x + Math.random() * 4 - 2;
                    newPeanut1.xVel = peanutsWhole[i].xVel + Math.random() * 4;
                    newPeanut1.yVel = peanutsWhole[i].yVel;
                    newPeanut1.angVel = Math.random() * 4 - 2;
                    peanutsInd.push(newPeanut1);
                    
                    var newPeanut2 = new Raster('img/peanut_individual.png');
                    newPeanut2.position = peanutsWhole[i].position;
                    newPeanut2.position.x = newPeanut2.position.x + Math.random() * 4 - 2;
                    newPeanut2.xVel = peanutsWhole[i].xVel + Math.random() * (-4);
                    newPeanut2.yVel = peanutsWhole[i].yVel;
                    newPeanut2.angVel = Math.random() * 4 - 2;
                    peanutsInd.push(newPeanut2);
                    
                    */
                    continue;
                }
            }
            else
            {
                peanutsInd[i].invTimer--;
            }

            peanutsInd[i].position.x = peanutsInd[i].position.x + peanutsInd[i].xVel;
            peanutsInd[i].position.y = peanutsInd[i].position.y + peanutsInd[i].yVel;
            peanutsInd[i].rotate(peanutsInd[i].angVel);
            peanutsInd[i].yVel = peanutsInd[i].yVel + GRAVITY;

        }
    }
    
    for (var i = 0; i < peanutsWhole.length; i++)
    {
        if (peanutsWhole[i].position.y > view.bounds.bottom)
        {
            peanutsWhole[i].remove();
            peanutsWhole.splice(i, 1);
            
            /* lose a life when you miss a whole peanut */
            loseLife();
        }
        else
        {
            if (peanutsWhole[i].contains(mousePoint))
            {
                /* spawn 2 individual peanuts */
                var newPeanut1 = new Raster('img/peanut_individual.png');
                newPeanut1.position = peanutsWhole[i].position;
                newPeanut1.position.x = newPeanut1.position.x + Math.random() * 4 - 2;
                newPeanut1.xVel = peanutsWhole[i].xVel + Math.random() * 4;
                newPeanut1.yVel = peanutsWhole[i].yVel - Math.random() * 4;
                newPeanut1.angVel = Math.random() * 4 - 2;
                newPeanut1.invTimer = INV_COOLDOWN;
                peanutsInd.push(newPeanut1);
                
                var newPeanut2 = new Raster('img/peanut_individual.png');
                newPeanut2.position = peanutsWhole[i].position;
                newPeanut2.position.x = newPeanut2.position.x + Math.random() * 4 - 2;
                newPeanut2.xVel = peanutsWhole[i].xVel + Math.random() * (-4);
                newPeanut2.yVel = peanutsWhole[i].yVel - Math.random() * 4;
                newPeanut2.angVel = Math.random() * 4 - 2;
                newPeanut2.invTimer = INV_COOLDOWN;
                peanutsInd.push(newPeanut2);
                
                peanutsWhole[i].remove();
                peanutsWhole.splice(i, 1);
                playHit();
                
                addScore();
            }
            else
            {
                peanutsWhole[i].position.x = peanutsWhole[i].position.x + peanutsWhole[i].xVel;
                peanutsWhole[i].position.y = peanutsWhole[i].position.y + peanutsWhole[i].yVel;
                peanutsWhole[i].rotate(peanutsWhole[i].angVel);
                peanutsWhole[i].yVel = peanutsWhole[i].yVel + GRAVITY;
            }
        }
    }
    
    paper.view.draw();
}

function playHum() {
    hum[humIndex].play();
    humIndex = (humIndex + 1) % CONCURRENT_SOUNDS;
}

function playScream() {
    scream[screamIndex].play();
    screamIndex = (screamIndex + 1) % CONCURRENT_SOUNDS;
}

function playSwing() {
    /* 2 possible swish sounds */
    if (Math.random() < 0.5)
    {
        swing1[swing1Index].play();
        swing1Index = (swing1Index + 1) % CONCURRENT_SOUNDS;
    }
    else
    {
        swing2[swing2Index].play();
        swing2Index = (swing2Index + 1) % CONCURRENT_SOUNDS;
    }
}

function playHit() {
    /* 2 possible hit sounds */
    if (Math.random() < 0.5)
    {
        hit1[hit1Index].play();
        hit1Index = (hit1Index + 1) % CONCURRENT_SOUNDS;
    }
    else
    {
        hit2[hit2Index].play();
        hit2Index = (hit2Index + 1) % CONCURRENT_SOUNDS;
    }
}

function addScore() {
    score++;
    if (score > highScore)
    {
        highScore = score;
        highScoreText.content = 'High Score: ' + highScore;
    }
    scoreText.content = 'Score: ' + score;
}

function resetScore() {
    score = 0;
    scoreText.content = 'Score: ' + score;
}

function loseLife() {
    lives--;
    var lifeImage = lifeImg.pop();
    lifeImage.remove();
    if (lives == 0)
    {
        loseGame();
    }
}

function resetLives() {
    lives = START_LIVES;
    for (var i = 0; i < lives; i++)
    {
        var lifeImage = new Raster('img/jedi_symbol.jpg');
        lifeImage.position = new Point(view.bounds.right - 100 + i * 35, view.bounds.bottom - 20);
        lifeImg.push(lifeImage);
    }
}

function loseGame()
{
    var loseText = new PointText(new Point(view.bounds.right / 2, view.bounds.bottom / 2));
    loseText.fillColor = 'red';
    loseText.justification = 'center';
    loseText.content = 'YOU LOSE. WELCOME TO THE DARK SIDE.';
    loseText.fontSize = 40;
    gameOver = true;
}

window.addEventListener('load', function() {
    paper.setup('canvas');
    
    myPath = new Path();
    mousePoint = new Point(0,0);
    sumDelta = 0;

    for (var i = 0; i < PATH_LENGTH; i++)
    {
        myPath.add(new Point(10,10));
    }
    myPath.closed = true;
    myPath.strokeColor = 'blue';
    myPath.fillColor = 'blue';
    
    scoreText = new PointText(new Point(10, 30));
    scoreText.fillColor = 'black';
    scoreText.fontSize = 25;
    
    highScoreText = new PointText(new Point(view.bounds.right - 200, 30));
    highScoreText.fillColor = 'black';
    highScoreText.fontSize = 25;
    highScoreText.content = 'High Score: 0';
    
    resetScore();
    resetLives();
    
    var mouseTool = new Tool();
  
    mouseTool.onMouseMove = function(event) {
        /* update mouse position */
        mousePoint = event.point;
        /* add to the length traveled */
        sumDelta = sumDelta + event.delta.length;
    }
    
    gameOver = false;

    /* time step for the game loop */
    setInterval(gameLoop, 10);

});