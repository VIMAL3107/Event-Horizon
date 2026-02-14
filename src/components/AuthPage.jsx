import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ArrowRight, Github } from 'lucide-react';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(username, email, password);
                setIsLogin(true); // Switch to login after successful registration
                setError('Registration successful! Please login.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
                    <p>{isLogin ? 'Enter your credentials to access your horizon' : 'Join the cosmic journey today'}</p>
                </div>

                {error && <div className={`auth-message ${error.includes('successful') ? 'success' : 'error'}`}>{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <div className="input-group">
                            <User size={18} className="input-icon" />
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="input-group">
                        <Mail size={18} className="input-icon" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <Lock size={18} className="input-icon" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-submit" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                        <ArrowRight size={18} />
                    </button>
                </form>

                <div className="auth-footer">
                    <button onClick={() => setIsLogin(!isLogin)} className="toggle-auth">
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                    </button>
                </div>
            </div>

            <style>{`
                .auth-container {
                    position: fixed;
                    top: 0; left: 0; width: 100vw; height: 100vh;
                    display: flex; align-items: center; justify-content: center;
                    background: #050505;
                    z-index: 1000;
                    overflow: hidden;
                }

                .auth-container::before {
                    content: '';
                    position: absolute;
                    width: 200%; height: 200%;
                    background: radial-gradient(circle at center, rgba(255, 140, 66, 0.05) 0%, transparent 50%);
                    animation: rotate 60s linear infinite;
                }

                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .auth-card {
                    position: relative;
                    width: 100%;
                    max-width: 450px;
                    padding: 3rem;
                    background: rgba(10, 10, 10, 0.8);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    z-index: 10;
                }

                .auth-header {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }

                .auth-header h1 {
                    font-size: 2rem;
                    color: #fff;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(to right, #fff, #ffae70);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .auth-header p {
                    color: #888;
                    font-size: 0.95rem;
                }

                .auth-message {
                    padding: 0.8rem;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    margin-bottom: 1.5rem;
                    text-align: center;
                }

                .auth-message.error {
                    background: rgba(255, 85, 85, 0.1);
                    color: #ff5555;
                    border: 1px solid rgba(255, 85, 85, 0.2);
                }

                .auth-message.success {
                    background: rgba(0, 255, 127, 0.1);
                    color: #00ff7f;
                    border: 1px solid rgba(0, 255, 127, 0.2);
                }

                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.2rem;
                }

                .input-group {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .input-icon {
                    position: absolute;
                    left: 1.2rem;
                    color: #555;
                    transition: color 0.3s;
                }

                .input-group input {
                    width: 100%;
                    padding: 1rem 1rem 1rem 3.2rem;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 14px;
                    color: #fff;
                    font-size: 0.95rem;
                    transition: all 0.3s;
                }

                .input-group input:focus {
                    outline: none;
                    border-color: #ff8c42;
                    background: rgba(255, 140, 66, 0.05);
                }

                .input-group input:focus + .input-icon {
                    color: #ff8c42;
                }

                .auth-submit {
                    margin-top: 1rem;
                    padding: 1rem;
                    background: #ff8c42;
                    color: #000;
                    border: none;
                    border-radius: 14px;
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.8rem;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .auth-submit:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(255, 140, 66, 0.3);
                    background: #ffae70;
                }

                .auth-submit:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .auth-footer {
                    margin-top: 2rem;
                    text-align: center;
                }

                .toggle-auth {
                    background: none;
                    border: none;
                    color: #888;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: color 0.3s;
                }

                .toggle-auth:hover {
                    color: #fff;
                }
            `}</style>
        </div>
    );
};

export default AuthPage;
