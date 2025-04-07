// modules/InteractionManager.js
import * as THREE from 'three'
import AnimationUtils from './AnimationUtils'

export default class InteractionManager {
  constructor(scene, camera, buttonManager, menuManager, toggleMenuCallback, navigateCallback) {
    this.scene = scene
    this.camera = camera
    this.buttonManager = buttonManager
    this.menuManager = menuManager
    this.toggleMenu = toggleMenuCallback
    this.navigateTo = navigateCallback

    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()

    this.init()
  }

  init() {
    window.addEventListener('mousemove', this.onMouseMove.bind(this))
    window.addEventListener('click', this.onClick.bind(this))
  }

  onMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

    this.raycaster.setFromCamera(this.mouse, this.camera)

    const intersects = this.raycaster.intersectObjects(this.scene.children, true)
    let hoveredButton = false
    let hoveredMenuItem = false

    for (let i = 0; i < intersects.length; i++) {
      const object = this.findInteractiveParent(intersects[i].object)

      if (object && object.userData && object.userData.isInteractive) {
        if (object.userData.type === 'button') {
          document.body.style.cursor = 'pointer'
          hoveredButton = true
          if (this.buttonManager?.setHovered) {
            this.buttonManager.setHovered(true)
          }
        }
        else if (object.userData.type === 'menuItem') {
          document.body.style.cursor = 'pointer'
          hoveredMenuItem = true
          if (this.menuManager?.setItemHovered) {
            this.menuManager.setItemHovered(object, true)
          }
        }
        break
      }
    }

    if (!hoveredButton && this.buttonManager?.setHovered) {
      this.buttonManager.setHovered(false)
    }

    if (!hoveredMenuItem && this.menuManager?.menuItems?.length) {
      this.menuManager.menuItems.forEach(item => {
        if (item?.userData?.hovered && this.menuManager.setItemHovered) {
          this.menuManager.setItemHovered(item, false)
        }
      })
    }
  }

  onClick(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersects = this.raycaster.intersectObjects(this.scene.children, true)

    for (let i = 0; i < intersects.length; i++) {
      const object = this.findInteractiveParent(intersects[i].object)

      if (object?.userData?.isInteractive) {
        if (object.userData.type === 'button') {
          this.buttonManager?.animateClick?.()
          this.toggleMenu?.()
        }
        else if (object.userData.type === 'menuItem' && object.userData.url) {
          AnimationUtils.animateScale(object, 1.2, 0.15, () => {
            AnimationUtils.animateScale(object, 0.8, 0.15, () => {
              this.navigateTo?.(object.userData.url)
            })
          })
        }
        break
      }
    }
  }

  findInteractiveParent(object) {
    let current = object
    while (current) {
      if (current.userData?.isInteractive) return current
      current = current.parent
    }
    return null
  }

  dispose() {
    window.removeEventListener('mousemove', this.onMouseMove.bind(this))
    window.removeEventListener('click', this.onClick.bind(this))
  }
}
