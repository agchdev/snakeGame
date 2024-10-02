const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d") //.getContext("2d") nos proporciona varias propiedades y metodos que nos permiten realizar operaciones de dibujo dentro del canvas

const menu = document.querySelector(".menu");
const score = document.querySelector(".score");
const canvas2 = document.getElementById("snake-1");
const canvas3 = document.getElementById("snake-2");

const ctx2 = canvas2.getContext("2d");
const ctx3 = canvas3.getContext("2d");

canvas2.width = 190;
canvas2.height = 80;
canvas3.width = 190;
canvas3.height = 80;
canvas.width = 650; //Esta propiedad es para ajustar el ancho
canvas.height = 380; //Esta propiedad es para ajustar el alto

let play = false;
let scoreP = 0;

//Creamos la clase de la manzana (mas bien comida sin mas xd)
class Apple{
    constructor(position, radio, color, context){
        this.position = position;
        this.radio = radio;
        this.color = color;
        this.context = context;
    }
    draw(){
        this.context.save();
        this.context.beginPath(); //Para indicar un nuevo dibujo
        this.context.arc(this.position.x,this.position.y,this.radio, 0, 2*Math.PI);//Dibujar cara de la serpiente
        this.context.fillStyle = this.color; //propiedad fillStyle para indicar el color
        this.context.shadowColor = this.color; // .shadowColor propiedad que genera una sombra
        this.context.shadowBlur = 10; //.shadowBlur propiedad que genera un desenfoque a la sombra
        this.context.fill(); //propiedad fill de nuestro contexto para colorear
        this.context.closePath(); //Esta propiedad para terminar
        this.context.restore();
    }
    collision(snake){
        let v1 = {
            x:this.position.x - snake.position.x,
            y:this.position.y - snake.position.y
        }
        let distancia = Math.sqrt(
            Math.pow(v1.x,2) + Math.pow(v1.y,2)
        );
        if(distancia < snake.radio+this.radio){
            //colision
            this.position = {
                x: Math.floor(Math.random()*
                    ((canvas.width-this.radio) - this.radio + 1)) + this.radio,
                y: Math.floor(Math.random()*
                    ((canvas.height-this.radio) - this.radio + 1)) + this.radio
            }
            snake.createBody();
            scoreP++;
            score.textContent = scoreP;
        }
    }
}
//Creamos el cuerpo de la serpiente
class SnakeBody{
    constructor(radio, color, context, path){
        this.radio = radio;
        this.color = color;
        this.context = context;
        this.path = path;
        this.transparency = 1;
    }
    drawCircle(x,y,radio,color){
        this.context.save();
        this.context.beginPath(); //Para indicar un nuevo dibujo
        this.context.arc(x,y,radio, 0, 2*Math.PI);//Dibujar cara de la serpiente
        this.context.fillStyle = color; //propiedad fillStyle para indicar el color
        this.context.globalAlpha = this.transparency; //ajustamos la transaparencia
        this.context.shadowColor = this.color;
        this.context.shadowBlur = 10;
        this.context.fill(); //propiedad fill de nuestro contexto para colorear
        this.context.closePath(); //Este propiedad para terminar
        this.context.restore();
    }
    draw(){
        this.drawCircle(this.path.slice(-1)[0].x, this.path.slice(-1)[0].y, this.radio, this.color); //this.path.slice(-1)[0] esto nos devuelve el elemento de la ultima posicion del array
    }
}
//Creamos la clase Snake
class Snake{
    //Creamos el constructor del Snake
    constructor(position, radio, color, velocity, length, pathLength, context){
        this.position = position;
        this.radio = radio;
        this.color = color;
        this.velocity = velocity;
        this.context = context;
        this.rotation = 0;
        this.transparency = 1;
        this.body = [];
        this.isDeath = false;
        this.length = length;
        this.pathLength = pathLength
        this.keys = {
            A:false,
            D:false,
            enable: true
        }
        this.keyboard();
    }
    //Iniciar el cuerpo
    initBody(){
        for(let i=0; i<this.length; i++){
            let path = [];
            for(let k=0; k<this.pathLength; k++){
                path.push({
                    x:this.position.x,
                    y:this.position.y
                });
            }
            this.body.push(new SnakeBody(this.radio, this.color, this.context, path));
        }
    }
    //Crear el cuerpo
    createBody(){
        let path = [];
        for(let k=0; k<this.pathLength; k++){
            path.push({
                /**
                 * this.body.slice(-1)[0] -> Con esto accedemos al ultimo cuerpo
                 * .path.slice(-1)[0].x -> Con esto al ultimo elmento del camino de ese cuerpo
                 */
                x:this.body.slice(-1)[0].path.slice(-1)[0].x,
                y:this.body.slice(-1)[0].path.slice(-1)[0].y
            });
        }
        this.body.push(new SnakeBody(this.radio, this.color, this.context, path));

        if(this.pathLength < 8){
            this.body.push(new SnakeBody(this.radio, this.color, this.context, [...path]));
            this.body.push(new SnakeBody(this.radio, this.color, this.context, [...path]));
            this.body.push(new SnakeBody(this.radio, this.color, this.context, [...path]));
        }
    }
    //metodo para dibujar los ojos de la serpiente
    drawCircle(x,y,radio,color, shadowColor){
        this.context.save();
        this.context.beginPath(); //Para indicar un nuevo dibujo
        this.context.arc(x,y,radio, 0, 2*Math.PI);//Dibujar cara de la serpiente
        this.context.fillStyle = color; //metodo fillStyle para indicar el color
        this.context.globalAlpha = this.transparency; //ajustamos la transaparencia
        this.context.shadowColor = shadowColor;
        this.context.shadowBlur = 10;
        this.context.fill(); //Metodo fill de nuestro contexto para colorear
        this.context.closePath(); //Este metodo para terminar
        this.context.restore();
    }
    //Metodo para dibujar
    drawHead(){
        //Cabeza como tal
        this.drawCircle(this.position.x, this.position.y, this.radio, this.color, this.color);
        //Ojo de arriba
        this.drawCircle(this.position.x, this.position.y-9, this.radio-4, "white", "transparent");
        this.drawCircle(this.position.x+1, this.position.y-9, this.radio-6, "black","transparent");
        this.drawCircle(this.position.x+3, this.position.y-8, this.radio-9, "white","transparent");
        //Ojo de abajo
        this.drawCircle(this.position.x, this.position.y+9, this.radio-4, "white","transparent");
        this.drawCircle(this.position.x+1, this.position.y+9, this.radio-6, "black","transparent");
        this.drawCircle(this.position.x+3, this.position.y+8, this.radio-9, "white","transparent");
    }
    //Para dibujar el cuerpo
    drawBody(){
        this.body[0].path.unshift({
            x:this.position.x,
            y:this.position.y
        });
        this.body[0].draw();

        for(let i = 1; i<this.body.length; i++){
            this.body[i].path.unshift(this.body[i-1].path.pop())//.pop() delvuelve y elimina el ultimo elemento
            this.body[i].draw();
        }
        this.body[this.body.length-1].path.pop();
    }
    //Para dibujar la cabeza
    draw(){
        //Guardar contexto
        this.context.save();

        //Nos va a permirtir rotar el dibujo
        this.context.translate(this.position.x, this.position.y); //Metodo para transaladarse
        this.context.rotate(this.rotation) //Metodo para rotar
        this.context.translate(-this.position.x, -this.position.y); //Metodo para reubicar

        //Dibujar
        this.drawHead();

        //Restaurar al contexto del estado anterior
        this.context.restore();
    }
    //metodo update para ir actualizando el movimiento, si colisiona o si tiene que dibujarse cuerpo
    update(){
        if(this.isDeath){
            this.transparency -= 0.02;
            if(this.transparency <= 0){
                play = false;
                menu.style.display = "flex";
            }
        }
        this.drawBody();
        this.draw();
        if(this.keys.A && this.keys.enable){
            this.rotation -= 0.04;
        }
        if(this.keys.D && this.keys.enable){
            this.rotation += 0.04;
        }
        this.position.x += Math.cos(this.rotation)*this.velocity;
        this.position.y += Math.sin(this.rotation)*this.velocity;
        
    this.collision();
    }
    //Metodo para detectar si hay alguna colision
    collision(){
        if(this.position.x-this.radio <= 0 ||
            this.position.x-this.radio >= canvas.width ||
            this.position.y-this.radio <= 0 ||
            this.position.y-this.radio >= canvas.height){
            
            this.death();
        }
    }
    //morision
    death(){
        this.velocity = 0;
        this.keys.enable = false;
        this.isDeath = true;
        this.body.forEach((b) => {
            let lastItem = b.path[b.path.length-1];
            for(let i=0; i<b.path.length; i++){
                b.path[i] = lastItem;
                b.transparency = this.transparency
            }
        });
    }
    drawCharacter(){
        for(let i=1; i<=this.length; i++){
            this.drawCircle(
                this.position.x - (this.pathLength*this.velocity*i),
                this.position.y, this.radio, this.color, this.color
            );
        }
        this.drawHead();
    }
    //Metodo para saber que tecla pulsa o no se pulsa
    keyboard(){
        document.addEventListener("keydown",(e) => {
            if(e.key == "a" || e.key == "A"){
                this.keys.A = true;
            }
            if(e.key == "d" || e.key == "D"){
                this.keys.D = true;
            }
        })
        document.addEventListener("keyup",(e) => {
            if(e.key == "a" || e.key == "A"){
                this.keys.A = false;
            }
            if(e.key == "d" || e.key == "D"){
                this.keys.D = false;
            }
        })
    }
}

