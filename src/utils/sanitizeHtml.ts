/**
 * A simple HTML sanitizer that removes potentially dangerous tags and attributes
 *
 * @param html - The HTML string to sanitize
 * @param allowedTags - Array of allowed HTML tags
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(
  html: string,
  allowedTags: string[] = [
    "a",
    "b",
    "br",
    "div",
    "em",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "i",
    "li",
    "ol",
    "p",
    "span",
    "strong",
    "table",
    "tbody",
    "td",
    "th",
    "thead",
    "tr",
    "ul",
  ]
): string {
  // Create a temporary DOM element
  const tempElement = document.createElement("div");
  tempElement.innerHTML = html;

  // Helper function to clean node
  const cleanNode = (node: Node): boolean => {
    // Skip text nodes and comments
    if (
      node.nodeType === Node.TEXT_NODE ||
      node.nodeType === Node.COMMENT_NODE
    ) {
      return true;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();

      // Remove disallowed tags
      if (!allowedTags.includes(tagName)) {
        return false;
      }

      // Remove all attributes except for safe ones
      const safeAttributes = ["href", "target", "class", "id", "style"];

      Array.from(element.attributes).forEach((attr) => {
        if (!safeAttributes.includes(attr.name)) {
          element.removeAttribute(attr.name);
        }

        // Special handling for href attributes to prevent javascript: URLs
        if (attr.name === "href") {
          const value = attr.value.toLowerCase().trim();
          if (value.startsWith("javascript:") || value.startsWith("data:")) {
            element.removeAttribute("href");
          }
        }
      });

      // Process children recursively
      Array.from(element.childNodes).forEach((child) => {
        if (!cleanNode(child)) {
          element.removeChild(child);
        }
      });

      return true;
    }

    return false;
  };

  // Clean the DOM
  Array.from(tempElement.childNodes).forEach((node) => {
    if (!cleanNode(node)) {
      tempElement.removeChild(node);
    }
  });

  return tempElement.innerHTML;
}
