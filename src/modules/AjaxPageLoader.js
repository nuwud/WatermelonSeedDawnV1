/**
 * AjaxPageLoader.js
 * This module handles seamless page transitions in Shopify with AJAX
 * for the 3D navigation environment
 */

export default class AjaxPageLoader {
  constructor(options = {}) {
    // Default settings
    this.settings = {
      container: '#MainContent',       // Main content container to update
      contentSelector: '.main-content', // Content selector inside the container
      linkSelector: 'a:not([target="_blank"]):not([href^="#"]):not([href^="mailto:"]):not([data-no-ajax])', // Links to intercept
      loadingClass: 'is-loading',      // Class applied during loading
      loadingDelay: 500,               // Minimum loading display time
      cachePages: true,                // Cache loaded pages
      animationDuration: 0.8,          // Animation duration in seconds
      onBeforePageLoad: null,          // Callback before loading starts
      onPageLoad: null,                // Callback when page content is loaded
      onTransitionStart: null,         // Callback at transition start
      onTransitionComplete: null,      // Callback when transition completes
      onError: null,                   // Callback on error
      extractContent: null,            // Custom function to extract content
      preserveSelectors: [             // Elements to preserve across page loads
        '#shopify-section-header',
        '#shopify-section-footer',
        '.cart-drawer',
        '.cart-notification',
        '.predictive-search'
      ]
    }

    // Merge with user options
    this.settings = { ...this.settings, ...options }

    // Initialize properties
    this.cache = {}
    this.currentUrl = window.location.href
    this.xhr = null
    this.isTransitioning = false

    // DOM elements
    this.bodyElement = document.querySelector('body')
    this.containerElement = document.querySelector(this.settings.container)

    // Initialize
    this.init()
  }

  /**
   * Initialize the AJAX page loader
   */
  init() {
    // Check if the container exists
    if (!this.containerElement) {
      console.error(`[AjaxPageLoader] Container element "${this.settings.container}" not found.`)
      return
    }

    // Cache the current page
    if (this.settings.cachePages) {
      this.cache[this.currentUrl] = this.containerElement.innerHTML
    }

    // Intercept link clicks
    this.attachLinkHandlers()

    // Handle browser back/forward buttons
    window.addEventListener('popstate', this.handlePopState.bind(this))

    console.log('[AjaxPageLoader] Initialized')
  }

  /**
   * Attach event handlers to links
   */
  attachLinkHandlers() {
    document.addEventListener('click', (event) => {
      // Find if click was on a link or inside a link
      let target = event.target
      let linkElement = null

      // Traverse up to find nearest link
      while (target && target !== document) {
        if (target.matches(this.settings.linkSelector)) {
          linkElement = target
          break
        }
        target = target.parentNode
      }

      // If a link was found
      if (linkElement) {
        const href = linkElement.getAttribute('href')

        // Skip if link is current page
        if (href === window.location.pathname) {
          event.preventDefault()
          return
        }

        // Exclude admin links and external links
        if (
          href.indexOf('/admin') !== -1 ||
          href.indexOf('://') !== -1 && href.indexOf(window.location.host) === -1
        ) {
          return // Let default behavior handle these
        }

        // Handle Shopify-specific links
        if (
          href.indexOf('/cart') !== -1 ||
          href.indexOf('/checkout') !== -1 ||
          href.indexOf('/account') !== -1
        ) {
          // Special handling for cart and checkout - optional
          // For now, we'll handle these with AJAX too
        }

        // Handle AJAX navigation for this link
        event.preventDefault()
        this.loadPage(href, true)
      }
    })
  }

  /**
   * Handle popstate event (browser back/forward)
   */
  handlePopState(event) {
    const url = window.location.href

    // Don't reload the current page
    if (url === this.currentUrl) return

    // Load the new page without pushing state
    this.loadPage(url, false)
  }

  /**
   * Load a page via AJAX
   */
  loadPage(url, pushState = true) {
    // Don't load if already transitioning
    if (this.isTransitioning) return

    this.isTransitioning = true
    this.currentUrl = url

    // Call before load callback
    if (typeof this.settings.onBeforePageLoad === 'function') {
      const beforeLoadResult = this.settings.onBeforePageLoad(url)

      // If the callback returns a promise, wait for it
      if (beforeLoadResult instanceof Promise) {
        beforeLoadResult.then(() => {
          this.proceedWithPageLoad(url, pushState)
        }).catch(() => {
          // If the before load promise is rejected, cancel the page load
          this.isTransitioning = false
        })
        return
      }
    }

    // Proceed with the page load
    this.proceedWithPageLoad(url, pushState)
  }

  /**
   * Proceed with the page load after before load callback
   */
  proceedWithPageLoad(url, pushState) {
    // Add loading class
    this.bodyElement.classList.add(this.settings.loadingClass)

    // Start transition out animation for 3D effect
    if (typeof this.settings.onTransitionStart === 'function') {
      this.settings.onTransitionStart(url, 'out')
    }

    // Delay the actual AJAX load to allow for animations
    setTimeout(() => {
      // Check if page is cached
      if (this.settings.cachePages && this.cache[url]) {
        this.handleLoadComplete(this.cache[url], url, pushState)
      } else {
        // If not cached, fetch the page
        this.fetchPage(url, pushState)
      }
    }, 300) // Short delay for transition animation to start
  }

