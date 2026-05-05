package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"net/url" // YENİ EKLENDİ
	"os"
	"strings" // YENİ EKLENDİ
	"time"

	"github.com/joho/godotenv"

	_ "github.com/go-sql-driver/mysql"
)

// Global veritabanı değişkenimiz
var db *sql.DB

func initDB() {
	dsn := os.Getenv("DB_DSN")
	var err error
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("Veritabanı başlatılamadı:", err)
	}
	if err := db.Ping(); err != nil {
		log.Fatal("Veritabanına bağlanılamadı:", err)
	}
	fmt.Println("Veritabanı bağlantısı başarılı!")
}

// Arka plan temizlik motoru: Süresi dolan kayıtları otomatik iptal eder
func baslatTemizlikMotoru() {
	// Her 1 dakikada bir çalışacak bir saat (ticker) kuruyoruz
	ticker := time.NewTicker(1 * time.Minute)

	// go func() diyerek bu işlemi ana sunucuyu durdurmaması için arka plana atıyoruz
	go func() {
		for {
			<-ticker.C // Her dakika başı burası tetiklenir

			// Zamanı geçen ve hala 'bekliyor' olanları 'suresi_doldu' statüsüne çek
			query := `UPDATE yer_gosterme_kayitlari 
					  SET durum = 'suresi_doldu' 
					  WHERE durum = 'bekliyor' AND son_gecerlilik_tarihi < ?`

			suAn := time.Now()
			sonuc, err := db.Exec(query, suAn)

			if err != nil {
				log.Printf("Temizlik motoru hatası: %v", err)
				continue
			}

			// Kaç kaydın süresinin dolduğunu kontrol et
			etkilenenKayit, _ := sonuc.RowsAffected()
			if etkilenenKayit > 0 {
				fmt.Printf("🧹 Temizlik Motoru: %d adet süresi dolan işlemin statüsü 'suresi_doldu' olarak güncellendi.\n", etkilenenKayit)
			}
		}
	}()
}

func generateOTP() string {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	otp := r.Intn(900000) + 100000
	return fmt.Sprintf("%d", otp)
}

// Twilio üzerinden SMS gönderme fonksiyonu
func smsGonder(telefon string, mesaj string) { // PARAMETRE DEĞİŞTİ
	// Kendi Twilio bilgilerini bozmadan buraya aynı şekilde yaz
	accountSid := os.Getenv("TWILIO_SID")
	authToken := os.Getenv("TWILIO_TOKEN")
	twilioNumarasi := os.Getenv("TWILIO_NUM")

	urlStr := fmt.Sprintf("https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json", accountSid)

	msgData := url.Values{}
	msgData.Set("To", telefon)
	msgData.Set("From", twilioNumarasi)
	msgData.Set("Body", mesaj) // ARTIK DIŞARIDAN GELEN TAM MESAJI ALIYOR
	msgDataReader := *strings.NewReader(msgData.Encode())

	req, _ := http.NewRequest("POST", urlStr, &msgDataReader)
	req.SetBasicAuth(accountSid, authToken)
	req.Header.Add("Accept", "application/json")
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)

	if err != nil {
		fmt.Printf("SMS Gönderim Hatası: %v\n", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		fmt.Println("✅ SMS Twilio üzerinden başarıyla gönderildi!")
	} else {
		fmt.Printf("❌ SMS Gönderilemedi! HTTP Kodu: %d\n", resp.StatusCode)
	}
}

// Danışman panelinden gelecek verinin (Request) yapısı
// İstek yapısı (Struct) güncellendi
type BaslatRequest struct {
	DanismanID        int     `json:"danisman_id"`
	MusteriAdSoyad    string  `json:"musteri_ad_soyad"`
	MusteriTelefon    string  `json:"musteri_telefon"`
	MusteriTC         string  `json:"musteri_tc"`          // YENİ
	TasinmazAdres     string  `json:"tasinmaz_adres"`      // YENİ (Elle girilecek)
	TasinmazAdaParsel string  `json:"tasinmaz_ada_parsel"` // YENİ
	IslemTuru         string  `json:"islem_turu"`          // YENİ (Kiralama veya Satış)
	Bedel             float64 `json:"bedel"`               // YENİ (Kira veya Satış bedeli)
}

