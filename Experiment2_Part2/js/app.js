"use strict";

var program;
var canvas;
var gl;


let currentRotation = [0, 1];//rotation of shape in x and y
let currentScale = [1.0, 1.0];//scale of the emoji
let currentAngle; // current angle of emoji


//Timing for set angles according to time
let previousTime = 0.0;

//to set rotational speed of shape
let degreesPerSecond = 45;

//when pressed 2
var press2 = false;
let firstpress = false;

// when pressed 1
var press1 = false;

//when pressed 3
var press3 = false;

let leftQuarter = true; //moving in left quarter
let rightQuarter = false; //moving in right quarter


const yellowColor = [0.929, 0.843, 0.239];
const brownColor = [0.231, 0.215, 0.090];
const whiteColor = [0.835, 0.878, 0.917];//colors of the mask

main();

function main() {

    canvas = document.querySelector("#glCanvas");
    gl = canvas.getContext("webgl2");

    // Only continue if WebGL is available and working
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }


    program = initShaderProgram(gl, vsSource, fsSource); //init program
    gl.useProgram(program);


    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);


    const leftEye = [];
    const rightEye = [];
    const face = [];

    currentAngle = 0.0;
    //x = r * cos(Q) y = r * sin(Q)
    for (var i = 0; i < 100; i++){
        /*formula
         * x = (Math.cos(i * 2 * Math.PI/degree) * r + x pos of center of circle
         * y = (Math.sin(i * 2 * Math.PI/degree) * r + xy pos of center of circle
         */
        var xPos = Math.cos(i * 2 * Math.PI/100);
        var yPos = Math.sin(i * 2 * Math.PI/100);

        leftEye.push(xPos * 0.044 - 0.1);
        leftEye.push(yPos * 0.044 + 0.08);

        rightEye.push(xPos * 0.044 + 0.1);
        rightEye.push(yPos * 0.044 + 0.08);

        face.push(xPos * 0.26); // x coordinate
        face.push(yPos * 0.26); // y coordinate


    }

    draw(face,yellowColor);//draw face

    // draw eyes
    draw(leftEye,brownColor);
    draw(rightEye,brownColor);


    //bezier curve points
    const upperCurveP0 = [-0.17,-0.02];
    const upperCurveP1 = [0,0.08]; //to upper part of mask
    const upperCurveP2 = [0.17,-0.02];

    const lowerCurveP0 = [-0.17,-0.18];
    const lowerCurveP1 = [0,-0.25]; //to lower curve part of mask
    const lowerCurveP2 = [0.17,-0.18];

    const Mask = [];

    //main part of mask

    //upper curve
    for(var x = 0;x <= 1; x = x + 0.1){

        var upperPos = calculateBezierCurvePosition(upperCurveP0, upperCurveP1, upperCurveP2, x)
        Mask.push(upperPos.xPos);
        Mask.push(upperPos.yPos);

    }
    //lower curve
    for(var z = 1;z >= 0; z = z - 0.1){

        var lowerPos = calculateBezierCurvePosition(lowerCurveP0, lowerCurveP1, lowerCurveP2, z)
        Mask.push(lowerPos.xPos);
        Mask.push(lowerPos.yPos);
    }
    draw(Mask, whiteColor);
    //draw main middle part of mask*/

    //draw quad parts of ropes of mask
    const topLeftMask = [upperCurveP0[0], upperCurveP0[1], upperCurveP0[0], upperCurveP0[1]-0.03, upperCurveP0[0]-0.0896, upperCurveP0[1] ,upperCurveP0[0]-0.09, upperCurveP0[1]+0.03];

    const topRightMask = [upperCurveP2[0], upperCurveP2[1], upperCurveP2[0], upperCurveP2[1]-0.03, upperCurveP2[0]+0.0896, upperCurveP2[1], upperCurveP2[0]+0.09, upperCurveP2[1]+0.03];

    const downLeftMask = [lowerCurveP0[0], lowerCurveP0[1], lowerCurveP0[0], lowerCurveP0[1] + 0.03, lowerCurveP0[0]-0.027, lowerCurveP0[1]+0.01, lowerCurveP0[0]-0.013 , lowerCurveP0[1]-0.005];

    const downRightMask = [lowerCurveP2[0], lowerCurveP2[1], lowerCurveP2[0], lowerCurveP2[1] + 0.03, lowerCurveP2[0]+0.027, lowerCurveP2[1] +0.01, lowerCurveP2[0]+0.013, lowerCurveP2[1] - 0.005];

    draw(topLeftMask, whiteColor);
    draw(topRightMask, whiteColor);
    draw(downLeftMask, whiteColor);
    draw(downRightMask, whiteColor);


    //bezier curves of ropes of mask
    const topLeftCurve = [];
    const topRightCurve = [];
    const downLeftCurve =[];
    const downRightCurve =[];

    for(var t = 0;t <= 1; t = t + 0.1){

        var topLeftPos = calculateBezierCurvePosition([upperCurveP0[0]-0.088, upperCurveP0[1]+0.03], [-0.263, upperCurveP0[1] + 0.015], [upperCurveP0[0]-0.088, upperCurveP0[1]], t)
        topLeftCurve.push(topLeftPos.xPos);
        topLeftCurve.push(topLeftPos.yPos);

        var topRightPos = calculateBezierCurvePosition([upperCurveP2[0]+0.088, upperCurveP2[1]+0.03], [0.263, upperCurveP2[1] + 0.015], [upperCurveP2[0]+0.088, upperCurveP2[1]], t)
        topRightCurve.push(topRightPos.xPos);
        topRightCurve.push(topRightPos.yPos);

        var downLeftPos = calculateBezierCurvePosition([lowerCurveP0[0]-0.009 , lowerCurveP0[1]-0.005], [-0.19, lowerCurveP0[1]-0.002], [lowerCurveP0[0]-0.025, lowerCurveP0[1]+0.01], t)
        downLeftCurve.push(downLeftPos.xPos);
        downLeftCurve.push(downLeftPos.yPos);

        var downRightPos = calculateBezierCurvePosition([lowerCurveP2[0]+0.009 , lowerCurveP2[1] - 0.005], [0.19, lowerCurveP2[1]-0.002], [lowerCurveP2[0]+0.025, lowerCurveP2[1]+0.01], t)
        downRightCurve.push(downRightPos.xPos);
        downRightCurve.push(downRightPos.yPos);

    }
    //for bezier curve of ropes of mask
    draw(topLeftCurve, whiteColor);

    draw(topRightCurve, whiteColor);

    draw(downLeftCurve, whiteColor);
    draw(downRightCurve, whiteColor);
}



