const vs = `#version 300 es

    in vec4 a_position;

    uniform vec3 a_color;

    out vec3 color;
    uniform mat4 projectionMatrix , modelViewMatrix;


    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * a_position;
      color = a_color;
    }
  `;

const fs = `#version 300 es
  precision mediump float;

    in vec3 color;
    out vec4 outColor;

    void main() {
      outColor = vec4(color, 1.0);
    }
  `;

