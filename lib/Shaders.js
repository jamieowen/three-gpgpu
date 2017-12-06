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
        uniform vec2 textureSize; // (x,y,z,w ) ( texture-width,texture-height )
        uniform vec4 texelSize; // (x,y,x2,y2 ) texel-width/height, half-texel-width/height
        varying vec2 vUv;
        
        void main(){
                            
            vec4 prev = texture2D( previousState,vUv );
            gl_FragColor = vec4( prev.xyz, 1.0 );
            
        }
    `,

    createSimulateUpdateWrapper:( attributes, updateShader )=>{

        let attConsts = '';
        let modelDecl = '';
        let readDecl = '';
        let writeDecl = '';        
        let att;

        const vMod = 1 / attributes.length;        

        attConsts += `const float vMod = ${vMod.toFixed(10)};\n`;

        for( let i = 0; i<attributes.length; i++ ){

            att = attributes[i];
            attConsts += `const float vOffset_${att.name} = ${ (vMod*i).toFixed(20) };\n`;
            modelDecl += `vec4 ${att.name};\n`;
            readDecl += `vec2 uv_${att.name} = vec2( vUv.x, mod( vUv.y, vMod ) + vOffset_${att.name} );\n`;
            readDecl += `model.${att.name} = texture2D( previousState, uv_${att.name} );\n`
            // mix in values of each sample depending on current uvY position.
            writeDecl += `write += model.${att.name} * ( step( vOffset_${att.name}, vUv.y ) - step( vOffset_${att.name} + vMod, vUv.y ) ); \n`

        }

        return `
            precision highp float;

            ${attConsts}
            uniform sampler2D previousState;
            uniform vec2 textureSize;
            uniform vec4 texelSize;
            uniform float time;

            ${updateShader.declarations}

            varying vec2 vUv;

            struct Model{
                ${modelDecl}
            };
            
            ${updateShader.updateSimulation}

            void main(){

                Model model;
                ${readDecl}
                model = updateSimulation( model );
                vec4 write = vec4(0.0,0.0,0.0,1.0);
                ${writeDecl}
                gl_FragColor = write;

                // gl_FragColor = texture2D( previousState, vUv );

            }
        
        `

    }
}