function calculateBezierCurvePosition(P0, P1, P2, t){ //formula to calculate points on bezier curve
    /*formula
         * x = (1 - t)*(1 - t)*P0x + 2*(1 - t)*t*P1x + t*t*P2x;
         * y = (1 - t)*(1 - t)*P0y + 2*(1 - t)*t*P1y + t*t*P2y;
         */
    const x = Math.pow((1-t), 2)*P0[0] + 2*(1 - t)*t*P1[0] + Math.pow(t, 2)*P2[0];
    const y = Math.pow((1-t), 2)*P0[1] + 2*(1 - t)*t*P1[1] + Math.pow(t, 2)*P2[1];
    return {
        xPos: x,
        yPos: y
    };
}

//init buffers
function draw(positions, colors) {

    const positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(positions),
        gl.STATIC_DRAW);

    const vertexCount = positions.length / 2;

    drawShape(positionBuffer, vertexCount, colors);//draw shape
}

//draw Shapes
function drawShape(positionBuffer, vertexCount, colors) {

    let radians;

    radians = (currentAngle * Math.PI / 180.0);

    if (currentAngle > 45) {//If you current angle is greater than 45, then emoji start change other direction
        leftQuarter = !leftQuarter;
        rightQuarter = !rightQuarter;
        currentAngle = currentAngle - 90;
    }

    if (leftQuarter) {//if the emoji is moving in left quarter
        if (currentAngle > 45) {//If you current angle is greater than 45, then angle will be negative
            radians = ((-90 + currentAngle) * Math.PI / 180.0);
        } else {
            radians = -(currentAngle * Math.PI / 180.0);//the emoji turns counter clockwise direction
        }
    } else if (rightQuarter) {
        if (currentAngle > 45) {//If you current angle is greater than 45, then angle will be negative
            radians = ((90 - currentAngle) * Math.PI / 180.0);
        } else {
            radians = (currentAngle * Math.PI / 180.0);//the emoji turns clockwise direction
        }
    }

    currentRotation[0] = Math.sin(radians);//rotation in x
    currentRotation[1] = Math.cos(radians);//rotation in y


    var scalingFactor =
        gl.getUniformLocation(program, "uScalingFactor");
    var rotationVector =
        gl.getUniformLocation(program, "uRotationVector");

    gl.uniform2fv(scalingFactor, currentScale);
    gl.uniform2fv(rotationVector, currentRotation);


    var colorUniformLocation = gl.getUniformLocation(program, "a_color");

    if (press3) {//if you press 3, then change color
        var newColors = changeColor(colors);
        gl.uniform4f(colorUniformLocation, colors[0], newColors.green, newColors.blue, 1);//set new colors according to angle

    }
    else{//otherwise dont change color
        gl.uniform4f(colorUniformLocation, colors[0], colors[1], colors[2], 1);
    }


    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var vertexPosition =
        gl.getAttribLocation(program, "aVertexPosition");

    gl.enableVertexAttribArray(vertexPosition);
    gl.vertexAttribPointer(vertexPosition, 2,
        gl.FLOAT, false, 0, 0);


    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertexCount);


    window.requestAnimationFrame(function (currentTime) {
        if(press2 || press3) {
            let deltaAngle = ((currentTime - previousTime) / 1000.0) * degreesPerSecond;//calculate dela angle according to time then add current angle
            currentAngle = (currentAngle + deltaAngle) % 360;
            previousTime = currentTime;
        }
        if(press1 || firstpress) {//when press 1, current angle will be 0, dont move

            //if you press 2, it will be start move left
            leftQuarter= true;
            rightQuarter = false;
            currentAngle = 0;
            firstpress = false;
        }

        drawShape(positionBuffer, vertexCount, colors);
    });

}

