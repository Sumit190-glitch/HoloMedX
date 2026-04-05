let viewerState = null;

async function ensureViewer(container) {
    if (viewerState) {
        return viewerState;
    }

    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js');
    const { OrbitControls } = await import('https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js');
    const { IFCLoader } = await import('https://cdn.jsdelivr.net/npm/web-ifc-three@0.0.126/IFCLoader.js/+esm');

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(12, 12, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 2, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(12, 18, 8);
    scene.add(directionalLight);

    const grid = new THREE.GridHelper(60, 60, 0x334155, 0x1e293b);
    scene.add(grid);

    const loader = new IFCLoader();
    loader.ifcManager.setWasmPath('https://cdn.jsdelivr.net/npm/web-ifc@0.0.35/');

    const resize = () => {
        if (!container.clientWidth || !container.clientHeight) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', resize);

    const animate = () => {
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };
    animate();

    viewerState = {
        THREE,
        scene,
        camera,
        renderer,
        controls,
        loader,
        currentModel: null,
        container,
        resize
    };

    return viewerState;
}

function fitModelToView(state, object) {
    const { THREE, camera, controls } = state;
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 10;
    const distance = maxDim * 1.6;

    camera.position.set(center.x + distance, center.y + distance * 0.7, center.z + distance);
    controls.target.copy(center);
    camera.near = Math.max(0.1, maxDim / 100);
    camera.far = maxDim * 20;
    camera.updateProjectionMatrix();
}

window.ModelViewer = {
    async loadIfcFromFile(file) {
        const container = document.getElementById('ifc-viewer-container');
        const state = await ensureViewer(container);

        if (state.currentModel) {
            state.scene.remove(state.currentModel);
            state.currentModel = null;
        }

        const objectUrl = URL.createObjectURL(file);
        return new Promise((resolve, reject) => {
            state.loader.load(
                objectUrl,
                (model) => {
                    state.currentModel = model;
                    state.scene.add(model);
                    state.container.style.display = 'block';
                    fitModelToView(state, model);
                    URL.revokeObjectURL(objectUrl);
                    resolve(model);
                },
                undefined,
                (error) => {
                    URL.revokeObjectURL(objectUrl);
                    reject(error);
                }
            );
        });
    },

    showClashMarkers(clashes) {
        if (!viewerState) return;
        const { THREE, scene } = viewerState;

        if (viewerState.clashMarkers) {
            viewerState.clashMarkers.forEach((marker) => scene.remove(marker));
        }
        viewerState.clashMarkers = [];

        clashes.forEach((clash) => {
            if (!clash.clash_point) return;
            const marker = new THREE.Mesh(
                new THREE.SphereGeometry(0.2, 20, 20),
                new THREE.MeshStandardMaterial({ color: clash.clash_type === 'hard' ? 0xef4444 : 0xf59e0b })
            );
            marker.position.set(clash.clash_point.x / 1000, clash.clash_point.z / 1000, clash.clash_point.y / 1000);
            scene.add(marker);
            viewerState.clashMarkers.push(marker);
        });
    },

    showReroutePath(path) {
        if (!viewerState || !path || path.length < 2) return;
        const { THREE, scene } = viewerState;

        if (viewerState.rerouteLine) {
            scene.remove(viewerState.rerouteLine);
        }

        const points = path.map((pt) => new THREE.Vector3(pt.x / 1000, pt.z / 1000, pt.y / 1000));
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 3 });
        const line = new THREE.Line(geometry, material);
        scene.add(line);
        viewerState.rerouteLine = line;
    },

    resetScene() {
        const container = document.getElementById('ifc-viewer-container');
        if (container) {
            container.style.display = 'none';
            container.innerHTML = '';
        }
        viewerState = null;
    }
};