// Panele döneceğimiz verinin (Response) yapısı
type BaslatResponse struct {
	Basarili    bool   `json:"basarili"`
	Mesaj       string `json:"mesaj"`
	KayitID     int64  `json:"kayit_id,omitempty"`
	KalanDakika int    `json:"kalan_dakika,omitempty"`
}

// 1. Doğrulama Request Yapısını Güncelle
type DogrulaRequest struct {
	KayitID  int    `json:"kayit_id"`
	OnayKodu string `json:"onay_kodu"`
	Konum    string `json:"konum"` // YENİ: Telefondan gelecek GPS verisi
}

// Panele döneceğimiz doğrulama sonucu
type DogrulaResponse struct {
	Basarili   bool   `json:"basarili"`
	Mesaj      string `json:"mesaj"`
	OnayZamani string `json:"onay_zamani,omitempty"`
	MusteriIP  string `json:"musteri_ip,omitempty"` // Hukuki log için ekledik
}

// API Endpoint: /api/baslat
func yerGostermeBaslatHandler(w http.ResponseWriter, r *http.Request) {
	// Ön kontrol (Preflight) isteğine yanıt ver
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var req BaslatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		json.NewEncoder(w).Encode(BaslatResponse{Basarili: false, Mesaj: "Hatalı veri formatı"})
		return
	}

	// 1. Danışman Adını Veritabanından Çek
	var danismanAd string
	err := db.QueryRow("SELECT ad_soyad FROM danismanlar WHERE id = ?", req.DanismanID).Scan(&danismanAd)
	if err != nil {
		danismanAd = "Asil Emlak Danismani"
	}

	// 2. İşlem: Rastgele 6 haneli kod üret
	onayKodu := generateOTP()

	// 3. İşlem: Şu anki zamana 15 dakika ekle
	suAn := time.Now()
	sonGecerlilik := suAn.Add(15 * time.Minute)

	// 4. İşlem: Veritabanına YENİ ALANLARLA kaydet
	query := `INSERT INTO yer_gosterme_kayitlari 
		(danisman_id, musteri_ad_soyad, musteri_telefon, musteri_tc, tasinmaz_adres, tasinmaz_ada_parsel, islem_turu, bedel, onay_kodu, durum, olusturulma_tarihi, son_gecerlilik_tarihi) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'bekliyor', ?, ?)`

	sonuc, err := db.Exec(query, req.DanismanID, req.MusteriAdSoyad, req.MusteriTelefon, req.MusteriTC, req.TasinmazAdres, req.TasinmazAdaParsel, req.IslemTuru, req.Bedel, onayKodu, suAn, sonGecerlilik)

	if err != nil {
		log.Printf("Kayıt hatası: %v", err)
		json.NewEncoder(w).Encode(BaslatResponse{Basarili: false, Mesaj: "Veritabanı kayıt hatası: " + err.Error()})
		return
	}

	yeniID, _ := sonuc.LastInsertId()

	// 5. Zengin SMS Metnini Oluştur
	tamMesaj := fmt.Sprintf("ASIL EMLAK: %s Yetki No: 8100235-001. %s adresindeki (%s) tasinmazin yer gosterimi %s icin yapilmistir. Sozlesme: https://asil-emlak-backend.vercel.app/belge Onay Kodu: %s",
		danismanAd, req.TasinmazAdres, req.IslemTuru, req.MusteriAdSoyad, onayKodu)

	// SMS'i Gönder
	formatliTelefon := "+90" + req.MusteriTelefon
	go smsGonder(formatliTelefon, tamMesaj)

	fmt.Printf("Yeni Kayıt ID: %d - Kod: %s\n", yeniID, onayKodu)

	// 6. EKSİK OLAN KISIM: React'e Başarılı Yanıtını Döndür
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(BaslatResponse{
		Basarili: true,
		Mesaj:    "Sözleşme başlatıldı ve SMS gönderildi.",
		KayitID:  yeniID,
	})
}

