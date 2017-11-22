
import Example from './Example';
import {
    Mesh,
    MeshBasicMaterial,
    BoxBufferGeometry,
    RGBAFormat,
    RGBFormat    
} from 'three';

import Simulate from '../../Simulate';

class BasicExample extends Example{

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
            maxTextureSize: 256,
            numObjects: 256 * 256,
            textureFormat: RGBFormat,
            attributes: [
                {
                    name: 'position',
                    initialState: ( vec,i )=>{

                        vec.x = -10.0;
                        vec.y = Math.random() * 20 - 10;
                        vec.z = Math.random() * 20 - 10;

                    }
                },
                {
                    name: 'color',
                    initialState: ( vec, i )=>{

                        vec.x = 1.0;
                        vec.y = 0.0;
                        vec.z = 0.0;

                    }
                }
            ],

            uniforms: {

                resolution: {
                }

            },

            shader: {

                functions: `
                vec3 getForce( vec3 position ){

                    return 
                }
                `,
                update: `
                
                Simulate update( Simulate state ){

                    vec3 position = state.position;
                    vec3 color = state.color;
                    float life = state.props.x;
                    float age = state.props.y;

                    vec3 force = getForce( position );

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