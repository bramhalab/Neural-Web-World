import * as THREE from 'three';

// 1. Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#world-canvas'),
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// 2. Add "Neural" Object (A Grid representing the Spatial Field)
const geometry = new THREE.IcosahedronGeometry(2, 1);
const material = new THREE.MeshBasicMaterial({ 
    color: 0x00ffcc, 
    wireframe: true 
});
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

camera.position.z = 5;

// 3. AI Trajectory Logic (Simulation)
let angle = 0;
function animate() {
    requestAnimationFrame(animate);

    // Camera ko ghumana (WorldFM jaisa target pose simulation)
    angle += 0.01;
    camera.position.x = Math.sin(angle) * 5;
    camera.position.z = Math.cos(angle) * 5;
    camera.lookAt(0, 0, 0);

    // Object rotation
    sphere.rotation.y += 0.005;

    renderer.render(scene, camera);
}

// 4. Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Button Interaction
document.getElementById('generateBtn').onclick = () => {
    document.getElementById('status').innerText = "Processing Field...";
    sphere.material.color.setHex(0xff00ff); // Color badalna visual effect ke liye
    setTimeout(() => {
        document.getElementById('status').innerText = "Neural View Stabilized";
    }, 1500);
};

animate();
