import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { FiHome, FiSearch, FiHeart, FiPlusCircle, FiUser, FiLogOut, FiMenu, FiX, FiShield } from 'react-icons/fi';
import { MdGavel } from 'react-icons/md';
import './Navbar.css';

export default function Navbar() {
    const { isLoggedIn, user, logout, isAdmin } = useAuth();
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-brand">
                    <img src="/logo.png" alt="" style={{  height: '80px' }} />
                    AUCTO
                </Link>

                <button className="hamburger" onClick={() => setOpen(!open)}>
                    {open ? <FiX /> : <FiMenu />}
                </button>

                <ul className={`navbar-links ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
                    <li><NavLink to="/"><FiHome /> Ana Səhifə</NavLink></li>
                    <li><NavLink to="/cars"><FiSearch /> Maşınlar</NavLink></li>
                    <li><NavLink to="/auctions"><MdGavel /> Hərraclar</NavLink></li>
                    {isLoggedIn && (
                        <>
                            <li><NavLink to="/create-ad"><FiPlusCircle /> Elan Ver</NavLink></li>
                            <li><NavLink to="/favorites"><FiHeart /> Sevimlilər</NavLink></li>
                            <li><NavLink to="/my-cars">🚗 Elanlarım</NavLink></li>
                            <li><NavLink to="/profile"><FiUser /> Profil</NavLink></li>
                            {isAdmin && <li><NavLink to="/admin"><FiShield /> Admin</NavLink></li>}
                        </>
                    )}
                </ul>

                <div className="navbar-auth">
                    {isLoggedIn ? (
                        <>
                            <div className="navbar-user">
                                <span className="user-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                                {user?.name}
                            </div>
                            <button className="btn btn-sm btn-secondary" onClick={handleLogout}>
                                <FiLogOut /> Çıxış
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-sm btn-secondary">Giriş</Link>
                            <Link to="/register" className="btn btn-sm btn-primary">Qeydiyyat</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
