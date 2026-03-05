import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { isAuthenticated } from "../../store/selectors/AuthSelectors";
import {
  INACTIVITY_TIMEOUT_MS,
  WARNING_TIMEOUT_MS,
  ACTIVITY_EVENTS,
} from "../../constants/lockTime";

export const useInactivityDetection = () => {
  const navigate = useNavigate();
  const userIsAuthenticated = useSelector(isAuthenticated);
  const inactivityTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const isLockedRef = useRef(false);

  const resetInactivityTimer = () => {
    // Only track inactivity if user is authenticated
    if (!userIsAuthenticated) return;

    // Clear existing timers
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    // Only reset if user is not locked
    if (!isLockedRef.current) {
      // Set warning timer
      warningTimerRef.current = setTimeout(() => {
        console.warn(
          `User inactive. Warning: Session will lock soon.`
        );
        // Dispatch warning event
        const event = new CustomEvent("inactivityWarning");
        window.dispatchEvent(event);
      }, WARNING_TIMEOUT_MS);

      // Set lock timer
      inactivityTimerRef.current = setTimeout(() => {
        lockScreen();
      }, INACTIVITY_TIMEOUT_MS);
    }
  };

  const lockScreen = () => {
    isLockedRef.current = true;
    localStorage.setItem("isLocked", "true");
    localStorage.setItem("lockTimestamp", new Date().toISOString());
    navigate("/page-lock-screen");
  };

  const unlockScreen = () => {
    isLockedRef.current = false;
    localStorage.removeItem("isLocked");
    localStorage.removeItem("lockTimestamp");
    resetInactivityTimer();
  };

  useEffect(() => {
    // Only track inactivity if user is authenticated
    if (!userIsAuthenticated) {
      // Clean up timers if user logs out
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
      return;
    }

    // Check if user is already locked
    const isLocked = localStorage.getItem("isLocked");
    if (isLocked === "true") {
      isLockedRef.current = true;
      navigate("/page-lock-screen");
      return;
    }

    // List of events that indicate user activity
    // (Configured in src/constants/lockTime.js)
    const activityEvents = ACTIVITY_EVENTS;

    // Add event listeners for user activity
    const handleActivity = () => {
      resetInactivityTimer();
    };

    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Custom event to reset timer from other components
    window.addEventListener("resetInactivityTimer", () => {
      unlockScreen();
    });

    // Initialize timer on mount
    resetInactivityTimer();

    // Cleanup
    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });

      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }

      window.removeEventListener("resetInactivityTimer", () => {
        unlockScreen();
      });
    };
  }, [userIsAuthenticated, navigate]);

  return {
    lockScreen,
    unlockScreen,
    isLocked: isLockedRef.current,
  };
};
