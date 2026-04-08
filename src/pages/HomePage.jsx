import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getActiveCars, getAllCars } from '../api/carsApi';
import { FiSearch, FiTrendingUp, FiShield, FiZap } from 'react-icons/fi';
import { MdGavel } from 'react-icons/md';
import './HomePage.css';

export default function HomePage() {
    const [featured, setFeatured] = useState([]);

    useEffect(() => {
        getActiveCars().then(r => {
            const cars = Array.isArray(r.data) ? r.data : (r.data?.items || []);
            setFeatured(cars.slice(0, 6));
        }).catch(() => { });
    }, []);

    return (
        <div className="home-page">
            {/* Hero */}
            <section className="hero">
                <div className="hero-bg-effects">
                    <div className="hero-orb hero-orb-1"></div>
                    <div className="hero-orb hero-orb-2"></div>
                    <div className="hero-orb hero-orb-3"></div>
                </div>
                <div className="container hero-content">
                    <div className="hero-badge">🏎️ Azərbaycanın #1 Avtomobil Platforması</div>
                    <h1>Xəyal etdiyiniz avtomobili <span className="gradient-text">AUCTO</span>-da tapın</h1>
                    <p className="hero-sub">Satışa çıxarın, hərracda iştirak edin və ən yaxşı qiymətə sahib olun.</p>
                    <div className="hero-actions">
                        <Link to="/cars" className="btn btn-primary btn-lg"><FiSearch /> Maşınlara Bax</Link>
                        <Link to="/auctions" className="btn btn-secondary btn-lg"><MdGavel /> Hərraclara Bax</Link>
                    </div>
                    <div className="hero-stats">
                        <div className="hero-stat"><span className="hero-stat-num">500+</span><span>Avtomobil</span></div>
                        <div className="hero-stat"><span className="hero-stat-num">1000+</span><span>İstifadəçi</span></div>
                        <div className="hero-stat"><span className="hero-stat-num">50+</span><span>Şəhər</span></div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="container features-section">
                <div className="section-header" style={{ textAlign: 'center' }}>
                    <h2>Niyə <span className="gradient-text">AUCTO</span>?</h2>
                    <p>Avtomobil alqı-satqısında yeni standart</p>
                </div>
                <div className="grid-3">
                    <div className="feature-card glass-card">
                        <div className="feature-icon" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--accent-light)' }}><FiZap /></div>
                        <h3>Sürətli & Asan</h3>
                        <p>Bir neçə dəqiqə içində elan verin və ya hərrac başladın</p>
                    </div>
                    <div className="feature-card glass-card">
                        <div className="feature-icon" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)' }}><FiShield /></div>
                        <h3>Etibarlı Platform</h3>
                        <p>Stripe ilə təhlükəsiz ödəniş, şəffaf hərrac prosesi</p>
                    </div>
                    <div className="feature-card glass-card">
                        <div className="feature-icon" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--warning)' }}><FiTrendingUp /></div>
                        <h3>AI Qiymət Məsləhəti</h3>
                        <p>Süni intellektlə avtomobilinizin real bazar dəyərini öyrənin</p>
                    </div>
                </div>
            </section>

            {/* Featured Cars */}
            {featured.length > 0 && (
                <section className="container featured-section">
                    <div className="section-header">
                        <h2>Son Elanlar</h2>
                        <p>Ən yeni avtomobil elanları</p>
                    </div>
                    <div className="grid-3">
                        {featured.map(car => (
                            <Link to={`/cars/${car.id}`} key={car.id} className="car-card card">
                                <div className="car-card-img">
                                    {car.images?.length > 0 ? (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <img src={`https://nihad911-001-site1.rtempurl.com${car.images[0]?.imageUrl}`} alt={car.brandName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ) : (
                                        <div className="car-card-no-img">🚗</div>
                                    )}
                                    {car.auction && <span className="badge badge-warning car-card-badge"><MdGavel /> Hərrac</span>}
                                    {car.listing && <span className="badge badge-accent car-card-badge">Satılır</span>}
                                    {car.listing?.type === 3 && <span className="badge badge-premium car-card-badge">PREMIUM</span>}
                                    {car.listing?.type === 2 && <span className="badge badge-vip car-card-badge">VIP</span>}
                                </div>
                                <div className="car-card-body">
                                    <h3>{car.brandName} {car.modelName}</h3>
                                    <div className="car-card-details">
                                        <span>📅 {car.year}</span>
                                        <span>⚙️ {car.km?.toLocaleString()} km</span>
                                        <span>📍 {car.cityName}</span>
                                    </div>
                                    <div className="car-card-price">
                                        {car.listing ? `${car.listing.price?.toLocaleString()} AZN` :
                                            car.auction ? `${car.auction.currentPrice?.toLocaleString()} AZN` : ''}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '32px' }}>
                        <Link to="/cars" className="btn btn-secondary">Hamısına Bax →</Link>
                    </div>
                </section>
            )}
        </div>
    );
}