// API Endpoint: /api/dogrula
func yerGostermeDogrulaHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Sadece POST metodu geçerlidir", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	var req DogrulaRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		json.NewEncoder(w).Encode(DogrulaResponse{Basarili: false, Mesaj: "Hatalı veri formatı"})
		return
	}

	// 1. Veritabanından bu kaydı bul ve mevcut durumunu kontrol et
	var dbOnayKodu string
	var dbDurum string
	var dbSonGecerlilik time.Time

	// Sadece bekleyen işlemleri sorguluyoruz
	query := `SELECT onay_kodu, durum, son_gecerlilik_tarihi FROM yer_gosterme_kayitlari WHERE id = ? AND durum = 'bekliyor'`
	err := db.QueryRow(query, req.KayitID).Scan(&dbOnayKodu, &dbDurum, &dbSonGecerlilik)

	if err == sql.ErrNoRows {
		json.NewEncoder(w).Encode(DogrulaResponse{Basarili: false, Mesaj: "Aktif bir onay kaydı bulunamadı veya işlem zaten sonlandırılmış."})
		return
	} else if err != nil {
		log.Printf("Sorgu hatası: %v", err)
		json.NewEncoder(w).Encode(DogrulaResponse{Basarili: false, Mesaj: "Veritabanı hatası"})
		return
	}

	// 2. Süre Kontrolü: 15 dakika dolmuş mu?
	if time.Now().After(dbSonGecerlilik) {
		// Süre dolduysa veritabanındaki durumu güncelle
		db.Exec("UPDATE yer_gosterme_kayitlari SET durum = 'suresi_doldu' WHERE id = ?", req.KayitID)
		json.NewEncoder(w).Encode(DogrulaResponse{Basarili: false, Mesaj: "Bu kodun süresi dolmuş. Lütfen yeni bir kod isteyiniz."})
		return
	}

	// 3. Kod Kontrolü: Müşterinin söylediği kod doğru mu?
	if req.OnayKodu != dbOnayKodu {
		json.NewEncoder(w).Encode(DogrulaResponse{Basarili: false, Mesaj: "Girdiğiniz onay kodu hatalı."})
		return
	}

	// 4. Her Şey Doğruysa: İşlemi Mühürle!
	suAn := time.Now()
	danismanIP := r.RemoteAddr // İsteği yapan cihazın IP adresi ve Port numarası

	// YENİ: Konum verisini de kaydediyoruz
	updateQuery := `UPDATE yer_gosterme_kayitlari 
		SET durum = 'onaylandi', onaylanma_tarihi = ?, ip_adresi = ?, konum = ? 
		WHERE id = ?`

	_, err = db.Exec(updateQuery, suAn, danismanIP, req.Konum, req.KayitID)
	if err != nil {
		log.Printf("Güncelleme hatası: %v", err)
		json.NewEncoder(w).Encode(DogrulaResponse{Basarili: false, Mesaj: "Onay işlemi sırasında veritabanı hatası oluştu."})
		return
	}

	fmt.Printf("Onay Başarılı! Kayıt ID: %d - IP: %s\n", req.KayitID, danismanIP)

	// Başarılı yanıt dön
	json.NewEncoder(w).Encode(DogrulaResponse{
		Basarili:   true,
		Mesaj:      "Yer gösterme belgesi yasal olarak onaylandı.",
		OnayZamani: suAn.Format("2006-01-02 15:04:05"), // Tarihi okunaklı formata çeviriyoruz
		MusteriIP:  danismanIP,
	})
}

// Veri yapıları (Structs)
type Danisman struct {
	ID      int    `json:"id"`
	AdSoyad string `json:"ad_soyad"`
}

type Portfoy struct {
	ID        int    `json:"id"`
	Baslik    string `json:"baslik"`
	IlIlceMah string `json:"il_ilce_mah"`
}

// API Endpoint: /api/danismanlar
func getDanismanlarHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	rows, err := db.Query("SELECT id, ad_soyad FROM danismanlar WHERE aktif_mi = TRUE")
	if err != nil {
		http.Error(w, "Veritabanı hatası", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var danismanlar []Danisman
	for rows.Next() {
		var d Danisman
		rows.Scan(&d.ID, &d.AdSoyad)
		danismanlar = append(danismanlar, d)
	}

	json.NewEncoder(w).Encode(danismanlar)
}

// API Endpoint: /api/portfoyler
func getPortfoylerHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	rows, err := db.Query("SELECT id, baslik, il_ilce_mah FROM portfoyler")
	if err != nil {
		http.Error(w, "Veritabanı hatası", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var portfoyler []Portfoy
	for rows.Next() {
		var p Portfoy
		rows.Scan(&p.ID, &p.Baslik, &p.IlIlceMah)
		portfoyler = append(portfoyler, p)
	}

	json.NewEncoder(w).Encode(portfoyler)
}

// ... main.go içindeki main() fonksiyonunun ilgili kısmı ...

// Basit bir CORS middleware (Ara katman)
func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		// Tarayıcının ön kontrol (preflight) isteğine yanıt ver
		if r.Method == "OPTIONS" {
			return
		}
		next(w, r)
	}
}

