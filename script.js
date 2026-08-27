// 1. Scene, Camera, Renderer Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // आसमान का नीला रंग

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game-canvas').appendChild(renderer.domElement);

// 2. Lights (रोशनी)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(30, 50, 30);
scene.add(dirLight);

// 3. Environment: Ground & Roads (खेत और सड़क)
const groundGeo = new THREE.PlaneGeometry(300, 300);
const groundMat = new THREE.MeshLambertMaterial({ color: 0x4d7c0f }); // हरा खेत
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const roadGeo = new THREE.PlaneGeometry(14, 300);
const roadMat = new THREE.MeshLambertMaterial({ color: 0x334155 }); // काली सड़क
const road = new THREE.Mesh(roadGeo, roadMat);
road.rotation.x = -Math.PI / 2;
road.position.y = 0.01;
scene.add(road);

// 4. Mission & Location Spot (मिट्टी उठाने की जगह)
const missionGeo = new THREE.CylinderGeometry(4, 4, 0.2, 32);
const missionMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.6 });
const missionSpot = new THREE.Mesh(missionGeo, missionMat);
missionSpot.position.set(20, 0.1, 50);
scene.add(missionSpot);

// 5. Build 3D Tractor + Trolley (ट्रैक्टर और ट्रॉली)
const tractorGroup = new THREE.Group();

// ट्रैक्टर बॉडी
const bodyGeo = new THREE.BoxGeometry(2.2, 1.2, 3);
const bodyMat = new THREE.MeshLambertMaterial({ color: 0xd32f2f }); // लाल रंग
const body = new THREE.Mesh(bodyGeo, bodyMat);
body.position.y = 1;
tractorGroup.add(body);

// इंजन का Bonnet
const bonnetGeo = new THREE.BoxGeometry(1.9, 1, 2);
const bonnet = new THREE.Mesh(bonnetGeo, bodyMat);
bonnet.position.set(0, 0.9, 2);
tractorGroup.add(bonnet);

// साइलेंसर
const pipeGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2);
const pipeMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
const pipe = new THREE.Mesh(pipeGeo, pipeMat);
pipe.position.set(0.6, 1.8, 2.2);
tractorGroup.add(pipe);

// पहिए
const wheelMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
const bigWheelGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.5, 16);

const wBackLeft = new THREE.Mesh(bigWheelGeo, wheelMat);
wBackLeft.rotation.z = Math.PI / 2;
wBackLeft.position.set(1.3, 0.9, -0.8);
tractorGroup.add(wBackLeft);

const wBackRight = wBackLeft.clone();
wBackRight.position.x = -1.3;
tractorGroup.add(wBackRight);

const smallWheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16);
const wFrontLeft = new THREE.Mesh(smallWheelGeo, wheelMat);
wFrontLeft.rotation.z = Math.PI / 2;
wFrontLeft.position.set(1.1, 0.5, 2.2);
tractorGroup.add(wFrontLeft);

const wFrontRight = wFrontLeft.clone();
wFrontRight.position.x = -1.1;
tractorGroup.add(wFrontRight);

// ट्रॉली (Trolley)
const trolleyGeo = new THREE.BoxGeometry(2.5, 1, 3.5);
const trolleyMat = new THREE.MeshLambertMaterial({ color: 0x0284c7 }); // नीली ट्रॉली
const trolley = new THREE.Mesh(trolleyGeo, trolleyMat);
trolley.position.set(0, 1, -3.8);
tractorGroup.add(trolley);

scene.add(tractorGroup);

// 6. Driving Controls & Logic
let speed = 0;
let angle = 0;
const keys = { gas: false, reverse: false, left: false, right: false };

function setupButton(id, key) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('touchstart', (e) => { e.preventDefault(); keys[key] = true; });
    el.addEventListener('touchend', (e) => { e.preventDefault(); keys[key] = false; });
    el.addEventListener('mousedown', () => keys[key] = true);
    el.addEventListener('mouseup', () => keys[key] = false);
}

setupButton('btn-gas', 'gas');
setupButton('btn-reverse', 'reverse');
setupButton('btn-left', 'left');
setupButton('btn-right', 'right');

// 7. Game Loop & Render
function animate() {
    requestAnimationFrame(animate);

    // स्पीड और मूवमेंट
    if (keys.gas) speed = Math.min(speed + 0.01, 0.35);
    else if (keys.reverse) speed = Math.max(speed - 0.008, -0.15);
    else speed *= 0.95;

    // मुड़ना
    if (keys.left) angle += 0.03;
    if (keys.right) angle -= 0.03;

    tractorGroup.rotation.y = angle;
    tractorGroup.position.x += Math.sin(angle) * speed;
    tractorGroup.position.z += Math.cos(angle) * speed;

    // फ्रंट व्हील्स रोटेशन (मुड़ते हुए दिखना)
    wFrontLeft.rotation.y = keys.left ? 0.4 : (keys.right ? -0.4 : 0);
    wFrontRight.rotation.y = wFrontLeft.rotation.y;

    // कैमरा ट्रैक्टर के पीछे स्मूथ फॉलो करेगा
    camera.position.x = tractorGroup.position.x - Math.sin(angle) * 12;
    camera.position.z = tractorGroup.position.z - Math.cos(angle) * 12;
    camera.position.y = tractorGroup.position.y + 7;
    camera.lookAt(tractorGroup.position.x, tractorGroup.position.y + 1.2, tractorGroup.position.z);

    // GPS एरो अपडेट (मिशन स्पॉट की तरफ पॉइंट करना)
    const gpsArrow = document.getElementById('gps-arrow');
    if (gpsArrow) {
        const dx = missionSpot.position.x - tractorGroup.position.x;
        const dz = missionSpot.position.z - tractorGroup.position.z;
        const targetAngle = Math.atan2(dx, dz);
        const relativeAngle = targetAngle - angle;
        gpsArrow.style.transform = `rotate(${relativeAngle * (180 / Math.PI)}deg)`;
    }

    renderer.render(scene, camera);
}

animate();

// विंडो रिसाइज़ हैंडलर
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
