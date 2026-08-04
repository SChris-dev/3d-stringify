import * as THREE from 'three';

export interface SavedShape {
  id: number;
  type: 'cube' | 'pyramid' | 'sphere' | 'torus' | 'octahedron';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  createdAt: number;
}

export interface ThreeEngine {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  handGroups: THREE.Group[];
  visionLineSegments: THREE.LineSegments | null;
  activeHoverMeshGroup: THREE.Group | null;
  pinnedMeshGroups: Map<number, THREE.Group>;
  particleSystem: THREE.Points | null;
  particlePositions: Float32Array | null;
  particleVelocities: Float32Array | null;
  particleLifes: Float32Array | null;
}

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface TrackingData {
  landmarks: Landmark[][];
  smoothedLandmarks: Landmark[][];
  prevLandmarks: Landmark[][];
  isOpenPalm: [boolean, boolean];
  isFist: [boolean, boolean];
  isPeaceSign: [boolean, boolean];
  palmCenters: [(Landmark | null), (Landmark | null)];
  pinchCenters: [(Landmark | null), (Landmark | null)];
  isPinching: [boolean, boolean];
  isPrayerGesture: boolean;
  isDoublePinching: boolean;
  initialPinchDist: number | null;
  initialPinchScale: number;
  activeShapeSpawned: boolean;
  crumbleAnimationFactor: number;
  currentScale: number;
  lastPinTime: number;
  lastCrumbleTime: number;
  grabbedShapeId: number | null;
  grabOffset: THREE.Vector3;
  initialGrabAngle: number;
  initialShapeRotation: THREE.Euler;
}
