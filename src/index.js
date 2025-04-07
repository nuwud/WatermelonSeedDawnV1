// Import components
import App from './App.vue';
import ImprovedInteractiveButton from './components/ImprovedInteractiveButton.vue';
import SmoothTransitionMenu from './components/SmoothTransitionMenu.vue';
import AjaxPageLoader from './utils/AjaxPageLoader';
import { shopifyConfig, initShopify3DNavigation } from './shopify-integration';

// Export for global use
export default {
  App,
  ImprovedInteractiveButton,
  SmoothTransitionMenu,
  AjaxPageLoader,
  shopifyConfig,
  initShopify3DNavigation
};

// Make initShopify3DNavigation globally accessible
window.initShopify3DNavigation = initShopify3DNavigation;