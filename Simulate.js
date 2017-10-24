
import aBigTriangle from '../geometry/aBigTriangle';
import State from './State'

import {
    RawShaderMaterial,
    RGBAFormat,
    BackSide,
    Vector2,
    Vector4,
    DataTexture
} from 'three';

const defaultOpts = {

    maxTextureSize: 1024,
    textureFormat: RGBAFormat, // All attributes will have this size.
    numObjects: 1024,

    attributes: [
        {

            // Example.

            name: 'position',
            initialState: ( vec,i )=>{

                vec.x = Math.random();
                vec.y = Math.random();
                vec.z = Math.random();
                vec.w = 1.0;

            }
        }
    ],

    uniforms: {

        // Required

        resolution: { type: 'v2', value: null },
        previousState: { type: 't', value: null }

    },

    updateShader: `

        precision highp float;

        varying vec2 vUv;
        uniform sampler2D previousState;

        void main(){

            gl_FragColor = texture2D( previousState, vUv);

        }

    `

}

export default class GPGPUSimulate{

    constructor( opts ){

        opts = Object.assign( {}, defaultOpts, opts );

        this.opts = opts;
        this.attributes = opts.attributes;

        // Texture Size

        let objectRowCount = Math.ceil( opts.numObjects / opts.maxTextureSize );

        let textureWidth = opts.maxTextureSize;
        let textureHeight = this.attributes.length * objectRowCount;

        if( textureHeight > opts.maxTextureSize ){
            throw new Error( 'Texture size too small to fit data. Try increasing maxTextureSize.' );
        }

        // required uniforms.
        opts.uniforms.previousState = { type: 't', value: null };
        opts.uniforms.vSegmentSize = { value: 1.0 / this.attributes.length };

        // State Render Targets

        this.state = new State( {

            fillMode: 'square',
            width: textureWidth,
            height: textureHeight,
            format: opts.textureFormat,

            fragmentShader: opts.updateShader,
            uniforms: opts.uniforms

        } );

        // Initial State

        let size = 4; // todo : setup format support.
        let data = new Float32Array( textureWidth * textureHeight * size );
        let attribute,offset;
        let vec4 = new Vector4();

        for( let i = 0; i<this.attributes.length; i++ ){

            attribute = this.attributes[i];
            offset = i * objectRowCount * textureWidth * size;
            console.log( 'offset start', offset );

            if( attribute.initialState ){

                for( let j=0; j<opts.numObjects; j++ ){

                    vec4.set( 0,0,0,0 );
                    attribute.initialState( vec4,j );

                    data[ offset ]     = vec4.x;
                    data[ offset + 1 ] = vec4.y;
                    data[ offset + 2 ] = vec4.z;
                    data[ offset + 3 ] = vec4.w;

                    offset += 4;

                }

            }

        }

        // format, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, encoding

        let rttOpts = this.state.opts.rttOpts;
        this.initialState = new DataTexture( data, textureWidth, textureHeight,
            rttOpts.format, rttOpts.type, rttOpts.mapping,
            rttOpts.wrapS, rttOpts.wrapT,
            rttOpts.magFilter, rttOpts.minFilter
        )

        this.initialState.needsUpdate = true;
        this.renderInitialState = true;

    }

    render( renderer ){

        if( this.renderInitialState ){

            this.renderInitialState = false;
            this.state.material.uniforms.previousState.value = this.initialState;
            //this.state.render( renderer );

        }else{

            this.state.material.uniforms.previousState.value = this.state.getTexture();

        }

        this.state.render( renderer );


    }


    /**
     *
     * Create an array of uv coordinates for each object.
     * This array will be equal to the number of objects * 2.
     *
     * And if there are multiple attributes the uv will be within the
     * *first* V segment, so therefore must be offset by the V segment size
     * to access other attributes in the texture.
     *
     */
    createUVAttributeArray(){

        let count = this.opts.numObjects;
        let array = new Float32Array( count * 2 );

        let texX = 1.0 / this.state.width;
        let texY = 1.0 / this.state.height;

        let u,v;

        for( let i = 0,offset = 0; i<count; i++,offset+=2 ){

            u = i % this.state.width;
            v = Math.floor( i / this.state.width );

            array[ offset ] = u * texX;
            array[ offset + 1 ] = v * texY;

        }

        return array;

    }

}
