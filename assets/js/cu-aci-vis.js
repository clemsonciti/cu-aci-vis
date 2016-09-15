/*
 * I'm keeping this as an example of how you should not draw many shapes to the 
 * screen! This render performs poorly because of too many draw calls.
 */

/* Expects globals:
 *   - THREE (three.js)
 *   - palmettoNodes (data.js)
 */

/* Defines globals: */

//For animation
var duration = 30000; //ms
var currentTime = Date.now();
var startTime = currentTime;

var scene;
var camera;
var renderer;

//For stats display
var stats;

var w = window.innerWidth;
var h = window.innerHeight;

var controls;

/*
str = JSON.stringify(palmettoNodes, null, 4); 
console.log(str);
*/

function init() {
    scene = new THREE.Scene();

    //renderer = new THREE.WebGLRenderer();
    renderer = new THREE.WebGLRenderer({antialias:true});
    
    renderer.setSize(w, h);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(45, w / h, 0.01, 5000);
    camera.position.x = 0.5;
    camera.position.y = 0.5;
    camera.position.z = 0.5;
    
    // Add an axis helper to help understand scene and camera orientation
    var axisLength = 1000.0;
    var axisHelper = new THREE.AxisHelper(axisLength);
    scene.add(axisHelper);
    
    // Lights!
    var ambLight = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(ambLight);
    
    dirLight0 = new THREE.DirectionalLight(0xffffff, 0.75);
	dirLight0.position.set(2500, 100, 2500);
	//scene.add(dirLight0);
    
    var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5);
    hemiLight.position.set( 0, 500, 0 );
    scene.add(hemiLight);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    
    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild( stats.dom );
}

function animate(){
    stats.begin();
     
    var now = Date.now();
    var deltat = now - currentTime;
    var fract = deltat / duration;
    currentTime = now;
    
    /*
    */
    if((currentTime - duration) > startTime)
    {
        startTime = currentTime;
        camera.position.x = .1;
        camera.position.y = .1;
        camera.position.z = .1;        
    }
    
    camera.position.x += 70 * (fract);
    camera.position.y += 7 * (fract);
    camera.position.z += 70 * (fract);
    
    renderer.render(scene, camera);
  
    controls.update();
  
    stats.end();
  
    requestAnimationFrame(animate);
}

function palmettoComputeNodes(nodeCount) {
    /* "Palmetto" compute nodes */
    var material = new THREE.MeshLambertMaterial({
      color: 0xF66733,
      shading: THREE.FlatShading
    });
    
    var redMaterial = new THREE.MeshLambertMaterial({
      color: 0xF00000,
      shading: THREE.FlatShading
    });
    
    var newMaterial = new THREE.MeshLambertMaterial( { color: 0xdddddd, shading: THREE.FlatShading } );
    /* http://threejs.org/docs/#Reference/Materials/MeshPhongMaterial */
    var newMaterial2 = new THREE.MeshPhongMaterial( {
        color: 0xF66733,
    });
    
    var nodeCountSqrt = Math.floor(Math.sqrt(nodeCount));
    console.log(nodeCountSqrt);
    
    for(i = 0; i < nodeCount; i++) {
        iZf = ('000' + (i + 1)).slice(-4);
        nodeName = "node" + iZf;
        //console.log(nodeName);
        
        var cubeLength = 0.25;
        var cubeHeight = 0.25;
        var cubeWidth = 0.25;
        
        var nproc = 0.0;
        if (nodeName in palmettoNodes) {
            nproc = palmettoNodes[nodeName]["nproc"] * 1;
            //console.log(nproc)
        }
        
        //cubeHeight = nproc;
        
        var geometry = new THREE.BoxGeometry(cubeLength, cubeHeight, cubeWidth);
        
        var cube;
        if (nproc > 0) {
            cube = new THREE.Mesh(geometry, material);
        }
        else {
            cube = new THREE.Mesh(geometry, redMaterial);
        }
        
        var cubeSpacing = 1.0;
        cube.position.x = (i % nodeCountSqrt) + (cubeLength / 2) + ((i % nodeCountSqrt) * cubeLength * cubeSpacing);
        cube.position.z = (Math.floor(i / nodeCountSqrt)) + (cubeWidth / 2) + ((i / nodeCountSqrt) * cubeWidth * cubeSpacing);
        cube.position.y = cubeHeight / 2;
        
        scene.add(cube);
        
        edges = new THREE.EdgesHelper( cube, 0x000000 );
        scene.add(edges);
    }
}

init()
palmettoComputeNodes(2015);
//cypressWorkerNodes(40);
animate();
