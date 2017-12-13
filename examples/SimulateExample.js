
import ExampleBase from './ExampleBase';
import Simulate from '../Simulate';

import {
    Vector3,
    RawShaderMaterial,
    Mesh,
    Points,
    BufferGeometry,
    BufferAttribute
} from 'three';

class SimulateExample extends ExampleBase{

    constructor(){

        super( 128 );

    }

    setup(){

        const size = 128.0;
        const r = 40.0;
        const r2 = r / 2.0;
        this.simulate = new Simulate({
            width: size,
            height: size * 4,
            attributes: [
                {
                    name: 'position',
                    size: 3,
                    initialState: ( vec,i )=>{

                        vec.x = Math.random() * r - r2;
                        vec.y = Math.random() * r - r2;
                        vec.z = Math.random() * r - r2;

                    }
                },
                {
                    name: 'velocity',
                    size: 3,
                    initialState: ( vec,i )=>{

                        vec.x = ( ( Math.random() * 0.3 ) + 0.1 ) * 1.6;
                        vec.y = 0.0;
                        vec.z = 0.0;

                    }
                },                
                {
                    name: 'color',
                    size: 3,
                    initialState: ( vec, i )=>{
                        
                        // color
                        vec.x = Math.random();
                        vec.y = 0.0;
                        vec.z = Math.random();

                    }
                },
                {
                    name: 'props',
                    size: 3,
                    initialState: ( vec, i )=>{

                        // max vel y 
                        vec.x = ( Math.random() * 0.5 ) + 0.1;
                        // cos scale
                        vec.y = Math.random() * 0.1;
                        // time scale
                        vec.z = ( Math.random() * 10.0 ) + 0.1;
                        
                    }
                }

            ],

            uniforms: {
                gravity: { value: new Vector3(0,-0.03,0) }
            },

            updateShader: {

                declarations: `        
                uniform vec3 gravity;
                `,
                updateSimulation: `
                
                Model updateSimulation( Model sim ){

                    sim.position.xyz += sim.velocity.xyz;
                    sim.position.xyz = mod( sim.position.xyz, ${r.toFixed(10)} ) - ${r2.toFixed(10)};

                    sim.velocity.y += cos( time * sim.props.z ) * sim.props.y;
                    sim.velocity.xz = vec2( cos( time ) );

                    sim.color.r = sin( time * sim.props.z );
                    sim.color.g = sin( time * sim.props.z ) * sim.props.y;
                    sim.color.b = sin( time ) + sim.props.z;
                    
                    float max = sim.props.x;
                    sim.velocity.y = clamp( sim.velocity.y, -max, max );

                    return sim;
                    
                }
                `
            }

        });

        this.previewTexture( this.simulate.state.getCurrent(), [ 1, 4 ] );
        
        const readUV = this.simulate.createReadUVArray();        
        this.geometry = new BufferGeometry();        
        this.geometry.addAttribute( 'read_uv', new BufferAttribute( readUV,2 ) );

        const temp = new Float32Array( this.simulate.numObjects * 3 );

        this.geometry.addAttribute( 'position', new BufferAttribute( temp, 3 ) );

        this.points = new Points( this.geometry,
            new RawShaderMaterial( {
                uniforms: {
                    state: { type: 't', value: null },
                    texelSize: this.simulate.state.material.uniforms.texelSize                
                },
                vertexShader: `
                    precision highp float;

                    uniform mat4 modelViewMatrix;
                    uniform mat4 projectionMatrix;                
                    uniform sampler2D state;
                    uniform vec4 texelSize;

                    attribute vec2 read_uv;

                    const float v_segment = 1.0 / 4.0;
                    const float v_position = 0.0;
                    const float v_velocity = v_segment;
                    const float v_color = v_segment * 2.0;
                    const float v_props = v_segment * 3.0;

                    varying vec3 vColor;

                    void main(){

                        vec2 read_position = vec2( read_uv.x, mod( read_uv.y, v_segment ) + v_position );//+ texelSize.zw;
                        vec2 read_color = vec2( read_uv.x, mod( read_uv.y, v_segment ) + v_color );// + texelSize.zw;
                        vec2 read_velocity = vec2( read_uv.x, mod( read_uv.y, v_segment ) + v_velocity );// + texelSize.zw;

                        vec3 position = texture2D( state, read_position ).rgb;
                        vec3 color = texture2D( state, read_color ).rgb;
                        vec3 velocity = texture2D( state, read_velocity ).rgb;
                        
                        color += length( velocity ) * 0.1;
                        vColor = color;

                        gl_PointSize = 2.5;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position,1.0 );

                    }
                `,
                fragmentShader: `
                    precision highp float;

                    varying vec3 vColor;

                    void main(){

                        gl_FragColor = vec4( vColor,1.0 );

                    }
                `
            })
        )

        this.scene.add( this.points );


    }

    update(){

        this.simulate.render( this.renderer );
        this.orthoScene.children[0].material.map = this.simulate.state.getCurrent();

        this.points.material.uniforms.state.value = this.simulate.state.getCurrent();

    }


}

export default new SimulateExample();