
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
                decay: { value: 0.3 }
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
                uniform vec4 textureSize;
                
                varying vec2 vUv;
                
                void main(){
                                    
                    vec4 prev = texture2D( previousState,vUv );
                    gl_FragColor = vec4( prev.xyz * 0.998, 1.0 );
                    
                } 
                           
            `
        });       
        
        this.state2 = new State({
            renderMode: 'quad',
            uniforms: {
                decay: { value: 0.3 }
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
            </section>
        `;        
        document.body.appendChild( ui );
        document.getElementById( 'resetButton' ).onclick = ()=>{
            
            this.state1.reset();
            this.state2.reset();
            
        }
                
    }


}

export default new StateExample();