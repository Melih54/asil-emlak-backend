import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Swal from 'sweetalert2'
import './App.css'
import html2pdf from 'html2pdf.js';

// --- YAN MENÜ (SIDEBAR) BİLEŞENİ ---
function YanMenu({ darkMode, toggleDarkMode }) {
  const [acik, setAcik] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuGecis = (yol) => {
    navigate(yol);
    setAcik(false);
  };

  const aktifMi = (yol) => location.pathname === yol ? "sidebar-item active" : "sidebar-item";

  return (
    <>
      <button onClick={() => setAcik(true)} className="hamburger-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>

      {acik && <div onClick={() => setAcik(false)} className="sidebar-overlay" />}

      <div className="sidebar" style={{ left: acik ? '0' : '-300px' }}>
        <div className="sidebar-header">
          <h3>Asil Emlak</h3>
          <p className="text-muted" style={{ fontSize: '13px', margin: 0, fontWeight: 500 }}>Sistem Menüsü</p>
        </div>
        
        <div className="sidebar-menu">
          <button onClick={() => menuGecis('/')} className={aktifMi('/')}>🏠 Saha Paneli</button>
          <button onClick={() => menuGecis('/belge')} className={aktifMi('/belge')}>📄 Boş Belge Şablonu</button>
          <button onClick={() => menuGecis('/danismanlar')} className={aktifMi('/danismanlar')}>👥 Danışman Yönetimi</button>
          <button onClick={() => menuGecis('/admin')} className={aktifMi('/admin')}>⚙️ Yönetici Paneli</button>
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)' }}>
          <button onClick={toggleDarkMode} className="btn btn-secondary btn-block" style={{ display: 'flex', justifyContent: 'center' }}>
            {darkMode ? '☀️ Açık Tema' : '🌙 Karanlık Tema'}
          </button>
        </div>
      </div>
    </>
  );
}

