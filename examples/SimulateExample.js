
import ExampleBase from './ExampleBase';
import {
    Mesh,
    MeshBasicMaterial,
    BoxBufferGeometry  
} from 'three';

import Simulate from '../Simulate';

class BasicExample extends ExampleBase{

    constructor(){

        super();

    }

    setup(){

        const mesh = new Mesh( 
            new BoxBufferGeometry(1,1,1,1,1,1),
            new MeshBasicMaterial({
                color:0xff0000
            })            
        )
        this.scene.add( mesh );

        this.simulate = new Simulate({
            textureWidth: 256,
            numObjects: 1000,
            attributes: [
                {
                    name: 'position',
                    size: 3,
                    initialState: ( vec,i )=>{

                        vec.x = -10.0;
                        vec.y = Math.random() * 20 - 10;
                        vec.z = Math.random() * 20 - 10;

                    }
                },
                {
                    name: 'color',
                    size: 3,
                    initialState: ( vec, i )=>{

                        vec.x = 1.0;
                        vec.y = 0.0;
                        vec.z = 1.0;

                    }
                }
            ],

            uniforms: {

                resolution: {
                }

            },

            shader: {

                functions: `
                vec3 accumulateModel( vec3 position ){

                    return vec3( 0.0,1.0,0.0 );
                    
                }
                `,
                update: `
                
                Simulate update( Simulate state ){

                    vec3 position = state.position;
                    vec3 color = state.color;
                    float life = state.props.x;
                    float age = state.props.y;

                    vec3 force = accumulateModel( position );

                    state.position += force;
                    state.color *= life / age;

                    return state;
                    
                }
                `
            }

        });

    }

    update(){


    }


}

export default new BasicExample();