  /**
   * Fetch a page via AJAX
   */
  fetchPage(url, pushState) {
    // Abort any existing request
    if (this.xhr) {
      this.xhr.abort()
    }

    // Measure load time
    const loadStart = Date.now()

    // Create and send request
    this.xhr = new XMLHttpRequest()
    this.xhr.open('GET', url, true)
    this.xhr.onreadystatechange = () => {
      if (this.xhr.readyState === 4) {
        // Calculate how long it took
        const loadDuration = Date.now() - loadStart
        const remainingDelay = Math.max(0, this.settings.loadingDelay - loadDuration)

        // Wait for minimum delay to avoid flickering
        setTimeout(() => {
          if (this.xhr.status >= 200 && this.xhr.status < 300) {
            // Success - parse content
            const html = this.xhr.responseText
            let newContent

            // Use custom extract function if provided
            if (typeof this.settings.extractContent === 'function') {
              newContent = this.settings.extractContent(html)
            } else {
              newContent = this.extractContent(html)
            }

            // Add to cache
            if (this.settings.cachePages) {
              this.cache[url] = newContent
            }

            // Update the page
            this.handleLoadComplete(newContent, url, pushState)
          } else {
            // Handle error
            this.handleLoadError(url)
          }
        }, remainingDelay)
      }
    }

    this.xhr.send()
  }

  /**
   * Extract the content from loaded HTML
   */
  extractContent(html) {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html

    // Get the content container
    const newContentElement = tempDiv.querySelector(this.settings.contentSelector)
    if (!newContentElement) {
      console.error(`[AjaxPageLoader] Content element "${this.settings.contentSelector}" not found in loaded page.`)
      return ''
    }

    // Preserve specified elements
    if (Array.isArray(this.settings.preserveSelectors) && this.settings.preserveSelectors.length > 0) {
      this.settings.preserveSelectors.forEach(selector => {
        const elementToRemove = tempDiv.querySelector(selector)
        if (elementToRemove) {
          elementToRemove.parentNode.removeChild(elementToRemove)
        }
      })
    }

    return newContentElement.innerHTML
  }

  /**
   * Handle successful page load
   */
  handleLoadComplete(content, url, pushState) {
    // Call page load callback
    if (typeof this.settings.onPageLoad === 'function') {
      this.settings.onPageLoad(url, content)
    }

    // Update URL if needed
    if (pushState) {
      window.history.pushState({ url }, '', url)
    }

    // Update document title
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = content
    const titleElement = tempDiv.querySelector('title')
    if (titleElement) {
      document.title = titleElement.textContent
    }

    // Update the content
    this.updateContent(content)
  }

  /**
   * Update page content and animate in
   */
  updateContent(content) {
    // Update content
    this.containerElement.innerHTML = content

    // Remove loading class
    this.bodyElement.classList.remove(this.settings.loadingClass)

    // Start transition in animation
    if (typeof this.settings.onTransitionStart === 'function') {
      this.settings.onTransitionStart(this.currentUrl, 'in')
    }

    // Give a small delay to allow DOM to update
    setTimeout(() => {
      // Re-initialize Shopify-specific components
      this.reinitializeShopifyComponents()

      // Complete transition
      this.isTransitioning = false

      // Call transition complete callback
      if (typeof this.settings.onTransitionComplete === 'function') {
        this.settings.onTransitionComplete(this.currentUrl)
      }
    }, 100)
  }

  /**
   * Handle load error
   */
  handleLoadError(url) {
    console.error(`[AjaxPageLoader] Failed to load page: ${url}`)

    // Remove loading class
    this.bodyElement.classList.remove(this.settings.loadingClass)

    // Reset transition state
    this.isTransitioning = false

    // Call error callback
    if (typeof this.settings.onError === 'function') {
      this.settings.onError(url)
    } else {
      // Default error handling - redirect
      window.location.href = url
    }
  }

  /**
   * Reinitialize Shopify components after page load
   */
  reinitializeShopifyComponents() {
    // Reinitialize cart
    if (window.Shopify && window.Shopify.theme) {
      if (typeof window.Shopify.theme.reinitFeatures === 'function') {
        window.Shopify.theme.reinitFeatures()
      }
    }

    // Re-bind product forms
    const productForms = document.querySelectorAll('form[action$="/cart/add"]')
    if (productForms.length > 0) {
      if (typeof window.initProductForms === 'function') {
        window.initProductForms()
      }
    }

    // Check for product gallery
    const productGallery = document.querySelector('[data-media-gallery]')
    if (productGallery) {
      if (typeof window.initProductGallery === 'function') {
        window.initProductGallery()
      }
    }

    // Update cart counters
    this.updateCartCounters()
  }

  /**
   * Update cart counters after page load
   */
  updateCartCounters() {
    // Fetch updated cart data
    fetch('/cart.js')
      .then(response => response.json())
      .then(cart => {
        // Update cart count elements
        const cartCounters = document.querySelectorAll('.cart-count, [data-cart-count]')
        cartCounters.forEach(counter => {
          counter.textContent = cart.item_count
          counter.classList.add('updated')

          // Remove updated class after animation
          setTimeout(() => {
            counter.classList.remove('updated')
          }, 1000)
        })
      })
      .catch(error => console.error('Error updating cart count:', error))
  }
}