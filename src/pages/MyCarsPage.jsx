import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyCars, deleteCar } from '../api/carsApi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlusCircle } from 'react-icons/fi';

export default function MyCarsPage() {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoggedIn) { navigate('/login'); return; }
        fetchMyCars();
    }, []);

    const fetchMyCars = async () => {
        try {
            const res = await getMyCars();
            setCars(Array.isArray(res.data) ? res.data : []);
        } catch { setCars([]); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu elanı silmək istədiyinizdən əminsiniz?')) return;
        try {
            await deleteCar(id);
            toast.success('Elan silindi!');
            setCars(cars.filter(c => c.id !== id));
        } catch (err) { toast.error(err.response?.data?.message || 'Silmə uğursuz oldu'); }
    };

    if (loading) return <div className="page loading-page"><div className="spinner"></div></div>;

    return (
        <div className="page container">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>🚗 Elanlarım</h1>
                    <p>Sizin yaratdığınız elanlar</p>
                </div>
                <Link to="/create-ad" className="btn btn-primary"><FiPlusCircle /> Yeni Elan</Link>
            </div>

            {cars.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>Hələ elanınız yoxdur</h3>
                    <p>Maşın elanı yaratmaq üçün yuxarıdakı düyməni basın</p>
                </div>
            ) : (
                <div className="grid-3">
                    {cars.map(car => (
                        <div key={car.id} className="card" style={{ overflow: 'hidden' }}>
                            <Link to={`/cars/${car.id}`}>
                                <div className="car-card-img">
                                    {car.images?.length > 0 ? (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <img src={`https://nihad911-001-site1.rtempurl.com${car.images[0]?.imageUrl}`} alt={car.brandName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ) : (
                                        <div className="car-card-no-img">🚗</div>
                                    )}
                                </div>
                            </Link>
                            <div className="car-card-body">
                                <h3>{car.brandName} {car.modelName} ({car.year})</h3>
                                <div className="car-card-details">
                                    <span>⚙️ {car.km?.toLocaleString()} km</span>
                                    <span>📍 {car.cityName}</span>
                                </div>
                                <div className="car-card-price" style={{ marginBottom: 12 }}>
                                    {car.listing ? `${car.listing.price?.toLocaleString()} AZN` :
                                        car.auction ? `${car.auction.currentPrice?.toLocaleString()} AZN` : ''}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Link to={`/cars/${car.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}><FiEdit /> Bax</Link>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(car.id)}><FiTrash2 /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
