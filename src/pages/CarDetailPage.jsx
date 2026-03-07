import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCarById, toggleFavorite, getAiAdvice } from '../api/carsApi';
import { getBidsByAuction, createBid } from '../api/bidsApi';
import { useAuth } from '../context/AuthContext';
import { useAuctionHub } from '../hooks/useAuctionHub';
import { toast } from 'react-toastify';
import { FiHeart, FiPhone, FiUser, FiClock, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { MdGavel } from 'react-icons/md';
import './CarDetailPage.css';
import { createAuctionHold } from '../api/paymentsApi';

const ENUM_LABELS = {
    fuelType: ['Benzin', 'Dizel', 'Hibrid', 'Elektrik', 'Qaz'],
    gearBoxType: ['Avtomat', 'Mexaniki', 'Robot', 'Variator'],
    bodyType: ['Sedan', 'SUV', 'Coupe', 'Hatchback', 'Universal'],
    transmissionType: ['Ön', 'Arxa', 'Tam'],
    condition: [null, 'İşlənmiş', 'Yeni'],
    paintState: [null, 'Original', 'Qismən rənglənib', 'Tam rənglənib'],
    damageState: [null, 'Vuruğu yoxdur', 'Yüngül zədəli', 'Ağır qəzalı', 'Ehtiyat hissəsi'],
    auctionStatus: ['Planlaşdırılıb', 'Canlı', 'Bitib', 'Satılmadı', 'Gözləmədə'],
};

function Countdown({ endTime }) {
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
    return <span className="countdown">{left}</span>;
}

export default function CarDetailPage() {
    const { id } = useParams();
    const { isLoggedIn, user } = useAuth();
    const navigate = useNavigate();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imgIdx, setImgIdx] = useState(0);
    const [bids, setBids] = useState([]);
    const [bidAmount, setBidAmount] = useState('');
    const [bidLoading, setBidLoading] = useState(false);
    const [aiAdvice, setAiAdvice] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [fav, setFav] = useState(false);

    const auctionId = car?.auction?.id;
    const { liveBid, auctionClosed } = useAuctionHub(auctionId);

    useEffect(() => {
        setLoading(true);
        getCarById(id).then(r => {
            setCar(r.data);
            if (r.data.auction) {
                getBidsByAuction(r.data.auction.id).then(br => {
                    const bidsData = Array.isArray(br.data) ? br.data : (br.data?.bids || []);
                    setBids(bidsData);
                }).catch(() => { });
            }
        }).catch(() => toast.error('Maşın tapılmadı'))
            .finally(() => setLoading(false));
    }, [id]);

    // LiveBid gəldikdə həm qiyməti, həm də vaxtı yeniləyirik
useEffect(() => {
    if (liveBid) {
        setCar(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                auction: {
                    ...prev.auction,
                    currentPrice: liveBid.amount,
                    endTime: liveBid.newEndTime // Backend-dən gələn yeni vaxt (uzanma ehtimalı üçün)
                }
            };
        });

        // Yeni təklifi tarixçənin başına əlavə edirik
        setBids(prev => [
            {
                id: Date.now(), // Keçici ID
                bidderName: liveBid.bidderName,
                amount: liveBid.amount,
                bidTime: liveBid.bidTime
            },
            ...prev
        ]);
    }
}, [liveBid]);

    useEffect(() => {
        if (liveBid) {
            setCar(prev => prev ? { ...prev, auction: { ...prev.auction, currentPrice: liveBid.currentPrice || liveBid.amount } } : prev);
            setBids(prev => [liveBid, ...prev]);
        }
    }, [liveBid]);

    const handleFav = async () => {
        if (!isLoggedIn) { navigate('/login'); return; }
        try {
            const res = await toggleFavorite(id);
            setFav(!fav);
            toast.success(res.data.message);
        } catch (err) { toast.error(err.response?.data?.message || 'Xəta'); }
    };

    const handleBid = async (e) => {
        e.preventDefault();
        if (!isLoggedIn) { navigate('/login'); return; }
        setBidLoading(true);

        const storedData = JSON.parse(localStorage.getItem('payed-auction-data'));

        try {
            if (storedData && storedData.carId === id) {
                const bidData = {
                    auctionId: car.auction.id,
                    amount: parseFloat(bidAmount),
                    paymentIntentId: storedData.sessionId
                };

                const res = await createBid(bidData);

                // 1. Əgər API 200 OK qaytarıbsa amma Success: false-dursa (Yumşaq xəta)
                if (res.Success === false || res.StatusCode === 400) {
                    throw new Error(res.Message || 'Təklif göndərilə bilmədi');
                }

                // Əgər bura çatdıqsa, deməli hər şey qaydasındadır
                toast.success('Təklifiniz qəbul edildi! 🏆');
                setBidAmount('');

            } else {
                const res = await createAuctionHold(car.id);
                if (res.data?.url) {
                    window.location.href = res.data.url;
                }
            }
        } catch (err) {
            // 2. Xəta mesajını backend-dən gələn formata uyğun tuturuq
            // Axios xətasıdırsa (err.response), yoxsa bizim atdığımız Error-dur (err.message)?
            const backendMessage = err.response?.data?.Message ||
                err.response?.data?.message ||
                err.message ||
                'Gözlənilməz xəta baş verdi';

            console.log('Xəta detalı:', err);
            toast.error(backendMessage);

        } finally {
            setBidLoading(false);
        }
    };

    const fetchAi = async () => {
        setAiLoading(true);
        try {
            const res = await getAiAdvice(id);
            setAiAdvice(res.data.aiAdvice);
        } catch { toast.error('AI məsləhət alına bilmədi'); }
        finally { setAiLoading(false); }
    };

    if (loading) return <div className="page loading-page"><div className="spinner"></div></div>;
    if (!car) return <div className="page container"><div className="empty-state"><h3>Maşın tapılmadı</h3></div></div>;

    const images = car.images || [];

    return (
        <div className="page container car-detail">
            <div className="car-detail-grid">
                {/* Gallery */}
                <div className="car-gallery">
                    <div className="gallery-main">
                        {images.length > 0 ? (
                            <>
                                <img src={`https://nihad911-001-site1.rtempurl.com${images[imgIdx]?.imageUrl}`} alt={car.brandName} />
                                {images.length > 1 && (
                                    <>
                                        <button className="gallery-nav gallery-prev" onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}><FiChevronLeft /></button>
                                        <button className="gallery-nav gallery-next" onClick={() => setImgIdx(i => (i + 1) % images.length)}><FiChevronRight /></button>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="gallery-placeholder">🚗</div>
                        )}
                    </div>
                    {images.length > 1 && (
                        <div className="gallery-thumbs">
                            {images.map((img, i) => (
                                <img key={img.id} src={`https://nihad911-001-site1.rtempurl.com${img.imageUrl}`} alt=""
                                    className={i === imgIdx ? 'active' : ''} onClick={() => setImgIdx(i)} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="car-info">
                    <div className="car-info-header">
                        <div>
                            <h1>{car.brandName} {car.modelName} <span className="year-badge">{car.year}</span></h1>
                            {car.listing && <div className="car-price">{car.listing.price?.toLocaleString()} AZN</div>}
                            {car.auction && <div className="car-price">{car.auction.currentPrice?.toLocaleString()} AZN <small>cari qiymət</small></div>}
                        </div>
                        <button className={`btn-icon fav-btn ${fav ? 'fav-active' : ''}`} onClick={handleFav}>
                            <FiHeart />
                        </button>
                    </div>

                    {/* Auction Section */}
                    {car.auction && (
                        <div className="auction-panel glass-card">
                            <div className="auction-panel-header">
                                <MdGavel /> <h3>Hərrac</h3>
                                <span className={`badge ${car.auction.status === 1 ? 'badge-success' : 'badge-warning'}`}>
                                    {ENUM_LABELS.auctionStatus[car.auction.status]}
                                </span>
                            </div>
                            <div className="auction-info-grid">
                                <div><label>Başlanğıc Qiymət</label><span>{car.auction.startingPrice?.toLocaleString()} AZN</span></div>
                                <div><label>Cari Qiymət</label><span className="gradient-text" style={{ fontWeight: 700 }}>{car.auction.currentPrice?.toLocaleString()} AZN</span></div>
                                <div><label><FiClock /> Bitmə Vaxtı</label><Countdown endTime={car.auction.endTime} /></div>
                            </div>
                            {car.auction.status === 1 && !auctionClosed && (
                                <form className="bid-form" onSubmit={handleBid}>
                                    <input type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)}
                                        placeholder={`Min: ${(car.auction.currentPrice + 1)} AZN`} required step="0.01" />
                                    <button type="submit" className="btn btn-primary" disabled={bidLoading}>
                                        {bidLoading ? '...' : 'Təklif Ver'}
                                    </button>
                                </form>
                            )}
                            {bids.length > 0 && (
                                <div className="bid-history">
                                    <h4>Son Təkliflər</h4>
                                    {bids.slice(0, 5).map((b, i) => (
                                        <div key={b.id || i} className="bid-item">
                                            <span>{b.bidderName || 'İstifadəçi'}</span>
                                            <span className="bid-amount">{b.amount?.toLocaleString()} AZN</span>
                                            <span className="bid-time">{new Date(b.bidTime).toLocaleTimeString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Listing description */}
                    {car.listing?.description && (
                        <div className="listing-desc glass-card">
                            <h3>Təsvir</h3>
                            <p>{car.listing.description}</p>
                        </div>
                    )}

                    {/* Specs */}
                    <div className="specs-grid">
                        <div className="spec-item"><label>Şəhər</label><span>{car.cityName}</span></div>
                        <div className="spec-item"><label>Yürüş</label><span>{car.km?.toLocaleString()} km</span></div>
                        <div className="spec-item"><label>Rəng</label><span>{car.color}</span></div>
                        <div className="spec-item"><label>Mühərrik</label><span>{car.engineCapacity} cc</span></div>
                        <div className="spec-item"><label>Güc</label><span>{car.horsePower} HP</span></div>
                        <div className="spec-item"><label>Yanacaq</label><span>{ENUM_LABELS.fuelType[car.fuelType]}</span></div>
                        <div className="spec-item"><label>Sürətlər qutusu</label><span>{ENUM_LABELS.gearBoxType[car.gearBoxType]}</span></div>
                        <div className="spec-item"><label>Ban</label><span>{ENUM_LABELS.bodyType[car.bodyType]}</span></div>
                        <div className="spec-item"><label>Ötürücü</label><span>{ENUM_LABELS.transmissionType[car.transmissionType]}</span></div>
                        <div className="spec-item"><label>Vəziyyət</label><span>{ENUM_LABELS.condition[car.condition]}</span></div>
                        <div className="spec-item"><label>Rəng vəziyyəti</label><span>{ENUM_LABELS.paintState[car.paintState]}</span></div>
                        <div className="spec-item"><label>Zədə</label><span>{ENUM_LABELS.damageState[car.damageState]}</span></div>
                        {car.vin && <div className="spec-item"><label>VIN</label><span>{car.vin}</span></div>}
                    </div>

                    {car.features?.length > 0 && (
                        <div className="car-features">
                            <h3>Təchizat</h3>
                            <div className="feature-tags">
                                {car.features.map((f, i) => <span key={i} className="badge badge-accent">{f}</span>)}
                            </div>
                        </div>
                    )}

                    {/* Seller */}
                    <div className="seller-info glass-card">
                        <h3><FiUser /> Satıcı</h3>
                        <div className="seller-details">
                            <span>{car.sellerFullName}</span>
                            {car.sellerPhoneNumber && <a href={`tel:${car.sellerPhoneNumber}`} className="btn btn-secondary btn-sm"><FiPhone /> {car.sellerPhoneNumber}</a>}
                        </div>
                    </div>

                    {/* AI Advice */}
                    <div className="ai-section">
                        <button className="btn btn-secondary" onClick={fetchAi} disabled={aiLoading}>
                            {aiLoading ? '🤖 AI düşünür...' : '🤖 AI Məsləhət Al'}
                        </button>
                        {aiAdvice && (
                            <div className="ai-result glass-card">
                                <h3>🤖 AI Qiymətləndirmə</h3>
                                <p style={{ whiteSpace: 'pre-wrap' }}>{aiAdvice}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
