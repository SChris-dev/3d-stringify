import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import type { SavedShape, ThreeEngine, TrackingData } from '../types';
import { HAND_CONNECTIONS, FINGERTIP_INDICES } from '../constants';

interface UseThreeSceneParams {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  savedShapes: SavedShape[];
  themeColors: {
    stringLine: number;
    shapePrimary: number;
    shapeGlow: number;
    grabHighlight: number;
  };
  selectedShape: 'cube' | 'pyramid' | 'sphere' | 'torus' | 'octahedron';
  lineStyle: 'neon' | 'thin' | 'thick';
  showOverlay: boolean;
  appMode: 'spawner' | 'vision_web';
  connectionMode: 'skeleton' | 'fingertips' | 'complete_graph';
  showEnergyWeb: boolean;
  enableHandBridge: boolean;
  trackingDataRef: React.RefObject<TrackingData>;
  savedShapesRef: React.RefObject<SavedShape[]>;
}

export function useThreeScene({
  canvasRef,
  savedShapes,
  themeColors,
  selectedShape,
  lineStyle,
  showOverlay,
  appMode,
  connectionMode,
  showEnergyWeb,
  enableHandBridge,
  trackingDataRef,
  savedShapesRef
}: UseThreeSceneParams) {
  
  const threeEngineRef = useRef<ThreeEngine>({
    scene: null,
    camera: null,
    renderer: null,
    handGroups: [],
    visionLineSegments: null,
    activeHoverMeshGroup: null,
    pinnedMeshGroups: new Map(),
    particleSystem: null,
    particlePositions: null,
    particleVelocities: null,
    particleLifes: null
  });

  const createShapeMeshGroup = useCallback((
    shapeType: 'cube' | 'pyramid' | 'sphere' | 'torus' | 'octahedron',
    colors: { shapePrimary: number; shapeGlow: number }
  ) => {
    const group = new THREE.Group();

    let innerGeo: THREE.BufferGeometry;
    let outerGeo: THREE.BufferGeometry;

    if (shapeType === 'cube') {
      innerGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      outerGeo = new THREE.BoxGeometry(0.52, 0.52, 0.52);
    } else if (shapeType === 'pyramid') {
      innerGeo = new THREE.ConeGeometry(0.4, 0.6, 4);
      outerGeo = new THREE.ConeGeometry(0.42, 0.62, 4);
    } else if (shapeType === 'sphere') {
      innerGeo = new THREE.SphereGeometry(0.35, 24, 24);
      outerGeo = new THREE.SphereGeometry(0.37, 16, 16);
    } else if (shapeType === 'torus') {
      innerGeo = new THREE.TorusGeometry(0.3, 0.12, 16, 32);
      outerGeo = new THREE.TorusGeometry(0.3, 0.13, 12, 24);
    } else { // octahedron
      innerGeo = new THREE.OctahedronGeometry(0.4);
      outerGeo = new THREE.OctahedronGeometry(0.42);
    }

    const innerMat = new THREE.MeshStandardMaterial({
      color: colors.shapePrimary,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.75
    });

    const outerMat = new THREE.MeshBasicMaterial({
      color: colors.shapeGlow,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });

    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);

    group.add(innerMesh);
    group.add(outerMesh);

    return group;
  }, []);

  // 1. Core Scene Setup Effect
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 0, 3);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(themeColors.shapePrimary, 1.5);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(themeColors.stringLine, 0.8);
    pointLight2.position.set(-10, -10, -10);
    scene.add(pointLight2);

    const handGroups = [new THREE.Group(), new THREE.Group()];
    handGroups.forEach((hg) => {
      for (let i = 0; i < 21; i++) {
        const radius = FINGERTIP_INDICES.includes(i) ? 0.035 : 0.02;
        const jointGeo = new THREE.SphereGeometry(radius, 8, 8);
        const jointMat = new THREE.MeshBasicMaterial({ color: themeColors.stringLine });
        const jointMesh = new THREE.Mesh(jointGeo, jointMat);
        jointMesh.name = `joint_${i}`;
        hg.add(jointMesh);
      }

      HAND_CONNECTIONS.forEach((_, cIdx) => {
        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(6), 3));
        const lineMat = new THREE.LineBasicMaterial({
          color: themeColors.stringLine,
          transparent: true,
          opacity: 0.85,
          linewidth: lineStyle === 'thick' ? 3 : 1
        });
        const lineMesh = new THREE.Line(lineGeo, lineMat);
        lineMesh.name = `bone_${cIdx}`;
        hg.add(lineMesh);
      });

      scene.add(hg);
    });

    const visionLineGeo = new THREE.BufferGeometry();
    const maxLineSegments = 100;
    visionLineGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(maxLineSegments * 6), 3));
    const visionLineMat = new THREE.LineBasicMaterial({
      color: themeColors.stringLine,
      transparent: true,
      opacity: 0.9,
      linewidth: 2
    });
    const visionLineSegments = new THREE.LineSegments(visionLineGeo, visionLineMat);
    scene.add(visionLineSegments);

    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = new Float32Array(particleCount * 3);
    const particleLifes = new Float32Array(particleCount);

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: themeColors.shapePrimary,
      size: 0.04,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    threeEngineRef.current = {
      scene,
      camera,
      renderer,
      handGroups,
      visionLineSegments,
      activeHoverMeshGroup: null,
      pinnedMeshGroups: new Map(),
      particleSystem,
      particlePositions,
      particleVelocities,
      particleLifes
    };

    const handleResize = () => {
      if (!canvasRef.current) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((mat) => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
    };
  }, []);

  // 2. Theme color configuration update effect
  useEffect(() => {
    const { scene, handGroups, visionLineSegments } = threeEngineRef.current;
    if (!scene) return;

    handGroups.forEach((hg) => {
      hg.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
          child.material.color.setHex(themeColors.stringLine);
        }
        if (child instanceof THREE.Line && child.material instanceof THREE.LineBasicMaterial) {
          child.material.color.setHex(themeColors.stringLine);
        }
      });
    });

    if (visionLineSegments && visionLineSegments.material instanceof THREE.LineBasicMaterial) {
      visionLineSegments.material.color.setHex(themeColors.stringLine);
    }
  }, [themeColors]);

  // 3. Hover shape update effect
  useEffect(() => {
    const { scene, activeHoverMeshGroup } = threeEngineRef.current;
    if (!scene) return;

    if (activeHoverMeshGroup) {
      scene.remove(activeHoverMeshGroup);
      activeHoverMeshGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
    }

    const newGroup = createShapeMeshGroup(selectedShape, themeColors);
    newGroup.visible = false;
    scene.add(newGroup);
    threeEngineRef.current.activeHoverMeshGroup = newGroup;
  }, [selectedShape, themeColors, createShapeMeshGroup]);

  // 4. Saved shapes state synchronizer with scene + GPU disposal
  const lastThemeColorsRef = useRef(themeColors);

  useEffect(() => {
    const { scene, pinnedMeshGroups } = threeEngineRef.current;
    if (!scene) return;

    const themeChanged = lastThemeColorsRef.current !== themeColors;
    if (themeChanged) {
      pinnedMeshGroups.forEach((group) => {
        scene.remove(group);
        group.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((m) => m.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      });
      pinnedMeshGroups.clear();
      lastThemeColorsRef.current = themeColors;
    }

    savedShapes.forEach((shape) => {
      if (!pinnedMeshGroups.has(shape.id)) {
        const group = createShapeMeshGroup(shape.type, themeColors);
        group.position.set(shape.position[0], shape.position[1], shape.position[2]);
        group.rotation.set(shape.rotation[0], shape.rotation[1], shape.rotation[2]);
        group.scale.set(shape.scale, shape.scale, shape.scale);
        scene.add(group);
        pinnedMeshGroups.set(shape.id, group);
      } else {
        const group = pinnedMeshGroups.get(shape.id);
        if (group) {
          if (trackingDataRef.current.grabbedShapeId !== shape.id) {
            group.position.set(shape.position[0], shape.position[1], shape.position[2]);
          }
          group.scale.set(shape.scale, shape.scale, shape.scale);
        }
      }
    });

    const savedIds = new Set(savedShapes.map((s) => s.id));
    pinnedMeshGroups.forEach((group, id) => {
      if (!savedIds.has(id)) {
        scene.remove(group);
        group.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((m) => m.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
        pinnedMeshGroups.delete(id);
      }
    });
  }, [savedShapes, themeColors, createShapeMeshGroup, trackingDataRef]);

  // 5. Trigger Particle Explosion Callback
  const triggerParticleExplosion = useCallback((x: number, y: number, z: number) => {
    const { particleSystem, particlePositions, particleVelocities, particleLifes } = threeEngineRef.current;
    if (!particlePositions || !particleVelocities || !particleLifes || !particleSystem) return;

    const count = particlePositions.length / 3;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      particlePositions[i3] = x;
      particlePositions[i3 + 1] = y;
      particlePositions[i3 + 2] = z;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = 0.03 + Math.random() * 0.08;

      particleVelocities[i3] = speed * Math.sin(phi) * Math.cos(theta);
      particleVelocities[i3 + 1] = speed * Math.sin(phi) * Math.sin(theta);
      particleVelocities[i3 + 2] = speed * Math.cos(phi);

      particleLifes[i] = 1.0;
    }

    if (particleSystem.material instanceof THREE.PointsMaterial) {
      particleSystem.material.opacity = 1.0;
      particleSystem.material.color.setHex(themeColors.shapePrimary);
    }
  }, [themeColors]);

  // 6. Animation Render Loop Effect
  useEffect(() => {
    let animId: number;

    const animateLoop = () => {
      animId = requestAnimationFrame(animateLoop);

      const { scene, camera, renderer, handGroups, visionLineSegments, activeHoverMeshGroup, pinnedMeshGroups } = threeEngineRef.current;
      if (!scene || !camera || !renderer) return;

      const landmarks = trackingDataRef.current.smoothedLandmarks || [];

      // A. Hand Skeleton render + Energy webs
      let lineVertexIdx = 0;
      const visionPosAttr = visionLineSegments ? visionLineSegments.geometry.attributes.position : null;

      handGroups.forEach((hg, hIdx) => {
        const hand = landmarks[hIdx];
        if (!hand || !showOverlay) {
          hg.visible = false;
          return;
        }

        hg.visible = true;

        const pts3D = hand.map((pt) => [
          (0.5 - pt.x) * 4.2,
          (0.5 - pt.y) * 2.8,
          -1.2 - pt.z * 2.5
        ]);

        pts3D.forEach((pos, jIdx) => {
          const jointMesh = hg.getObjectByName(`joint_${jIdx}`);
          if (jointMesh) {
            jointMesh.position.set(pos[0], pos[1], pos[2]);
          }
        });

        HAND_CONNECTIONS.forEach(([i, j], cIdx) => {
          const lineMesh = hg.getObjectByName(`bone_${cIdx}`) as THREE.Line;
          if (lineMesh && lineMesh.geometry) {
            lineMesh.visible = connectionMode === 'skeleton' || appMode === 'spawner';
            if (lineMesh.visible) {
              const posAttr = lineMesh.geometry.attributes.position as THREE.BufferAttribute;
              posAttr.setXYZ(0, pts3D[i][0], pts3D[i][1], pts3D[i][2]);
              posAttr.setXYZ(1, pts3D[j][0], pts3D[j][1], pts3D[j][2]);
              posAttr.needsUpdate = true;
            }
          }
        });

        if ((showEnergyWeb || appMode === 'vision_web') && visionPosAttr) {
          if (connectionMode === 'fingertips') {
            for (let f = 0; f < FINGERTIP_INDICES.length; f++) {
              const idx1 = FINGERTIP_INDICES[f];
              const idx2 = FINGERTIP_INDICES[(f + 1) % FINGERTIP_INDICES.length];
              visionPosAttr.setXYZ(lineVertexIdx++, pts3D[idx1][0], pts3D[idx1][1], pts3D[idx1][2]);
              visionPosAttr.setXYZ(lineVertexIdx++, pts3D[idx2][0], pts3D[idx2][1], pts3D[idx2][2]);
            }
          } else if (connectionMode === 'complete_graph') {
            for (let i = 0; i < FINGERTIP_INDICES.length; i++) {
              for (let j = i + 1; j < FINGERTIP_INDICES.length; j++) {
                const idx1 = FINGERTIP_INDICES[i];
                const idx2 = FINGERTIP_INDICES[j];
                visionPosAttr.setXYZ(lineVertexIdx++, pts3D[idx1][0], pts3D[idx1][1], pts3D[idx1][2]);
                visionPosAttr.setXYZ(lineVertexIdx++, pts3D[idx2][0], pts3D[idx2][1], pts3D[idx2][2]);
              }
            }
          }
        }
      });

      // B. Cross-Hand Bridge line renderer
      if (enableHandBridge && landmarks.length >= 2 && visionPosAttr) {
        const hand0 = landmarks[0].map((pt) => [(0.5 - pt.x) * 4.2, (0.5 - pt.y) * 2.8, -1.2 - pt.z * 2.5]);
        const hand1 = landmarks[1].map((pt) => [(0.5 - pt.x) * 4.2, (0.5 - pt.y) * 2.8, -1.2 - pt.z * 2.5]);

        FINGERTIP_INDICES.forEach((tipIdx) => {
          visionPosAttr.setXYZ(lineVertexIdx++, hand0[tipIdx][0], hand0[tipIdx][1], hand0[tipIdx][2]);
          visionPosAttr.setXYZ(lineVertexIdx++, hand1[tipIdx][0], hand1[tipIdx][1], hand1[tipIdx][2]);
        });
      }

      if (visionLineSegments && visionPosAttr) {
        visionLineSegments.geometry.setDrawRange(0, lineVertexIdx);
        visionPosAttr.needsUpdate = true;
      }

      // C. Active hover shape renderer
      if (activeHoverMeshGroup) {
        const p1 = trackingDataRef.current.palmCenters[0];
        const p2 = trackingDataRef.current.palmCenters[1];
        const isAlreadyPinned = savedShapesRef.current.some((s) => s.type === selectedShape);

        if (
          appMode !== 'spawner' ||
          !trackingDataRef.current.activeShapeSpawned ||
          isAlreadyPinned ||
          (!p1 && !p2)
        ) {
          activeHoverMeshGroup.visible = false;
        } else {
          activeHoverMeshGroup.visible = true;

          activeHoverMeshGroup.rotation.x += 0.015;
          activeHoverMeshGroup.rotation.y += 0.02;

          let targetX = 0, targetY = 0, targetZ = -2.0;

          if (p1 && p2) {
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            const midZ = (p1.z + p2.z) / 2;
            targetX = (0.5 - midX) * 4.2;
            targetY = (0.5 - midY) * 2.8;
            targetZ = -1.2 - midZ * 2.5;
          } else if (p1) {
            targetX = (0.5 - p1.x) * 4.2;
            targetY = (0.5 - p1.y) * 2.8;
            targetZ = -1.2 - p1.z * 2.5;
          }

          activeHoverMeshGroup.position.x += (targetX - activeHoverMeshGroup.position.x) * 0.25;
          activeHoverMeshGroup.position.y += (targetY - activeHoverMeshGroup.position.y) * 0.25;
          activeHoverMeshGroup.position.z += (targetZ - activeHoverMeshGroup.position.z) * 0.25;

          const scale = trackingDataRef.current.currentScale || 1.0;
          activeHoverMeshGroup.scale.set(scale, scale, scale);
        }
      }

      // D. Pinned shapes animations
      pinnedMeshGroups.forEach((group, id) => {
        const isGrabbed = trackingDataRef.current.grabbedShapeId === id;
        if (!isGrabbed) {
          group.rotation.y += 0.01;
          group.rotation.x += 0.005;
        }
      });

      // E. Particle burst simulation
      const { particleSystem, particlePositions, particleVelocities, particleLifes } = threeEngineRef.current;
      if (particleSystem && particlePositions && particleVelocities && particleLifes && particleSystem.material instanceof THREE.PointsMaterial && particleSystem.material.opacity > 0.01) {
        const count = particlePositions.length / 3;
        let anyAlive = false;

        for (let i = 0; i < count; i++) {
          if (particleLifes[i] > 0) {
            const i3 = i * 3;
            particlePositions[i3] += particleVelocities[i3];
            particlePositions[i3 + 1] += particleVelocities[i3 + 1];
            particlePositions[i3 + 2] += particleVelocities[i3 + 2];

            particleVelocities[i3 + 1] -= 0.001;
            particleLifes[i] -= 0.03;
            if (particleLifes[i] > 0) anyAlive = true;
          }
        }

        const posAttr = particleSystem.geometry.attributes.position as THREE.BufferAttribute;
        posAttr.needsUpdate = true;
        particleSystem.material.opacity *= 0.94;
        if (!anyAlive) particleSystem.material.opacity = 0;
      }

      renderer.render(scene, camera);
    };

    animateLoop();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [showOverlay, selectedShape, appMode, connectionMode, showEnergyWeb, enableHandBridge, trackingDataRef, savedShapesRef]);

  return {
    threeEngine: threeEngineRef.current,
    triggerParticleExplosion
  };
}
