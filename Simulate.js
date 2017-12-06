
import State from './State'
import Shaders from './lib/Shaders';

import {
    RawShaderMaterial,
    RGBAFormat,
    BackSide,
    Vector2,
    Vector4,
    DataTexture,
    Clock
} from 'three';

const defaultOpts = {

    width: 512,
    height: 512,

    attributes: [
        {
            name: 'position',
            size: 3, 
            initialState: ( vec,i,x,y )=>{

                vec.x = Math.random();
                vec.y = Math.random();
                vec.z = Math.random();

            }
        }        
    ],

    uniforms: {
        time: { value: 0.0 }
    },

    updateShader: {
        declarations: ``,
        updateSimulation: `
        void updateSimulation( Model sim ){
        }
        `
    }

}

export default class Simulate{

    constructor( opts ){

        opts = Object.assign( {}, defaultOpts, opts );

        this.opts = opts;
        this.attributes = opts.attributes;

        const initialStateFuncs = [];
        let att;
        
        for( let i = 0; i<this.attributes.length; i++ ){
            att = this.attributes[i];
            if( !att.size ){
                att.size = 3;
            }
            if( att.initialState ){
                initialStateFuncs[i] = att.initialState;
            }
        }
            
        if( opts.height % this.attributes.length !== 0 ){
            throw new Error( 'Texture height must be exactly divisible by the number attriutes.' );
        }

        const updateShader = Shaders.createSimulateUpdateWrapper( 
            this.attributes, opts.updateShader );

        console.log( 'Shader:', updateShader );

        const segmentY = opts.height / this.attributes.length;

        this.clock = new Clock();
        console.log( this.clock );

        this.state = new State( {

            renderMode: 'triangle',
            width: opts.width,
            height: opts.height,

            uniforms: Object.assign( opts.uniforms, { time: { value: 0.0 } } ),
            updateShader: updateShader,
            initialState: ( vec, i,x,y )=>{

                // could optimize this initialization loop most likely.
                const attInitialState = initialStateFuncs[ Math.floor( y / segmentY ) ];
                attInitialState( vec, i,x,y );                

            }

        } );

    }

    render( renderer ){

        this.state.material.uniforms.time.value = this.clock.getElapsedTime()
        this.state.render( renderer );

    }

    createGeometry(){

        
    }

    createReadUVArray(){

        const count = this.state.width * this.state.height;
        const array = new Float32Array( count * 2 );

        const texX = 1.0 / this.state.width;
        const texY = 1.0 / this.state.height;

        let u,v;
        let offset = 0;

        for( let i = 0; i<count; i++ ){

            u = i % this.state.width;
            v = Math.floor( i / this.state.width );

            array[ offset ] = u * texX;
            array[ offset + 1 ] = v * texY;

            offset+=2;

        }

        return array;

    }

}
