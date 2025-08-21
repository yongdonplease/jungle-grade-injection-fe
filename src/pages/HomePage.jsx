import React, { useState, useEffect, useRef } from 'react';
import LandingPage from '../components/LandingPage';
import DescriptionPanel from '../components/DescriptionPanel';
import DragIndicator from '../components/DragIndicator';

function HomePage() {
    const [isPanelRevealed, setIsPanelRevealed] = useState(false);
    const panelRef = useRef(null);
    const dragStartRef = useRef({ y: 0, isDragging: false });
    const DRAG_THRESHOLD = 50;

    const openPanel = () => setIsPanelRevealed(true);
    const closePanel = () => setIsPanelRevealed(false);

    useEffect(() => {
        // --- Wheel Event Handler ---
        const handleWheel = (e) => {
            if (e.deltaY > 0 && !isPanelRevealed) {
                openPanel();
            } else if (e.deltaY < 0 && isPanelRevealed && panelRef.current?.scrollTop === 0) {
                closePanel();
            }
        };

        // --- Keyboard Event Handler ---
        const handleKeyDown = (e) => {
            if ((e.key === 'ArrowDown' || e.key === 'Enter') && !isPanelRevealed) {
                openPanel();
            } else if (e.key === 'Escape' && isPanelRevealed) {
                closePanel();
            }
        };
        
        // --- Touch Event Handlers ---
        const handleTouchStart = (e) => {
            dragStartRef.current = { y: e.touches[0].clientY, isDragging: true };
        };

        const handleTouchMove = (e) => {
            if (!dragStartRef.current.isDragging) return;
            const currentY = e.touches[0].clientY;

            if (isPanelRevealed) {
                const deltaY = currentY - dragStartRef.current.y; // Downward drag
                if (deltaY > DRAG_THRESHOLD && panelRef.current?.scrollTop === 0) {
                    closePanel();
                    dragStartRef.current.isDragging = false;
                }
            } else {
                const deltaY = dragStartRef.current.y - currentY; // Upward drag
                if (deltaY > DRAG_THRESHOLD) {
                    openPanel();
                    dragStartRef.current.isDragging = false;
                }
            }
        };

        const handleTouchEnd = () => {
            dragStartRef.current.isDragging = false;
        };

        // Add all event listeners
        document.addEventListener('wheel', handleWheel);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchmove', handleTouchMove, { passive: true });
        document.addEventListener('touchend', handleTouchEnd);

        // Cleanup function to remove listeners on component unmount
        return () => {
            document.removeEventListener('wheel', handleWheel);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isPanelRevealed]); // Re-run effect if isPanelRevealed changes

    return (
        <div className="h-full bg-gray-50 flex items-center justify-center overflow-hidden">
            <LandingPage />
            {!isPanelRevealed && <DragIndicator />}
            <DescriptionPanel
                isRevealed={isPanelRevealed}
                onClose={closePanel}
                ref={panelRef}
            />
        </div>
    );
}

export default HomePage;