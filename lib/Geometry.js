import {
    PlaneBufferGeometry,
    BufferGeometry,
    BufferAttribute,
    Matrix4
} from 'three';

let planeGeometry = null;
let triangleGeometry = null;

export default {
    
    createPlaneGeometry:()=>{
        
       if( !planeGeometry ){
           planeGeometry = new PlaneBufferGeometry(1,1,1,1);
           planeGeometry.removeAttribute( 'uv' );
           planeGeometry.removeAttribute( 'normal' );
       }
       return planeGeometry;
       
    },
    
    createTriangleGeometry:()=>{
        
        if( !triangleGeometry ){
            triangleGeometry = new BufferGeometry();
            triangleGeometry.addAttribute( 'position',
                new BufferAttribute( new Float32Array( [-1,-1,0, -1,4,0, 4,-1,0 ]), 3 )
            );
        }
       
		return triangleGeometry;
        
    }
    
}