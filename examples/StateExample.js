
import ExampleBase from './ExampleBase';
import {
    Mesh,
    MeshBasicMaterial,
    BoxBufferGeometry  
} from 'three';

import State from '../State';

class StateExample extends ExampleBase{

    constructor(){

        super();

    }   
    
    setup(){
        
        this.state1 = new State({
            renderMode: 'triangle',
            uniforms: {
            },
            initialState: ( vec, i,x,y )=>{
                
                vec.x = Math.random();
                vec.y = x / 255.0;
                vec.z = y / 255.0;
                vec.w = 1.0;
                                
            },
            updateShader: `
            
                precision mediump float;
                
                uniform sampler2D previousState;
                uniform vec2 textureSize;
                uniform vec4 texelSize;
                
                varying vec2 vUv;
                
                highp float rand(vec2 co)
                {
                    highp float a = 12.9898;
                    highp float b = 78.233;
                    highp float c = 43758.5453;
                    highp float dt= dot(co.xy ,vec2(a,b));
                    highp float sn= mod(dt,3.14);
                    return fract(sin(sn) * c);
                }
                
                void main(){
                                    
                    vec4 prev = texture2D( previousState,vUv );
                    float r = 1.0  - ( rand( vUv ) * 0.02 );                    
                    gl_FragColor = vec4( prev.xyz * 0.98 * r, 1.0 );
                    
                } 
                           
            `
        });       
        
        this.state2 = new State({
            renderMode: 'quad',
            uniforms: {
            },            
            initialState: ( vec, i,x,y )=>{
                
                vec.x = Math.random();
                vec.y = x / 255.0;
                vec.z = y / 255.0;
                vec.w = 1.0;
                                
            }
        });              
        
        this.previewTexture( this.state1.getCurrent() );
        this.previewTexture( this.state2.getCurrent() );
        
        this.addUI();

    }
    
    

    update(){
        
        this.state1.render( this.renderer );
        this.state2.render( this.renderer );
            
        this.orthoScene.children[0].material.map = this.state1.getCurrent();
        this.orthoScene.children[1].material.map = this.state2.getCurrent();

    }
    
    addUI(){
       
        const ui = document.createElement( 'div' );
        ui.innerHTML = `
        <style>
            section{
                position: absolute;
                top: 0px; right: 0px;
                margin: 10px;            
            }
            </style>
            <section>
                <button id="resetButton">Reset Initial State</button>
                <button id="regenButton">Regenerate Initial Data</button>
            </section>
        `;        
        document.body.appendChild( ui );
        document.getElementById( 'resetButton' ).onclick = ()=>{
            
            this.state1.reset();
            this.state2.reset();
            
        }
        
        document.getElementById( 'regenButton' ).onclick = ()=>{
            
            this.state1.setInitialState( this.state1.opts.initialState );
            this.state2.setInitialState( this.state2.opts.initialState );
            this.state1.reset();
            this.state2.reset();
            
        }        
                
    }


}

export default new StateExample();