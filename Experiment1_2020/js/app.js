"use strict";

var program;
var canvas;
var gl;

main();

function main() {

    canvas = document.querySelector("#glCanvas");
    gl = canvas.getContext("webgl2");

    // Only continue if WebGL is available and working
    if(!gl) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    gl.clearColor(1.0,1.0,1.0,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    program = initShaderProgram(gl, vsSource, fsSource); //init program


    const yellowColor = [1.0, 1.0, 0.0];
    const brownColor = [0.35, 0, 0];
    const whiteColor = [1.0, 1.0, 1.0];//color of the mask


    const leftEye = [];
    const rightEye = [];
    const face = [];

    //x = r * cos(Q) y = r * sin(Q)
    for (var i = 0; i < 100; i++){
        /*formula
         * x = (Math.cos(i * 2 * Math.PI/degree) * r + x pos of center of circle
         * y = (Math.sin(i * 2 * Math.PI/degree) * r + xy pos of center of circle
         */
        var xPos = Math.cos(i * 2 * Math.PI/100);
        var yPos = Math.sin(i * 2 * Math.PI/100);

        leftEye.push(xPos / 8 - 0.32);
        leftEye.push(yPos / 8 + 0.3);

        rightEye.push(xPos / 8 + 0.32);
        rightEye.push(yPos / 8 + 0.3);

        face.push(xPos / 1.2); // x coordinate
        face.push(yPos / 1.2); // y coordinate


    }
    drawCircle(face,yellowColor);
    drawCircle(leftEye,brownColor);
    drawCircle(rightEye,brownColor);


    //bezier curve points
    const upperCurveP0 = [-0.5,0];
    const upperCurveP1 = [0,0.3]; //to upper part of mask
    const upperCurveP2 = [0.5,0];

    const lowerCurveP0 = [-0.5,-0.6];
    const lowerCurveP1 = [0,-0.8]; //to lower curve part of mask
    const lowerCurveP2 = [0.5,-0.6];

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
    drawBezierCurves(Mask, whiteColor);//draw main middle part of mask

    //draw quad parts of ropes of mask
    const topLeftMask = [upperCurveP0[0], upperCurveP0[1], upperCurveP0[0], upperCurveP0[1]-0.1, -0.827, upperCurveP0[1]+0.1, -0.833, upperCurveP0[1]];

    const topRightMask = [upperCurveP2[0], upperCurveP2[1], upperCurveP2[0], upperCurveP2[1]-0.1, 0.827, upperCurveP2[1]+0.1, 0.833, upperCurveP2[1]];

    const downLeftMask = [lowerCurveP0[0], lowerCurveP0[1], lowerCurveP0[0], lowerCurveP0[1] + 0.1, -0.546 , lowerCurveP0[1] - 0.032, -0.6, lowerCurveP0[1]+0.02];

    const downRightMask = [lowerCurveP2[0], lowerCurveP2[1], lowerCurveP2[0], lowerCurveP2[1] + 0.1, 0.546, lowerCurveP2[1] - 0.032, 0.6, lowerCurveP2[1] +0.02];
    drawQuad(topLeftMask, whiteColor);
    drawQuad(topRightMask, whiteColor);
    drawQuad(downLeftMask, whiteColor);
    drawQuad(downRightMask, whiteColor);


    //bezier curves of ropes of mask
    const topLeftCurve = [];
    const topRightCurve = [];
    const downLeftCurve =[];
    const downRightCurve =[];

    for(var t = 0;t <= 1; t = t + 0.1){

        var topLeftPos = calculateBezierCurvePosition([-0.827, upperCurveP0[1]+0.1], [-0.837, upperCurveP0[1] + 0.05], [-0.833, upperCurveP0[1]], t)
        topLeftCurve.push(topLeftPos.xPos);
        topLeftCurve.push(topLeftPos.yPos);

        var topRightPos = calculateBezierCurvePosition([0.827, upperCurveP2[1]+0.1], [0.837, upperCurveP2[1] + 0.05], [0.833, upperCurveP2[1]], t)
        topRightCurve.push(topRightPos.xPos);
        topRightCurve.push(topRightPos.yPos);

        var downLeftPos = calculateBezierCurvePosition([-0.54 , lowerCurveP0[1] - 0.032], [-0.56, lowerCurveP0[1]-0.017], [-0.6, lowerCurveP0[1]+0.02], t)
        downLeftCurve.push(downLeftPos.xPos);
        downLeftCurve.push(downLeftPos.yPos);

        var downRightPos = calculateBezierCurvePosition([0.54 , lowerCurveP2[1] - 0.032], [0.56, lowerCurveP2[1]-0.017], [0.6, lowerCurveP2[1]+0.02], t)
        downRightCurve.push(downRightPos.xPos);
        downRightCurve.push(downRightPos.yPos);

    }
    //for bezier curve of lines
    drawBezierCurves(topLeftCurve, whiteColor);

    drawBezierCurves(topRightCurve, whiteColor);

    drawBezierCurves(downLeftCurve, whiteColor);
    drawBezierCurves(downRightCurve, whiteColor);
}


function draw(positions, colors){

    const positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(positions),
        gl.STATIC_DRAW);

    const vertexCount = positions.length / 2;

    gl.useProgram(program);
    //set pos of shape
    gl.enableVertexAttribArray(gl.getAttribLocation(program, "a_position"));
    gl.vertexAttribPointer(gl.getAttribLocation(program, "a_position"), 2, gl.FLOAT, false, 0, 0);

    //set color of shape
    var colorUniformLocation = gl.getUniformLocation(program, "a_color");
    gl.uniform4f(colorUniformLocation, colors[0], colors[1], colors[2], 1);

    return vertexCount;
}

function drawCircle(positions, colors){

    var vertexCount = draw(positions, colors);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertexCount);
}

function drawQuad(positions, colors){

    var vertexCount = draw(positions, colors);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexCount);
}

function drawBezierCurves(positions, colors){
    var vertexCount = draw(positions, colors);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertexCount);
}

function calculateBezierCurvePosition(P0, P1, P2, t){ //to calculate bezier formula
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