
import {
	Mesh,
	Scene,
	PerspectiveCamera,
	PlaneBufferGeometry,
	OrthographicCamera,
	WebGLRenderTarget,
	ClampToEdgeWrapping,
	NearestFilter,
	DefaultMapping,
	FloatType,
	RGBFormat,
	RawShaderMaterial,
	BackSide,
	FrontSide,
	DataTexture,
	Vector4
} from 'three';

import Geometry from './lib/Geometry';
import Shaders from './lib/Shaders';

const defaultRttOpts = {
	format: RGBFormat,
	type:FloatType,
	mapping: DefaultMapping,
	wrapS: ClampToEdgeWrapping,
	wrapT: ClampToEdgeWrapping,
	minFilter: NearestFilter,
	magFilter: NearestFilter,
	stencilBuffer: false,
	depthBuffer: false
} 

const defaultOpts = {

	width: 256,
	height: 256,

	uniforms: {
		previousState: { type: 't', value: null }
	},
	
	updateShader: Shaders.defaultUpdateStateFragment,
	
	initialState: null, // Provide a function to generate data.
	initialData: null, // Or, provide a DataTexture directly.
	states: 2,
	renderMode: 'triangle',
	rttOpts: defaultRttOpts

};


export default class State{

	constructor( opts ){
		
		const uniforms = Object.assign( {}, defaultOpts.uniforms, opts.uniforms );		
		opts = Object.assign( {}, defaultOpts, opts );
		opts.uniforms = uniforms;
		
		this.opts = opts;
		this.opts.rttOpts = Object.assign( {}, defaultOpts.rttOpts, opts.rttOpts );
		
		this._current = 0;
		this._previous = opts.states-1;

		this.width = opts.width;
		this.height = opts.height;

		this.states = [];

		for( var i = 0; i<opts.states; i++ ){
			this.states.push(
				new WebGLRenderTarget( opts.width,opts.height,opts.rttOpts )
			)
		}
		
		this.camera = new OrthographicCamera( -0.5,0.5,0.5,-0.5,0,1 );			
		
		this.geometry = opts.renderMode === 'triangle' ? 
			Geometry.createTriangleGeometry() : Geometry.createPlaneGeometry();
			
		this.material = new RawShaderMaterial( {

			uniforms: opts.uniforms,
			vertexShader: opts.renderMode === 'triangle' ? 
				Shaders.triangleVertexShader : Shaders.quadVertexShader,
			fragmentShader: opts.updateShader,
			depthTest: false,
			depthWrite: false,
			side: opts.renderMode === 'triangle' ? BackSide : FrontSide

		});

		this.mesh = new Mesh( this.geometry,this.material );
		this.scene = new Scene();
		this.scene.add( this.mesh );
			
		// Create or assign the initial data texture.
		if( opts.initialData ){
			this.initialData = opts.initialData;
		}else{
			let data = new Float32Array( this.width * this.height * 3 );
			let rttOpts = this.opts.rttOpts;
			// format, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, encoding
			this.initialData = new DataTexture( 
				data, this.width, this.height,
				rttOpts.format, rttOpts.type, rttOpts.mapping,
				rttOpts.wrapS, rttOpts.wrapT,
				rttOpts.magFilter, rttOpts.minFilter 
			 );
		}
		
		this.writeInitialState = true;
		
		// Populate the data texture with initial state.
		if( opts.initialState ){
			this.setInitialState( opts.initialState );
		}

	}
	
	setInitialState( setValueFunc ){
		
		const vec4 = new Vector4();
		let offset3 = 0;
		let i = 0;
		const data = this.initialData.image.data;
		
		for( let y = 0; y<this.height; y++ ){
			
			for( let x = 0; x<this.width; x++ ){
				
				setValueFunc( vec4, i,x,y );
				
				data[ offset3 ] = vec4.x;
				data[ offset3 + 1 ] = vec4.y;
				data[ offset3 + 2 ] = vec4.z;
								
				i++;
				offset3+=3;
				
			}
			
		} 
		
		this.initialData.needsUpdate = true;		
		
	}

	getTexture(){

		return this.states[ this._current ].texture;

	}

	getRenderTexture(){

		return this.states[ this._current ];

	}

	getPrevious(){

		return this.states[ this._previous ].texture;

	}

	getCurrent(){

		return this.states[ this._current ].texture;

	}

	_step(){

		this._previous = this._current;
		this._current = ++this._current % this.states.length;
		return this.states[ this._current ];

	}

	render( renderer ){
		
		let next;
		this.writeInitialState = false;
		if( this.writeInitialState ){
			next = this.initialData;
			
		}else{
			next = this._step();	
		}
		
		this.material.uniforms.previousState.value = this.initialData;
		
		renderer.clearTarget( next, true, true, false );
		renderer.render( this.scene, this.camera, next, false );
		renderer.setRenderTarget( null );

	}

	scissorRender( renderer, x,y, width, height ){

		var next = this._step();

		next.scissor.x = x;
		next.scissor.y = y;
		next.scissor.z = width;
		next.scissor.w = height;
		next.scissorTest = true;

		renderer.render( this.scene, this.camera, next, true );

		next.scissor.x = 0;
		next.scissor.y = 0;
		next.scissor.z = next.width;
		next.scissor.w = next.height;
		next.scissorTest = false;

	}

}
