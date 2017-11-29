
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
            initialState: ( vec, i,x,y )=>{
                
                vec.x = Math.random();
                vec.y = x / 255.0;
                vec.z = y / 255.0;
                vec.w = 1.0;
                                
            }
        });       
        
        this.state2 = new State({
            renderMode: 'quad',
            initialState: ( vec, i,x,y )=>{
                
                vec.x = Math.random();
                vec.y = x / 255.0;
                vec.z = y / 255.0;
                vec.w = 1.0;
                                
            }
        });              
        
        this.previewTexture( this.state1.getCurrent() );
        this.previewTexture( this.state2.getCurrent() );

    }

    update(){
        
        this.state1.render( this.renderer );
        this.state2.render( this.renderer );
            
        this.orthoScene.children[0].material.map = this.state1.getCurrent();
        this.orthoScene.children[1].material.map = this.state2.getCurrent();

    }


}

export default new StateExample();