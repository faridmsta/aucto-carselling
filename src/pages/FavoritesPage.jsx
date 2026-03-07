import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFavorites } from '../api/carsApi';
import { useAuth } from '../context/AuthContext';

export default function FavoritesPage() {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoggedIn) { navigate('/login'); return; }
        getFavorites().then(r => setCars(Array.isArray(r.data) ? r.data : []))
            .catch(() => setCars([])).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="page loading-page"><div className="spinner"></div></div>;

    return (
        <div className="page container">
            <div className="section-header">
                <h1>❤️ Sevimlilər</h1>
                <p>Bəyəndiyiniz avtomobillər</p>
            </div>

            {cars.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">❤️</div>
                    <h3>Sevimli maşın yoxdur</h3>
                    <p>Maşın səhifəsindən ürək ikonunu basaraq əlavə edin</p>
                </div>
            ) : (
                <div className="grid-3">
                    {cars.map(car => (
                        <Link to={`/cars/${car.id}`} key={car.id} className="car-card card">
                            <div className="car-card-img">
                                {car.images?.length > 0 ? (
                                    <img src={`https://nihad911-001-site1.rtempurl.com${car.images[0]?.imageUrl}`} alt={car.brandName} />
                                ) : (
                                    <div className="car-card-no-img">🚗</div>
                                )}
                            </div>
                            <div className="car-card-body">
                                <h3>{car.brandName} {car.modelName}</h3>
                                <div className="car-card-details">
                                    <span>📅 {car.year}</span>
                                    <span>⚙️ {car.km?.toLocaleString()} km</span>
                                </div>
                                <div className="car-card-price">
                                    {car.listing ? `${car.listing.price?.toLocaleString()} AZN` :
                                        car.auction ? `${car.auction.currentPrice?.toLocaleString()} AZN` : ''}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
