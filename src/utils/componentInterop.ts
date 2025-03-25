/**
 * Utilities for interacting with embedded HTML components
 */

/**
 * Initializes an event listener for messages from embedded components
 * to handle cross-component communication
 *
 * @param eventName - Name of the custom event to listen for
 * @param handler - Callback function to handle the event data
 * @returns A cleanup function to remove the event listener
 */
export function listenToComponentEvent<T = any>(
  eventName: string,
  handler: (data: T) => void
): () => void {
  const eventListener = (event: Event) => {
    const customEvent = event as CustomEvent<T>;
    handler(customEvent.detail);
  };

  // Add event listener to window
  window.addEventListener(eventName, eventListener);

  // Return a cleanup function
  return () => {
    window.removeEventListener(eventName, eventListener);
  };
}

/**
 * Dispatches data to an embedded component by triggering a custom event
 *
 * @param eventName - Name of the custom event to dispatch
 * @param data - Data to send with the event
 */
export function sendToComponent<T = any>(eventName: string, data: T): void {
  const event = new CustomEvent(eventName, {
    detail: data,
    bubbles: true,
    cancelable: true,
  });

  window.dispatchEvent(event);
}

/**
 * Injects data attributes to be used by embedded HTML components
 *
 * @param data - Object with data to inject as attributes
 * @returns Object with data attributes for a React component
 */
export function injectComponentData(
  data: Record<string, string | number | boolean>
): Record<string, string> {
  const attributes: Record<string, string> = {};

  Object.entries(data).forEach(([key, value]) => {
    attributes[`data-ama-${key}`] = String(value);
  });

  return attributes;
}

/**
 * Example usage:
 *
 * ```tsx
 * // In your React component
 * import { injectComponentData, listenToComponentEvent, sendToComponent } from '../utils/componentInterop';
 *
 * function MyComponent() {
 *   const [counter, setCounter] = useState(0);
 *
 *   // Listen for events from the embedded HTML
 *   useEffect(() => {
 *     const cleanup = listenToComponentEvent('component:buttonClicked', (data) => {
 *       console.log('Button clicked in HTML component:', data);
 *       setCounter(prev => prev + 1);
 *     });
 *
 *     return cleanup;
 *   }, []);
 *
 *   // Send data to the embedded HTML
 *   const updateEmbeddedComponent = () => {
 *     sendToComponent('react:counterUpdate', { count: counter });
 *   };
 *
 *   // Pass data attributes to the component
 *   const dataAttributes = injectComponentData({
 *     userId: 123,
 *     theme: 'dark',
 *     isAdmin: true
 *   });
 *
 *   return (
 *     <div>
 *       <button onClick={updateEmbeddedComponent}>Update Embedded Component</button>
 *       <AmaComponentRenderer
 *         path="components/interactive.html"
 *         {...dataAttributes}
 *       />
 *     </div>
 *   );
 * }
 * ```
 *
 * // In your HTML component (interactive.html)
 * ```html
 * <div class="interactive-component">
 *   <h2>Interactive Component</h2>
 *   <div id="counter-display">0</div>
 *   <button id="notify-react">Notify React</button>
 *
 *   <script>
 *     // Get data from React
 *     const userId = document.currentScript.parentElement.dataset.amaUserId;
 *     const theme = document.currentScript.parentElement.dataset.amaTheme;
 *
 *     // Listen for React events
 *     window.addEventListener('react:counterUpdate', (event) => {
 *       document.getElementById('counter-display').textContent = event.detail.count;
 *     });
 *
 *     // Send events to React
 *     document.getElementById('notify-react').addEventListener('click', () => {
 *       window.dispatchEvent(new CustomEvent('component:buttonClicked', {
 *         detail: { timestamp: Date.now() },
 *         bubbles: true
 *       }));
 *     });
 *   </script>
 * </div>
 * ```
 */
