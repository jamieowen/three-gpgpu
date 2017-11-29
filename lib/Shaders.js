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
        varying vec2 vUv;
        
        void main(){
                            
            vec4 prev = texture2D( previousState,vUv );
            gl_FragColor = vec4( prev.xyz, 1.0 );
            
            // gl_FragColor.xyz = prev.xyz;
            // gl_FragColor.a = 1.0;
            // gl_FragColor.x = vUv.x;
            // gl_FragColor.y = vUv.y;
            
            // gl_FragColor.b = step( vUv.x, 0.5 );
            
            // float val = gl_FragCoord.x / 256.0;
            // gl_FragColor = vec4( val,val,val, 1.0 );
            
        }
    `
}