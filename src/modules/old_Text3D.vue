<template>
  <mesh ref="mesh">
    <slot></slot>
  </mesh>
</template>

<script>
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { defineComponent, onMounted, onUpdated, ref, watch } from 'vue'

export default defineComponent({
  props: {
    font: {
      type: Object,
      required: true
    },
    position: {
      type: Array,
      default: () => [0, 0, 0]
    },
    rotation: {
      type: Array,
      default: () => [0, 0, 0]
    },
    size: {
      type: Number,
      default: 1
    },
    height: {
      type: Number,
      default: 0.2
    },
    curveSegments: {
      type: Number,
      default: 12
    },
    bevelEnabled: {
      type: Boolean,
      default: false
    },
    bevelThickness: {
      type: Number,
      default: 0.1
    },
    bevelSize: {
      type: Number,
      default: 0.1
    },
    bevelOffset: {
      type: Number,
      default: 0
    },
    bevelSegments: {
      type: Number,
      default: 3
    }
  },
  setup(props, { slots }) {
    const mesh = ref(null)
    const textGeometry = ref(null)
    
    // Function to create or update text geometry
    const createTextGeometry = () => {
      if (!props.font) return
      
      // Get text from default slot
      const slotContent = slots.default()[0]?.children
      if (!slotContent) return
      
      const text = slotContent.trim()
      
      // Create new text geometry
      textGeometry.value = new TextGeometry(text, {
        font: props.font,
        size: props.size,
        height: props.height,
        curveSegments: props.curveSegments,
        bevelEnabled: props.bevelEnabled,
        bevelThickness: props.bevelThickness,
        bevelSize: props.bevelSize,
        bevelOffset: props.bevelOffset,
        bevelSegments: props.bevelSegments
      })
      
      // Center text
      textGeometry.value.computeBoundingBox()
      const textWidth = textGeometry.value.boundingBox.max.x - textGeometry.value.boundingBox.min.x
      
      // Set position and rotation
      if (mesh.value) {
        mesh.value.geometry = textGeometry.value
        mesh.value.position.set(props.position[0] - textWidth / 2, props.position[1], props.position[2])
        mesh.value.rotation.set(props.rotation[0], props.rotation[1], props.rotation[2])
      }
    }
    
    // Watch for changes to font or text content
    watch(() => props.font, createTextGeometry)
    watch(() => slots.default(), createTextGeometry, { deep: true })
    
    // Update when position or rotation changes
    watch(() => props.position, (newPos) => {
      if (mesh.value) {
        const centerOffset = textGeometry.value ? 
          (textGeometry.value.boundingBox.max.x - textGeometry.value.boundingBox.min.x) / 2 : 0
        mesh.value.position.set(newPos[0] - centerOffset, newPos[1], newPos[2])
      }
    })
    
    watch(() => props.rotation, (newRot) => {
      if (mesh.value) {
        mesh.value.rotation.set(newRot[0], newRot[1], newRot[2])
      }
    })
    
    onMounted(() => {
      if (props.font) {
        createTextGeometry()
      }
    })
    
    onUpdated(() => {
      if (props.font && !textGeometry.value) {
        createTextGeometry()
      }
    })
    
    return { mesh }
  }
})
</script>