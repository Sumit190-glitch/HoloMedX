"use client";

import { useEffect, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { VRButton, XR } from '@react-three/xr';
import { IFCLoader } from 'web-ifc-three/IFCLoader';
import * as THREE from 'three';

function IfcModel({ url, clash_status }: { url: string, clash_status: string }) {
  const [model, setModel] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    if (!url) return;
    
    const ifcLoader = new IFCLoader();
    // Using unpkg CDN for the massive WebAssembly binaries to avoid Next.js local compilation bottlenecks
    ifcLoader.ifcManager.setWasmPath("https://unpkg.com/web-ifc@0.0.35/");
    
    ifcLoader.load(url, (ifcModel) => {
        setModel(ifcModel);
    });

    return () => {
        // Clean up memory when a new model is uploaded
        setModel(null);
    }
  }, [url]);

  // Handle Math Engine Coloring System Matrix
  useEffect(() => {
    if(!model) return;
    
    // Mathematically traverse the entire 3D mesh structure
    model.traverse((child) => {
        if((child as THREE.Mesh).isMesh) {
             const mesh = child as THREE.Mesh;
             
             // Backup original architectural materials deeply
             if(!mesh.userData.origMat) {
                  mesh.userData.origMat = Array.isArray(mesh.material)
                     ? mesh.material.map(m => m.clone())
                     : (mesh.material as THREE.Material).clone();
             }
             
             // Tint geometries based on AI collision states
             if (clash_status === 'critical') {
                 mesh.material = new THREE.MeshStandardMaterial({ color: '#ef4444', wireframe: true });
             } else if (clash_status === 'rerouted') {
                 mesh.material = new THREE.MeshStandardMaterial({ color: '#10b981', transparent: true, opacity: 0.9 });
             } else {
                 mesh.material = mesh.userData.origMat;
             }
        }
    });
  }, [model, clash_status]);

  if (!model) return null;
  return <primitive object={model} />;
}

// A mock cylindrical pipe component as a fallback when no IFC is uploaded yet
function MepPipe({ start, end, radius, clash_status }: any) {
  const color = clash_status === 'critical' ? '#ef4444' : clash_status === 'rerouted' ? '#10b981' : '#38bdf8';
  return (
    <mesh position={[(start.x + end.x)/2, (start.y + end.y)/2, (start.z + end.z)/2]}>
      <cylinderGeometry args={[radius, radius, 10, 32]} />
      <meshStandardMaterial color={color} transparent opacity={0.8} />
    </mesh>
  );
}

export default function ThreeViewer({ clash_status = 'critical', modelUrl }: { clash_status?: "critical" | "rerouted" | "clear", modelUrl?: string | null }) {
  const [isSecureContextReady, setIsSecureContextReady] = useState(false);
  const [supportsImmersiveVR, setSupportsImmersiveVR] = useState(false);

  useEffect(() => {
    const checkWebXRSupport = async () => {
      const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
      const isSecure = window.isSecureContext || isLocalhost || window.location.protocol === "https:";

      setIsSecureContextReady(isSecure);

      if (!isSecure || !("xr" in navigator) || !navigator.xr?.isSessionSupported) {
        setSupportsImmersiveVR(false);
        return;
      }

      try {
        const supported = await navigator.xr.isSessionSupported("immersive-vr");
        setSupportsImmersiveVR(supported);
      } catch {
        setSupportsImmersiveVR(false);
      }
    };

    checkWebXRSupport();
  }, []);

  return (
    <div className="w-full h-[600px] relative rounded-xl overflow-hidden glass-panel">
      {supportsImmersiveVR && (
        <VRButton className="absolute top-4 right-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
      )}

      {!isSecureContextReady && (
        <div className="absolute left-4 right-4 top-4 z-50 rounded-lg border border-amber-400/30 bg-amber-950/85 px-4 py-3 text-sm text-amber-100 backdrop-blur">
          WebXR VR mode needs HTTPS after upload. The 3D viewer still works on HTTP, but VR is disabled until you serve this site over HTTPS.
        </div>
      )}
      
      {/* Loading Overlay */}
      {modelUrl && clash_status === 'clear' && (
          <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
             <div className="animate-pulse text-sky-400 font-bold border border-sky-500/30 bg-sky-900/40 px-6 py-3 rounded-full flex items-center space-x-3">
                <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"/>
                <span>Initializing WebAssembly Engine...</span>
             </div>
          </div>
      )}

      <Canvas camera={{ position: [-15, 15, 20], fov: 50 }}>
        <XR>
          <ambientLight intensity={0.6} />
          <directionalLight position={[20, 20, 10]} intensity={1.5} />
          <pointLight position={[-10, 10, -10]} intensity={0.5} />
          
          <Suspense fallback={null}>
             {modelUrl ? (
                 <IfcModel url={modelUrl} clash_status={clash_status} />
             ) : (
                 <MepPipe start={{x: 0, y: 0, z: 0}} end={{x: 5, y:0, z:0}} radius={1} clash_status={clash_status} />
             )}
             <Grid infiniteGrid fadeDistance={40} cellColor="#ffffff" sectionColor="#ffffff" />
             <Environment preset="city" />
          </Suspense>
          <OrbitControls makeDefault />
        </XR>
      </Canvas>
    </div>
  );
}
