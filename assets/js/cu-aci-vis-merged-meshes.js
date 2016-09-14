/* Expects globals:
 *   - THREE (three.js)
 *   - palmettoNodes (data.js)
 */

/* =============================================================================
 * DEFINES GLOBALS
 * ===========================================================================*/
//For animation
var animationEnabled = true;
var duration = 60000; //ms
var startTime = Date.now();
var pausedStartTime;
var pausedDuration = 0.0; //ms
var now;

// Number of Palmetto nodes
var numPalmettoNodes = 2015;

// Set up some variable used in the animation loop.
var palmettoNodeCountSqrt = Math.ceil(Math.sqrt(numPalmettoNodes));
var palmettoAnimDistanceNodeFactor = 8.0 * 2;
var distanceXZ = palmettoNodeCountSqrt * palmettoAnimDistanceNodeFactor;
var animVelocity = distanceXZ / duration; //units per millisecond

var scene;
var camera;
var renderer;

var cameraStart_x = 2.0;
var cameraStart_y = 16.0;
var cameraStart_z = 2.0;

var ambLight;
var dirLight0;
var hemiLight;
var gridHelper;
var axisHelper;

var palmettoMesh;
var palmettoMeshBad;

//For stats display
var stats;

var w = window.innerWidth;
var h = window.innerHeight;

var controls;

/*
str = JSON.stringify(palmettoNodes, null, 4); 
console.log(str);
*/

/* =============================================================================
 * RUN
 * ===========================================================================*/
init()
palmettoComputeNodes(numPalmettoNodes);
//cypressWorkerNodes(40);
animate();

/* =============================================================================
 * FUNCTIONS
 * ===========================================================================*/
function init() {
    scene = new THREE.Scene();
    //scene.background = new THREE.Color(0x404040);
    scene.background = new THREE.Color(0x000000);

    //renderer = new THREE.WebGLRenderer();
    renderer = new THREE.WebGLRenderer({antialias:true});
    
    renderer.setSize(w, h);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(45, w / h, 0.01, 2000);
    camera.position.x = cameraStart_x;
    camera.position.y = cameraStart_y;
    camera.position.z = cameraStart_z;
    
    // Add an axis helper to help understand scene and camera orientation
    var axisLength = 1000.0;
    axisHelper = new THREE.AxisHelper(axisLength);
    scene.add(axisHelper);
    
    // Lights!
    ambLight = new THREE.AmbientLight(0x808080, 0.25); // soft white light
    scene.add(ambLight);
    
    dirLight0 = new THREE.DirectionalLight(0xffffff, 1);
	dirLight0.position.set(distanceXZ, distanceXZ, distanceXZ * 2);
	scene.add(dirLight0);
    
    hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.25);
    hemiLight.position.set(0, 0, 0);
    scene.add(hemiLight);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    
    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
    
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('keydown', onKeyDown, false);
    window.parent.document.addEventListener('keydown', onKeyDown, false);
}

function reset() {
    startTime = now;
    pausedDuration = 0;
    camera.position.x = cameraStart_x;
    camera.position.y = cameraStart_y;
    camera.position.z = cameraStart_z;   
}

function animate(){
    requestAnimationFrame(animate);
    
    if(animationEnabled) {
        now = Date.now();
        var deltat = now - (startTime + pausedDuration);
        if(deltat > duration)
        {
            reset();
        }
        
        // Scale velocity in x,y,z directions
        cameraBoostX = 1.0;
        cameraBoostY = 0.1;
        cameraBoostZ = 1.0;
        
        camera.position.x = cameraStart_x + cameraBoostX * animVelocity * deltat;
        camera.position.y = cameraStart_y + cameraBoostY * animVelocity * deltat;
        camera.position.z = cameraStart_z + cameraBoostZ * animVelocity * deltat;
    }
    
    controls.update();
    renderer.render(scene, camera);
    stats.update();
}