function keyEvent(){
    var name = event.key;

    if(name == 1){//when pressed 1
        press1 = true;
        press2 = false;
        press3 = false;
    }
    else if(name == 2){//when pressed 2
        press1 = false;
        press2 = true;
        press3 = false;
        firstpress = true;
    }
    else if(name == 3){//when pressed 3
        if(press3)//if you have already pressed 3, dont need it
            return;
        if(!press2){//you can't press 3, without press 2
            firstpress = true;
        }
        press1 = false;
        press2 = false;
        press3 = true;
    }
}

function changeColor(colors){// change color
    var newGreen;
    var newBlue;
    if(yellowColor[0] == colors[0] && yellowColor[1] == yellowColor[1] && yellowColor[2] == colors[2]){// if the shape is face


        var angle  = Math.atan2(currentRotation[0], currentRotation[1]) * 180 / Math.PI;
        newGreen = colors[1] - ( Math.abs(currentAngle) / 240);// new green color according to current angle
        newBlue = colors[2] -  ( Math.abs(currentAngle) / 1200);// new blue color according to current angle
    }

    else if(brownColor[0] == colors[0] && brownColor[1] == colors[1] && brownColor[2] == colors[2]){//if the shape is eye

        newGreen = colors[1] - ( Math.abs(currentAngle) / 900);// new green color according to current angle
        newBlue = colors[2] -  ( Math.abs(currentAngle) / 2400);// new blue color according to current angle
    }
    else{//dont change color

        newGreen = colors[1];
        newBlue = colors[2];
    }

    return {
        green: newGreen,
        blue: newBlue
    };
}

window.addEventListener('keypress', keyEvent);
