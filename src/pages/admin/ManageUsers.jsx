import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiShield, FiShieldOff, FiArrowLeft } from 'react-icons/fi';
import { getUsers, banUser, unbanUser } from '../../api/adminApi';
import { useAuth } from '../../context/AuthContext';
import './AdminPages.css';
import { toast } from 'react-hot-toast';

export default function ManageUsers() {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const res = await getUsers();
            setUsers(res.data);
        } catch (err) {
            console.error("Users load error:", err);
            toast.error("İstifadəçilər yüklənərkən xəta baş verdi!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            return;
        }
        fetchUsers();
    }, [isAdmin, navigate]);

    const handleBan = async (userId) => {
        if (window.confirm("Bu istifadəçini bloklamaq istədiyinizə əminsiniz?")) {
            try {
                await banUser(userId);
                toast.success("İstifadəçi bloklandı!");
                fetchUsers();
            } catch (err) {
                toast.error("Xəta baş verdi!");
            }
        }
    };

    const handleUnban = async (userId) => {
        try {
            await unbanUser(userId);
            toast.success("İstifadəçinin bloku açıldı!");
            fetchUsers();
        } catch (err) {
            toast.error("Xəta baş verdi!");
        }
    };

    if (loading) {
        return (
            <div className="page loading-page">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="page container admin-crud">
            <header className="crud-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => navigate('/admin')} className="btn btn-icon"><FiArrowLeft /></button>
                    <h1>👤 İstifadəçilərin İdarə Edilməsi</h1>
                </div>
            </header>

            <div className="card" style={{ padding: '20px', overflowX: 'auto' }}>
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                            <th style={{ padding: '12px' }}>Ad Soyad</th>
                            <th style={{ padding: '12px' }}>İstifadəçi adı</th>
                            <th style={{ padding: '12px' }}>Email</th>
                            <th style={{ padding: '12px' }}>Telefon</th>
                            <th style={{ padding: '12px' }}>Status</th>
                            <th style={{ padding: '12px' }}>Əməliyyat</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                <td style={{ padding: '12px' }}><strong>{user.fullName}</strong></td>
                                <td style={{ padding: '12px' }}>{user.userName}</td>
                                <td style={{ padding: '12px' }}>{user.email}</td>
                                <td style={{ padding: '12px' }}>{user.phoneNumber}</td>
                                <td style={{ padding: '12px' }}>
                                    <span className={`badge ${user.isLockedOut ? 'danger' : 'success'}`}>
                                        {user.isLockedOut ? 'Bloklanıb' : 'Aktiv'}
                                    </span>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    {user.isLockedOut ? (
                                        <button 
                                            onClick={() => handleUnban(user.id)} 
                                            className="btn btn-sm btn-success"
                                            title="Bloku aç"
                                        >
                                            <FiShield /> Aç
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleBan(user.id)} 
                                            className="btn btn-sm btn-danger"
                                            title="Blokla"
                                        >
                                            <FiShieldOff /> Blokla
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
