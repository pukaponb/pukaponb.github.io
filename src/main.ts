import './style.css';
import * as THREE from 'three';
import { 
  createIcons, 
  ArrowUpRight, 
  Sparkle, 
  Database, 
  GitBranch, 
  Terminal, 
  Code, 
  Cpu, 
  Server, 
  Layers, 
  Globe, 
  Monitor,
  ChevronDown
} from 'lucide';

// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', () => {
  createIcons({
    icons: {
      ArrowUpRight,
      Sparkle,
      Database,
      GitBranch,
      Terminal,
      Code,
      Cpu,
      Server,
      Layers,
      Globe,
      Monitor,
      ChevronDown
    }
  });
});

// Three.js Interactive WebGL Particle Background
class WebGLBackground {
  private canvas!: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private particles!: THREE.Points;
  private particleCount = 1000;
  private mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  private clock = new THREE.Clock();

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'webgl-canvas';
    this.canvas.className = 'fixed inset-0 -z-10 pointer-events-none opacity-45';
    document.body.appendChild(this.canvas);

    this.init();
    this.animate();

    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  private init() {
    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.z = 30;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle Geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);
    const initialPositions = new Float32Array(this.particleCount * 3);

    // Color definitions to match design aesthetics (teal accent #324444 and bright white)
    const colorTeal = new THREE.Color('#324444');
    const colorWhite = new THREE.Color('#ffffff');

    for (let i = 0; i < this.particleCount; i++) {
      // Semi-random spread of particles in space
      const x = (Math.random() - 0.5) * 60;
      const y = (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 20;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      initialPositions[i * 3] = x;
      initialPositions[i * 3 + 1] = y;
      initialPositions[i * 3 + 2] = z;

      // Color variation: 80% teal, 20% bright white stardust
      const isWhite = Math.random() > 0.8;
      const mixedColor = isWhite ? colorWhite : colorTeal.clone().addScalar(Math.random() * 0.15);

      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('initialPosition', new THREE.BufferAttribute(initialPositions, 3));

    // Particle texture creator (Soft round circle)
    const canvasTexture = document.createElement('canvas');
    canvasTexture.width = 16;
    canvasTexture.height = 16;
    const ctx = canvasTexture.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 16, 16);
    }
    const texture = new THREE.CanvasTexture(canvasTexture);

    // Points Material
    const material = new THREE.PointsMaterial({
      size: 0.4,
      vertexColors: true,
      map: texture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    // Mesh
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  private onMouseMove(event: MouseEvent) {
    // Normalize coordinates from -1 to 1
    this.mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  private onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this));

    const time = this.clock.getElapsedTime();

    // Lerp coordinates for ultra-smooth lagging movement
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    const positions = this.particles.geometry.attributes.position.array as Float32Array;
    const initialPositions = this.particles.geometry.attributes.initialPosition.array as Float32Array;
    const count = this.particleCount;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const initX = initialPositions[i3];
      const initY = initialPositions[i3 + 1];

      // Subtle organic wave animation
      const waveX = Math.sin(time * 0.15 + initY * 0.1) * 1.2;
      const waveY = Math.cos(time * 0.2 + initX * 0.1) * 1.2;

      // Distance to normalized mouse coordinates (projected space)
      const mouseWorldX = this.mouse.x * 25;
      const mouseWorldY = this.mouse.y * 18;

      const currentX = initX + waveX;
      const currentY = initY + waveY;

      const dx = currentX - mouseWorldX;
      const dy = currentY - mouseWorldY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Repulsion force if mouse gets close
      let repX = 0;
      let repY = 0;
      if (dist < 8) {
        const force = (8 - dist) * 0.25;
        repX = (dx / dist) * force;
        repY = (dy / dist) * force;
      }

      positions[i3] = currentX + repX;
      positions[i3 + 1] = currentY + repY;
    }

    this.particles.geometry.attributes.position.needsUpdate = true;

    // Scroll parallax calculation
    const scrollY = window.scrollY || window.pageYOffset;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight || 1;
    const scrollPercent = Math.min(Math.max(scrollY / maxScroll, 0), 1);

    // Zoom the camera along Z axis as the user scrolls down (creating forward travel depth effect)
    const targetCameraZ = 30 - scrollPercent * 12;
    this.camera.position.z += (targetCameraZ - this.camera.position.z) * 0.05;

    // Rotate particles based on scroll
    this.particles.rotation.z = scrollPercent * 0.8;
    this.particles.rotation.x = scrollPercent * 0.3;

    // Soft camera movement tracking the mouse
    this.camera.position.x += (this.mouse.x * 2.5 - this.camera.position.x) * 0.05;
    this.camera.position.y += (this.mouse.y * 2.5 - this.camera.position.y) * 0.05;
    this.camera.lookAt(0, 0, 0);

    // Rotate system slowly
    this.particles.rotation.y = time * 0.01 + scrollPercent * 0.5;

    this.renderer.render(this.scene, this.camera);
  }
}

