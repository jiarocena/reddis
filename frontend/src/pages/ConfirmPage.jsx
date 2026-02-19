import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { confirmEmail } from '../api/api';
import { CheckCircle, XCircle } from 'lucide-react';

export default function ConfirmPage() {
    const [params] = useSearchParams();
    const token = params.get('token');
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Token no proporcionado');
            return;
        }

        confirmEmail(token)
            .then(data => {
                setStatus('success');
                setMessage(data.message);
            })
            .catch(err => {
                setStatus('error');
                setMessage(err.message);
            });
    }, [token]);

    return (
        <div className="auth-page animate-fadeIn">
            <div className="auth-card" style={{ textAlign: 'center' }}>
                {status === 'loading' && <p>Confirmando email...</p>}
                {status === 'success' && (
                    <>
                        <div className="auth-icon" style={{ background: 'var(--success-bg)' }}>
                            <CheckCircle size={28} color="var(--success)" />
                        </div>
                        <h1>¡Email confirmado!</h1>
                        <p style={{ color: 'var(--gray-500)', margin: '1rem 0' }}>{message}</p>
                        <Link to="/login" className="btn btn-primary">Iniciar Sesión</Link>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <div className="auth-icon" style={{ background: '#fee2e2' }}>
                            <XCircle size={28} color="#dc2626" />
                        </div>
                        <h1>Error</h1>
                        <p style={{ color: 'var(--gray-500)', margin: '1rem 0' }}>{message}</p>
                        <Link to="/registro" className="btn btn-secondary">Volver a registrarse</Link>
                    </>
                )}
            </div>
        </div>
    );
}
