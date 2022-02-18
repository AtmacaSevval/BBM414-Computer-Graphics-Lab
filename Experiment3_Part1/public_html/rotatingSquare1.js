"use strict";

var canvas;
var gl;

var theta = 0.0;
var thetaLoc;
var direction = true;

var delayingTime = 100;
var changeColor = false;
var colorBuffer;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    var vertices = [
        vec2(0, 0.7),
        vec2(-0.606, -0.35 ),
        vec2(0.606, -0.35 )
    ];

    var colors = setRandomColor();


    colorBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );



    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );



    thetaLoc = gl.getUniformLocation( program, "theta" );


    document.getElementById("Toggle").onclick = function () {//change direction
        direction = !direction;
    };

    document.getElementById("SpeedUp").onclick = function () {//speed up with decrease delaying time
        delayingTime /= 2.0;
    };

    document.getElementById("SlowDown").onclick = function () {//speed down with increase delaying time
        delayingTime *= 2.0;
    };

    document.getElementById("Color").onclick = function () {//bind color array
        changeColor = true;
        colors= setRandomColor();//change color randomly

        gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );


        var vColor = gl.getAttribLocation( program, "vColor" );
        gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vColor );

    };

    render();
};


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );

    theta += (direction ? 0.1 : -0.1);//if it is moving counter clockwise then 0.1, otherwise, -0.1
    gl.uniform1f( thetaLoc, theta );

    gl.drawArrays( gl.LINE_LOOP, 0, 3 );

    setTimeout(
        function (){requestAnimFrame(render);}, delayingTime
    );
}

function setRandomColor(){//set random color for each vertices
    return [
        vec3(Math.random(), Math.random(), Math.random()),
        vec3(Math.random(), Math.random(), Math.random()),
        vec3(Math.random(), Math.random(), Math.random()),
    ];
}
