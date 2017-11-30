export default {
        
    quadVertexShader:`
        precision highp float;
            
        uniform mat4 projectionMatrix;
        uniform mat4 modelViewMatrix;
        
        attribute vec3 position;
        varying vec2 vUv;
        
        void main(){
            
            vUv = position.xy + 0.5;   
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position,1.0 );
            
        }
    `,
    
    triangleVertexShader:`
        precision highp float;
        attribute vec3 position;
        varying vec2 vUv;

        void main(){           
            
            vUv = 0.5 * ( position.xy+1.0 );
            gl_Position = vec4( position,1.0 );            

        }
    `,
    
    defaultUpdateStateFragment:`    
        precision mediump float;
        
        uniform sampler2D previousState;
        uniform vec4 textureSize; // (x,y,z,w ) ( texture-width,texture-height,texel-width,texel-height )
        
        varying vec2 vUv;
        
        void main(){
                            
            vec4 prev = texture2D( previousState,vUv );
            gl_FragColor = vec4( prev.xyz, 1.0 );
            
        }
    `
}