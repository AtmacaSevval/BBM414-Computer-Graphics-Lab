let vertices = [];

let program;
let gl;
let canvas;


let theta = 0;
let rotateYSpeed = 0.5; //speed of rotate

let eyeX = 0;// x position of eye
let eyeY = 0;// y position of eye
let eyeZ = 3;// y position of eye

const at = [0.0, 0.0, 100]; //at value of lookAt function
const up = [0.0, 1.0, 0.0]; //up value of lookAt function

let movePointer = false; // boolean. This is true, when you move the mouse. Otherwise, else.

main();


function main(){
    readObjFile();
}


function draw() {

    canvas = document.getElementById('glCanvas');
    gl = canvas.getContext("webgl2");

    pointerLock();
    mouseMovement();

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.0, 0.6, 0, 1.0); // make background green
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    program = initShaderProgram(gl, vs, fs); //init vertex and fragment shader

    gl.useProgram(program);

    let vertexBuffer = gl.createBuffer(); // create vertex Buffer

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);// save vertices array as a flat in buffer
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    const vPosition = gl.getAttribLocation(program, 'a_position');
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, gl.FALSE, Float32Array.BYTES_PER_ELEMENT * 8, 0);
    gl.enableVertexAttribArray(vPosition);


    let vColor = gl.getUniformLocation(program, "a_color");//make the color of monkey is gray
    gl.uniform3f(vColor, 0.66, 0.69, 0.63);

    var aspect = gl.canvas.width / gl.canvas.height;

    let projectionMatrix = perspective(60, aspect, 1, 200); // create projection matrix
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'projectionMatrix'), gl.FALSE, flatten(projectionMatrix));

    at[0] = eyeX;
    at[1] = eyeY;
    at[2] = eyeZ - 3;

    let modelViewMatrix = lookAt([eyeX, eyeY, eyeZ], at , up);//create modelview matrix

    theta += rotateYSpeed; // change theta angle while rotating at y-axis
    modelViewMatrix = mult(modelViewMatrix, rotateY(theta));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'modelViewMatrix'), gl.FALSE, flatten(modelViewMatrix));

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 6);//draw the shape

    requestAnimationFrame(function() {
        draw();
    });

}

function saveObjData(objArr) {

    let positionArray = [];
    let normalArray = [];


    for ( let i = 0 ; i < objArr.length ; i++ ) {
        let line = objArr[i].split(' ');//split lines
        let ch = line[0];//first word in the line

            if(ch === 'v') {//position array
                positionArray.push(parseFloat(line[1]), parseFloat(line[2]), parseFloat(line[3]));//a point with x,y and x position

            }
            else if(ch === 'vn') {//normal

                normalArray.push(parseFloat(line[1]), parseFloat(line[2]), parseFloat(line[3]));//normal of a point with x,y and x position

            }
            else if(ch === 'f') {
                let firstFace = line[1].split('//');
                let secondFace = line[2].split('//');
                let thirdFace = line[3].split('//');

                // safe positions and normals according to their face numbers
               vertices.push(positionArray[3 * parseInt(firstFace[0]) - 3], positionArray[3 * parseInt(firstFace[0]) - 2], positionArray[3 * parseInt(firstFace[0]) - 1], 1 ,
                    normalArray[3 * parseInt(firstFace[1]) - 3], normalArray[3 * parseInt(firstFace[1]) - 2], normalArray[3 * parseInt(firstFace[1]) - 1] , 1);
               vertices.push(positionArray[3 * parseInt(secondFace[0])  -3], positionArray[3 * parseInt(secondFace[0]) - 2], positionArray[3 * parseInt(secondFace[0]) - 1] ,1 ,
                    normalArray[3 * parseInt(secondFace[1]) - 3], normalArray[3 * parseInt(secondFace[1]) - 2], normalArray[3 * parseInt(secondFace[1]) - 1] ,1);
               vertices.push(positionArray[3 * parseInt(thirdFace[0]) - 3], positionArray[3 * parseInt(thirdFace[0]) - 2], positionArray[3 * parseInt(thirdFace[0]) - 1] ,1,
                    normalArray[3 * parseInt(thirdFace[1]) - 3], normalArray[3 * parseInt(thirdFace[1]) - 2], normalArray[3 * parseInt(thirdFace[1]) - 1] ,1);

            }
    }

    draw();
}



function readObjFile() {
    //save obj file as a array
    let dataArr=[];
    $.get('monkey_head.obj', function(data){
        dataArr = data.split('\n');
        saveObjData(dataArr)
    });
}



window.addEventListener('keypress', keyPressEvent);
function keyPressEvent(){

    let name = event.key;

    if(name === "p"){//if you press p then, activate mouse movement
        if (!(canvas === document.pointerLockElement || canvas === document.mozPointerLockElement || canvas === document.webkitPointerLockElement)) {
            canvas.requestPointerLock();
        } else {
            document.exitPointerLock();
        }
    }
    if(name === "+"){//increase rotate speed
        rotateYSpeed += 0.2;
    }
    else if(name === "-"){//decrease rotate speed
        rotateYSpeed -= 0.2;
    }
}


window.addEventListener('keydown', keyDownEvent);

function keyDownEvent(){

    let name = event.key;


    // change position of eye(camera) according to move
    if(name === "ArrowDown"){//camera moves in the direction of negative z
        eyeZ -= 1;
    }
    else if(name === "ArrowUp"){//camera moves in the direction of positive z
        eyeZ += 1;
    }
    else if(name === "ArrowLeft"){//camera moves in the direction of negative x
        eyeX -= 1;
    }
    else if(name === "ArrowRight"){//camera moves in the direction of positive x
        eyeX += 1;
    }
    else if(name === "PageUp"){//camera moves in the direction of positive y
        eyeY += 1;
    }
    else if(name === "PageDown"){//camera moves in the direction of negative y
        eyeY -= 1;
    }
}


function mouseMovement(){
    var value = 0.01;
    if(movePointer) {//if the mouse is moving

        if (movementx < 0) {//if the x position of mouse is negative x

           eyeY -= value * Math.abs(movementx);//change camera position according to postion of mouse
        } else if(movementx >0){//if the x position of mouse is positive x
            eyeY += value * Math.abs(movementx);
        }
        if (movementy > 0) {//if the x position of mouse is positive y
            eyeX += value * Math.abs(movementy);
        }else if(movementy < 0){//if the x position of mouse is negative y

            eyeX -= value * Math.abs(movementy);
        }
        movePointer = false;
    }
}
function changeCallBack(){ // call when pointer lock activated ,then call mouse movement
    if (canvas === document.pointerLockElement || canvas === document.mozPointerLockElement || canvas === document.webkitPointerLockElement) {
        document.addEventListener("mousemove", moveCallback, false);
    } else {
        document.removeEventListener("mousemove", moveCallback, false);
    }
}
function moveCallback(e) { // to save x and y position of mouse
    movePointer = true;
    movementx = e.movementX || e.mozMovementX  || e.webkitMovementX  || 0;
    movementy = e.movementY || e.mozMovementY  || e.webkitMovementY  || 0;
}

function pointerLock(){ //check pointer lock


    canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;

    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;

    window.addEventListener('keypress', keyPressEvent);

    document.addEventListener('pointerlockchange', changeCallBack, false);
    document.addEventListener('mozpointerlockchange', changeCallBack, false);
    document.addEventListener('webkitpointerlockchange', changeCallBack, false);

}