// --- DANIŞMAN YÖNETİMİ SAYFASI ---
function DanismanYonetimi() {
  const [danismanlar, setDanismanlar] = useState([]);
  const [form, setForm] = useState({ id: null, ad_soyad: '', telefon: '' });
  const [duzenleniyorMu, setDuzenleniyorMu] = useState(false);

  const danismanlariGetir = () => {
    fetch('https://asil-emlak-api.onrender.com/api/danismanlar')
      .then(res => res.json())
      .then(data => setDanismanlar(data || []))
      .catch(err => console.error(err));
  };

  useEffect(() => { danismanlariGetir(); }, []);

  const kaydet = async (e) => {
    e.preventDefault();
    const url = duzenleniyorMu ? 'https://asil-emlak-api.onrender.com/api/danisman/guncelle' : 'https://asil-emlak-api.onrender.com/api/danisman/ekle';
    const method = duzenleniyorMu ? 'PUT' : 'POST';

    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();

    if(data.basarili) {
      Swal.fire({ icon: 'success', title: 'Başarılı', timer: 1500, showConfirmButton: false });
      setForm({ id: null, ad_soyad: '', telefon: '' });
      setDuzenleniyorMu(false);
      danismanlariGetir();
    }
  };

  const sil = async (id) => {
    const onay = await Swal.fire({ title: 'Emin misiniz?', text: "Danışman silinecek!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#64748b', confirmButtonText: 'Evet, Sil!' });
    if(onay.isConfirmed) {
      await fetch(`https://asil-emlak-api.onrender.com/api/danisman/sil?id=${id}`, { method: 'DELETE' });
      danismanlariGetir();
    }
  };

  return (
    <div className="container">
      <div className="page-title">
        <h2 style={{ margin: 0 }}>Danışman Yönetimi</h2>
      </div>
      
      <div className="card" style={{ animationDelay: '0.1s' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '24px', color: '#ef4444' }}>{duzenleniyorMu ? 'Danışmanı Güncelle' : 'Yeni Danışman Ekle'}</h3>
        <form onSubmit={kaydet}>
          <div className="form-group">
            <label>Ad Soyad:</label>
            <input type="text" required value={form.ad_soyad} onChange={e => setForm({...form, ad_soyad: e.target.value})} />
          </div>
          
          <div className="form-group">
            <label>Telefon (Sisteme kayıtlı numara):</label>
            {/* ŞIK PLACEHOLDER DÜZELTMESİ EKLENDİ */}
            <input type="text" required value={form.telefon} onChange={e => setForm({...form, telefon: e.target.value})} placeholder="Örn: 555 123 45 67" />
          </div>
          
          <button type="submit" className={`btn btn-block ${duzenleniyorMu ? 'btn-success' : 'btn-brand'}`}>
            {duzenleniyorMu ? 'GÜNCELLE' : 'SİSTEME EKLE'}
          </button>
          
          {duzenleniyorMu && (
            <button type="button" onClick={() => { setDuzenleniyorMu(false); setForm({id:null, ad_soyad:'', telefon:''}); }} className="btn btn-block btn-secondary mt-3">
              İptal
            </button>
          )}
        </form>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {danismanlar.map((d, index) => (
          <li key={d.id} className="list-item" style={{ animation: `slideUp 0.5s ease forwards`, animationDelay: `${index * 0.1 + 0.2}s`, opacity: 0 }}>
            <div>
              <strong style={{ fontSize: '16px', color: 'var(--text-main)' }}>{d.ad_soyad}</strong><br/>
              <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>{d.telefon}</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => { setForm(d); setDuzenleniyorMu(true); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="btn btn-secondary" style={{ padding: '8px 12px' }}>✏️</button>
              <button type="button" onClick={() => sil(d.id)} className="btn btn-secondary" style={{ padding: '8px 12px', color: '#ef4444' }}>🗑️</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// --------------------------------------------------------
// 1. SAYFA: SÖZLEŞME VE KVKK BELGESİ
// --------------------------------------------------------
function BelgeSayfasi() {
  const yetkiNo = "8100235-001";

  return (
    <div className="container container-md">
      <div className="card" style={{ fontFamily: 'serif', lineHeight: '1.6', color: '#333', padding: '40px', background: '#fff' }}>
        <div style={{ borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px', textAlign: 'center' }}>
          <img src="/logo1.png" alt="Asil Emlak Logo" style={{ height: '60px', objectFit: 'contain', marginBottom: '10px' }} onError={(e) => e.target.style.display = 'none'} />
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>TAŞINMAZ YER GÖSTERME SÖZLEŞMESİ</h2>
        </div>

        <h3 style={{ fontSize: '18px', borderBottom: '1px solid #ccc' }}>MADDE 1 - TARAFLAR</h3>
        <p><strong>1.1. Sorumlu Emlak İşletmesi</strong></p>
        <ul style={{ listStyleType: 'none', paddingLeft: '10px' }}>
          <li><strong>İşletme Adresi:</strong> [AZMİMİLLİ MAHALLESİ AYDINPINAR CADDESİ NO:19/A MERKEZ DÜZCE]</li>
          <li><strong>Yetki Belgesi No:</strong> {yetkiNo}</li>
        </ul>

        <p><strong>1.2. Kiracı Adayı/Alıcı Adayı</strong></p>
        <p style={{ color: '#666', fontStyle: 'italic' }}>(Sisteme girilen Ad Soyad, TC ve İletişim bilgileri esas alınır.)</p>

        <h3 style={{ fontSize: '18px', borderBottom: '1px solid #ccc', marginTop: '20px' }}>MADDE 2 - SÖZLEŞMENİN KONUSU</h3>
        <p style={{ textAlign: 'justify' }}><strong>2.1.</strong> SORUMLU EMLAK DANIŞMANI, üstlendiği taşınmazın kiralanması/satılması sözleşmesinin yapılması imkanını hazırlama görevi çerçevesinde; taşınmazı kiralama/satın alma amacıyla KİRACI ADAYI/ALICI ADAYI’na gösterdiğini, gerekli tanıtımı yaptığını ve bu şekilde edinimi yerine getirdiğini kabul ve taahhüt eder.</p>
        <p style={{ textAlign: 'justify' }}><strong>2.2.</strong> KİRACI ADAYI/ALICI ADAYI; her ne suretle olursa olsun taşınmazın; bizatihi kendisi adına, eşi, çocukları, kardeşleri, anne-babası, 3. derece dahil kan ve sıhri hısımlarının adına veya ortağı, paydaşı, temsilcisi, çalışanı olduğu şirket adına kiralandığı/satıldığı taktirde; <strong>satışta satış bedeli üzerinden %2 +KDV, kiralamada 1 (bir) aylık kira bedeli +KDV’sini komisyon olarak</strong> Sorumlu Emlak Danışmanı’na ödeyeceğini kabul ve taahhüt eder.</p>

        <h3 style={{ fontSize: '18px', borderBottom: '1px solid #ccc', marginTop: '20px' }}>MADDE 3 – TARAFLARIN HAK VE YÜKÜMLÜLÜKLERİ</h3>
        <p style={{ textAlign: 'justify' }}><strong>3.1.</strong> KİRACI ADAYI veya ALICI ADAYI; SORUMLU EMLAK DANIŞMANI’nı devre dışı bırakılarak işlem gerçekleştirdiği takdirde hem ödemek zorunda olduğu komisyon bedelini ve ayrıca komisyon bedeli kadar ceza-i şart ödemek zorunda olduğunu kabul ve taahhüt eder.</p>

        <h3 style={{ fontSize: '18px', borderBottom: '1px solid #ccc', marginTop: '20px' }}>MADDE 4 - GİZLİLİK ve KİŞİSEL VERİLERİN KORUNMASI</h3>
        <p style={{ textAlign: 'justify' }}>SORUMLU EMLAK DANIŞMAN’ı ile paylaşılan kişisel veriler, 6698 Sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında işlenmektedir. Kiracı Adayı/Mal Sahibi Adayı kanunda öngörülen tedbirler kapsamında kişisel verilenin işlenmesine açık rızasının bulunduğunu kabul ve beyan eder.</p>

        <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(239, 68, 68, 0.05)', border: '1px dashed #ef4444', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#ef4444', fontSize: '14px' }}>Tarafıma SMS ile iletilen onay kodunu ilgili danışmana ileterek bu belgeyi dijital olarak imzaladığımı kabul ederim.</p>
        </div>
      </div>
    </div>
  )
}

// --------------------------------------------------------
// 2. SAYFA: DANIŞMAN SAHA PANELİ
// --------------------------------------------------------
function SahaPaneli() {
  const [adim, setAdim] = useState(1);
  const [kayitId, setKayitId] = useState(null);
  const [danismanlar, setDanismanlar] = useState([]);
  const [onayliSozlesmeler, setOnayliSozlesmeler] = useState([]); 
  
  const navigate = useNavigate(); 

  const [form, setForm] = useState({ danisman_id: '', musteri_ad_soyad: '', musteri_telefon: '', musteri_tc: '', tasinmaz_adres: '', tasinmaz_ada_parsel: '', islem_turu: 'Satış', bedel: '' });
  const [onayKodu, setOnayKodu] = useState('');

  // WP için telefon numarası formatlama (Saha Paneli İçin)
  const wpTel = form.musteri_telefon.replace(/\D/g, '');
  const wpFormatli = wpTel.length === 10 ? '90' + wpTel : (wpTel.startsWith('0') ? '9' + wpTel : wpTel);
  const wpMesaj = encodeURIComponent(`Merhaba ${form.musteri_ad_soyad}, Asil Emlak yer gösterme sözleşmeniz sisteme girilmiş ve onay kodunuz SMS olarak iletilmiştir. Belgenin bir örneğini bu linkten inceleyebilirsiniz: https://asil-emlak-backend.vercel.app/belge`);

  useEffect(() => {
    fetch('https://asil-emlak-api.onrender.com/api/danismanlar')
      .then(res => res.json())
      .then(data => { setDanismanlar(data || []); if(data?.length > 0) setForm(p => ({...p, danisman_id: data[0].id})); })
      .catch(err => console.error(err));

    fetch('https://asil-emlak-api.onrender.com/api/kayitlar')
      .then(res => res.json())
      .then(data => { if(data) { setOnayliSozlesmeler(data.filter(k => k.durum === 'onaylandi')); } })
      .catch(err => console.error(err));
  }, []);

  const islemBaslat = async (e) => {
    e.preventDefault();
    Swal.fire({ title: 'SMS Gönderiliyor...', allowOutsideClick: false, didOpen: () => { Swal.showLoading() } });

    try {
      const payload = { ...form, danisman_id: parseInt(form.danisman_id), bedel: parseFloat(form.bedel) || 0 };
      const response = await fetch('https://asil-emlak-api.onrender.com/api/baslat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      
      if (data.basarili) { setKayitId(data.kayit_id); setAdim(2); Swal.fire({ icon: 'success', title: 'Başarılı!', text: data.mesaj, timer: 2000, showConfirmButton: false }); } 
      else { Swal.fire({ icon: 'error', title: 'Hata', text: data.mesaj }); }
    } catch { Swal.fire({ icon: 'error', title: 'Bağlantı Hatası', text: 'Sunucuya bağlanılamadı.' }); }
  };

  const koduDogrula = async (e) => {
    e.preventDefault();
    Swal.fire({ title: 'Konum ve Onay Alınıyor...', allowOutsideClick: false, didOpen: () => { Swal.showLoading() } });

    const konumAl = () => new Promise((resolve) => {
      if (!navigator.geolocation) resolve("Tarayıcı GPS desteklemiyor");
      else navigator.geolocation.getCurrentPosition((pos) => resolve(`${pos.coords.latitude}, ${pos.coords.longitude}`), () => resolve("Konum İzni Verilmedi"));
    });

    try {
      const gpsKonum = await konumAl();
      const response = await fetch('https://asil-emlak-api.onrender.com/api/dogrula', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kayit_id: kayitId, onay_kodu: onayKodu, konum: gpsKonum }) });
      const data = await response.json();
      
      if (data.basarili) {
        Swal.fire({ icon: 'success', title: '🎉 MÜHÜRLENDİ!', html: `<b>Sözleşme yasal olarak onaylandı.</b><br/><br/><b>Konum:</b> ${gpsKonum}`, confirmButtonText: 'Yeni İşlem Başlat' }).then(() => {
          setAdim(1); setForm(prev => ({...prev, musteri_ad_soyad: '', musteri_telefon: '', musteri_tc: '', tasinmaz_adres: '', tasinmaz_ada_parsel: '', bedel: ''})); setOnayKodu(''); window.location.reload(); 
        });
      } else { Swal.fire({ icon: 'error', title: 'Hata', text: data.mesaj }); }
    } catch { Swal.fire({ icon: 'error', title: 'Bağlantı Hatası', text: 'Sunucuya bağlanılamadı.' }); }
  };

  return (
    <div className="container">
      <div className="header-logo">
        <img src="/logo1.png" alt="Asil Emlak Logo" onError={(e) => e.target.style.display = 'none'} />
        <button onClick={() => navigate('/belge')} className="btn btn-secondary mt-4" style={{ borderRadius: '30px', fontSize: '13px' }}>📄 Belge Şablonu</button>
      </div>
      
      {adim === 1 && (
        <>
          <div className="card" style={{ animationDelay: '0.1s' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '24px', color: '#ef4444' }}>Yeni Sözleşme Oluştur</h3>
            <form onSubmit={islemBaslat}>
              <div className="form-group">
                <label>Danışman Seçimi</label>
                <select value={form.danisman_id} onChange={(e) => setForm({...form, danisman_id: e.target.value})}>
                  {danismanlar.map(d => <option key={d.id} value={d.id}>{d.ad_soyad}</option>)}
                </select>
              </div>
              
              <div className="form-row">
                <div className="form-col">
                  <label>Müşteri Ad Soyad</label>
                  <input type="text" required value={form.musteri_ad_soyad} onChange={(e) => setForm({...form, musteri_ad_soyad: e.target.value})} />
                </div>
                <div className="form-col">
                  <label>Müşteri TC/Yabancı No</label>
                  <input type="text" maxLength="11" required value={form.musteri_tc} onChange={(e) => setForm({...form, musteri_tc: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label>Müşteri Telefon</label>
                {/* ŞIK PLACEHOLDER DÜZELTMESİ EKLENDİ */}
                <input type="tel" required placeholder="Örn: 555 123 45 67" value={form.musteri_telefon} onChange={(e) => setForm({...form, musteri_telefon: e.target.value})} />
              </div>
              
              <hr style={{ border: '0', borderTop: '1px solid var(--glass-border)', margin: '30px 0' }} />

              <div className="form-group">
                <label>Taşınmaz Açık Adresi</label>
                <textarea required rows="2" value={form.tasinmaz_adres} onChange={(e) => setForm({...form, tasinmaz_adres: e.target.value})} style={{resize: 'vertical'}} placeholder="İl, İlçe, Mahalle, Sokak..." />
              </div>

              <div className="form-row">
                <div className="form-col">
                  <label>Ada/Parsel</label>
                  <input type="text" value={form.tasinmaz_ada_parsel} onChange={(e) => setForm({...form, tasinmaz_ada_parsel: e.target.value})} placeholder="Örn: 102/4" />
                </div>
                <div className="form-col">
                  <label>İşlem Türü</label>
                  <select value={form.islem_turu} onChange={(e) => setForm({...form, islem_turu: e.target.value})}>
                    <option value="Satış">Satış</option>
                    <option value="Kiralama">Kiralama</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Bedel ({form.islem_turu === 'Satış' ? 'Satış Bedeli' : 'Aylık Kira'} - TL)</label>
                <input type="number" required value={form.bedel} onChange={(e) => setForm({...form, bedel: e.target.value})} />
              </div>
              
              <button type="submit" className="btn btn-brand btn-block mt-4">
                SMS GÖNDER VE BAŞLAT
              </button>
            </form>
          </div>

          <div className="card" style={{ animationDelay: '0.2s', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Son Onaylananlar</h3>
              <button onClick={() => navigate('/admin')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>Tümünü Gör</button>
            </div>
            
            {onayliSozlesmeler.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {onayliSozlesmeler.slice(0, 3).map(k => ( 
                  <li key={k.id} className="list-item" style={{ padding: '15px' }}>
                    <div>
                      <strong style={{ color: 'var(--text-main)' }}>{k.musteri_ad_soyad}</strong><br/>
                      <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{k.tasinmaz_adres}</span>
                    </div>
                    <span className="badge badge-success">✓ Mühürlü</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '20px 0 0 0' }}>Henüz onaylanmış sözleşme bulunmuyor.</p>
            )}
          </div>
        </>
      )}

      {adim === 2 && (
        <form onSubmit={koduDogrula}>
          <div className="card text-center" style={{ padding: '50px 30px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#10b981' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>Onay Bekleniyor</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Müşteriye yasal bilgilendirme ve 6 haneli onay kodu gönderildi.</p>
            
            <input type="text" maxLength="6" required placeholder="000000" value={onayKodu} onChange={(e) => setOnayKodu(e.target.value)} className="otp-input" />
            
            <button type="submit" className="btn btn-success btn-block mt-4" style={{ padding: '16px', fontSize: '1rem' }}>
              SÖZLEŞMEYİ MÜHÜRLE
            </button>

            {/* WHATSAPP BUTONU DİZAYNI DÜZELTİLDİ: Flex ve Ortalama eklendi */}
            <a href={`https://wa.me/${wpFormatli}?text=${wpMesaj}`} target="_blank" rel="noreferrer" className="btn mt-3" style={{ margin: '0 auto', maxWidth: '250px', background: '#25D366', color: '#ffffff', padding: '14px', fontSize: '15px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 6px 15px rgba(37, 211, 102, 0.3)', border: 'none', borderRadius: '12px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              WhatsApp ile Gönder
            </a>

            <button type="button" onClick={() => setAdim(1)} className="btn btn-secondary btn-block mt-3" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>İptal Et</button>
          </div>
        </form>
      )}
    </div>
  )
}

// --------------------------------------------------------
// 3. SAYFA: YÖNETİCİ (ADMIN) PANELİ (SAYFALAMALI + GPS + WP)
// --------------------------------------------------------
function AdminPaneli() {
  const [kayitlar, setKayitlar] = useState([]);
  const [arama, setArama] = useState('');
  
  // SAYFALAMA STATE'LERİ
  const [mevcutSayfa, setMevcutSayfa] = useState(1);
  const kayitBasinaSayfa = 10;
  
  const navigate = useNavigate(); 

  useEffect(() => {
    fetch('https://asil-emlak-api.onrender.com/api/kayitlar')
      .then(res => res.json())
      .then(data => setKayitlar(data || []))
      .catch(err => console.error("Kayıtlar çekilemedi", err));
  }, []);

  useEffect(() => {
    setMevcutSayfa(1);
  }, [arama]);

  const filtrelenmisKayitlar = kayitlar.filter(k => {
    const adSoyad = k.musteri_ad_soyad || '';
    const tcNo = k.musteri_tc || '';
    return adSoyad.toLowerCase().includes(arama.toLowerCase()) || tcNo.includes(arama);
  });

  const sonKayitIndeksi = mevcutSayfa * kayitBasinaSayfa;
  const ilkKayitIndeksi = sonKayitIndeksi - kayitBasinaSayfa;
  const gosterilecekKayitlar = filtrelenmisKayitlar.slice(ilkKayitIndeksi, sonKayitIndeksi);
  const toplamSayfa = Math.ceil(filtrelenmisKayitlar.length / kayitBasinaSayfa);

  const durumRenkGetir = (durum) => {
    switch(durum) {
      case 'onaylandi': return { sinif: 'badge badge-success', etiket: 'Onaylandı' };
      case 'bekliyor': return { sinif: 'badge badge-warning', etiket: 'Bekliyor' };
      default: return { sinif: 'badge', etiket: durum };
    }
  };

  // Admin tablosu için WP telefon numarası formatlama
  const adminWpFormatla = (tel) => {
    if (!tel) return '';
    let clean = tel.replace(/\D/g, '');
    if (clean.length === 10) return '90' + clean;
    if (clean.length === 11 && clean.startsWith('0')) return '9' + clean;
    return clean.startsWith('90') ? clean : '90' + clean;
  };

  const pdfIndir = (kayit) => {
    const islemMetni = kayit.islem_turu === 'Satış' ? `satış bedeli üzerinden %2 +KDV'sini` : `1 (bir) aylık kira bedeli +KDV'sini`;
    const telFormatla = (tel) => (!tel ? 'Belirtilmedi' : (tel.startsWith('+90') ? tel : `+90${tel}`));
    const musteriTel = telFormatla(kayit.musteri_telefon);
    const danismanTel = telFormatla(kayit.danisman_telefon);

    // HTML tasarımı genişletildi, fontlar büyütüldü ve satır aralıkları açıldı.
    const htmlIcerik = `
      <div style="width: 800px; padding: 50px; font-family: 'Times New Roman', serif; font-size: 16px; line-height: 1.6; color: #000; background: #fff; box-sizing: border-box;">
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 25px;">
          <h2 style="margin: 0; font-size: 24px; font-weight: bold;">TAŞINMAZ YER GÖSTERME SÖZLEŞMESİ</h2>
        </div>
        
        <h3 style="font-size: 18px; text-decoration: underline; margin-bottom: 10px;">MADDE 1 - TARAFLAR</h3>
        <p style="margin-bottom: 8px;"><strong>1.1. Sorumlu Emlak İşletmesi</strong><br/>İşletme Adı: Asil Emlak Düzce<br/>İşletme Adresi: [AZMİMİLLİ MAHALLESİ AYDINPINAR CADDESİ NO:19/A MERKEZ DÜZCE]<br/>İşletme Yetki Belgesi Numarası: 8100235-001</p>
        <p style="margin-bottom: 8px;"><strong>1.2. Sorumlu Emlak Danışmanı</strong><br/>Adı Soyadı: ${kayit.danisman_ad}<br/>İletişim Bilgisi: ${danismanTel}</p>
        <p style="margin-bottom: 8px;"><strong>1.3. Kiracı/Alıcı Adayı</strong><br/>Adı Soyadı: ${kayit.musteri_ad_soyad}<br/>TC Kimlik No: ${kayit.musteri_tc}<br/>İletişim Bilgisi: ${musteriTel}</p>

        <h3 style="font-size: 18px; text-decoration: underline; margin-top: 25px; margin-bottom: 10px;">MADDE 2 - SÖZLEŞMENİN KONUSU</h3>
        <p style="text-align: justify; margin-bottom: 12px;"><strong>2.1.</strong> SORUMLU EMLAK DANIŞMANI, üstlendiği taşınmazın kiralanması/satılması sözleşmesinin yapılması imkanını hazırlama görevi çerçevesinde; taşınmazı kiralama/satın alma amacıyla KİRACI ADAYI/ALICI ADAYI'na gösterdiğini kabul ve taahhüt eder.</p>
        <p style="text-align: justify; margin-bottom: 12px;"><strong>2.2.</strong> KİRACI ADAYI/ALICI ADAYI; her ne suretle olursa olsun taşınmazın bizatihi kendisi adına, eşi, çocukları, 3. derece dahil kan ve sıhri hısımlarının adına veya ortağı olduğu şirket adına kiralandığı/satıldığı taktirde; <strong>${islemMetni}</strong> komisyon olarak Sorumlu Emlak Danışmanı'na ödeyeceğini kabul ve taahhüt eder.</p>
        <p style="margin-bottom: 12px;"><strong>2.3. Taşınmaz Bilgileri</strong><br/>Adresi: ${kayit.tasinmaz_adres}<br/>Ada/Parsel: ${kayit.tasinmaz_ada_parsel}<br/>İşlem Türü ve Bedeli: ${kayit.islem_turu} - <strong style="color: #ef4444;">${kayit.bedel} TL</strong></p>

        <h3 style="font-size: 18px; text-decoration: underline; margin-top: 25px; margin-bottom: 10px;">MADDE 3 - DİJİTAL ONAY VE KVKK</h3>
        <p style="text-align: justify; margin-bottom: 30px;">Bu sözleşme, müşteri tarafından SMS ile iletilen onay kodunun sisteme girilmesiyle yasal olarak mühürlenmiştir. 6698 Sayılı KVKK kapsamında verilerin işlenmesine açık rıza gösterilmiştir.</p>
        
        <div style="padding: 20px; border: 2px solid #28a745; border-radius: 12px; text-align: center; background-color: #f8fff9; page-break-inside: avoid;">
          <h4 style="margin: 0 0 10px 0; color: #28a745; font-size: 18px;">✓ DİJİTAL İMZA MÜHRÜ</h4>
          <p style="margin: 5px 0; font-size: 15px;"><strong>Onay Zamanı:</strong> ${kayit.onay_zamani && kayit.onay_zamani.Valid ? kayit.onay_zamani.String : '-'}</p>
          <p style="margin: 5px 0; font-size: 15px;"><strong>Cihaz GPS Koordinatı:</strong> ${kayit.konum && kayit.konum.Valid ? kayit.konum.String : 'Alınamadı'}</p>
          <p style="margin: 5px 0; font-size: 15px;"><strong>GSM OTP Doğrulaması:</strong> ${musteriTel} numaralı telefona iletilen eşsiz şifre sisteme girilerek kimlik teyidi sağlanmıştır.</p>
          <p style="margin: 15px 0 0 0; font-size: 12px; color: #666;">Bu belge Asil Emlak Saha Otomasyonu tarafından oluşturulmuştur.</p>
        </div>
      </div>
    `;

    // SİHİRLİ DOKUNUŞ: PDF'e "bunu A4 mm olarak değil, 800x1131 PİKSEL boyutlarında bas" diyoruz. 
    // Bu sayede büzüşme ortadan kalkar, margin sıfırlanarak içerideki 50px padding kullanılır.
    const ayarlar = { 
      margin: 0, 
      filename: `YerGosterme_${kayit.musteri_ad_soyad.replace(/ /g, '_')}_${kayit.id}.pdf`, 
      image: { type: 'jpeg', quality: 1 }, 
      html2canvas: { scale: 2, windowWidth: 800 }, 
      jsPDF: { unit: 'px', format: [800, 1131], orientation: 'portrait' } 
    };

    html2pdf().from(htmlIcerik).set(ayarlar).save();
  };

  return (
    <div className="container container-lg">
      <div className="page-title" style={{ marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '28px' }}>Yönetici Paneli</h2>
          <button onClick={() => navigate('/')} style={{ padding: 0, marginTop: '8px', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}>← Saha Paneline Dön</button>
        </div>
        <input type="text" placeholder="Ad veya TC ile Ara..." value={arama} onChange={(e) => setArama(e.target.value)} style={{ maxWidth: '300px', marginBottom: 0 }} />
      </div>

      <div className="table-container" style={{ animation: 'slideUp 0.6s ease forwards' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Danışman</th>
              <th>Müşteri Bilgisi</th>
              <th>Taşınmaz Bilgisi</th>
              <th>İşlem & Bedel</th>
              <th>Durum</th>
              <th>Kayıt & IP</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {gosterilecekKayitlar.map(kayit => {
              const d = durumRenkGetir(kayit.durum);
              
              const konumGecerliMi = kayit.konum && kayit.konum.Valid && kayit.konum.String.includes(',');

              return (
                <tr key={kayit.id}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#{kayit.id}</td>
                  <td><strong style={{ color: 'var(--text-main)' }}>{kayit.danisman_ad}</strong></td>
                  <td>
                    <span style={{ color: 'var(--text-main)' }}>{kayit.musteri_ad_soyad}</span><br/>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>TC: {kayit.musteri_tc}</span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-main)' }}>{kayit.tasinmaz_adres}</span><br/>
                    <strong style={{ color: '#007bff' }}>{kayit.tasinmaz_ada_parsel}</strong>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-main)' }}>{kayit.islem_turu}</span><br/>
                    <strong style={{ color: '#ef4444' }}>{kayit.bedel} TL</strong>
                  </td>
                  <td><span className={d.sinif}>{d.etiket}</span></td>
                  
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    {kayit.onay_zamani && kayit.onay_zamani.Valid ? kayit.onay_zamani.String : '-'} <br/>
                    {kayit.musteri_ip && kayit.musteri_ip.Valid ? `IP: ${kayit.musteri_ip.String}` : ''}
                    
                    {konumGecerliMi && (
                      <a href={`http://maps.google.com/?q=${kayit.konum.String.replace(/\s/g, '')}`} target="_blank" rel="noreferrer" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        Haritada Gör
                      </a>
                    )}
                  </td>
                  
                  <td style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <a href={`https://wa.me/${adminWpFormatla(kayit.musteri_telefon)}?text=${encodeURIComponent(`Merhaba ${kayit.musteri_ad_soyad}, Asil Emlak yer gösterme belgenize bu linkten ulaşabilirsiniz: https://asil-emlak-backend.vercel.app/belge`)}`} target="_blank" rel="noreferrer" className="btn" style={{ padding: '6px 10px', fontSize: '12px', background: '#25D366', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                      WhatsApp
                    </a>
                    
                    {kayit.durum === 'onaylandi' && (
                      <button onClick={() => pdfIndir(kayit)} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        PDF İndir
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {gosterilecekKayitlar.length === 0 && (
              <tr><td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Sistemde kayıt bulunamadı.</td></tr>
            )}
          </tbody>
        </table>
        
        {toplamSayfa > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setMevcutSayfa(prev => Math.max(prev - 1, 1))} disabled={mevcutSayfa === 1}>Önceki</button>
            <span className="page-info">Sayfa {mevcutSayfa} / {toplamSayfa}</span>
            <button className="page-btn" onClick={() => setMevcutSayfa(prev => Math.min(prev + 1, toplamSayfa))} disabled={mevcutSayfa === toplamSayfa}>Sonraki</button>
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const kayitliTema = localStorage.getItem('asilEmlakTema');
    if (kayitliTema === 'dark') {
      setDarkMode(true);
      document.body.classList.add('dark-mode');
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('asilEmlakTema', 'light');
      setDarkMode(false);
    } else {
      document.body.classList.add('dark-mode');
      localStorage.setItem('asilEmlakTema', 'dark');
      setDarkMode(true);
    }
  };

  return (
    <>
      <YanMenu darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <Routes>
        <Route path="/" element={<SahaPaneli />} />
        <Route path="/belge" element={<BelgeSayfasi />} />
        <Route path="/admin" element={<AdminPaneli />} />
        <Route path="/danismanlar" element={<DanismanYonetimi />} />
      </Routes>
    </>
  )
}

export default App