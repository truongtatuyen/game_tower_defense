const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

//set cursor
document.getElementsByTagName("body")[0].style.cursor = "url('./src/imgs/cur1.cur'), auto";

//global variables
const cellSize = 100;
let numberOfResources = 150;
let enemiesInterval = 900;
let frame = 0;
let gameOver = false;
let isWin = false;
let score = 0;
let winningScore = 500;

const gameGrid = [];
const defenders = [];
const enemies = [];
const enemyPositions = [];
const projectiles = [];
const resources = [];


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
    mouse.x = undefined;
});

//game board
const controlsBar = {
    width: canvas.width,
    height: cellSize,
    img : `./src/imgs/controlbar1.png`// h:100 , w:900
};

function drawControlBar() {
    const controlBarBG = new Image();
    controlBarBG.src = controlsBar.img;
    // ctx.fillStyle = 'blue';
    // ctx.fillRect(0,0,controlsBar.width, controlsBar.height);
    ctx.drawImage(controlBarBG, 0, 0, controlsBar.width, controlsBar.height, 0, 0, controlsBar.width, controlsBar.height);
}

const mainBackground = {
    width: canvas.width,
    height: cellSize * 5,
    img : `./src/imgs/background1.jpg`// h:500 , w:900
};
function drawMainBG() {
    const mainBG = new Image();
    mainBG.src = mainBackground.img;
    ctx.drawImage(mainBG,0, 100);
}

