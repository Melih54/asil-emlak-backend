import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Swal from 'sweetalert2'
import './App.css'
import html2pdf from 'html2pdf.js';

// --- YAN MENÜ (SIDEBAR) BİLEŞENİ ---
function YanMenu() {
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
            <input type="text" required value={form.telefon} onChange={e => setForm({...form, telefon: e.target.value})} placeholder="Örn: 5551234567" />
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
              <strong style={{ fontSize: '16px' }}>{d.ad_soyad}</strong><br/>
              <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>{d.telefon}</span>
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
      <div className="card" style={{ fontFamily: 'serif', lineHeight: '1.6', color: '#333', padding: '40px' }}>
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
        <img src="/logo.png" alt="Asil Emlak Logo" onError={(e) => e.target.style.display = 'none'} />
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
                <input type="tel" required placeholder="5xxxxxxxxx" value={form.musteri_telefon} onChange={(e) => setForm({...form, musteri_telefon: e.target.value})} />
              </div>
              
              <hr style={{ border: '0', borderTop: '1px solid rgba(0,0,0,0.1)', margin: '30px 0' }} />

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
                      <strong style={{ color: '#0f172a' }}>{k.musteri_ad_soyad}</strong><br/>
                      <span style={{ color: '#64748b', fontSize: '13px' }}>{k.tasinmaz_adres}</span>
                    </div>
                    <span className="badge badge-success">✓ Mühürlü</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ textAlign: 'center', color: '#64748b', margin: '20px 0 0 0' }}>Henüz onaylanmış sözleşme bulunmuyor.</p>
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
            <p style={{ color: '#64748b', marginBottom: '30px' }}>Müşteriye yasal bilgilendirme ve 6 haneli onay kodu gönderildi.</p>
            
            <input type="text" maxLength="6" required placeholder="000000" value={onayKodu} onChange={(e) => setOnayKodu(e.target.value)} className="otp-input" />
            
            <button type="submit" className="btn btn-success btn-block mt-4" style={{ padding: '18px', fontSize: '1.1rem' }}>SÖZLEŞMEYİ MÜHÜRLE</button>
            <button type="button" onClick={() => setAdim(1)} className="btn btn-secondary btn-block mt-3" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>İptal Et</button>
          </div>
        </form>
      )}
    </div>
  )
}

