import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
// Burada adı düzəltdik: verifyPayment -> confirmPayment
import { confirmPayment, confirmAuctionPayment } from '../api/paymentsApi';
import { toast } from 'react-toastify';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);

    // API-nin çağırılıb-çağırılmadığını izləmək üçün
    const effectRan = useRef(false);

    useEffect(() => {
        // Əgər artıq işləyibsə, dayandır
        if (effectRan.current === true) return;

        const sessionId = searchParams.get('sessionId');
        const carId = searchParams.get('carId');
        const type = searchParams.get('type');

        const verify = async () => {
            try {

                await confirmPayment(sessionId, carId, type);

                if (type == 'hold') {
                    localStorage.setItem('payed-auction-data', JSON.stringify({ carId, sessionId }));

                }

                toast.success("Təbriklər, elanınız aktivdir!");
                effectRan.current = true;
            } catch (error) {
                console.error(error);
                toast.error("Ödəniş təsdiqlənmədi!");
            } finally {
                setVerifying(false);
            }
        };

        if (carId) {
            verify();
        }

        // Cleanup funksiyasında flag-i true edirik
        return () => {
            effectRan.current = true;
        };
    }, [searchParams]);

    return (
        <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>
            <div className="glass-card" style={{ padding: '50px' }}>
                {verifying ? (
                    <h2>🔄 Ödəniş təsdiqlənir...</h2>
                ) : (
                    <>
                        <h1>✅ Hazırdır!</h1>
                        <p>Ödəniş uğurla tamamlandı və elan aktiv edildi.</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/my-cars')}
                        >
                            Elanlarıma bax
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}