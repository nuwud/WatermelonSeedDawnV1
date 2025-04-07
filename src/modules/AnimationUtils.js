// modules/AnimationUtils.js

export default {
    /**
     * Animate an object's scale uniformly
     * @param {Object} object - The THREE.js object to scale
     * @param {number} targetScale - Target scale value (applied to x, y, and z)
     * @param {number} duration - Duration in seconds
     * @param {Function} onComplete - Optional callback when animation completes
     */
    animateScale(object, targetScale, duration = 0.3, onComplete = null) {
      if (!object) return
      
      const startScale = {
        x: object.scale.x,
        y: object.scale.y,
        z: object.scale.z
      }
      
      const startTime = Date.now()
      const endTime = startTime + duration * 1000
      
      const updateScale = () => {
        const now = Date.now()
        
        if (now >= endTime) {
          // Animation complete
          object.scale.set(targetScale, targetScale, targetScale)
          if (onComplete) onComplete()
          return
        }
        
        // Calculate progress (0 to 1)
        const progress = (now - startTime) / (endTime - startTime)
        
        // Use cubic ease out
        const easedProgress = 1 - Math.pow(1 - progress, 3)
        
        // Calculate current scale
        const currentScale = {
          x: startScale.x + (targetScale - startScale.x) * easedProgress,
          y: startScale.y + (targetScale - startScale.y) * easedProgress,
          z: startScale.z + (targetScale - startScale.z) * easedProgress
        }
        
        // Apply scale
        object.scale.set(currentScale.x, currentScale.y, currentScale.z)
        
        // Continue animation
        requestAnimationFrame(updateScale)
      }
      
      // Start the animation
      updateScale()
    },
    
    /**
     * Animate a property of an object
     * @param {Object} object - The object containing the property
     * @param {string} property - The property name to animate
     * @param {number} targetValue - Target property value
     * @param {number} duration - Duration in seconds
     * @param {Function} onComplete - Optional callback when animation completes
     */
    animateProperty(object, property, targetValue, duration = 0.3, onComplete = null) {
      if (!object || object[property] === undefined) return
      
      const startValue = object[property]
      const startTime = Date.now()
      const endTime = startTime + duration * 1000
      
      const updateProperty = () => {
        const now = Date.now()
        
        if (now >= endTime) {
          // Animation complete
          object[property] = targetValue
          if (object.needsUpdate) object.needsUpdate = true
          if (onComplete) onComplete()
          return
        }
        
        // Calculate progress (0 to 1)
        const progress = (now - startTime) / (endTime - startTime)
        
        // Use cubic ease out
        const easedProgress = 1 - Math.pow(1 - progress, 3)
        
        // Calculate current value
        const currentValue = startValue + (targetValue - startValue) * easedProgress
        
        // Apply value
        object[property] = currentValue
        if (object.needsUpdate) object.needsUpdate = true
        
        // Continue animation
        requestAnimationFrame(updateProperty)
      }
      
      // Start the animation
      updateProperty()
    },
    
    /**
     * Create a tween animation between two values
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} duration - Duration in seconds
     * @param {Function} onUpdate - Update callback with current value
     * @param {Function} onComplete - Optional callback when complete
     */
    tween(start, end, duration, onUpdate, onComplete = null) {
      const startTime = Date.now()
      const endTime = startTime + duration * 1000
      
      const update = () => {
        const now = Date.now()
        
        if (now >= endTime) {
          // Animation complete
          onUpdate(end)
          if (onComplete) onComplete()
          return
        }
        
        // Calculate progress (0 to 1)
        const progress = (now - startTime) / (endTime - startTime)
        
        // Use cubic ease out
        const easedProgress = 1 - Math.pow(1 - progress, 3)
        
        // Calculate current value
        const currentValue = start + (end - start) * easedProgress
        
        // Update with current value
        onUpdate(currentValue)
        
        // Continue animation
        requestAnimationFrame(update)
      }
      
      // Start the animation
      update()
    }
  }