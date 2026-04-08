import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFilteredCars } from '../api/carsApi';
import { getAllBrands } from '../api/brandsApi';
import { getAllModels } from '../api/modelsApi';
import { getAllCities } from '../api/citiesApi';
import { MdGavel } from 'react-icons/md';
import { FiFilter, FiX } from 'react-icons/fi';
import './CarsPage.css';

const SALE_TYPES = [
    { value: '', label: 'Hamısı' },
    { value: '1', label: 'Satış' },
    { value: '2', label: 'Hərrac' },
];

export default function CarsPage() {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [cities, setCities] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [filters, setFilters] = useState({
        brandId: '', modelId: '', cityId: '',
        minPrice: '', maxPrice: '', minYear: '', maxYear: '',
        saleType: '', pageNumber: 1, pageSize: 12
    });

    useEffect(() => {
        getAllBrands().then(r => setBrands(r.data)).catch(() => { });
        getAllModels().then(r => setModels(r.data)).catch(() => { });
        getAllCities().then(r => setCities(r.data)).catch(() => { });
    }, []);

    useEffect(() => {
        fetchCars();
    }, [page]);

    const fetchCars = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.brandId) params.BrandId = filters.brandId;
            if (filters.modelId) params.ModelId = filters.modelId;
            if (filters.cityId) params.CityId = filters.cityId;
            if (filters.minPrice) params.MinPrice = filters.minPrice;
            if (filters.maxPrice) params.MaxPrice = filters.maxPrice;
            if (filters.minYear) params.MinYear = filters.minYear;
            if (filters.maxYear) params.MaxYear = filters.maxYear;
            if (filters.saleType) params.SaleType = filters.saleType;
            params.PageNumber = page;
            params.PageSize = 12;

            const res = await getFilteredCars(params);
            const data = res.data;
            if (Array.isArray(data)) {
                setCars(data);
                setTotalPages(Math.ceil(data.length / 12) || 1);
            } else {
                setCars(data.items || data.data || []);
                setTotalPages(data.totalPages || 1);
            }
        } catch {
            setCars([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (e) => {
        e.preventDefault();
        setPage(1);
        fetchCars();
    };

    const clearFilters = () => {
        setFilters({ brandId: '', modelId: '', cityId: '', minPrice: '', maxPrice: '', minYear: '', maxYear: '', saleType: '', pageNumber: 1, pageSize: 12 });
        setPage(1);
        setTimeout(fetchCars, 0);
    };

    const filteredModels = filters.brandId ? models.filter(m => m.brandId === parseInt(filters.brandId)) : models;

    return (
        <div className="page container">
            <div className="section-header">
                <h1>🚘 Maşınlar</h1>
                <p>Bütün mövcud avtomobil elanları</p>
            </div>

            <button className="btn btn-secondary filter-toggle" onClick={() => setShowFilter(!showFilter)}>
                {showFilter ? <><FiX /> Filtri Bağla</> : <><FiFilter /> Filtr</>}
            </button>

            <div className={`cars-layout ${showFilter ? 'filter-open' : ''}`}>
                {/* Filter sidebar */}
                <aside className={`filter-sidebar glass-card ${showFilter ? 'open' : ''}`}>
                    <form onSubmit={handleFilter}>
                        <h3>Filtr</h3>
                        <div className="form-group">
                            <label>Marka</label>
                            <select value={filters.brandId} onChange={e => setFilters({ ...filters, brandId: e.target.value, modelId: '' })}>
                                <option value="">Hamısı</option>
                                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Model</label>
                            <select value={filters.modelId} onChange={e => setFilters({ ...filters, modelId: e.target.value })}>
                                <option value="">Hamısı</option>
                                {filteredModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Şəhər</label>
                            <select value={filters.cityId} onChange={e => setFilters({ ...filters, cityId: e.target.value })}>
                                <option value="">Hamısı</option>
                                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Satış Tipi</label>
                            <select value={filters.saleType} onChange={e => setFilters({ ...filters, saleType: e.target.value })}>
                                {SALE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Min Qiymət</label>
                                <input type="number" value={filters.minPrice} onChange={e => setFilters({ ...filters, minPrice: e.target.value })} placeholder="0" />
                            </div>
                            <div className="form-group">
                                <label>Max Qiymət</label>
                                <input type="number" value={filters.maxPrice} onChange={e => setFilters({ ...filters, maxPrice: e.target.value })} placeholder="999999" />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Min İl</label>
                                <input type="number" value={filters.minYear} onChange={e => setFilters({ ...filters, minYear: e.target.value })} placeholder="2000" />
                            </div>
                            <div className="form-group">
                                <label>Max İl</label>
                                <input type="number" value={filters.maxYear} onChange={e => setFilters({ ...filters, maxYear: e.target.value })} placeholder="2026" />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Axtar</button>
                        <button type="button" className="btn btn-secondary" style={{ width: '100%', marginTop: '8px' }} onClick={clearFilters}>Təmizlə</button>
                    </form>
                </aside>

                {/* Cars grid */}
                <main className="cars-grid-wrapper">
                    {loading ? (
                        <div className="loading-page"><div className="spinner"></div></div>
                    ) : cars.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🚗</div>
                            <h3>Nəticə tapılmadı</h3>
                            <p>Filtri dəyişdirərək yenidən axtarış edin</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid-3">
                                {cars.map(car => (
                                    <Link to={`/cars/${car.id}`} key={car.id} className="car-card card">
                                        <div className="car-card-img">
                                            {car.images?.length > 0 ? (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <img src={`https://nihad911-001-site1.rtempurl.com${car.images[0]?.imageUrl}`} alt={car.brandName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                            ) : (
                                                <div className="car-card-no-img">🚗</div>
                                            )}
                                            {car.auction && <span className="badge badge-warning car-card-badge"><MdGavel /> Hərrac</span>}
                                            {car.listing && !car.auction && <span className="badge badge-accent car-card-badge">Satılır</span>}
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
                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Əvvəl</button>
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <button key={i + 1} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>
                                    ))}
                                    <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Sonrakı →</button>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
