import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 1. Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#three-canvas'), antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0, 0, 10);

// 2. Controls (3D World mein ghumne ke liye)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 3. Image Processing Logic
const imageInput = document.getElementById('imageUpload');
const reconstructBtn = document.getElementById('reconstructBtn');
const statusText = document.getElementById('statusText');

let currentMesh = null;

imageInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
        reconstructBtn.disabled = false;
        statusText.innerText = "Image Loaded. Ready for Reconstruction.";
    }
});

reconstructBtn.addEventListener('click', () => {
    const file = imageInput.files[0];
    const reader = new FileReader();

    statusText.innerText = "Analyzing Depth & Generating 3D Mesh...";
    
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            create3DWorldFromImage(img);
        };
    };
    reader.readAsDataURL(file);
});

// 4. Core Engine: Image to 3D Mesh
function create3DWorldFromImage(img) {
    // Purane mesh ko hatana
    if (currentMesh) scene.remove(currentMesh);

    const width = 100;
    const height = 100;
    
    // Geometry banana (Plane ko 3D grid mein todna)
    const geometry = new THREE.PlaneGeometry(15, 10, width, height);
    
    // Texture load karna
    const texture = new THREE.TextureLoader().load(img.src);
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        displacementScale: 2.5 // Ye depth ka level set karta hai
    });

    // Neural Simulation: Pixels ko depth dena
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    
    const imgData = ctx.getImageData(0, 0, width, height).data;
    const vertices = geometry.attributes.position.array;

    for (let i = 0; i < vertices.length; i++) {
        const x = i % (width + 1);
        const y = Math.floor(i / (width + 1));
        
        if (imgData[i * 4]) {
            // Brightness ke hisaab se Z-axis (Depth) calculate karna
            const brightness = (imgData[i * 4] + imgData[i * 4 + 1] + imgData[i * 4 + 2]) / 3;
            vertices[i * 3 + 2] = (brightness / 255) * 3; 
        }
    }

    currentMesh = new THREE.Mesh(geometry, material);
    scene.add(currentMesh);

    // Light add karna taaki 3D depth dikhe
    const light = new THREE.DirectionalLight(0xffwide, 1);
    light.position.set(0, 5, 10);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    statusText.innerText = "3D World Reconstructed!";
}

// 5. Animation Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
