// modules/BackgroundManager.js
import * as THREE from 'three'

export default class BackgroundManager {
  constructor(scene, settings) {
    this.scene = scene
    this.theme = settings.skyballTheme || 'starry'
    
    this.stars = null
    this.nebula = null
    
    this.init()
  }
  
  init() {
    this.createStarfield()
    
    if (this.theme === 'nebula' || this.theme === 'sunset') {
      this.createNebula()
    }
  }
  
  createStarfield() {
    // Create a large sphere for stars
    const starsGeometry = new THREE.BufferGeometry()
    const starsCount = 2000
    const starsPositions = new Float32Array(starsCount * 3)
    const starsSizes = new Float32Array(starsCount)
    
    for (let i = 0; i < starsCount; i++) {
      const i3 = i * 3
      
      // Distribute stars in a sphere around the camera
      const phi = Math.random() * Math.PI * 2
      const theta = Math.random() * Math.PI
      const radius = 50 + Math.random() * 50
      
      starsPositions[i3] = radius * Math.sin(theta) * Math.cos(phi)
      starsPositions[i3 + 1] = radius * Math.sin(theta) * Math.sin(phi)
      starsPositions[i3 + 2] = radius * Math.cos(theta)
      
      // Random sizes for stars
      starsSizes[i] = Math.random() * 2 + 0.5
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3))
    starsGeometry.setAttribute('aSize', new THREE.BufferAttribute(starsSizes, 1))
    
    // Create star material with custom shader for twinkling
    const starsMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }
      },
      vertexShader: `
        uniform float uTime;
        attribute float aSize;
        varying float vSize;
        
        void main() {
          vSize = aSize;
          // Slight twinkling effect
          float twinkle = sin(uTime + position.x * 10.0) * 0.5 + 0.5;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (1.0 + 0.5 * twinkle) * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vSize;
        
        void main() {
          // Create circular points with soft edges
          float distanceToCenter = length(gl_PointCoord - vec2(0.5));
          float strength = 1.0 - smoothstep(0.4, 0.5, distanceToCenter);
          
          // Color gradient based on size
          vec3 color = mix(vec3(0.4, 0.7, 1.0), vec3(1.0), vSize / 3.0);
          
          gl_FragColor = vec4(color, strength);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    
    this.stars = new THREE.Points(starsGeometry, starsMaterial)
    this.scene.add(this.stars)
  }
  
  createNebula() {
    const nebulaGeometry = new THREE.IcosahedronGeometry(80, 4)
    
    // Choose colors based on theme
    let nebulaColorA, nebulaColorB
    
    if (this.theme === 'nebula') {
      nebulaColorA = new THREE.Color(0x1a0a3a)
      nebulaColorB = new THREE.Color(0x0a1a3a)
    } else if (this.theme === 'sunset') {
      nebulaColorA = new THREE.Color(0x3a0a1a) 
      nebulaColorB = new THREE.Color(0x1a0a2a)
    }
    
    const nebulaMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        colorA: { value: nebulaColorA },
        colorB: { value: nebulaColorB }
      },
      vertexShader: `
        varying vec3 vPosition;
        
        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 colorA;
        uniform vec3 colorB;
        varying vec3 vPosition;
        
        // Simple noise function
        float noise(vec3 p) {
          return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
        }
        
        void main() {
          // Create organic nebula-like patterns
          vec3 pos = normalize(vPosition) * 10.0;
          float n = noise(pos + time * 0.05);
          
          // Create nebula colors
          vec3 color = mix(colorA, colorB, n);
          
          // Add some subtle color variations
          color += 0.1 * vec3(
            noise(pos * 2.0 + vec3(0.0, 0.0, time * 0.1)),
            noise(pos * 2.1 + vec3(time * 0.15, 0.0, 0.0)),
            noise(pos * 2.2 + vec3(0.0, time * 0.12, 0.0))
          );
          
          // Transparency based on noise pattern
          float alpha = smoothstep(0.1, 0.3, noise(pos + vec3(time * 0.03))) * 0.3;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    
    this.nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial)
    this.scene.add(this.nebula)
  }
  
  update(time) {
    // Update star shader uniforms
    if (this.stars && this.stars.material.uniforms) {
      this.stars.material.uniforms.uTime.value = time
      this.stars.rotation.y = time * 0.01
    }
    
    // Update nebula shader uniforms
    if (this.nebula && this.nebula.material.uniforms) {
      this.nebula.material.uniforms.time.value = time
    }
  }
  
  dispose() {
    // Dispose of geometries and materials
    if (this.stars) {
      this.stars.geometry.dispose()
      this.stars.material.dispose()
      this.scene.remove(this.stars)
    }
    
    if (this.nebula) {
      this.nebula.geometry.dispose()
      this.nebula.material.dispose()
      this.scene.remove(this.nebula)
    }
  }
}
