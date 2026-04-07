import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUsers, FiTruck, FiList, FiActivity } from 'react-icons/fi';
import { getDashboardStats } from '../../api/adminApi';
import { getAdminCars } from '../../api/carsApi';
import { useAuth } from '../../context/AuthContext';
import './AdminPages.css';

export default function AdminDashboard() {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    
    const [stats, setStats] = useState(null);
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Security Check
        if (!isAdmin) {
            navigate('/');
            return;
        }

        // 2. Concurrent Data Fetching
        const fetchData = async () => {
            try {
                const [statsRes, carsRes] = await Promise.all([
                    getDashboardStats(),
                    getAdminCars()
                ]);
                
                setStats(statsRes.data);
                // Note: Adjusted to match standard Axios response structure
                setCars(carsRes.data); 
            } catch (err) {
                console.error("Dashboard data load error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAdmin, navigate]);

    if (loading) {
        return (
            <div className="page loading-page">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="page container">
            <header className="section-header">
                <h1>🛡️ Admin Panel</h1>
                <p>Platformanın idarəsi</p>
            </header>

            {/* Stats Overview */}
            {stats && (
                <div className="grid-4" style={{ marginBottom: 40 }}>
                    <StatCard icon={<FiUsers />} value={stats.totalUsers} label="İstifadəçilər" color="var(--accent-light)" bg="rgba(99,102,241,0.15)" />
                    <StatCard icon={<FiTruck />} value={stats.totalCars} label="Maşınlar" color="var(--success)" bg="rgba(16,185,129,0.15)" />
                    <StatCard icon={<FiList />} value={stats.activeListings} label="Aktiv Elanlar" color="var(--info)" bg="rgba(59,130,246,0.15)" />
                    <StatCard icon={<FiActivity />} value={stats.liveAuctions} label="Canlı Hərraclar" color="var(--warning)" bg="rgba(245,158,11,0.15)" />
                </div>
            )}

            {/* Quick Links */}
            <div className="grid-4" style={{ marginBottom: 40 }}>
                <QuickLink to="/admin/brands" emoji="🏷️" title="Markalar" desc="Marka əlavə et, sil" />
                <QuickLink to="/admin/models" emoji="🚘" title="Modellər" desc="Model əlavə et, sil" />
                <QuickLink to="/admin/cities" emoji="📍" title="Şəhərlər" desc="Şəhər əlavə et, sil" />
                <QuickLink to="/admin/users" emoji="👤" title="İstifadəçilər" desc="Ban, unban və siyahı" />
            </div>

            {/* Recent Cars Table */}
            <div className="card" style={{ padding: '20px', overflowX: 'auto' }}>
                <h3 style={{ marginBottom: '20px' }}>🚗 Bütün Avtomobillər</h3>
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                            <th style={{ padding: '12px' }}>Şəkil</th>
                            <th style={{ padding: '12px' }}>Marka/Model</th>
                            <th style={{ padding: '12px' }}>İl</th>
                            <th style={{ padding: '12px' }}>Qiymət</th>
                            <th style={{ padding: '12px' }}>Satıcı</th>
                            <th style={{ padding: '12px' }}>Status</th>
                            <th style={{ padding: '12px' }}>Əməliyyat</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cars.map(car => (
                            <tr key={car.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                <td style={{ padding: '12px' }}>
                                    <img
                                        src={car.images?.find(i => i.isMain)?.imageUrl ? `https://nihad911-001-site1.rtempurl.com${car.images.find(i => i.isMain).imageUrl}` : 'https://via.placeholder.com/50'}
                                        alt="car"
                                        style={{ width: '50px', height: '35px', borderRadius: '4px', objectFit: 'cover' }}
                                    />
                                </td>
                                <td style={{ padding: '12px' }}><strong>{car.brandName}</strong> {car.modelName}</td>
                                <td style={{ padding: '12px' }}>{car.year}</td>
                                <td style={{ padding: '12px' }}>{car.listing?.price || car.auction?.currentPrice} AZN</td>
                                <td style={{ padding: '12px' }}>{car.sellerFullName}</td>
                                <td style={{ padding: '12px' }}>
                                    <span className={`badge ${car.listing?.status === 1 || car.auction?.status === 1 ? 'active' : 'pending'}`}>
                                        {car.listing?.status === 1 || car.auction?.status === 1 ? 'Aktiv' : 'Gözləmədə'}
                                    </span>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <button 
                                        className="btn btn-sm btn-danger"
                                        onClick={async () => {
                                            if (window.confirm("Bu elanı silmək istədiyinizə əminsiniz?")) {
                                                try {
                                                    await deleteCarByAdmin(car.id);
                                                    setCars(cars.filter(c => c.id !== car.id));
                                                } catch (err) {
                                                    alert("Xəta baş verdi!");
                                                }
                                            }
                                        }}
                                    >
                                        Sil
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Sub-components for cleaner JSX
const StatCard = ({ icon, value, label, color, bg }) => (
    <div className="stat-card">
        <div className="stat-icon" style={{ background: bg, color: color }}>{icon}</div>
        <div className="stat-info"><h3>{value}</h3><p>{label}</p></div>
    </div>
);

const QuickLink = ({ to, emoji, title, desc }) => (
    <Link to={to} className="card" style={{ padding: '28px', textAlign: 'center', textDecoration: 'none', color: 'inherit' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>{emoji} {title}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{desc}</p>
    </Link>
);