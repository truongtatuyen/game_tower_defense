const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

//global variables
const cellSize = 100;
const cellGap = 3;
const gameGrid = [];
const defenders = [];
let numberOfResources = 300;
const enemies = [];
const enemiesPositions = [];
let enemiesInterval = 600;
let frame = 0;
let gameOver = false;


//mouse
const mouse = {
    x: 10,
    y: 10,
    width: 0.1,
    height: 0.1
};
let canvasPosition = canvas.getBoundingClientRect();
// console.log(canvasPosition);
canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener('mouseleave', () => {
    mouse.y = undefined;
    mouse.y = undefined;
});

//game board
const controlsBar = {
    width: canvas.width,
    height: cellSize
};
class Cell{
    constructor(x, y){
        this.x = x,
        this.y = y,
        this.width = cellSize;
        this.height = cellSize;
    }
    draw(){
        if(mouse.x && mouse.y && collision(this, mouse)){
            ctx.strokeStyle = 'black';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }        
    }
}
function createGrid() {
    //y = cellSize for infoBar on top
    for(let y = cellSize; y < canvas.height; y += cellSize){
        for (let x = 0; x < canvas.width; x += cellSize) {
            gameGrid.push(new Cell(x, y));
        }
    }
}
createGrid();
function handleGameGrid() {
    for (let i = 0; i < gameGrid.length; i++) {
        gameGrid[i].draw();
    }
}
//projectiles
//defenders
class Defender {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
        this.health = 100;
        this.projectiles = [];
        this.timer = 0;
    }
    draw(){
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'gold';
        ctx.font = '30px Amatic SC';
        ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
    }
}
canvas.addEventListener('click', () => {
    const gridPositionX = mouse.x - (mouse.x % cellSize);
    const gridPositionY = mouse.y - (mouse.y % cellSize);
    let defenderCost = 100;

    //ignore first line for status
    if(gridPositionY < cellSize) return;

    //check existed defender at mouse position
    for (let i = 0; i < defenders.length; i++) {
        if(defenders[i].x === gridPositionX && defenders[i].y === gridPositionY) return;
    }

    if(numberOfResources >= defenderCost){
        defenders.push(new Defender(gridPositionX, gridPositionY));
        numberOfResources -= defenderCost;
    }
});
function handleDefenders() {
    for (let i = 0; i < defenders.length; i++) {
        defenders[i].draw();
        for (let j = 0; j < enemies.length; j++) {
            if(defenders[i] && enemies[j] && collision(defenders[i], enemies[j])){
                enemies[j].movement = 0;
                defenders[i].health -= 1;// bleed
                if(defenders[i] && defenders[i].health <= 0){
                    defenders.splice(i, 1);
                    i--;
                    enemies[j].movement = enemies[j].speed;
                }
            }
        }
    }
}

//enemies
class Enemy {
    constructor(verticalPosition){
        this.x = canvas.width + 5;
        this.y = verticalPosition + 5;
        this.width = cellSize - 10;
        this.height = cellSize - 10;
        this.speed = Math.random() * 0.2 + 5; // Change speed here
        this.movement = this.speed;
        this.health = 100;
        this.maxHealth = this.health;
    }
    update(){
        this.x -= this.movement;
    }
    draw(){
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.font = '30px Amatic SC';
        ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
    }
}
function handleEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].update();
        enemies[i].draw();
        if(enemies[i].x < 0){
            gameOver = true;
        }
    }
    if(frame % enemiesInterval === 0){
        let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize;
        enemies.push(new Enemy(verticalPosition));
        enemiesPositions.push(verticalPosition);
        if(enemiesInterval > 120) enemiesInterval -= 100;
    }
}

//resources
//utilities
function handleGameStatus() {
    ctx.fillStyle = 'gold';
    ctx.font = '45px Amatic SC';
    ctx.fillText(`Resources: ${numberOfResources}`, 20, 65);
}

//animate loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'blue';
    ctx.fillRect(0,0,controlsBar.width, controlsBar.height);
    handleGameGrid();
    handleGameStatus();
    handleDefenders();
    handleEnemies();
    frame++;// use to born Enemies

    if(!gameOver){
        requestAnimationFrame(animate);
    }else{// GAMEOVER handles
        ctx.fillStyle = 'black';
        ctx.font = '120px Amatic SC';
        ctx.fillText('GAME OVER', 135, 330);
    }
}
animate();

function collision(first, second) {
    if(
        !(
            first.x > second.x + second.width ||
            first.x + first.width < second.x ||
            first.y > second.y + second.height ||
            first.y + first.height < second.y
        )
    ){
        return true;
    }
}