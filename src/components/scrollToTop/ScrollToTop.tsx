import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type Props = {
  // selector for scrollable container. Use 'window' to scroll window, or '#main-content' for your main element.
  selector?: string;
  // behavior: 'smooth' | 'auto'
  behavior?: ScrollBehavior;
};

export default function ScrollToTop({
  selector = "#main-content",
  behavior = "smooth",
}: Props) {
  const { pathname } = useLocation();

  useEffect(() => {
    // try to find the element first
    if (selector && selector !== "window") {
      const el = document.querySelector<HTMLElement>(selector);
      if (el) {
        // scroll the container to top
        el.scrollTo({ top: 0, behavior });
        return;
      }
    }

    // fallback to window
    window.scrollTo({ top: 0, behavior });
  }, [pathname, selector, behavior]);

  return null;
}
