import React from 'react';

function DragIndicator() {
    return (
        <div className="drag-indicator text-gray-400">
            <div className="flex flex-col items-center">
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                </svg>
                <span className="text-sm">아래로 내려보세요</span>
            </div>
        </div>
    );
}

export default DragIndicator;