class Cell{
    constructor(x, y){
        this.x = x,
        this.y = y,
        this.width = cellSize;
        this.height = cellSize;
    }
    draw(){
        if(mouse.x && mouse.y && collision(this, mouse)){
            ctx.strokeStyle = 'gold';
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

//PROJECTILE PROJECTILE PROJECTILE PROJECTILE PROJECTILE PROJECTILE PROJECTILE PROJECTILE PROJECTILE
const projectile1 = new Image();
projectile1.src = `./src/imgs/projectile1.png`;
class Projectile {
    constructor(x, y){
        this.x = x;
        this.y = y - 20;
        this.width = 35;
        this.height = 35;
        this.power = 20;
        this.speed = 5.5;

        //for sprite image
        this.projectileType = projectile1;
        this.frameX = 0;
        this.frameY = 0;
        this.minFrame = 0;
        this.maxFrame = 3;
        this.spriteWidth = 35;
        this.spriteHeight = 35;
    }
    update(){
        this.x += this.speed;
        if(frame % 12 === 0){// delay for animation
            if(this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = this.minFrame;
        }
    }
    draw(){
        // ctx.fillStyle = 'black';
        // ctx.beginPath();
        // ctx.arc(this.x, this.y, this.width, 0, Math.PI*2);
        // ctx.fill();
        // ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
        //s(sources):position in image 
        //d(destination):position want to place
        ctx.drawImage(this.projectileType, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}
function handleProjectiles() {
    for (let i = 0; i < projectiles.length; i++) {
        projectiles[i].update();
        projectiles[i].draw();

        for (let j = 0; j < enemies.length; j++) {
            if(enemies[j] && projectiles[i] && collision(projectiles[i], enemies[j])){
                enemies[j].health -= projectiles[i].power;
                projectiles.splice(i, 1);
                i--;
            }
        }

        if(projectiles[i] && projectiles[i].x > canvas.width - cellSize){
            projectiles.splice(i, 1);
            i--;
        }
        // console.log(`projectiles ${projectiles.length}`);
    }
}
//PROJECTILE PROJECTILE PROJECTILE PROJECTILE PROJECTILE PROJECTILE PROJECTILE PROJECTILE PROJECTILE

//DEFENDER DEFENDER DEFENDER DEFENDER DEFENDER DEFENDER DEFENDER DEFENDER DEFENDER DEFENDER DEFENDER
const defenderTypes = [];
const defender1 = new Image();
defender1.src = `./src/imgs/defender1.png`;
defenderTypes.push(defender1);
const defender2 = new Image();
defender2.src = `./src/imgs/defender2.png`;
defenderTypes.push(defender2);
const defender3 = new Image();
defender3.src = `./src/imgs/defender3.png`;
defenderTypes.push(defender3);
const defender4 = new Image();
defender4.src = `./src/imgs/defender4.png`;
defenderTypes.push(defender4);
class Defender {
    constructor(x, y){
        this.x = x;
        this.y = y + 5;
        this.width = cellSize - 10;
        this.height = cellSize - 10;
        this.shooting = true;
        this.health = 100;
        this.projectiles = [];
        this.timer = 0;

        //for sprite image
        this.defenderType = defenderTypes[Math.floor(Math.random() * defenderTypes.length)];
        this.frameX = 0;
        this.frameY = 0;
        this.minFrame = 0;
        this.maxFrame = 4;
        this.spriteWidth = 130;
        this.spriteHeight = 130;
    }
    draw(){
        // ctx.fillStyle = 'blue';
        // ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'yellow';
        ctx.font = '30px Amatic SC';
        ctx.fillText(Math.floor(this.health), this.x + 35, this.y + 15);
        // ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
        //s(sources):position in image 
        //d(destination):position want to place
        ctx.shadowColor = 'blue';
        ctx.shadowBlur = 5;
        ctx.drawImage(this.defenderType, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
    update(){
        if(frame % 12 === 0){// delay for animation
            if(this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = this.minFrame;
        }
        if(this.shooting){
            this.timer++;
            if(this.timer % 60 === 0){//born projectile here
                projectiles.push(new Projectile(this.x + 70, this.y + 50));
            }
        }else{
            this.timer = 0;
        }
    }
}
canvas.addEventListener('click', () => {
    const gridPositionX = mouse.x - (mouse.x % cellSize);
    const gridPositionY = mouse.y - (mouse.y % cellSize);
    let defenderCost = 50;

    //ignore first line for status
    if(gridPositionY < cellSize) return;

    //check existed defender at mouse position
    for (let i = 0; i < defenders.length; i++) {
        if(defenders[i].x === gridPositionX && defenders[i].y === gridPositionY) return;
    }

    if(numberOfResources >= defenderCost){
        defenders.push(new Defender(gridPositionX, gridPositionY));
        numberOfResources -= defenderCost;
    }else{
        floatMSGs.push(new FloatMSGs('need more resources', mouse.x, mouse.y, 20, `white`));
    }
});
function handleDefenders() {
    for (let i = 0; i < defenders.length; i++) {
        defenders[i].draw();
        defenders[i].update();
        //check if Enemy not same lane with Defender
        // console.log(enemyPositions.indexOf(defenders[i].y))
        // if(enemyPositions.indexOf(defenders[i].y) != -1 ){
        //     defenders[i].shooting = true;
        // }else{
        //     defenders[i].shooting = false;
        // }

        for (let j = 0; j < enemies.length; j++) {
            if(defenders[i] && enemies[j] && collision(defenders[i], enemies[j])){
                enemies[j].movement = 0;
                defenders[i].health -= 1;// BLEED
                if(defenders[i] && defenders[i].health <= 0){
                    defenders.splice(i, 1);
                    i--;
                    enemies[j].movement = enemies[j].speed;
                }
            }
        }
    }
}
//DEFENDER DEFENDER DEFENDER DEFENDER DEFENDER DEFENDER DEFENDER DEFENDER DEFENDER DEFENDER DEFENDER

//FLOAT MSGs FLOAT MSGs FLOAT MSGs FLOAT MSGs FLOAT MSGs FLOAT MSGs FLOAT MSGs FLOAT MSGs FLOAT MSGs FLOAT MSGs FLOAT MSGs
const floatMSGs = [];
class FloatMSGs {
    constructor(value, x, y, size, color){
        this.value = value;
        this.x = x;
        this.y = y;
        this.size = size;
        this.lifeSpan = 0;
        this.color = color;
        this.opacity = 1;
    }
    update(){
        this.y -= 0.5;
        this.lifeSpan += 1;
        if(this.oapcity > 0.03) this.opacity -= 0.03;
    }
    draw(){
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.font = this.size + `px Amatic SC`;
        ctx.fillText(this.value, this.x, this.y);
        ctx.globalAlpha = 1;//css:opacity
    }
}
function handleFloatMSGs() {
    for (let i = 0; i < floatMSGs.length; i++) {
        floatMSGs[i].update();
        floatMSGs[i].draw();
        if(floatMSGs[i].lifeSpan >= 50){
            floatMSGs.splice(i, 1);
            i--;
        }
    }
}
//FLOAT MSGs FLOAT MSGs FLOAT MSGs FLOAT MSGs FLOAT MSGs FLOAT MSGs FLOAT MSGs FLOAT MSGs FLOAT MSGs FLOAT MSGs FLOAT MSGs

//ENEMY ENEMY ENEMY ENEMY ENEMY ENEMY ENEMY ENEMY ENEMY ENEMY ENEMY ENEMY ENEMY ENEMY ENEMY ENEMY ENEMY ENEMY
const enemyTypes = [];
const enemy1 = new Image();
enemy1.src = `./src/imgs/enemy1.png`;
enemyTypes.push(enemy1);
const enemy2 = new Image();
enemy2.src = `./src/imgs/enemy2.png`;
enemyTypes.push(enemy2);
const enemy3 = new Image();
enemy3.src = `./src/imgs/enemy3.png`;
enemyTypes.push(enemy3);
const enemy4 = new Image();
enemy4.src = `./src/imgs/enemy4.png`;
enemyTypes.push(enemy4);

class Enemy {
    constructor(verticalPosition){
        this.x = canvas.width;
        this.y = verticalPosition + 2;
        this.width = cellSize - 10;
        this.height = cellSize - 10;
        this.speed = Math.random() * 0.2 + 0.7; // Change speed here
        this.movement = this.speed;
        this.health = 100;
        this.maxHealth = this.health;

        //for sprite image
        this.enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        this.frameX = 0;
        this.frameY = 0;
        this.minFrame = 0;
        this.maxFrame = 10;
        this.spriteWidth = 130;
        this.spriteHeight = 130;
    }
    update(){
        this.x -= this.movement;
        if(frame % 12 === 0){// delay for animation
            if(this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = this.minFrame;
        }
    }
    draw(){
        // ctx.fillStyle = 'red';
        // ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'red';
        ctx.font = '30px Amatic SC';
        ctx.fillText(Math.floor(this.health), this.x + 35, this.y + 10);
        // ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
        //s(sources):position in image 
        //d(destination):position want to place
        ctx.shadowColor = 'red';
        ctx.shadowBlur = 5;
        ctx.drawImage(this.enemyType, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}
function handleEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].update();
        enemies[i].draw();
        if(enemies[i].x < 0){
            gameOver = true;
        }
        if(enemies[i].health <= 0){
            let gainedResources = enemies[i].maxHealth / 10;
            //show floatMSGs
            floatMSGs.push(new FloatMSGs(`+ ${gainedResources}`,enemies[i].x, enemies[i].y, 30, 'gold' ));

            //show gain src on controlBar
            floatMSGs.push(new FloatMSGs(`+ ${gainedResources}`,180, 50, 30, 'gold' ));

            numberOfResources += gainedResources;
            score += gainedResources;
            const findThisIndex = enemyPositions.indexOf(enemies[i].y);
            enemyPositions.splice(findThisIndex, 1);
            enemies.splice(i, 1);
            i--;
            // console.log(enemyPositions);
        }
    }
    if(frame % enemiesInterval === 0){
        let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize + 3;
        enemies.push(new Enemy(verticalPosition));
        enemyPositions.push(verticalPosition);
        if(enemiesInterval > 120) enemiesInterval -= 110;
        // console.log(enemyPositions);
    }
}
//ENEMY ENEMY ENEMY ENEMY ENEMY ENEMY ENEMY ENEMY ENEMY ENEMY ENEMY ENEMY ENEMY ENEMY ENEMY ENEMY ENEMY ENEMY

//RESOURCES RESOURCES RESOURCES RESOURCES RESOURCES RESOURCES RESOURCES RESOURCES RESOURCES RESOURCES RESOURCES
const amounts = [10, 20, 30];
const srcTypes = [];
const src1 = new Image();
src1.src = `./src/imgs/src1.png`;
srcTypes.push(src1);
class Resource {
    constructor(){
        this.x = Math.random() * (canvas.width - cellSize);
        this.y = (Math.floor(Math.random() * 5) + 1) * cellSize + 25;
        this.width = cellSize * 0.6;
        this.height = cellSize * 0.6;
        this.amount = amounts[Math.floor(Math.random() * amounts.length)];

        //for sprite image
        this.srcType = srcTypes[0];
        this.frameX = 0;
        this.frameY = 0;
        this.minFrame = 0;
        this.maxFrame = 1;
        this.spriteWidth = 100;
        this.spriteHeight = 100;
    }
    update(){
        if(frame % 30 === 0){// delay for animation
            if(this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = this.minFrame;
        }
    }
    draw(){
        // ctx.fillStyle = 'yellow';
        // ctx.fillRect(this.x, this.y, this.width, this.height);
        // ctx.fillStyle = 'black';
        // ctx.font = '35px Amatic SC';
        // ctx.fillText(`+` + this.amount, this.x + 25, this.y + 5);
        // ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
        //s(sources):position in image 
        //d(destination):position want to place
        ctx.shadowColor = 'gold';
        ctx.shadowBlur = 30;
        ctx.drawImage(this.srcType, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}
function handleResources(){
    if(frame % 600 === 0 && score < winningScore){
        resources.push(new Resource());
    }
    for (let i = 0; i < resources.length; i++) {
        resources[i].draw();
        resources[i].update();
        if(resources[i] && mouse.x && mouse.y && collision(resources[i], mouse)){
            numberOfResources += resources[i].amount;

            //show floatMSGs
            floatMSGs.push(new FloatMSGs(`+${resources[i].amount}`,resources[i].x, resources[i].y, 30, 'gold' ));

            //show gain src on controlBar
            floatMSGs.push(new FloatMSGs(`+${resources[i].amount}`,180, 50, 30, 'gold' ));

            resources.splice(i, 1);
            i--;
        }
        
    }
}
//RESOURCES RESOURCES RESOURCES RESOURCES RESOURCES RESOURCES RESOURCES RESOURCES RESOURCES RESOURCES RESOURCES

//UTILITIES UTILITIES UTILITIES UTILITIES UTILITIES UTILITIES UTILITIES UTILITIES UTILITIES UTILITIES UTILITIES
function handleGameStatus() {
    ctx.fillStyle = 'gold';
    ctx.font = '45px Amatic SC';
    ctx.fillText(`Score: ${score}`, 20, 45);
    ctx.fillText(`Resources: ${numberOfResources}`, 20, 85);
    ctx.fillText(`WIN-SCORE : ${winningScore}`, 600, 70);

    if(score >= winningScore /*&& enemies.length === 0*/){
        isWin = true;
    }
}
function renewGame() {
    setTimeout(() => {
        ctx.textAlign = 'center';
        ctx.fillStyle = 'black';
        ctx.fillText('Press "R" to Retry ', canvas.width / 2, canvas.height / 2 + 200);

        document.addEventListener("keyup", function(event) {
            if (event.keyCode === 82) {
                event.preventDefault();
                location.reload();
            }
        });
    }, 1000);
}
//fix mouse position when resize browser
function fixResize() {
    window.addEventListener('mouseover', ()=>{
        canvasPosition = canvas.getBoundingClientRect();
    });
    window.addEventListener('resize', ()=>{
        canvasPosition = canvas.getBoundingClientRect();
    });
}
//UTILITIES UTILITIES UTILITIES UTILITIES UTILITIES UTILITIES UTILITIES UTILITIES UTILITIES UTILITIES UTILITIES


//animate loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fixResize();
    drawControlBar();
    drawMainBG();
    handleGameGrid();
    handleGameStatus();
    handleDefenders();
    handleResources();
    handleProjectiles();
    handleEnemies();
    handleFloatMSGs();
    frame++;// use to make delays

    if(!gameOver){
        if(!isWin){
            requestAnimationFrame(animate);
        }else{
            //when win
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'gold';
            ctx.globalCompositeOperation = 'destination-over';// css:z-index
            ctx.font = '80px Amatic SC';
            ctx.fillText('LEVEL COMPLETE', 130, 300);
            ctx.fillText(`You win with ${score} points!`, 150, 370);
            renewGame();
        }
    }else{// GAMEOVER handles
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.font = '120px Amatic SC';
        ctx.fillText('GAME OVER', 135, 330);
        renewGame();
    }

}


//to play game
const btnStart = document.getElementById('startGame');
btnStart.addEventListener('click', ()=>{
    btnStart.classList.add('hidden');
    document.getElementById('canvas1').classList.remove('hidden');
    fixResize();
    animate();
});

//check collision
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