// --------------------------------------------------------
// 3. SAYFA: YÖNETİCİ (ADMIN) PANELİ
// --------------------------------------------------------
function AdminPaneli() {
  const [kayitlar, setKayitlar] = useState([]);
  const [arama, setArama] = useState('');
  const navigate = useNavigate(); 

  useEffect(() => {
    fetch('https://asil-emlak-api.onrender.com/api/kayitlar')
      .then(res => res.json())
      .then(data => setKayitlar(data || []))
      .catch(err => console.error("Kayıtlar çekilemedi", err));
  }, []);

  const filtrelenmisKayitlar = kayitlar.filter(k => {
    const adSoyad = k.musteri_ad_soyad || '';
    const tcNo = k.musteri_tc || '';
    return adSoyad.toLowerCase().includes(arama.toLowerCase()) || tcNo.includes(arama);
  });

  const durumRenkGetir = (durum) => {
    switch(durum) {
      case 'onaylandi': return { sinif: 'badge badge-success', etiket: 'Onaylandı' };
      case 'bekliyor': return { sinif: 'badge badge-warning', etiket: 'Bekliyor' };
      default: return { sinif: 'badge', etiket: durum };
    }
  };

  const pdfIndir = (kayit) => {
    const islemMetni = kayit.islem_turu === 'Satış' ? `satış bedeli üzerinden %2 +KDV'sini` : `1 (bir) aylık kira bedeli +KDV'sini`;
    const telFormatla = (tel) => (!tel ? 'Belirtilmedi' : (tel.startsWith('+90') ? tel : `+90${tel}`));
    const musteriTel = telFormatla(kayit.musteri_telefon);
    const danismanTel = telFormatla(kayit.danisman_telefon);

    const htmlIcerik = `
      <div style="width: 750px; padding: 20px; font-family: 'Times New Roman', serif; font-size: 14px; line-height: 1.5; color: #000; background: #fff;">
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
          <h2 style="margin: 0; font-size: 20px;">TAŞINMAZ YER GÖSTERME SÖZLEŞMESİ</h2>
        </div>
        <h3 style="font-size: 15px; text-decoration: underline;">MADDE 1 - TARAFLAR</h3>
        <p><strong>1.1. Sorumlu Emlak İşletmesi</strong><br/>İşletme Adı: Asil Emlak Düzce<br/>İşletme Adresi: [AZMİMİLLİ MAHALLESİ AYDINPINAR CADDESİ NO:19/A MERKEZ DÜZCE]<br/>İşletme Yetki Belgesi Numarası: 8100235-001</p>
        <p><strong>1.2. Sorumlu Emlak Danışmanı</strong><br/>Adı Soyadı: ${kayit.danisman_ad}<br/>İletişim Bilgisi: ${danismanTel}</p>
        <p><strong>1.3. Kiracı/Alıcı Adayı</strong><br/>Adı Soyadı: ${kayit.musteri_ad_soyad}<br/>TC Kimlik No: ${kayit.musteri_tc}<br/>İletişim Bilgisi: ${musteriTel}</p>
        <h3 style="font-size: 15px; text-decoration: underline; margin-top: 15px;">MADDE 2 - SÖZLEŞMENİN KONUSU</h3>
        <p style="text-align: justify;"><strong>2.1.</strong> SORUMLU EMLAK DANIŞMANI, üstlendiği taşınmazın kiralanması/satılması sözleşmesinin yapılması imkanını hazırlama görevi çerçevesinde; taşınmazı kiralama/satın alma amacıyla KİRACI ADAYI/ALICI ADAYI'na gösterdiğini kabul ve taahhüt eder.</p>
        <p style="text-align: justify;"><strong>2.2.</strong> KİRACI ADAYI/ALICI ADAYI; her ne suretle olursa olsun taşınmazın bizatihi kendisi adına, eşi, çocukları, 3. derece dahil kan ve sıhri hısımlarının adına veya ortağı olduğu şirket adına kiralandığı/satıldığı taktirde; <strong>${islemMetni}</strong> komisyon olarak Sorumlu Emlak Danışmanı'na ödeyeceğini kabul ve taahhüt eder.</p>
        <p><strong>2.3. Taşınmaz Bilgileri</strong><br/>Adresi: ${kayit.tasinmaz_adres}<br/>Ada/Parsel: ${kayit.tasinmaz_ada_parsel}<br/>İşlem Türü ve Bedeli: ${kayit.islem_turu} - ${kayit.bedel} TL</p>
        <h3 style="font-size: 15px; text-decoration: underline; margin-top: 15px;">MADDE 3 - DİJİTAL ONAY VE KVKK</h3>
        <p style="text-align: justify;">Bu sözleşme, müşteri tarafından SMS ile iletilen onay kodunun sisteme girilmesiyle yasal olarak mühürlenmiştir. 6698 Sayılı KVKK kapsamında verilerin işlenmesine açık rıza gösterilmiştir.</p>
        <div style="margin-top: 20px; padding: 15px; border: 2px solid #28a745; border-radius: 10px; text-align: center; background-color: #f8fff9; page-break-inside: avoid;">
          <h4 style="margin: 0 0 5px 0; color: #28a745;">✓ DİJİTAL İMZA MÜHRÜ</h4>
          <p style="margin: 3px 0;"><strong>Onay Zamanı:</strong> ${kayit.onay_zamani && kayit.onay_zamani.Valid ? kayit.onay_zamani.String : '-'}</p>
          <p style="margin: 3px 0;"><strong>Cihaz GPS Koordinatı:</strong> ${kayit.konum && kayit.konum.Valid ? kayit.konum.String : 'Alınamadı'}</p>
          <p style="margin: 3px 0;"><strong>GSM OTP Doğrulaması:</strong> ${musteriTel} numaralı telefona iletilen eşsiz şifre sisteme girilerek kimlik teyidi sağlanmıştır.</p>
          <p style="margin: 10px 0 0 0; font-size: 11px; color: #555;">Bu belge Asil Emlak Saha Otomasyonu tarafından oluşturulmuştur.</p>
        </div>
      </div>
    `;

    const ayarlar = { margin: [5, 5, 5, 5], filename: `YerGosterme_${kayit.musteri_ad_soyad.replace(/ /g, '_')}_${kayit.id}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, windowWidth: 800 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }, pagebreak: { mode: 'avoid-all' } };
    html2pdf().from(htmlIcerik).set(ayarlar).save();
  };

  return (
    <div className="container container-lg">
      <div className="page-title" style={{ marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '28px' }}>Yönetici Paneli</h2>
          <button onClick={() => navigate('/')} style={{ padding: 0, marginTop: '8px', border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', fontWeight: 600 }}>← Saha Paneline Dön</button>
        </div>
        <input type="text" placeholder="Ad veya TC ile Ara..." value={arama} onChange={(e) => setArama(e.target.value)} style={{ maxWidth: '300px', marginBottom: 0, background: 'rgba(255,255,255,0.8)' }} />
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
            {filtrelenmisKayitlar.map(kayit => {
              const d = durumRenkGetir(kayit.durum);
              return (
                <tr key={kayit.id}>
                  <td style={{ color: '#64748b', fontWeight: 600 }}>#{kayit.id}</td>
                  <td><strong>{kayit.danisman_ad}</strong></td>
                  <td>
                    {kayit.musteri_ad_soyad}<br/>
                    <span style={{ color: '#64748b', fontSize: '13px' }}>TC: {kayit.musteri_tc}</span>
                  </td>
                  <td>
                    {kayit.tasinmaz_adres}<br/>
                    <strong style={{ color: '#0f172a' }}>{kayit.tasinmaz_ada_parsel}</strong>
                  </td>
                  <td>
                    {kayit.islem_turu}<br/>
                    <strong style={{ color: '#ef4444' }}>{kayit.bedel} TL</strong>
                  </td>
                  <td><span className={d.sinif}>{d.etiket}</span></td>
                  <td style={{ color: '#64748b', fontSize: '13px' }}>
                    {kayit.onay_zamani && kayit.onay_zamani.Valid ? kayit.onay_zamani.String : '-'} <br/>
                    {kayit.musteri_ip && kayit.musteri_ip.Valid ? `IP: ${kayit.musteri_ip.String}` : ''}
                  </td>
                  <td>
                    {kayit.durum === 'onaylandi' && (
                      <button onClick={() => pdfIndir(kayit)} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', background: '#f8fafc' }}>
                        PDF İndir
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {filtrelenmisKayitlar.length === 0 && (
              <tr><td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Sistemde kayıt bulunamadı.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function App() {
  return (
    <>
      <YanMenu />
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