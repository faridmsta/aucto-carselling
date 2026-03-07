import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCarAd, uploadCarImages } from '../api/carsApi';
import { getAllBrands } from '../api/brandsApi';
import { getAllModels } from '../api/modelsApi';
import { getAllCities } from '../api/citiesApi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './CreateAdPage.css';
import { createAuctionFee, createPaymentIntent } from '../api/paymentsApi';

export default function CreateAdPage() {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [cities, setCities] = useState([]);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        brandId: '', modelId: '', cityId: '', year: 2024, vin: '', km: 0,
        color: '', engineCapacity: 0, horsePower: 0,
        fuelType: 0, gearBoxType: 0, bodyType: 0, transmissionType: 0,
        condition: 1, paintState: 1, damageState: 1,
        featureIds: [],
        saleType: 1,
        price: '', startingPrice: '', auctionStartDate: '', auctionEndDate: '',
        listingType: 1, description: ''
    });

    useEffect(() => {
        if (!isLoggedIn) { navigate('/login'); return; }
        getAllBrands().then(r => setBrands(r.data)).catch(() => { });
        getAllModels().then(r => setModels(r.data)).catch(() => { });
        getAllCities().then(r => setCities(r.data)).catch(() => { });
    }, []);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const filteredModels = form.brandId ? models.filter(m => m.brandId === parseInt(form.brandId)) : [];

    // Validation Logic
    const validateStep = (currentStep) => {
        if (currentStep === 1) {
            if (!form.brandId || !form.modelId || !form.cityId || !form.year ||
                form.km === '' || !form.color || !form.engineCapacity || !form.horsePower) {
                toast.warning("Zəhmət olmasa ulduzlu (*) və bütün texniki sahələri doldurun.");
                return false;
            }
        }
        if (currentStep === 2) {
            if (images.length === 0) {
                toast.warning("Zəhmət olmasa ən azı bir şəkil yükləyin.");
                return false;
            }
        }
        if (currentStep === 3) {
            if (parseInt(form.saleType) === 1) {
                if (!form.price) {
                    toast.warning("Zəhmət olmasa qiyməti qeyd edin.");
                    return false;
                }
            } else {
                if (!form.startingPrice || !form.auctionEndDate) {
                    toast.warning("Başlanğıc qiyməti və bitmə tarixini qeyd edin.");
                    return false;
                }
            }
        }
        return true;
    };

    const handleNextStep = (next) => {
        if (validateStep(step)) {
            setStep(next);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(3)) return; // Final check before submission

        setLoading(true);
        try {
            const payload = {
                brandId: parseInt(form.brandId), modelId: parseInt(form.modelId), cityId: parseInt(form.cityId),
                year: parseInt(form.year), vin: form.vin || null, km: parseInt(form.km),
                color: form.color, engineCapacity: parseInt(form.engineCapacity), horsePower: parseInt(form.horsePower),
                fuelType: parseInt(form.fuelType), gearBoxType: parseInt(form.gearBoxType),
                bodyType: parseInt(form.bodyType), transmissionType: parseInt(form.transmissionType),
                condition: parseInt(form.condition), paintState: parseInt(form.paintState), damageState: parseInt(form.damageState),
                featureIds: form.featureIds,
                saleType: parseInt(form.saleType),
                listingType: parseInt(form.listingType),
                description: form.description || null,
            };
            if (form.saleType === 1 || form.saleType === '1') {
                payload.price = parseFloat(form.price);
            } else {
                payload.startingPrice = parseFloat(form.startingPrice);
                payload.auctionStartDate = form.auctionStartDate || null;
                payload.auctionEndDate = form.auctionEndDate || null;
            }

            const res = await createCarAd(payload);
            const carId = res.data.carId;

            if (images.length > 0 && carId) {
                const fd = new FormData();
                images.forEach(img => fd.append('images', img));
                await uploadCarImages(carId, fd);
            }

            let paymentResponse;
            if (parseInt(form.saleType) == 1) {
                paymentResponse = await createPaymentIntent(parseInt(form.listingType), parseInt(carId));
            } else {
                paymentResponse = await createAuctionFee(parseInt(carId));
            }

            if (paymentResponse.data?.url) {
                window.location.href = paymentResponse.data.url;
            } else {
                toast.success("Elan yaradıldı!");
                navigate('/my-cars');
            }

        } catch (err) {
            toast.error(err.response?.data?.message || 'Xəta baş verdi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page container">
            <div className="section-header">
                <h1>📝 Elan Yarat</h1>
                <p>Avtomobilinizi satışa və ya hərraca çıxarın</p>
            </div>

            <div className="create-ad-steps">
                {[1, 2, 3].map(s => (
                    <div key={s} className={`step-indicator ${step >= s ? 'active' : ''}`}>
                        <span className="step-num">{s}</span>
                        <span className="step-label">{s === 1 ? 'Maşın' : s === 2 ? 'Detallar' : 'Satış'}</span>
                    </div>
                ))}
            </div>

            <div className="glass-card create-ad-form">
                {step === 1 && (
                    <>
                        <h2>Maşın Məlumatları</h2>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Marka *</label>
                                <select value={form.brandId} onChange={e => { set('brandId', e.target.value); set('modelId', ''); }} required>
                                    <option value="">Seçin</option>
                                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Model *</label>
                                <select value={form.modelId} onChange={e => set('modelId', e.target.value)} disabled={!form.brandId} required>
                                    <option value="">Seçin</option>
                                    {filteredModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Şəhər *</label>
                                <select value={form.cityId} onChange={e => set('cityId', e.target.value)} required>
                                    <option value="">Seçin</option>
                                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>İl *</label>
                                <input type="number" value={form.year} onChange={e => set('year', e.target.value)} min="1960" max="2026" />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Yürüş (KM) *</label>
                                <input type="number" value={form.km} onChange={e => set('km', e.target.value)} min="0" />
                            </div>
                            <div className="form-group">
                                <label>Rəng *</label>
                                <input value={form.color} onChange={e => set('color', e.target.value)} placeholder="Qara" />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Mühərrik Həcmi (cc) *</label>
                                <input type="number" value={form.engineCapacity} onChange={e => set('engineCapacity', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Güc (HP) *</label>
                                <input type="number" value={form.horsePower} onChange={e => set('horsePower', e.target.value)} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>VIN (İstəyə bağlı)</label>
                            <input value={form.vin} onChange={e => set('vin', e.target.value)} placeholder="VIN nömrəsi" />
                        </div>
                        <button className="btn btn-primary" onClick={() => handleNextStep(2)}>Davam Et →</button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h2>Texniki Xüsusiyyətlər</h2>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Yanacaq</label>
                                <select value={form.fuelType} onChange={e => set('fuelType', e.target.value)}>
                                    <option value={0}>Benzin</option><option value={1}>Dizel</option>
                                    <option value={2}>Hibrid</option><option value={3}>Elektrik</option><option value={4}>Qaz</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Sürətlər Qutusu</label>
                                <select value={form.gearBoxType} onChange={e => set('gearBoxType', e.target.value)}>
                                    <option value={0}>Avtomat</option><option value={1}>Mexaniki</option>
                                    <option value={2}>Robot</option><option value={3}>Variator</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Ban Növü</label>
                                <select value={form.bodyType} onChange={e => set('bodyType', e.target.value)}>
                                    <option value={0}>Sedan</option><option value={1}>SUV</option>
                                    <option value={2}>Coupe</option><option value={3}>Hatchback</option><option value={4}>Universal</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Ötürücü</label>
                                <select value={form.transmissionType} onChange={e => set('transmissionType', e.target.value)}>
                                    <option value={0}>Ön (FWD)</option><option value={1}>Arxa (RWD)</option><option value={2}>Tam (AWD)</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Vəziyyət</label>
                                <select value={form.condition} onChange={e => set('condition', e.target.value)}>
                                    <option value={1}>İşlənmiş</option><option value={2}>Yeni</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Rəng Vəziyyəti</label>
                                <select value={form.paintState} onChange={e => set('paintState', e.target.value)}>
                                    <option value={1}>Original</option><option value={2}>Qismən rənglənib</option><option value={3}>Tam rənglənib</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Zədə</label>
                            <select value={form.damageState} onChange={e => set('damageState', e.target.value)}>
                                <option value={1}>Vuruğu yoxdur</option><option value={2}>Yüngül zədəli</option>
                                <option value={3}>Ağır qəzalı</option><option value={4}>Ehtiyat hissəsi</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Şəkillər *</label>
                            <div className="image-preview-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                                {images.map((file, index) => (
                                    <div key={index} style={{ position: 'relative', width: '80px', height: '80px' }}>
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt="preview"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                                        />
                                        {/* Optional: Add a button to remove a specific image */}
                                        <button
                                            type="button"
                                            onClick={() => setImages(images.filter((_, i) => i !== index))}
                                            style={{ position: 'absolute', top: '-5px', right: '-5px', borderRadius: '50%', border: 'none', background: 'red', color: 'white', cursor: 'pointer' }}
                                        >
                                            x
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={e => {
                                    if (e.target.files) {
                                        setImages([...images, ...Array.from(e.target.files)]);
                                    }
                                }}
                            />
                            {images.length > 0 && <small style={{ color: 'var(--text-muted)' }}>{images.length} şəkil seçildi</small>}
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn btn-secondary" onClick={() => setStep(1)}>← Geri</button>
                            <button className="btn btn-primary" onClick={() => handleNextStep(3)}>Davam Et →</button>
                        </div>
                    </>
                )}

                {step === 3 && (
                    <>
                        <h2>Satış Növü</h2>
                        <div className="form-group">
                            <label>Satış Tipi</label>
                            <select value={form.saleType} onChange={e => set('saleType', e.target.value)}>
                                <option value={1}>Satış (Listing)</option>
                                <option value={2}>Hərrac (Auction)</option>
                            </select>
                        </div>

                        {(form.saleType === 1 || form.saleType === '1') ? (
                            <>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Qiymət (AZN) *</label>
                                        <input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="25000" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Elan Növü</label>
                                        <select value={form.listingType} onChange={e => set('listingType', e.target.value)}>
                                            <option value={1}>Sadə (3 AZN)</option>
                                            <option value={2}>VIP (7 AZN)</option>
                                            <option value={3}>Premium (10 AZN)</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label>Başlanğıc Qiymət (AZN) *</label>
                                    <input type="number" value={form.startingPrice} onChange={e => set('startingPrice', e.target.value)} placeholder="10000" required />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Başlama Tarixi</label>
                                        <input type="datetime-local" value={form.auctionStartDate} onChange={e => set('auctionStartDate', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Bitmə Tarixi *</label>
                                        <input type="datetime-local" value={form.auctionEndDate} onChange={e => set('auctionEndDate', e.target.value)} required />
                                    </div>
                                </div>
                            </>
                        )}
                        <div className="form-group">
                            <label>Təsvir</label>
                            <textarea value={form.description} onChange={e => set('description', e.target.value)}
                                rows={4} placeholder="Maşın haqqında əlavə məlumat..." />
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn btn-secondary" onClick={() => setStep(2)}>← Geri</button>
                            <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading}>
                                {loading ? 'Yaradılır...' : '🚀 Elanı Yarat'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}