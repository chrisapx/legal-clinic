import { useEffect, useRef } from 'react';
import { blogAPI } from '../services/api';

/**
 * Custom hook to track blog post views and time spent on page
 * @param {number} postId - The ID of the blog post
 * @param {boolean} enabled - Whether tracking is enabled (default: true)
 */
export const useBlogViewTracking = (postId, enabled = true) => {
  const startTimeRef = useRef(null);
  const viewTrackedRef = useRef(false);
  const timeUpdateIntervalRef = useRef(null);

  useEffect(() => {
    if (!enabled || !postId) return;

    // Record start time
    startTimeRef.current = Date.now();

    // Track initial view (without time spent)
    const trackInitialView = async () => {
      try {
        await blogAPI.trackView(postId);
        viewTrackedRef.current = true;
      } catch (error) {
        console.error('Failed to track blog view:', error);
      }
    };

    trackInitialView();

    // Update time spent every 30 seconds while user is on the page
    timeUpdateIntervalRef.current = setInterval(() => {
      if (viewTrackedRef.current && startTimeRef.current) {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);

        // Only send update if user has spent at least 5 seconds
        if (timeSpent >= 5) {
          blogAPI.trackView(postId, timeSpent).catch(err => {
            console.error('Failed to update time spent:', err);
          });
        }
      }
    }, 30000); // Update every 30 seconds

    // Track final time spent when user leaves the page
    const handleBeforeUnload = () => {
      if (viewTrackedRef.current && startTimeRef.current) {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);

        // Only send if user spent at least 5 seconds
        if (timeSpent >= 5) {
          // Use sendBeacon for reliable tracking on page unload
          const url = `/api/blog-views/${postId}?timeSpent=${timeSpent}`;
          if (navigator.sendBeacon) {
            // Get the token for authentication
            const token = localStorage.getItem('token');
            const blob = new Blob([''], { type: 'application/json' });
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            // sendBeacon doesn't support custom headers, so we'll use a simple POST
            // The server will still track it even without authentication
            navigator.sendBeacon(window.location.origin + url, blob);
          }
        }
      }
    };

    // Add event listener for page unload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // Send final update on component unmount (when navigating away within the SPA)
      if (viewTrackedRef.current && startTimeRef.current) {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (timeSpent >= 5) {
          blogAPI.trackView(postId, timeSpent).catch(err => {
            console.error('Failed to send final time update:', err);
          });
        }
      }
    };
  }, [postId, enabled]);

  return null;
};