// Bind cards to timeline-scroller and local info panel
function setupTimelineInteractions() {
  const nodes = document.querySelectorAll('.timeline-node');
  const badges = document.querySelectorAll('.timeline-logo-badge');
  const scroller = document.getElementById('timeline-scroller');
  const line = document.getElementById('timeline-line');
  const progressBar = document.getElementById('timeline-progress-bar');
  
  if (nodes.length === 0 || badges.length === 0 || !scroller) return;

  // Align badges with their cards
  function alignLogos() {
    const scrollerRect = scroller!.getBoundingClientRect();
    const scrollerTop = window.scrollY + scrollerRect.top;

    nodes.forEach((node, idx) => {
      const badge = badges[idx] as HTMLElement;
      if (!badge) return;
      
      const nodeRect = node.getBoundingClientRect();
      const nodeCenterY = window.scrollY + nodeRect.top + nodeRect.height / 2;
      const relativeCenterY = nodeCenterY - scrollerTop;
      
      badge.style.position = 'absolute';
      badge.style.top = `${relativeCenterY - badge.offsetHeight / 2}px`;
    });

    // Align vertical connector line and progress bar limits
    if (line && badges.length > 0) {
      const firstBadge = badges[0] as HTMLElement;
      const lastBadge = badges[badges.length - 1] as HTMLElement;
      
      const firstTop = parseFloat(firstBadge.style.top || '0') + firstBadge.offsetHeight / 2;
      const lastTop = parseFloat(lastBadge.style.top || '0') + lastBadge.offsetHeight / 2;
      
      line.style.top = `${firstTop}px`;
      line.style.height = `${lastTop - firstTop}px`;

      if (progressBar) {
        progressBar.style.top = `${firstTop}px`;
      }
    }
  }

  // Initial alignment
  alignLogos();
  
  // Realign on resize and load
  window.addEventListener('resize', alignLogos);
  window.addEventListener('load', alignLogos);
  // Also realign after images load to handle dynamic height shifts
  document.querySelectorAll('.timeline-logo-badge img').forEach(img => {
    img.addEventListener('load', alignLogos);
  });

  // Track active states and scroll progress
  function updateTimelineProgress() {
    const scrollerRect = scroller!.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const relativeScrollPos = viewportCenter - scrollerRect.top;
    
    // Determine which card is active based on viewport center intersection
    let activeIdx = 0;
    let minDistance = Infinity;

    nodes.forEach((node, idx) => {
      const nodeRect = node.getBoundingClientRect();
      const nodeCenter = nodeRect.top + nodeRect.height / 2;
      const distance = Math.abs(nodeCenter - viewportCenter);
      
      if (distance < minDistance) {
        minDistance = distance;
        activeIdx = idx;
      }
    });

    // Update active classes
    nodes.forEach((node, idx) => {
      const badge = badges[idx] as HTMLElement;
      if (idx === activeIdx) {
        node.classList.add('active-node', 'border-teal-500/30', 'bg-teal-500/2');
        if (badge) {
          badge.classList.add('active-badge', 'border-teal-400');
          badge.style.transform = 'scale(1.15) rotateY(360deg)';
          badge.style.boxShadow = '0 0 20px rgba(45, 212, 191, 0.4)';
        }
      } else {
        node.classList.remove('active-node', 'border-teal-500/30', 'bg-teal-500/2');
        if (badge) {
          badge.classList.remove('active-badge', 'border-teal-400');
          badge.style.transform = 'scale(1) rotateY(0deg)';
          badge.style.boxShadow = 'none';
        }
      }
    });

    // Update progress bar height
    if (progressBar && badges.length > 0) {
      const firstBadge = badges[0] as HTMLElement;
      const lastBadge = badges[badges.length - 1] as HTMLElement;
      
      const firstTop = parseFloat(firstBadge.style.top || '0') + firstBadge.offsetHeight / 2;
      const lastTop = parseFloat(lastBadge.style.top || '0') + lastBadge.offsetHeight / 2;
      
      const progressHeight = Math.min(Math.max(relativeScrollPos - firstTop, 0), lastTop - firstTop);
      progressBar.style.height = `${progressHeight}px`;
    }
  }

  window.addEventListener('scroll', updateTimelineProgress);
  updateTimelineProgress(); // run once initially

  // Add click handlers on badges to scroll to corresponding cards
  badges.forEach((badge, idx) => {
    badge.addEventListener('click', () => {
      const node = nodes[idx];
      if (node) {
        node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  // 3D card tilt animation on hover
  nodes.forEach(node => {
    node.addEventListener('mousemove', (e: any) => {
      const rect = node.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      const angleX = (yc - y) / 16;
      const angleY = (x - xc) / 24;
      (node as HTMLElement).style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1.015)`;
    });

    node.addEventListener('mouseleave', () => {
      (node as HTMLElement).style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
    });
  });
}

// Instantiate the background WebGL scene and bind interactions
new WebGLBackground();
document.addEventListener('DOMContentLoaded', () => {
  setupTimelineInteractions();
});
