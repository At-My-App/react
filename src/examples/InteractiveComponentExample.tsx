import React, { useState, useEffect } from "react";
import { AmaComponentRenderer } from "../components/AmaComponentRenderer";
import {
  injectComponentData,
  listenToComponentEvent,
  sendToComponent,
} from "../utils/componentInterop";

/**
 * Example component demonstrating interactive HTML components
 * with two-way communication between React and embedded HTML
 */
export function InteractiveComponentExample(): JSX.Element {
  const [counter, setCounter] = useState(0);
  const [lastEvent, setLastEvent] = useState<{ timestamp: number } | null>(
    null
  );
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Listen for events from the embedded HTML component
  useEffect(() => {
    // Setup event listener for the button click from HTML component
    const cleanupButtonClick = listenToComponentEvent<{ timestamp: number }>(
      "component:buttonClicked",
      (data) => {
        console.log("Button clicked in HTML component:", data);
        setLastEvent(data);
        setCounter((prev) => prev + 1);
      }
    );

    // Setup event listener for theme toggle from HTML component
    const cleanupThemeToggle = listenToComponentEvent<{
      theme: "light" | "dark";
    }>("component:themeToggle", (data) => {
      console.log("Theme toggle in HTML component:", data);
      setTheme(data.theme);
    });

    // Return cleanup function to remove event listeners
    return () => {
      cleanupButtonClick();
      cleanupThemeToggle();
    };
  }, []);

  // Send counter update to the embedded component when counter changes
  useEffect(() => {
    sendToComponent("react:counterUpdate", { count: counter });
  }, [counter]);

  // Manually update embedded component
  const resetCounter = () => {
    setCounter(0);
    sendToComponent("react:counterReset", { timestamp: Date.now() });
  };

  // Pass data to the embedded component as data attributes
  const componentData = injectComponentData({
    userId: 123,
    theme,
    isAdmin: true,
    lastUpdated: new Date().toISOString(),
  });

  return (
    <div className={`interactive-example theme-${theme}`}>
      <h1>Interactive Component Example</h1>

      <div className="react-controls">
        <h2>React Controls</h2>
        <p>Counter: {counter}</p>
        <button onClick={() => setCounter((prev) => prev + 1)}>
          Increment from React
        </button>
        <button onClick={resetCounter}>Reset Counter</button>
        <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
          Toggle Theme from React
        </button>

        {lastEvent && (
          <p>
            Last event from HTML component:{" "}
            {new Date(lastEvent.timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>

      <div className="component-container">
        <h2>Embedded HTML Component</h2>
        <AmaComponentRenderer
          path="components/interactive.html"
          config={{
            sanitize: false, // Allow scripts in this component
            cacheDuration: 0, // Don't cache during development
          }}
          className={`interactive-component theme-${theme}`}
          {...componentData}
        />
      </div>

      <div className="documentation">
        <h3>How it works:</h3>
        <ul>
          <li>
            The React component passes data to the HTML component using data
            attributes
          </li>
          <li>The HTML component sends events to React using CustomEvents</li>
          <li>
            React listens for these events and updates its state accordingly
          </li>
          <li>
            When React state changes, it can notify the HTML component via
            events
          </li>
        </ul>
      </div>
    </div>
  );
}
