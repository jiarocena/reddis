import { Link } from 'react-router-dom';
import { Network, Mail, MapPin, ExternalLink } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Network size={20} /> REDDIS (piloto)
                        </h3>
                        <p>
                            Red Digital de Inclusión Social. Plataforma colaborativa para identificar, priorizar y resolver barreras a la inclusión de personas con discapacidad.
                        </p>
                    </div>
                    <div className="footer-links">
                        <h4>Plataforma</h4>
                        <Link to="/barreras">Barreras</Link>
                        <Link to="/reportar">Reportar Barrera</Link>
                        <Link to="/acerca">Acerca de</Link>
                    </div>
                    <div className="footer-links">
                        <h4>Contacto</h4>
                        <a href="#"><Mail size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />contacto@reddis.uy</a>
                        <a href="#"><MapPin size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />Uruguay</a>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2026 REDDIS (piloto) — Red Digital de Inclusión Social. Experiencia piloto.</p>
                </div>
            </div>
        </footer>
    );
}
