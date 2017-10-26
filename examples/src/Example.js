
import {
    WebGLRenderer,
    PerspectiveCamera,
    Scene
} from 'three';

export default class Example{

    constructor(){

    }

    init(){

        this.renderer = new WebGLRenderer({
            antialias: true
        });

        this.camera = new PerspectiveCamera( 35,4/3,0.1,1000 );
        this.scene = new Scene();  
        
        this.setup();

        this.render = this.render.bind(this);
        this.render();

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