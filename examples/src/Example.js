
import {
    WebGLRenderer,
    PerspectiveCamera,
    Scene
} from 'three';

export default class Example{

    constructor(){

        window.onload = ()=>{
            this.init();
        }

    }

    init(){

        this.renderer = new WebGLRenderer({
            antialias: true
        });

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

        this.scene = new Scene();  
        
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

        this.renderer.render( this.scene,this.camera );
        requestAnimationFrame( this.render );

    }

    update(){
        
    }

    resize(){

        let w = window.innerWidth;
        let h = window.innerHeight;

        this.camera.aspect = w/h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( w,h );

    }

}