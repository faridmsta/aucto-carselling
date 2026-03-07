import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFilteredCars } from '../api/carsApi';
import { MdGavel } from 'react-icons/md';
import { FiClock } from 'react-icons/fi';

const AUCTION_STATUS = ['Planlaşdırılıb', 'Canlı', 'Bitib', 'Satılmadı', 'Gözləmədə'];

function MiniCountdown({ endTime }) {
    const [left, setLeft] = useState('');
    useEffect(() => {
        const calc = () => {
            const diff = new Date(endTime) - Date.now();
            if (diff <= 0) { setLeft('Bitdi'); return; }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setLeft(`${h}s ${m}d ${s}sn`);
        };
        calc();
        const id = setInterval(calc, 1000);
        return () => clearInterval(id);
    }, [endTime]);
    return <span style={{ color: 'var(--warning)', fontWeight: 600, fontSize: '0.85rem' }}><FiClock style={{ marginRight: 4 }} />{left}</span>;
}

export default function AuctionsPage() {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getFilteredCars({ SaleType: 2, PageSize: 50 }).then(r => {
            const data = r.data;
            const items = Array.isArray(data) ? data : (data.items || data.data || []);
            setCars(items.filter(c => c.auction));
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="page loading-page"><div className="spinner"></div></div>;

    return (
        <div className="page container">
            <div className="section-header">
                <h1><MdGavel /> Hərraclar</h1>
                <p>Canlı və planlaşdırılmış avtomobil hərracları</p>
            </div>

            {cars.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon"><MdGavel /></div>
                    <h3>Hərraca çıxarılmış maşın yoxdur</h3>
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
                                <span className={`badge ${car.auction.status === 1 ? 'badge-success' : 'badge-warning'} car-card-badge`}>
                                    {AUCTION_STATUS[car.auction.status]}
                                </span>
                            </div>
                            <div className="car-card-body">
                                <h3>{car.brandName} {car.modelName}</h3>
                                <div className="car-card-details">
                                    <span>📅 {car.year}</span>
                                    <span>⚙️ {car.km?.toLocaleString()} km</span>
                                    <span>📍 {car.cityName}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                                    <div className="car-card-price">{car.auction.currentPrice?.toLocaleString()} AZN</div>
                                    <MiniCountdown endTime={car.auction.endTime} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
