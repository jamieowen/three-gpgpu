
import Example from './Example';
import {
    Mesh,
    MeshBasicMaterial,
    BoxBufferGeometry
} from 'three';

class BasicExample extends Example{


    constructor(){

        super();

        window.onload = ()=>{
            this.init();
        }

    }

    setup(){

        console.log( "SETUP " );


    }

    update(){


    }


}

export default new BasicExample();