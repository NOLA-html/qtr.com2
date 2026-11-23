import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, Eye, Sparkles, ExternalLink } from 'lucide-react';

interface Motherboard3DViewerProps {
  socket?: string;
  chipset?: string;
  ramType?: string;
  formFactor?: string;
  name: string;
  moboMapUrl?: string;
}

export const Motherboard3DViewer: React.FC<Motherboard3DViewerProps> = ({
  socket = 'AM5',
  chipset = 'B650',
  ramType = 'DDR5',
  formFactor = 'ATX',
  name,
  moboMapUrl = 'https://mobomaps.com/boards'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const materialsRef = useRef<THREE.Material[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 320;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a101d);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 14, 18);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Group for motherboard
    const moboGroup = new THREE.Group();
    scene.add(moboGroup);

    // Track materials for wireframe toggle
    const materials: THREE.Material[] = [];
    materialsRef.current = materials;

    // Helper to register materials
    const makeMat = (params: THREE.MeshStandardMaterialParameters) => {
      const m = new THREE.MeshStandardMaterial(params);
      materials.push(m);
      return m;
    };

    // 1. PCB Board (ATX or Micro-ATX)
    const isMAtx = formFactor?.toLowerCase().includes('micro');
    const pcbWidth = 12;
    const pcbHeight = isMAtx ? 12 : 14.5;
    const pcbDepth = 0.25;

    const pcbMat = makeMat({
      color: 0x141b27,
      roughness: 0.7,
      metalness: 0.15
    });
    const pcbGeo = new THREE.BoxGeometry(pcbWidth, pcbDepth, pcbHeight);
    const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat);
    pcbMesh.receiveShadow = true;
    moboGroup.add(pcbMesh);

    // 2. CPU Socket (centered-top)
    const socketColor = socket?.includes('AM') ? 0xd1d5db : 0x9ca3af;
    const socketMat = makeMat({ color: socketColor, metalness: 0.8, roughness: 0.3 });
    const socketGeo = new THREE.BoxGeometry(3.5, 0.35, 3.5);
    const socketMesh = new THREE.Mesh(socketGeo, socketMat);
    socketMesh.position.set(0, 0.2, -2.5);
    socketMesh.castShadow = true;
    moboGroup.add(socketMesh);

    // Socket lever
    const leverMat = makeMat({ color: 0xe5e7eb, metalness: 0.9, roughness: 0.2 });
    const leverGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.8);
    const leverMesh = new THREE.Mesh(leverGeo, leverMat);
    leverMesh.rotation.z = Math.PI / 2;
    leverMesh.position.set(0, 0.45, -0.6);
    moboGroup.add(leverMesh);

    // 3. VRM Heatsinks (Top & Left of CPU)
    const heatsinkMat = makeMat({ color: 0x1f2937, metalness: 0.85, roughness: 0.25 });
    // Left VRM
    const leftVrm = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 4.2), heatsinkMat);
    leftVrm.position.set(-3.2, 0.65, -2.5);
    leftVrm.castShadow = true;
    moboGroup.add(leftVrm);
    // Top VRM
    const topVrm = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.2, 1.5), heatsinkMat);
    topVrm.position.set(0, 0.65, -5.2);
    topVrm.castShadow = true;
    moboGroup.add(topVrm);

    // 4. Chipset Heatsink (Bottom Right)
    const chipsetMat = makeMat({ color: 0x00a6d6, metalness: 0.7, roughness: 0.3 });
    const chipsetMesh = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.8, 3.2), chipsetMat);
    chipsetMesh.position.set(3.2, 0.45, 3.5);
    chipsetMesh.castShadow = true;
    moboGroup.add(chipsetMesh);

    // 5. RAM Slots (Right of CPU, 4 DIMMs)
    const ramSlotMat = makeMat({ color: 0x111827, roughness: 0.8 });
    const ramClipMat = makeMat({ color: ramType === 'DDR5' ? 0x00a6d6 : 0x10b981, roughness: 0.5 });

    for (let i = 0; i < 4; i++) {
      const ramSlot = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 5), ramSlotMat);
      ramSlot.position.set(2.4 + i * 0.7, 0.3, -2.2);
      moboGroup.add(ramSlot);

      // Top clip
      const clip = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.6, 0.3), ramClipMat);
      clip.position.set(2.4 + i * 0.7, 0.35, -4.6);
      moboGroup.add(clip);
    }

    // 6. PCIe Expansion Slots
    const pcieMat = makeMat({ color: 0x374151, metalness: 0.6, roughness: 0.4 });
    // Primary PCIe x16 (armored)
    const pcie1 = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.6, 0.45), pcieMat);
    pcie1.position.set(-1.2, 0.35, 0.8);
    moboGroup.add(pcie1);

    // Secondary PCIe
    const pcie2 = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.5, 0.4), pcieMat);
    pcie2.position.set(-1.2, 0.3, 3.2);
    moboGroup.add(pcie2);

    // 7. M.2 Heatshield Plates
    const m2Mat = makeMat({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const m2Slot1 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.3, 1.2), m2Mat);
    m2Slot1.position.set(-1.2, 0.25, -0.4);
    moboGroup.add(m2Slot1);

    const m2Slot2 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.3, 1.2), m2Mat);
    m2Slot2.position.set(-1.2, 0.25, 2.0);
    moboGroup.add(m2Slot2);

    // 8. Rear I/O Block
    const ioMat = makeMat({ color: 0x475569, metalness: 0.9, roughness: 0.2 });
    const ioBlock = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 5.5), ioMat);
    ioBlock.position.set(-5.1, 1.1, -4.0);
    ioBlock.castShadow = true;
    moboGroup.add(ioBlock);

    // 9. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight.position.set(15, 25, 15);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const cyanRimLight = new THREE.PointLight(0x00a6d6, 3.5, 30);
    cyanRimLight.position.set(-10, 8, -8);
    scene.add(cyanRimLight);

    const warmAccentLight = new THREE.PointLight(0xf59e0b, 1.8, 25);
    warmAccentLight.position.set(10, 5, 10);
    scene.add(warmAccentLight);

    // Mouse / Touch Interaction for Orbiting
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      moboGroup.rotation.y += deltaX * 0.008;
      moboGroup.rotation.x += deltaY * 0.008;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(9, Math.min(30, camera.position.z + e.deltaY * 0.02));
      camera.position.y = Math.max(6, Math.min(22, camera.position.y + e.deltaY * 0.015));
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Initial orientation
    moboGroup.rotation.x = 0.55;
    moboGroup.rotation.y = -0.45;

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (isRotating && !isDragging) {
        moboGroup.rotation.y += 0.004;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 320;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      renderer.dispose();
      materials.forEach((m) => m.dispose());
      if (container && dom) {
        container.innerHTML = '';
      }
    };
  }, [formFactor, socket, chipset, ramType, isRotating]);

  const toggleWireframe = () => {
    setWireframe((prev) => {
      const next = !prev;
      materialsRef.current.forEach((m) => {
        (m as THREE.MeshStandardMaterial).wireframe = next;
      });
      return next;
    });
  };

  return (
    <div className="bg-[#0a101d] rounded-2xl border border-slate-800 p-4 space-y-3 text-white overflow-hidden shadow-xl">
      {/* 3D Viewer Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00A6D6] animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-200">
            Interactive 3D PCB Architecture
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-[#00A6D6] border border-blue-500/30">
            {socket} · {chipset}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsRotating((prev) => !prev)}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
              isRotating ? 'bg-cyan-500/20 text-[#00A6D6]' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title={isRotating ? 'Pause auto-rotation' : 'Resume auto-rotation'}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline text-[11px]">{isRotating ? 'Spinning' : 'Static'}</span>
          </button>

          <button
            type="button"
            onClick={toggleWireframe}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
              wireframe ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle Wireframe mode"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Wireframe</span>
          </button>
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-72 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing relative flex items-center justify-center bg-radial from-slate-900 to-[#0a101d]"
      />

      {/* Interaction Helper & MoboMaps Verified Link */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <ZoomIn className="w-3.5 h-3.5 text-[#00A6D6]" />
          <span>Click &amp; drag to rotate · Scroll wheel to zoom</span>
        </span>

        <a
          href={moboMapUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[#00A6D6] hover:text-cyan-300 font-bold transition-colors underline"
        >
          <span>More info on motherboard (MoboMaps)</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
