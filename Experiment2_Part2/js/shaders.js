/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


const vsSource = `#version 300 es
    in vec2 aVertexPosition;

    uniform vec2 uScalingFactor;
    uniform vec2 uRotationVector;
    
    uniform vec4 a_color;
    out vec4 color;
    
    void main() {
        vec2 rotatedPosition = vec2(
      (aVertexPosition.x * uRotationVector.y+
            aVertexPosition.y * uRotationVector.x),
      (aVertexPosition.y * uRotationVector.y -
            aVertexPosition.x * uRotationVector.x)
        );
        

        gl_Position = vec4(rotatedPosition * uScalingFactor, 0.0, 1.0);
        color = a_color;
     
    }
    
    
`;

const fsSource = `#version 300 es
// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision"
    precision mediump float;
    
    in vec4 color;
    out vec4 outColor;
    
    void main() {
    
       outColor = vec4(color);
    }
`;
