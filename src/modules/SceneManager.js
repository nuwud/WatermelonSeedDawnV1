// modules/SceneManagerRefined.js
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import BackgroundManager from './BackgroundManager'
import MenuManager from './MenuManager'
import InteractionManager from './InteractionManager'
import ButtonManager from './ButtonManagerHybrid'

export default class SceneManagerRefined {
  constructor(container, settings) {
    this.container = container
    this.settings = settings

    // Core
    this.scene = null
    this.camera = null
    this.renderer = null
    this.controls = null

    // Managers
    this.backgroundManager = null
    this.menuManager = null
    this.interactionManager = null

    // State
    this.isMenuVisible = false

    this.init()
  }

  init() {
    this.createScene()
    this.addManagers()
    window.addEventListener('resize', this.handleResize.bind(this))
    window.addEventListener('openWatermelonCarousel3DMenu', () => this.toggleMenu(true))
    this.animate()
  }

  createScene() {
    this.scene = new THREE.Scene()

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.camera.position.z = 10

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setClearColor(0x000000, 0)
    this.container.appendChild(this.renderer.domElement)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.enableZoom = false
    this.controls.autoRotate = true
    this.controls.autoRotateSpeed = 0.5

    this.addLighting()
  }

  addLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    this.scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 5, 5)
    this.scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0x3366ff, 0.8, 20)
    pointLight.position.set(0, 0, 5)
    this.scene.add(pointLight)
  }

  addManagers() {
    this.backgroundManager = new BackgroundManager(this.scene, this.settings)

    this.menuManager = new MenuManager(
      this.scene,
      { x: 0, y: -3, z: 0 },
      this.settings
    )

    this.buttonManager = new ButtonManager(this.scene, () => {
      window.dispatchEvent(new CustomEvent('openWatermelonCarousel3DMenu', { detail: { state: this.isMenuVisible } }))
    })

    this.interactionManager = new InteractionManager(
      this.scene,
      this.camera,
      this.buttonManager,
      this.menuManager,
      this.toggleMenu.bind(this),
      this.navigateTo.bind(this)
    )
  }

  toggleMenu(state = null) {
    this.isMenuVisible = state !== null ? state : !this.isMenuVisible

    if (this.isMenuVisible) {
      this.menuManager.show(this.camera, this.controls)
    } else {
      this.menuManager.hide(this.camera, this.controls)
    }
  }

  navigateTo(url) {
    if (url.includes('://') && !url.includes(window.location.host)) {
      window.open(url, '_blank')
      return
    }
    window.location.href = url
  }

  handleResize() {
    if (!this.camera || !this.renderer) return

    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this))
    this.controls?.update()
    const t = performance.now() * 0.001
    this.backgroundManager?.update(t)
    this.menuManager?.update(t)
    this.buttonManager?.update(t)
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    window.removeEventListener('resize', this.handleResize.bind(this))
    this.renderer?.dispose()
    this.container?.removeChild(this.renderer.domElement)
    this.backgroundManager?.dispose()
    this.menuManager?.dispose()
    this.interactionManager?.dispose()
  }
}
