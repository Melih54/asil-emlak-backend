import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom' // YENİ: Yönlendirme için useNavigate eklendi
import Swal from 'sweetalert2'
import './App.css'
import html2pdf from 'html2pdf.js'; //[cite: 3]

// --------------------------------------------------------
// 1. SAYFA: SÖZLEŞME VE KVKK BELGESİ
// --------------------------------------------------------
function BelgeSayfasi() {
  const yetkiNo = "8100235-001"; //[cite: 3]

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '20px auto', fontFamily: 'serif', lineHeight: '1.6', color: '#333', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <div style={{ borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px', textAlign: 'center' }}>
        <img src="/logo.png" alt="Asil Emlak Logo" style={{ height: '70px', objectFit: 'contain', marginBottom: '10px' }} onError={(e) => e.target.style.display = 'none'} />
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>TAŞINMAZ YER GÖSTERME SÖZLEŞMESİ</h2>
      </div>

      <h3 style={{ fontSize: '18px', borderBottom: '1px solid #ccc' }}>MADDE 1 - TARAFLAR</h3>
      <p><strong>1.1. Sorumlu Emlak İşletmesi</strong></p>
      <ul style={{ listStyleType: 'none', paddingLeft: '15px' }}>
        <li><strong>İşletme Adresi:</strong> [AZMİMİLLİ MAHALLESİ AYDINPINAR CADDESİ NO:19/A MERKEZ DÜZCE]</li>
        <li><strong>İşletme Yetki Belgesi Numarası:</strong> {yetkiNo}</li>
      </ul>

      <p><strong>1.2. Kiracı Adayı/Alıcı Adayı</strong></p>
      <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>(Sisteme girilen Ad Soyad, TC ve İletişim bilgileri esas alınır.)</p>

      <h3 style={{ fontSize: '18px', borderBottom: '1px solid #ccc', marginTop: '20px' }}>MADDE 2 - SÖZLEŞMENİN KONUSU</h3>
      <p style={{ textAlign: 'justify' }}>
        <strong>2.1.</strong> SORUMLU EMLAK DANIŞMANI, üstlendiği taşınmazın kiralanması/satılması sözleşmesinin yapılması imkanını hazırlama görevi çerçevesinde; taşınmazı kiralama/satın alma amacıyla KİRACI ADAYI/ALICI ADAYI’na gösterdiğini, gerekli tanıtımı yaptığını ve bu şekilde edinimi yerine getirdiğini kabul ve taahhüt eder.
      </p>
      <p style={{ textAlign: 'justify' }}>
        <strong>2.2.</strong> KİRACI ADAYI/ALICI ADAYI; her ne suretle olursa olsun taşınmazın; bizzat kendisi adına, eşi, çocukları, kardeşleri, anne-babası, 3. derece dahil kan ve sıhri hısımlarının adına veya ortağı, paydaşı, temsilcisi, çalışanı olduğu şirket adına kiralandığı/satıldığı taktirde; <strong>satışta satış bedeli üzerinden %2 +KDV, kiralamada 1 (bir) aylık kira bedeli +KDV’sini komisyon olarak</strong> sorumlu emlak danışmanına ödeyeceğini kabul ve taahhüt eder.
      </p>

      <h3 style={{ fontSize: '18px', borderBottom: '1px solid #ccc', marginTop: '20px' }}>MADDE 3 – TARAFLARIN HAK VE YÜKÜMLÜLÜKLERİ</h3>
      <p style={{ textAlign: 'justify' }}>
        <strong>3.1.</strong> KİRACI ADAYI veya ALICI ADAYI; SORUMLU EMLAK DANIŞMANI’nı devre dışı bırakılarak işlem gerçekleştirdiği takdirde hem ödemek zorunda olduğu komisyon bedelini ve ayrıca komisyon bedeli kadar ceza-i şart ödemek zorunda olduğunu kabul ve taahhüt eder.
      </p>

      <h3 style={{ fontSize: '18px', borderBottom: '1px solid #ccc', marginTop: '20px' }}>MADDE 4 - GİZLİLİK ve KİŞİSEL VERİLERİN KORUNMASI</h3>
      <p style={{ textAlign: 'justify' }}>
        SORUMLU EMLAK DANIŞMAN’ı ile paylaşılan kişisel veriler, 6698 Sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında işlenmektedir. Kiracı Adayı/Mal Sahibi Adayı kanunda öngörülen tedbirler kapsamında kişisel verilenin işlenmesine açık rızasının bulunduğunu kabul ve beyan eder.
      </p>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '5px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: '#d9534f' }}>
          Tarafıma SMS ile iletilen onay kodunu ilgili danışmana ileterek bu belgeyi dijital olarak imzaladığımı kabul ederim.
        </p>
      </div>
    </div>
  )
} //[cite: 3]

// --------------------------------------------------------
// 2. SAYFA: DANIŞMAN SAHA PANELİ
// --------------------------------------------------------
function SahaPaneli() {
  const [adim, setAdim] = useState(1);
  const [kayitId, setKayitId] = useState(null);
  const [danismanlar, setDanismanlar] = useState([]);
  const [onayliSozlesmeler, setOnayliSozlesmeler] = useState([]); // YENİ: Anasayfa listesi için state
  
  const navigate = useNavigate(); // YENİ: Yönlendirme motoru

  const [form, setForm] = useState({ 
    danisman_id: '', 
    musteri_ad_soyad: '', 
    musteri_telefon: '',
    musteri_tc: '',
    tasinmaz_adres: '',
    tasinmaz_ada_parsel: '',
    islem_turu: 'Satış',
    bedel: ''
  });
  
  const [onayKodu, setOnayKodu] = useState('');

  useEffect(() => {
    // Danışmanları çek
    fetch('https://asil-emlak-api.onrender.com/api/danismanlar')
      .then(res => res.json())
      .then(data => { setDanismanlar(data || []); if(data?.length > 0) setForm(p => ({...p, danisman_id: data[0].id})); })
      .catch(err => console.error(err));

    // YENİ: Anasayfadaki vitrin için sadece onaylanan kayıtları çek
    fetch('https://asil-emlak-api.onrender.com/api/kayitlar')
      .then(res => res.json())
      .then(data => { 
        if(data) {
          const onaylilar = data.filter(k => k.durum === 'onaylandi');
          setOnayliSozlesmeler(onaylilar);
        }
      })
      .catch(err => console.error(err));
  }, []); //[cite: 3]

  const inputStyle = { width: '100%', padding: '12px', marginTop: '5px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '8px', boxSizing: 'border-box', fontSize: '15px' };
  const labelStyle = { fontWeight: '600', color: '#444', fontSize: '14px' };

  const islemBaslat = async (e) => {
    e.preventDefault();
    Swal.fire({ title: 'SMS Gönderiliyor...', allowOutsideClick: false, didOpen: () => { Swal.showLoading() } });

    try {
      const payload = { 
        ...form, 
        danisman_id: parseInt(form.danisman_id),
        bedel: parseFloat(form.bedel) || 0 
      };
      
      const response = await fetch('https://asil-emlak-api.onrender.com/api/baslat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (data.basarili) { 
        setKayitId(data.kayit_id); 
        setAdim(2); 
        Swal.fire({ icon: 'success', title: 'Başarılı!', text: data.mesaj, timer: 2000, showConfirmButton: false });
      } else { 
        Swal.fire({ icon: 'error', title: 'Hata', text: data.mesaj });
      }
    } catch { 
      Swal.fire({ icon: 'error', title: 'Bağlantı Hatası', text: 'Sunucuya bağlanılamadı.' });
    }
  }; //[cite: 3]

  const koduDogrula = async (e) => {
    e.preventDefault();
    Swal.fire({ title: 'Konum ve Onay Alınıyor...', allowOutsideClick: false, didOpen: () => { Swal.showLoading() } });

    const konumAl = () => {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          resolve("Tarayıcı GPS desteklemiyor");
        } else {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve(`${position.coords.latitude}, ${position.coords.longitude}`),
            () => resolve("Konum İzni Verilmedi")
          );
        }
      });
    };

    try {
      const gpsKonum = await konumAl();

      const response = await fetch('https://asil-emlak-api.onrender.com/api/dogrula', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          kayit_id: kayitId, 
          onay_kodu: onayKodu,
          konum: gpsKonum 
        })
      });
      const data = await response.json();
      
      if (data.basarili) {
        Swal.fire({
          icon: 'success',
          title: '🎉 MÜHÜRLENDİ!',
          html: `<b>Sözleşme yasal olarak onaylandı.</b><br/><br/><b>Konum:</b> ${gpsKonum}`,
          confirmButtonText: 'Yeni İşlem Başlat'
        }).then(() => {
          setAdim(1); 
          setForm(prev => ({...prev, musteri_ad_soyad: '', musteri_telefon: '', musteri_tc: '', tasinmaz_adres: '', tasinmaz_ada_parsel: '', bedel: ''})); 
          setOnayKodu('');
          // Mühürlemeden sonra anasayfadaki listeyi yenile
          window.location.reload(); 
        });
      } else { 
        Swal.fire({ icon: 'error', title: 'Hata', text: data.mesaj });
      }
    } catch { 
      Swal.fire({ icon: 'error', title: 'Bağlantı Hatası', text: 'Sunucuya bağlanılamadı.' });
    }
  }; //[cite: 3]

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img src="/logo.png" alt="Asil Emlak Logo" style={{ height: '80px', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
        <h2 style={{ color: '#d9534f', margin: '10px 0 0 0', fontSize: '28px', fontWeight: '800' }}>Asil Emlak Saha</h2>
      </div>
      
      {adim === 1 && (
        <>
          <form onSubmit={islemBaslat} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' }}>
              <h3 style={{ marginTop: 0, color: '#333', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px', marginBottom: '20px' }}>Yeni Sözleşme Oluştur</h3>
              
              <label style={labelStyle}>Danışman:</label>
              <select value={form.danisman_id} onChange={(e) => setForm({...form, danisman_id: e.target.value})} style={inputStyle}>
                {danismanlar.map(d => <option key={d.id} value={d.id}>{d.ad_soyad}</option>)}
              </select>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Müşteri Ad Soyad:</label>
                  <input type="text" required value={form.musteri_ad_soyad} onChange={(e) => setForm({...form, musteri_ad_soyad: e.target.value})} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Müşteri TC/Yabancı No:</label>
                  <input type="text" maxLength="11" required value={form.musteri_tc} onChange={(e) => setForm({...form, musteri_tc: e.target.value})} style={inputStyle} />
                </div>
              </div>

              <label style={labelStyle}>Müşteri Telefon:</label>
              <input type="tel" required placeholder="5xxxxxxxxx" value={form.musteri_telefon} onChange={(e) => setForm({...form, musteri_telefon: e.target.value})} style={inputStyle} />
              
              <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '20px 0' }} />

              <label style={labelStyle}>Taşınmaz Açık Adresi:</label>
              <textarea required rows="2" value={form.tasinmaz_adres} onChange={(e) => setForm({...form, tasinmaz_adres: e.target.value})} style={{...inputStyle, resize: 'vertical'}} placeholder="İl, İlçe, Mahalle, Sokak..." />

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Ada/Parsel:</label>
                  <input type="text" value={form.tasinmaz_ada_parsel} onChange={(e) => setForm({...form, tasinmaz_ada_parsel: e.target.value})} style={inputStyle} placeholder="Örn: 102/4" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>İşlem Türü:</label>
                  <select value={form.islem_turu} onChange={(e) => setForm({...form, islem_turu: e.target.value})} style={inputStyle}>
                    <option value="Satış">Satış</option>
                    <option value="Kiralama">Kiralama</option>
                  </select>
                </div>
              </div>

              <label style={labelStyle}>Bedel ({form.islem_turu === 'Satış' ? 'Satış Bedeli' : 'Aylık Kira'} - TL):</label>
              <input type="number" required value={form.bedel} onChange={(e) => setForm({...form, bedel: e.target.value})} style={inputStyle} />
              
              <button type="submit" style={{ width: '100%', padding: '16px', marginTop: '10px', backgroundColor: '#d9534f', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}>
                Sözleşmeyi Başlat & SMS Gönder
              </button>
            </div>
          </form>

          {/* YENİ: ANA SAYFADAKİ ONAYLANAN SÖZLEŞMELER BÖLÜMÜ */}
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0', marginTop: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#333', fontSize: '16px' }}>Son Onaylananlar</h3>
              <button onClick={() => navigate('/admin')} style={{ backgroundColor: '#333', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Tümünü Gör (Admin)</button>
            </div>
            
            {onayliSozlesmeler.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {onayliSozlesmeler.slice(0, 3).map(k => ( // Sadece son 3 işlemi gösterir
                  <li key={k.id} style={{ padding: '10px 0', borderBottom: '1px solid #eee', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#007bff' }}>{k.musteri_ad_soyad}</strong><br/>
                      <small style={{ color: '#666' }}>{k.tasinmaz_adres}</small>
                    </div>
                    <span style={{ color: '#28a745', fontWeight: 'bold', fontSize: '16px' }}>✓ Mühürlü</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: '13px', color: '#999', textAlign: 'center', margin: '15px 0' }}>Henüz onaylanmış sözleşme bulunmuyor.</p>
            )}
          </div>
        </>
      )}

      {adim === 2 && (
        <form onSubmit={koduDogrula} style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0', textAlign: 'center' }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>Müşteri Onayı Bekleniyor</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Müşteriye yasal bilgilendirme ve 6 haneli onay kodu gönderildi.</p>
            
            <input type="text" maxLength="6" required placeholder="000000" value={onayKodu} onChange={(e) => setOnayKodu(e.target.value)} style={{ width: '180px', padding: '15px', fontSize: '28px', textAlign: 'center', letterSpacing: '8px', marginTop: '10px', borderRadius: '8px', border: '2px solid #007bff', outline: 'none' }} />
            
            <button type="submit" style={{ width: '100%', padding: '16px', marginTop: '25px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>Doğrula ve Mühürle</button>
            <button type="button" onClick={() => setAdim(1)} style={{ width: '100%', padding: '10px', marginTop: '15px', backgroundColor: 'transparent', color: '#999', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>İptal Et</button>
          </div>
        </form>
      )}
    </div>
  )
}

// --------------------------------------------------------
// YENİ: YÖNETİCİ (ADMIN) PANELİ
// --------------------------------------------------------
function AdminPaneli() {
  const [kayitlar, setKayitlar] = useState([]);
  const [arama, setArama] = useState('');
  const navigate = useNavigate(); // YENİ: Yönlendirme motoru

  useEffect(() => {
    fetch('https://asil-emlak-api.onrender.com/api/kayitlar')
      .then(res => res.json())
      .then(data => setKayitlar(data || []))
      .catch(err => console.error("Kayıtlar çekilemedi", err));
  }, []); //[cite: 3]

  const filtrelenmisKayitlar = kayitlar.filter(k => {
    const adSoyad = k.musteri_ad_soyad || '';
    const tcNo = k.musteri_tc || '';
    
    return adSoyad.toLowerCase().includes(arama.toLowerCase()) || tcNo.includes(arama);
  }); //[cite: 3]

  const durumRenkGetir = (durum) => {
    switch(durum) {
      case 'onaylandi': return { bg: '#d4edda', text: '#155724', etiket: 'Onaylandı' };
      case 'bekliyor': return { bg: '#fff3cd', text: '#856404', etiket: 'Bekliyor' };
      case 'suresi_doldu': return { bg: '#f8d7da', text: '#721c24', etiket: 'Süresi Doldu' };
      default: return { bg: '#e2e3e5', text: '#383d41', etiket: durum };
    }
  }; //[cite: 3]

  const pdfIndir = (kayit) => {
    const islemMetni = kayit.islem_turu === 'Satış'
      ? `satış bedeli üzerinden %2 +KDV'sini`
      : `1 (bir) aylık kira bedeli +KDV'sini`;

    const htmlIcerik = `
      <div style="padding: 40px; font-family: 'Times New Roman', serif; font-size: 14px; line-height: 1.6; color: #000;">
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 22px;">TAŞINMAZ YER GÖSTERME SÖZLEŞMESİ</h2>
        </div>

        <h3 style="font-size: 16px; text-decoration: underline;">MADDE 1 - TARAFLAR</h3>
        <p><strong>1.1. Sorumlu Emlak İşletmesi</strong><br/>
        İşletme Adı: Asil Emlak Düzce<br/>
        İşletme Adresi: [AZMİMİLLİ MAHALLESİ AYDINPINAR CADDESİ NO:19/A MERKEZ DÜZCE]<br/>
        İşletme Yetki Belgesi Numarası: 8100235-001</p>
        <p><strong>1.2. Sorumlu Emlak Danışmanı</strong><br/>
        Adı Soyadı: ${kayit.danisman_ad}<br/>

        <p><strong>1.2. Kiracı/Alıcı Adayı</strong><br/>
        Adı Soyadı: ${kayit.musteri_ad_soyad}<br/>
        TC Kimlik No: ${kayit.musteri_tc}<br/>
        İletişim Bilgisi: ${kayit.musteri_telefon}</p>

        <h3 style="font-size: 16px; text-decoration: underline; margin-top: 20px;">MADDE 2 - SÖZLEŞMENİN KONUSU</h3>
        <p style="text-align: justify;"><strong>2.1.</strong> SORUMLU EMLAK DANIŞMANI, üstlendiği taşınmazın kiralanması/satılması sözleşmesinin yapılması imkanını hazırlama görevi çerçevesinde; taşınmazı kiralama/satın alma amacıyla KİRACI ADAYI/ALICI ADAYI'na gösterdiğini kabul ve taahhüt eder.</p>
        
        <p style="text-align: justify;"><strong>2.2.</strong> KİRACI ADAYI/ALICI ADAYI; her ne suretle olursa olsun taşınmazın bizatihi kendisi adına, eşi, çocukları, 3. derece dahil kan ve sıhri hısımlarının adına veya ortağı olduğu şirket adına kiralandığı/satıldığı taktirde; <strong>${islemMetni}</strong> komisyon olarak Sorumlu Emlak Danışmanı'na ödeyeceğini kabul ve taahhüt eder.</p>

        <p><strong>2.3. Taşınmaz Bilgileri</strong><br/>
        Adresi: ${kayit.tasinmaz_adres}<br/>
        Ada/Parsel: ${kayit.tasinmaz_ada_parsel}<br/>
        İşlem Türü ve Bedeli: ${kayit.islem_turu} - ${kayit.bedel} TL</p>

        <h3 style="font-size: 16px; text-decoration: underline; margin-top: 20px;">MADDE 3 - DİJİTAL ONAY VE KVKK</h3>
        <p style="text-align: justify;">Bu sözleşme, müşteri tarafından SMS ile iletilen onay kodunun sisteme girilmesiyle yasal olarak mühürlenmiştir. 6698 Sayılı KVKK kapsamında verilerin işlenmesine açık rıza gösterilmiştir. Hizmet sağlayıcı/şirket, işbu sözleşme kapsamında elde edilen kişisel verileri mevduata uygun olarak muhafaza etmekle; verilerin yetkisiz kişilerin eline geçnmesini, hukuka aykırı olarak işlenmesini ve ifşa edilmesini önlemek amacıyla gerekli tüm teknik ve idari tedbirleri almakla hükümlüdür.</p>
        
        <div style="margin-top: 40px; padding: 15px; border: 2px solid #28a745; border-radius: 10px; text-align: center; background-color: #f8fff9;">
          <h4 style="margin: 0 0 10px 0; color: #28a745;">✓ DİJİTAL İMZA MÜHRÜ</h4>
          <p style="margin: 5px 0;"><strong>Onay Zamanı:</strong> ${kayit.onay_zamani && kayit.onay_zamani.Valid ? kayit.onay_zamani.String : '-'}</p>
          <p style="margin: 5px 0;"><strong>Cihaz GPS Koordinatı:</strong> ${kayit.konum && kayit.konum.Valid ? kayit.konum.String : 'Alınamadı'}</p>
          <p style="margin: 5px 0;"><strong>GSM OTP Doğrulaması:</strong> ${kayit.musteri_telefon} numaralı telefona iletilen eşsiz şifre sisteme girilerek kimlik teyidi sağlanmıştır.</p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #555;">Bu belge Asil Emlak Saha Otomasyonu tarafından oluşturulmuştur.</p>
        </div>
      </div>
    `;

    html2pdf().from(htmlIcerik).set({
      margin: 10,
      filename: `YerGosterme_${kayit.musteri_ad_soyad.replace(/ /g, '_')}_${kayit.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).save();
  }; //[cite: 3]

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #d9534f', paddingBottom: '10px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: '#333', margin: 0 }}>Asil Emlak Yönetici Paneli</h2>
          {/* YENİ: ANA SAYFAYA DÖN BUTONU */}
          <button 
            onClick={() => navigate('/')} 
            style={{ marginTop: '8px', backgroundColor: 'transparent', color: '#ff0000', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline', fontSize: '14px', fontWeight: 'bold' }}>
            ← Saha Paneline (Ana Sayfa) Dön
          </button>
        </div>
        <input 
          type="text" 
          placeholder="Müşteri Adı veya TC ile Ara..." 
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          style={{ padding: '10px', width: '300px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
      </div>

      <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '15px' }}>ID</th>
              <th style={{ padding: '15px' }}>Danışman</th>
              <th style={{ padding: '15px' }}>Müşteri & TC</th>
              <th style={{ padding: '15px' }}>Taşınmaz Adresi & Ada/Parsel</th>
              <th style={{ padding: '15px' }}>İşlem & Bedel</th>
              <th style={{ padding: '15px' }}>Durum</th>
              <th style={{ padding: '15px' }}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filtrelenmisKayitlar.map(kayit => {
              const d = durumRenkGetir(kayit.durum);
              return (
                <tr key={kayit.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px' }}>#{kayit.id}</td>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>{kayit.danisman_ad}</td>
                  <td style={{ padding: '15px' }}>
                    {kayit.musteri_ad_soyad}<br/>
                    <small style={{ color: '#666' }}>TC: {kayit.musteri_tc}</small>
                  </td>
                  <td style={{ padding: '15px', maxWidth: '250px' }}>
                    {kayit.tasinmaz_adres}<br/>
                    <small style={{ color: '#007bff', fontWeight: 'bold' }}>Ada/Parsel: {kayit.tasinmaz_ada_parsel}</small>
                  </td>
                  <td style={{ padding: '15px' }}>
                    {kayit.islem_turu}<br/>
                    <strong style={{ color: '#d9534f' }}>{kayit.bedel} TL</strong>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ backgroundColor: d.bg, color: d.text, padding: '5px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                      {d.etiket}
                    </span>
                  </td>
                  <td style={{ padding: '15px', fontSize: '13px', color: '#555' }}>
                    {kayit.onay_zamani && kayit.onay_zamani.Valid ? kayit.onay_zamani.String : '-'} <br/>
                    {kayit.musteri_ip && kayit.musteri_ip.Valid ? `IP: ${kayit.musteri_ip.String}` : ''}
                  </td>
                  <td style={{ padding: '15px' }}>
                    {kayit.durum === 'onaylandi' && (
                      <button 
                        onClick={() => pdfIndir(kayit)}
                        style={{ backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                      >
                        PDF İndir
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {filtrelenmisKayitlar.length === 0 && (
              <tr>
                <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Kayıt bulunamadı.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<SahaPaneli />} />
      <Route path="/belge" element={<BelgeSayfasi />} />
      <Route path="/admin" element={<AdminPaneli />} />
    </Routes>
  )
}

export default App