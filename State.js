
import {
	Mesh,
	Scene,
	Camera,
	PerspectiveCamera,
	PlaneBufferGeometry,
	OrthographicCamera,
	WebGLRenderTarget,
	ClampToEdgeWrapping,
	NearestFilter,
	DefaultMapping,
	FloatType,
	RGBAFormat,
	RawShaderMaterial,
	BackSide
} from 'three';

// import aBigTriangle from '../geometry/aBigTriangle';

const defaultOpts = {

	width: 256,
	height: 256,

	uniforms: {},
	fragmentShader: ``,

	states: 2,
	fillMode: 'square',
	rttOpts: {
		stencilBuffer: false,
		depthBuffer: false,
		format: RGBAFormat,
		type:FloatType,
		mapping: DefaultMapping,
		wrapS: ClampToEdgeWrapping,
		wrapT: ClampToEdgeWrapping,
		minFilter: NearestFilter,
		magFilter: NearestFilter
	}

};


export default class State{

	constructor( opts ){

		opts = Object.assign( {}, defaultOpts, opts );

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

		switch( opts.fillMode ){

			case 'square':

				this.camera = new OrthographicCamera( -0.5,0.5,0.5,-0.5,0,1 );
				this.geometry = new PlaneBufferGeometry( 1,1 );
				this.material = new RawShaderMaterial( {

					uniforms: opts.uniforms,
					vertexShader: `
						uniform mat4 projectionMatrix;
		                uniform mat4 modelViewMatrix;
		                attribute vec3 position;
		                attribute vec2 uv;

		                varying vec2 vUv;

		                void main(){

		                    vUv = uv;
		                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		                }
					`,
					fragmentShader: opts.fragmentShader,
					depthTest: false,
					depthWrite: false

				});

				break;

			case 'triangle':

				// doesn't seem to working at the mo :(
				// didn't have this problem before..
				// NOTE : problems with UV's not extending to full range.

				this.camera = new Camera();
				this.geometry = aBigTriangle.getGeometry();
				this.material = new RawShaderMaterial( {

					uniforms: opts.uniforms,
					vertexShader: aBigTriangle.getVertexShader(),
					fragmentShader: opts.fragmentShader,
					depthTest: false,
					depthWrite: false,
					side: BackSide

				});

				break;

		}

		this.mesh = new Mesh( this.geometry,this.material );
		this.scene = new Scene();
		this.scene.add( this.mesh );

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

		var next = this._step();
		renderer.render( this.scene, this.camera, next, true );
		renderer.setRenderTarget( null );

	}

	/**
	 * This was added for the Surface renderer.
	 * But may be this can be removed now.
	 */
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

	/**
	pass(){

		//this.mesh.material = material

	}

	out(){

	}**/

}


//GPGPU.triangleGeometry = getTriangle();
//GPGPU.squareGeometry = getSquare();
/**GPGPU.vertexShader = triangleVertexShader;
GPGPU.triangleVertexShader = triangleVertexShader;
GPGPU.squareVertexShader = squareVertexShader;

GPGPU.getTriangleGeometry = getTriangle;
GPGPU.getSquareGeometry = getSquare;
**/