/**CREANDO LAS COSILLAS CHULAS!! */
const snake = new Snake({x:200, y:200}, 11,"#FEBA39", 1.5, 3, 12,ctx);
snake.initBody();
const snakeP1 = new Snake({x:165, y:40}, 11,"#FEBA39", 1.5, 8, 12,ctx2);
snakeP1.initBody();
snakeP1.drawCharacter();
const snakeP2 = new Snake({x:165, y:40}, 11,"#88FC03", 1.5, 24, 4,ctx3);
snakeP2.initBody();
snakeP2.drawCharacter();
const apple = new Apple({x:300, y:300}, 8, "red", ctx);


canvas2.addEventListener("click", () => {
    init(3,12,"#FEBA39")
})
canvas3.addEventListener("click", () => {
    init(8,4,"#88FC03")
})
/** AQUI VAMOS A PASAR LOS VALORES DE LA SERPIENTE ESCOGIDA */
function init(length, pathLength, color){
    snake.body.length = 0;
    snake.color = color;
    snake.length = length;
    snake.pathLength = pathLength;
    snake.position = {x:200, y:200};
    snake.isDeath = false;
    snake.velocity = 1.5;
    snake.transparency = 1;
    snake.initBody();
    snake.keys.enable = true;
    play = true;
    menu.style.display = "none";
    scoreP = 0;
    score.textContent = scoreP;
}
/** ESTO CREA EL BACKGROUND */
function background(){
    ctx.fillStyle = "#1B1C30"; //Da el color
    ctx.fillRect(0,0,canvas.width,canvas.height); //Los primeros dos valores osn la posicion y los otros dos valores son el tamañoa lo ancho y alto

    //Crear los cuadraditos
    for(let i=0; i<canvas.height; i+=80){
        for (let j = 0; j<canvas.width; j+=80) {
            ctx.fillStyle = "#23253C";
            ctx.fillRect(j+10, i+10, 70, 70);
        }
    }
}

function update(){
    background();
    if(play){
        snake.update();
        apple.draw();
        apple.collision(snake);
    }
    requestAnimationFrame(update);
}
update();


