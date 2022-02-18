"use strict";

let program;
let canvas;
let gl;

let currentScale = [1.0, 1.0];//scale of the emoji

const yellowColor = [0.929, 0.843, 0.239];
const brownColor = [0.231, 0.215, 0.090];
const whiteColor = [0.835, 0.878, 0.917];//colors of the mask


let startSpinning = false; //shape is spinning or not
let spinSpeed = 1; // speed of spin
let direction = true; // change direction, default counter clockwise

let startScaling = false;//shape is scaling or not
let scalingUp = true; // shape scales up
let scalingDown = false; // shape scales down

let theta = 0.0; //theta for spinning

let startSpiral;//shape makes spiral moving or not
let spiralSpeed = 1; // speed of spiral

let i = 0;

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


    //gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    gl.clearColor(0.0, 0.0, 1.0, 1.0);
    //gl.clear(gl.COLOR_BUFFER_BIT);



    const leftEye = [];
    const rightEye = [];
    const face = [];

    //x = r * cos(Q) y = r * sin(Q)
    for (let i = 0; i < 100; i++){

        const xPos = Math.cos(i * 2 * Math.PI / 100);
        const yPos = Math.sin(i * 2 * Math.PI / 100);

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
    for(let x = 0; x <= 1; x = x + 0.1){

        const upperPos = calculateBezierCurvePosition(upperCurveP0, upperCurveP1, upperCurveP2, x);
        Mask.push(upperPos.xPos);
        Mask.push(upperPos.yPos);

    }
    //lower curve
    for(let z = 1; z >= 0; z = z - 0.1){

        const lowerPos = calculateBezierCurvePosition(lowerCurveP0, lowerCurveP1, lowerCurveP2, z);
        Mask.push(lowerPos.xPos);
        Mask.push(lowerPos.yPos);
    }
    draw(Mask, whiteColor);
    //draw main middle part of mask

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

    for(let t = 0; t <= 1; t = t + 0.1){

        const topLeftPos = calculateBezierCurvePosition([upperCurveP0[0] - 0.088, upperCurveP0[1] + 0.03], [-0.263, upperCurveP0[1] + 0.015], [upperCurveP0[0] - 0.088, upperCurveP0[1]], t);
        topLeftCurve.push(topLeftPos.xPos);
        topLeftCurve.push(topLeftPos.yPos);

        const topRightPos = calculateBezierCurvePosition([upperCurveP2[0] + 0.088, upperCurveP2[1] + 0.03], [0.263, upperCurveP2[1] + 0.015], [upperCurveP2[0] + 0.088, upperCurveP2[1]], t);
        topRightCurve.push(topRightPos.xPos);
        topRightCurve.push(topRightPos.yPos);

        const downLeftPos = calculateBezierCurvePosition([lowerCurveP0[0] - 0.009, lowerCurveP0[1] - 0.005], [-0.19, lowerCurveP0[1] - 0.002], [lowerCurveP0[0] - 0.025, lowerCurveP0[1] + 0.01], t);
        downLeftCurve.push(downLeftPos.xPos);
        downLeftCurve.push(downLeftPos.yPos);

        const downRightPos = calculateBezierCurvePosition([lowerCurveP2[0] + 0.009, lowerCurveP2[1] - 0.005], [0.19, lowerCurveP2[1] - 0.002], [lowerCurveP2[0] + 0.025, lowerCurveP2[1] + 0.01], t);
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



    if(startSpinning && spinSpeed != 0){//if shape is spinning and its speed is not 0

        //if it is rotating counter clockwise then theta is positive, otherwise negative.
        theta += ((direction ? 0.001 : -0.001) * Math.abs(spinSpeed));//if it is moving counter clockwise then 0.1, otherwise, -0.1
    }

    if(startScaling){//if shape is scaling
        if(scalingUp){//if the shape is growing
            currentScale[0] += 0.0005;
            currentScale[1] += 0.0005;
            if(currentScale[0] >= 1.5){//the size of the shape will be at most 1.5
                scalingUp = false;
                scalingDown= true;
            }
        }
        else if(scalingDown){//if the shape is smalling
            currentScale[0] -= 0.0005;
            currentScale[1] -= 0.0005;
            if(currentScale[0] <= 0.5){//the size of the shape will not be smaller than 0.5
                scalingUp = true;
                scalingDown= false;
            }
        }
    }

    if(startSpiral) {//if the shape is making spiral moving

        if (i >= 0 && i <= 128) {

            let angle = -i * 0.1;
            let x, y;
            let radius;

            if (i > 64) {//second spiral
                radius = Math.sqrt((128 - i)) * 0.05;

            }
            else {//first spiral
                radius = Math.sqrt(i) * 0.05;

            }
            x = radius * Math.cos(angle);//new x position
            y = radius * Math.sin(angle);//new y position

            i = i + (0.1 * (spiralSpeed * 0.1));
            let translateLocation = gl.getUniformLocation(program, "translate");
            gl.uniform2fv(translateLocation, [x,y]);// new position

        }
        else {
            if (spiralSpeed >= 0)//if speed is moving then it wil be start from begin
                i = 0
            else //otherwise it will start end
                i = 128;
        }


    }

    const scalingFactor = gl.getUniformLocation(program, "uScalingFactor");//scaling
    gl.uniform2fv(scalingFactor, currentScale);

    const colorUniformLocation = gl.getUniformLocation(program, "a_color");//change color
    gl.uniform4f(colorUniformLocation, colors[0], colors[1], colors[2], 1);


    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);//position
    const vertexPosition = gl.getAttribLocation(program, "aVertexPosition");

    gl.enableVertexAttribArray(vertexPosition);
    gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);

    const thetaLoc = gl.getUniformLocation( program, "theta" );//for spin
    gl.uniform1f( thetaLoc, theta );

    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertexCount);


    window.requestAnimationFrame(function () {

        drawShape(positionBuffer, vertexCount, colors);
    });


}


    document.getElementById("StartSpin").onclick = function () {//spin
        startSpinning = true;
    };
    document.getElementById("StopSpin").onclick = function () {//not spin
        startSpinning = false;
    };
    document.getElementById("spinSpeed").onclick = function () {//speed of spin
        spinSpeed = document.getElementById("spinSpeed").value;
        direction = spinSpeed > 0;
    };
    document.getElementById("StartScale").onclick = function () {//scale
        startScaling = true;
    };
    document.getElementById("StopScale").onclick = function () {//not scale
        startScaling = false;
    };
    document.getElementById("StartSpiral").onclick = function () {//make spiral
        startSpiral = true;
    };
    document.getElementById("StopSpiral").onclick = function () {//dont make spiral
        if(!startSpiral)
            return;
        startSpiral = false;
    };
    document.getElementById("spiralSpeed").onclick = function () {//speed of spiral
        spiralSpeed = document.getElementById("spiralSpeed").value;
    };

