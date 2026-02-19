import { CheckCircle } from 'lucide-react';

export default function Timeline({ entries }) {
    if (!entries || entries.length === 0) return null;

    return (
        <div className="timeline">
            {entries.map((entry, index) => (
                <div key={index} className={`timeline-item ${entry.completed ? 'completed' : ''}`}>
                    <div className="timeline-dot"></div>
                    <div className="timeline-date">{entry.date}</div>
                    <div className="timeline-content">
                        {entry.completed && (
                            <CheckCircle size={14} style={{ color: '#10b981', display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                        )}
                        {entry.text}
                    </div>
                </div>
            ))}
        </div>
    );
}
