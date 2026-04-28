'use client';

import { useEffect } from 'react';

interface SecurityGuardProps {
  children: React.ReactNode;
  disableRightClick?: boolean;
  disableInspect?: boolean;
  disableDevTools?: boolean;
}

const SecurityGuard: React.FC<SecurityGuardProps> = ({
  children,
  disableRightClick = true,
  disableInspect = true,
  disableDevTools = true
}) => {
  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      if (disableRightClick) {
        e.preventDefault();
        return false;
      }
    };

    // Disable common keyboard shortcuts for developer tools
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!disableDevTools) return;

      // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Detect and prevent DevTools opening
    const detectDevTools = () => {
      if (!disableDevTools) return;

      let devtools = {
        open: false,
        orientation: null
      };

      const threshold = 160;

      setInterval(() => {
        if (
          window.outerHeight - window.innerHeight > threshold ||
          window.outerWidth - window.innerWidth > threshold
        ) {
          if (!devtools.open) {
            devtools.open = true;
            // Redirect or close window when DevTools opens
            window.location.href = 'about:blank';
          }
        } else {
          devtools.open = false;
        }
      }, 500);
    };

    // Disable text selection on sensitive elements
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest('.no-select') || disableInspect) {
        e.preventDefault();
        return false;
      }
    };

    // Disable drag and drop
    const handleDragStart = (e: DragEvent) => {
      if (disableInspect) {
        e.preventDefault();
        return false;
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);

    // Start DevTools detection if enabled
    if (disableDevTools) {
      detectDevTools();
    }

    // Console warnings
    if (process.env.NODE_ENV === 'production') {
      console.clear();
      console.log('%c⚠️ Security Warning ⚠️', 'color: red; font-size: 20px; font-weight: bold;');
      console.log('%cThis is a private computer system. Unauthorized access is prohibited.', 'color: red; font-size: 14px;');
      console.log('%cAll activities are monitored and recorded.', 'color: red; font-size: 14px;');
      
      // Override console methods to prevent debugging
      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;
      const originalInfo = console.info;
      const originalDebug = console.debug;

      console.log = function() {
        return;
      };
      console.warn = function() {
        return;
      };
      console.error = function() {
        return;
      };
      console.info = function() {
        return;
      };
      console.debug = function() {
        return;
      };

      // Restore original methods after 10 seconds (for legitimate debugging)
      setTimeout(() => {
        console.log = originalLog;
        console.warn = originalWarn;
        console.error = originalError;
        console.info = originalInfo;
        console.debug = originalDebug;
      }, 10000);
    }

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, [disableRightClick, disableInspect, disableDevTools]);

  return <>{children}</>;
};

export default SecurityGuard;
