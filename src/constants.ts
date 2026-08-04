// Standard MediaPipe Hand Connections
export const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],          // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],          // Index finger
  [5, 9], [9, 10], [10, 11], [11, 12],     // Middle finger
  [9, 13], [13, 14], [14, 15], [15, 16],   // Ring finger
  [13, 17], [17, 18], [18, 19], [19, 20],  // Pinky finger
  [0, 17]                                  // Palm base connection
];

// Key Fingertip Indices
export const FINGERTIP_INDICES = [4, 8, 12, 16, 20];
export const AVAILABLE_SHAPES = ['cube', 'pyramid', 'sphere', 'torus', 'octahedron'] as const;
export type ShapeType = typeof AVAILABLE_SHAPES[number];
