
import {
    WebGLRenderer,
    PerspectiveCamera,
    Scene,
    OrthographicCamera,
    MeshBasicMaterial,
    Mesh,
    PlaneBufferGeometry,
    Matrix4,
    BackSide
} from 'three';

let previewGeometry = null;
const createPreviewGeometry = ()=>{
    if( !previewGeometry ){
        previewGeometry = new PlaneBufferGeometry(1,1,1,1);
        const bake = new Matrix4();
        bake.makeTranslation( 0.5,0.5,0 );
        previewGeometry.applyMatrix( bake );
    }
    return previewGeometry;
}


export default class Example{

    constructor( previewSize=256 ){

        this.previewSize = previewSize;
        
        window.onload = ()=>{
            this.init();
        }

    }

    init(){

        this.renderer = new WebGLRenderer({
            antialias: true,
            premultipliedAlpha : false
        });
        
        this.renderer.autoClear = false;
        this.renderer.setClearColor( 0x222222 );
        this.renderer.setPixelRatio( Math.min( 2, window.devicePixelRatio ) );
        
        const style = document.createElement( 'style' );
        style.innerText = `
            body{
                margin: 0px;
                padding: 0px;
                overflow: hidden;
            }
        `;
        
        document.body.appendChild( style );
        document.body.appendChild( this.renderer.domElement );

        this.camera = new PerspectiveCamera( 35,4/3,0.1,1000 );
        this.camera.position.z = 100;
        
        this.orthoCamera = new OrthographicCamera( 0,0,0,0,0.1,1000 );
        this.orthoCamera.position.z = 1;
        
        this.scene = new Scene();  
        this.orthoScene = new Scene();
        
        this.setup();

        this.resize = this.resize.bind(this);
        this.render = this.render.bind(this);

        this.resize();
        this.render();           
        
        window.addEventListener( 'resize', this.resize );

    }

    setup(){
        
    }

    render(){

        this.update();
        
        this.renderer.clear();        
        this.renderer.render( this.scene,this.camera );
        this.renderer.render( this.orthoScene,this.orthoCamera );
        
        requestAnimationFrame( this.render );

    }

    update(){
        
    }

    resize(){

        let w = window.innerWidth;
        let h = window.innerHeight;

        this.camera.aspect = w/h;
        this.camera.updateProjectionMatrix();
        
        this.orthoCamera.left = 0;
        this.orthoCamera.right = w;
        this.orthoCamera.top = 0;
        this.orthoCamera.bottom = h;
        this.orthoCamera.updateProjectionMatrix();              
        
        this.renderer.setSize( w,h );

    }
    
    layout(){

        const previewSize = this.previewSize;
        const previewSpacing = 1; 
        const margin = 10;
                
        let preview;
        let y = margin;

        for( let i = 0; i<this.orthoScene.children.length; i++ ){
            
            preview = this.orthoScene.children[i];
            
            preview.position.x = margin;
            preview.position.y = y;

            if( preview.userData.size ){
                preview.scale.x = preview.userData.size[0] * previewSize;
                preview.scale.y = preview.userData.size[1] * previewSize;
            }else{
                preview.scale.x = previewSize;
                preview.scale.y = previewSize;
            }

            
            y += previewSize + previewSpacing;
            
        }
        
    }
    
    previewTexture( texture, size=null ){

        const mesh = new Mesh( 
            createPreviewGeometry(),
            new MeshBasicMaterial( {
                color: 0xffffff,
                side: BackSide,
                map: texture,
                depthWrite: false
            })
        ) 
        
        mesh.userData.size = size;
        this.orthoScene.add( mesh );
        
        this.layout();
        
    }
    

}