function palmettoComputeNodes(nodeCount) {
    /* http://threejs.org/docs/#Reference/Materials/MeshPhongMaterial */
    var goodNodeMaterial = new THREE.MeshPhongMaterial( {
        color: 0xF66733,
        shininess: 100
    });    
    
    var badNodeMaterial = new THREE.MeshPhongMaterial( {
        color: 0x522D80,
        shininess: 100
    });
    
    var nodeCountSqrt = Math.ceil(Math.sqrt(nodeCount));
    console.log(nodeCountSqrt);
    
    var palmettoGeom = new THREE.Geometry();
    var palmettoGeomBad = new THREE.Geometry();
    
    var nodeSpacing = 7.0;
    var nodeLength = 1;
    var nodeHeight = 1;
    var nodeWidth = 1;

    var nodeYOffset = 0.0;

    //grid size should approximately equal:
    var gridX = nodeCountSqrt * (nodeLength + nodeSpacing);
    var gridZ = nodeCountSqrt * (nodeWidth + nodeSpacing);
    console.log(gridX + " " + gridZ);
    
    var size = gridX/2;
    var step = gridX;
    gridHelper = new THREE.GridHelper(size, step);
    gridHelper.position.set(gridX/2, 0, gridZ/2);
    scene.add(gridHelper);
    
    for(i = 0; i < nodeCount; i++) {
        var iZf = ('000' + (i + 1)).slice(-4);
        nodeName = "node" + iZf;
        //console.log(nodeName);
                
        var nproc = 0.0;
        if (nodeName in palmettoNodes) {
            nproc = palmettoNodes[nodeName]["nproc"] * 1;
            nodeHeight = nproc;
            nodeYOffset = 0.0;
            //console.log(nproc)
        }
        else {
            nodeHeight = 1.0
            nodeYOffset = -1.0;
        }
        
        var nodeGeom = new THREE.BoxGeometry(nodeLength,
                                             nodeHeight,
                                             nodeWidth);
        var nodeMesh = new THREE.Mesh(nodeGeom);
         
        nodeMesh.position.x = (nodeLength / 2) +
            (Math.floor((i / nodeCountSqrt)) *
            (1 + nodeLength * nodeSpacing));
        nodeMesh.position.y = nodeHeight / 2 + nodeYOffset;
        nodeMesh.position.z = (nodeWidth / 2) +
            ((i % nodeCountSqrt) * (1 + nodeWidth * nodeSpacing));
        
        //nodeMeshPositionString = JSON.stringify(nodeMesh.position, null, 4); 
        //console.log(nodeMeshPositionString);
        
        nodeMesh.updateMatrix();
        
        if(nproc >= 1.0) {
            palmettoGeom.merge(nodeMesh.geometry, nodeMesh.matrix);
        }
        else {
            palmettoGeomBad.merge(nodeMesh.geometry, nodeMesh.matrix);
        }
    }
    
    palmettoMesh = new THREE.Mesh(palmettoGeom, goodNodeMaterial);
    scene.add(palmettoMesh);
    
    palmettoMeshBad = new THREE.Mesh(palmettoGeomBad, badNodeMaterial);
    scene.add(palmettoMeshBad);    
}

function onWindowResize() {
    w = window.innerWidth;
    h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);

}

function onKeyDown (event) {
    switch (event.keyCode) {
        case 65: //a
            ambLight.visible = !ambLight.visible;
            break;
        case 66: //b
            palmettoMeshBad.visible = !palmettoMeshBad.visible;
            break;   
        case 68: //d
            dirLight0.visible = !dirLight0.visible;
            break;
        case 71: //g
            gridHelper.visible = !gridHelper.visible;
            break;
        case 72: //h
            hemiLight.visible = !hemiLight.visible;
            break;
        case 80: //p
            animationEnabled = !animationEnabled;
            if (!animationEnabled) {
                pausedStartTime = Date.now();
                console.log("animation disabled: pausedStartTime = " + pausedStartTime);
            }
            else {
                pausedDuration += Date.now() - pausedStartTime;
                console.log("animation disabled: pausedDuration = " + pausedDuration + " ms");
            }
            break;
        case 82: //r
            reset();
            break;
        case 84: //t
            palmettoMesh.visible = !palmettoMesh.visible;
            break;
        case 90: //z
            axisHelper.visible = !axisHelper.visible;
            break;
    }
}
