
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
	Vector2,
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
		previousState: { type: 't', value: null },
		textureSize: { value: new Vector2() },
		texelSize: { value: new Vector4() }
	},
	
	updateShader: Shaders.defaultUpdateStateFragment,
	
	initialState: null, // Provide a function to generate data.
	initialData: null, // Or, provide a DataTexture directly.
	states: 2,
	renderMode: 'triangle', // triangle or quad.
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
			
		if( opts.uniforms.previousState === defaultOpts.uniforms.previousState ){
			opts.uniforms.previousState = { type: 't', value: null };
		}
		if( opts.uniforms.textureSize === defaultOpts.uniforms.textureSize ){
			opts.uniforms.textureSize = { value: new Vector4( this.width, this.height, 1/this.width, 1/this.height ) };
		}		
		if( opts.uniforms.texelSize === defaultOpts.uniforms.texelSize ){
			opts.uniforms.texelSize = { value: new Vector4( 1/this.width, 1/this.height, (1/this.width)*0.5, (1/this.height)*0.5 ) };
		}		
					
		this.material = new RawShaderMaterial( {

			uniforms: opts.uniforms,
			vertexShader: opts.renderMode === 'triangle' ? 
				Shaders.triangleVertexShader : Shaders.quadVertexShader,
			fragmentShader: opts.updateShader,
			depthTest: false,
			depthWrite: false,
			side: opts.renderMode === 'triangle' ? BackSide : FrontSide

		});
		
		this.resetMaterial = this.material.clone();
		this.resetMaterial.fragmentShader = Shaders.defaultUpdateStateFragment;

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
		
		this.readInitialState = true;
		this.readStateCount = 1; // the number of state textures to read/write to.
		
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
	
	reset( count=null ){
		
		if( !count ){
			this.readStateCount = this.states.length;
		}
		this.readInitialState = true;
		
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
		
		let next,prev;
		
		if( this.readInitialState ){
			
			this.mesh.material = this.resetMaterial;

			prev = this.initialData;
			
			for( let i = 0; i<this.readStateCount; i++ ){
				next = this._step();
				this._write( renderer, prev, next, false );
			}
			
			this.mesh.material = this.material;
			this.readInitialState = false;
			
		}else{
			
			next = this._step();
			prev = this.getPrevious();
			this._write( renderer, prev, next, true );
					
		}	
		
	}
	
	_write( renderer, previous, next, clear=true ){
		
		this.mesh.material.uniforms.previousState.value = previous;
		
		if( clear ){
			renderer.clearTarget( next, true, true, false );
		}
		
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
