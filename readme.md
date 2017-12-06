

# three-gpgpu
State
Array of rtt targets

Simulate
Encoding of attributes into textures with persistance of 
state being carried out in a state object.

Attribute Encoding
Define a number of attributes to be encoded and available in the simulation.
This has a number of implications and can dictate implementation. There are also a
number of hardware capabilities that can allow for different approaches to implementations.

Single Texture 
- Single 4 byte attribute or combination described by user implementation.

Single Texture / Segmented
- 4 byte attributes with the texture divided vertically to fit X number of attributes.

Multiple Texture / Single Attribute / MRT
- Multiple textures with a single attributes per texture resulting
in multiple textures  

Multiple Textures / Segmented Attributes / MRT
- Multiple textures with segmented attributes / MRT

MRT Support is useful to avoid multiple passes on the same simulation.
And to allow maximum number of attributes, and therefore maximum amount of points/objects
in a simulation. 


defaultOpts = {
    textureWidth: 1024,  // height will be automatically determined.
    numObjects:10000,
    mode: 'single-segmented' 
    
    attributes: [
        name: '',
        size: 4,
        initialState: ()={}
    ],
    uniforms: {
    },
    shader: {
        declarations:`` ,
        update:`
        void updateSimulation( Model simulationModel ){
            
            State ss = simualtionState;
            ss.position
            /// etc
        `
    }
    updateShader:`
    `      
}


Implementation

- get attribute count and max attribute length.
- determine texture format.
- call initial attribute state functions and write to data texture.
- construct shader code for simulation Model object and update function.
- construct shader code fot texture read and write operations.
- compile and run to target State
