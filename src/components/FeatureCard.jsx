import React from 'react';

function FeatureCard({ icon, title, description, delay }) {
    return (
        <div className="feature-card p-6 rounded-xl fade-in-up" style={{ animationDelay: delay }}>
            <div className="text-3xl mb-4">{icon}</div>
            <h3 className="text-xl font-semibold mb-3">{title}</h3>
            <p className="opacity-90">{description}</p>
        </div>
    );
}

export default FeatureCard;