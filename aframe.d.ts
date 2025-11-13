// src/lib/types/aframe.d.ts

import 'aframe';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-assets': any;
      'a-sky': any;
      'a-entity': any;
      'a-camera': any;
      'a-text': any;
      'a-ring': any;
      'a-light': any;
      'a-plane': any;
      'a-box': any;
      'a-sphere': any;
      'a-cylinder': any;
      'a-circle': any;
      'a-torus': any;
    }
  }
}

export {};
