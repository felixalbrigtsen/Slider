//Graphics settings;
let canvWidth = Math.round(Math.min(window.innerWidth, window.innerHeight) * 0.85);
let padding = 4;

let minSwipeDist = 50;

let shuffleLength = 100;

//Public variables for game logic and graphics
let scl;
let cols;
let imgscale;
let boardimg;

let board = [];
let images = [];

let prevTouchPos = [];

let solvedState;

let emptyx;
let emptyy;

let cvs;

function setup() {
    cvs = createCanvas(canvWidth, canvWidth);
    cvs.parent("gameCanvas");
    background(50);

    cvs.parent().addEventListener("touchstart", handle_touchdown);
    cvs.parent().addEventListener("touchend", handle_touchup);

    fill(255);
    textSize(Math.round(width / 20));
    text("Please load an image to start", width/6, height/2); //Approximately center

    noLoop();
}

function startGame(pic) {
    //Finds the center of the image, gets the source coordinates for each cell and start the game
    boardimg = pic;

    //Get the number of rows/collumns and adapt the size of the cells
    cols = parseInt(document.getElementById("difficultyNum").value);
    scl = Math.round(width / cols) - padding; //Equivalent to Math.round((width-(padding*cols)) / cols)

    board = [];
    images = [];

    let imgsize;
    let imgxoffset;
    let imgyoffset;
    let imgpadding;

    if (pic.width > pic.height) {
        //Landscape
        imgsize = pic.height;
        imgyoffset = 0; //Use the entire height
        imgxoffset = Math.round((pic.width - pic.height)/2); //Center the image horizontally
    } else {
        //Portrait
        imgsize = pic.width;
        imgyoffset = (Math.round((pic.height - imgsize) / 2)); //Center the image vertically
        imgxoffset = 0; //Use the entire width
    }

    //Set scale and padding
    imgpadding = Math.floor(imgsize * (padding / scl)); //Same relative size as the visible grid
    imgscale = Math.floor((imgsize)/cols)-padding; //Width/Height of each cell

    //Put source image coordinates(top left of each cell) into an array
    for (let i = 0; i < (cols**2); i++) {
        let x = i % cols;
        let y = (i-x)/cols;

        let coords = [
            (imgxoffset + (x*(padding+imgscale))),
            (imgyoffset + (y*(padding+imgscale)))
        ];
        images.push(coords);
    }
    
    
    //Initialize board to [[0,1,2,3],[4,5,6,7], etc.]
    let i = 0;
    for (let y = 0; y < cols; y++) {
        board.push([])
        for (let x = 0; x < cols; x++) {
            board[y].push(i)
            i++;
        }
    }
    //Empty cell, bottom right corner
    board[cols-1][cols-1] = -1
    emptyx = cols-1;
    emptyy = cols-1;

    //Set solvedState to an identical copy of the finished game, compare to test completion
    solvedState = JSON.stringify(board);


    drawFrame();
}

function drawFrame() {
    background(50); //Clear board

    for (let y = 0; y < cols; y++) {
        for (let x = 0; x < cols; x++) {
            //console.log("DEBUG  x: " + x + "   y: " + y + "   Cell: " + board[y][x])
            if (board[y][x] != -1) {
                let i = board[y][x];
                image(boardimg, x*(padding+scl) + padding, y*(padding+scl) + padding, scl, scl, images[i][0], images[i][1], imgscale, imgscale);
            }
        }
    }
}

function slide(code) {
    //Takes a keyboard code as input
    //Swipes/slides to the selected direction if the code corresponds to an arrow key
    let index = (emptyy*cols)+emptyx;

    switch(code) {
        case 37:
            //Left
            if (emptyx != cols-1) {
                board[emptyy][emptyx] = board[emptyy][emptyx+1];
                board[emptyy][emptyx+1] = -1; 
                emptyx++;
            }
            break;
        case 38:
            //Up
            if (emptyy != cols-1) {
                board[emptyy][emptyx] = board[emptyy+1][emptyx];
                board[emptyy+1][emptyx] = -1;
                emptyy++;
            }
            break;
        case 39:
            //Right
            if (emptyx != 0) {
                board[emptyy][emptyx] = board[emptyy][emptyx-1];
                board[emptyy][emptyx-1] = -1;
                emptyx--;
            }
            break;
        case 40:
            //Down
            if (emptyy != 0) {
                board[emptyy][emptyx] = board[emptyy-1][emptyx];
                board[emptyy-1][emptyx] = -1;
                emptyy--;
            }
            break;
    }
}

function keyPressed() {
    //Handle all keypresses, but only arrow keys are used.

    slide(keyCode);
    drawFrame();

    //Quick and dirty comparison check as (board == solvedState) always returns false
    if (([37,38,39,40].includes(keyCode)) && JSON.stringify(board) == solvedState) {
        alert("Solved!");
    }
}

function handle_touchdown(e) {
    let x = e.changedTouches[0].clientX;
    let y = e.changedTouches[0].clientY;
    prevTouchPos = [x, y];
    e.preventDefault();
}
function handle_touchup(e) {
    //Swipe in the direction that the touchpoint moved
    let x = e.changedTouches[0].clientX;
    let y = e.changedTouches[0].clientY;
    let keycode = 0;

    if (x-prevTouchPos[0] > minSwipeDist) {
        //Right
        keycode = 39;
    }
    if (prevTouchPos[0]-x > minSwipeDist) {
        //Left
        keycode = 37;
    }
    if (y-prevTouchPos[1] > minSwipeDist) {
        //Down
        keycode = 40;
    }
    if (prevTouchPos[1]-y > minSwipeDist) {
        //Up
        keycode = 38;
    }

    if (keycode != 0) {
        slide(keycode);
        drawFrame();
    }
}

function quickloadImage(btn) {
    let imgurl = btn.getAttribute("data-src");
    loadImage("https://cors-anywhere.herokuapp.com/"+imgurl, startGame);
}

function draw() {}

document.getElementById("imgUrlBtn").onclick = function(){
    //Load image URL and run startGame()

    //TODO - Verify/Check URL and give feedback to the player
    loadImage("https://cors-anywhere.herokuapp.com/"+document.getElementById("imgUrlInput").value, startGame);
}

document.getElementById("shuffleBtn").onclick = function(){
    //Slide random directions, shuffling the game and ensuring a possible solution
    for (let i = 0; i < shuffleLength; i++) {
        slide(
            Math.floor(Math.random()*4) + 37
        );
    }
    drawFrame();
}