// Yönetici paneli için kayıt listesi yapısı
type Kayit struct {
	ID                int            `json:"id"`
	DanismanAd        string         `json:"danisman_ad"`
	MusteriAdSoyad    string         `json:"musteri_ad_soyad"`
	MusteriTC         string         `json:"musteri_tc"`
	MusteriTelefon    string         `json:"musteri_telefon"`
	TasinmazAdres     string         `json:"tasinmaz_adres"`
	TasinmazAdaParsel string         `json:"tasinmaz_ada_parsel"` // YENİ EKLENDİ
	IslemTuru         string         `json:"islem_turu"`
	Bedel             float64        `json:"bedel"`
	Durum             string         `json:"durum"`
	OlusturulmaTarihi string         `json:"olusturulma_tarihi"`
	OnayZamani        sql.NullString `json:"onay_zamani"`
	MusteriIP         sql.NullString `json:"musteri_ip"`
	Konum             sql.NullString `json:"konum"` // YENİ EKLENDİ
}

// API Endpoint: /api/kayitlar (Tüm sözleşmeleri getirir)
func getKayitlarHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Sorguya y.tasinmaz_ada_parsel eklendi
	query := `
		SELECT y.id, d.ad_soyad, y.musteri_ad_soyad, y.musteri_tc, y.musteri_telefon, 
		       y.tasinmaz_adres, y.tasinmaz_ada_parsel, y.islem_turu, y.bedel, y.durum, 
		       CAST(y.olusturulma_tarihi AS CHAR), 
		       CAST(y.onaylanma_tarihi AS CHAR), 
		       y.ip_adresi, y.konum 
		FROM yer_gosterme_kayitlari y 
		JOIN danismanlar d ON y.danisman_id = d.id 
		ORDER BY y.olusturulma_tarihi DESC`

	rows, err := db.Query(query)
	if err != nil {
		http.Error(w, "Veritabanı hatası: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var kayitlar []Kayit
	for rows.Next() {
		var k Kayit
		// rows.Scan içine &k.TasinmazAdaParsel eklendi
		err := rows.Scan(&k.ID, &k.DanismanAd, &k.MusteriAdSoyad, &k.MusteriTC, &k.MusteriTelefon,
			&k.TasinmazAdres, &k.TasinmazAdaParsel, &k.IslemTuru, &k.Bedel, &k.Durum,
			&k.OlusturulmaTarihi, &k.OnayZamani, &k.MusteriIP, &k.Konum)

		if err != nil {
			log.Println("Kayıt okuma hatası:", err)
			continue
		}
		kayitlar = append(kayitlar, k)
	}

	json.NewEncoder(w).Encode(kayitlar)
}

func main() {
	godotenv.Load() // .env dosyasını yükler
	initDB()
	defer db.Close()

	baslatTemizlikMotoru()

	// Rotaları CORS fonksiyonu ile sarmalıyoruz
	http.HandleFunc("/api/baslat", corsMiddleware(yerGostermeBaslatHandler))
	http.HandleFunc("/api/dogrula", corsMiddleware(yerGostermeDogrulaHandler))
	http.HandleFunc("/api/danismanlar", corsMiddleware(getDanismanlarHandler)) // YENİ
	http.HandleFunc("/api/portfoyler", corsMiddleware(getPortfoylerHandler))   // YENİ
	http.HandleFunc("/api/kayitlar", corsMiddleware(getKayitlarHandler))       // YENİ: Admin Paneli İçin
	http.HandleFunc("/api/danisman/ekle", danismanEkle)
	http.HandleFunc("/api/danisman/guncelle", danismanGuncelle)
	http.HandleFunc("/api/danisman/sil", danismanSil)

	// Bulut sistemleri (Koyeb/Render) portu kendisi atar, onu yakalıyoruz
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Eğer localhost'ta çalışıyorsak 8080'den devam et
	}

	fmt.Printf("Asil Emlak API sunucusu %s portunda çalışıyor...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
