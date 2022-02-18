

const vsSource = `#version 300 es
    in vec2 aVertexPosition;
    
    uniform vec2 translate;//translate
    uniform vec2 uScalingFactor;//scaling
    
    uniform float theta;//spin
    
    uniform vec4 a_color;
    out vec4 color;
    
    void main() {
    
        float s = sin(theta);
        float c = cos(theta);
        
        vec2 rotatedPosition = vec2(
            (-s * aVertexPosition.y + c * aVertexPosition.x),
            (s * aVertexPosition.x + c * aVertexPosition.y)
        );
        
        gl_Position = vec4((rotatedPosition * uScalingFactor), 0.0, 1.0) + vec4(translate[0], translate[1], 0 ,0) ;
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