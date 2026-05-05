CREATE DATABASE IF NOT EXISTS asil_emlak;
USE asil_emlak;

-- Danışmanlar Tablosu (Asil Emlak Ekibi)
CREATE TABLE danismanlar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ad_soyad VARCHAR(100) NOT NULL,
    telefon VARCHAR(20) NOT NULL UNIQUE,
    aktif_mi BOOLEAN DEFAULT TRUE,
    olusturulma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Portföyler Tablosu (Gösterilecek İlanlar)
CREATE TABLE portfoyler (
    id INT AUTO_INCREMENT PRIMARY KEY,
    baslik VARCHAR(255) NOT NULL,
    il_ilce_mah VARCHAR(255) NOT NULL,
    adres_detay TEXT,
    olusturulma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ana Tablo: Yer Gösterme Kayıtları
CREATE TABLE yer_gosterme_kayitlari (
    id INT AUTO_INCREMENT PRIMARY KEY,
    danisman_id INT NOT NULL,
    musteri_ad_soyad VARCHAR(100) NOT NULL,
    musteri_telefon VARCHAR(20) NOT NULL,
    portfoy_id INT NOT NULL,
    onay_kodu VARCHAR(6) NOT NULL,
    durum ENUM('bekliyor', 'onaylandi', 'iptal', 'suresi_doldu') DEFAULT 'bekliyor',
    ip_adresi VARCHAR(45),
    olusturulma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    son_gecerlilik_tarihi TIMESTAMP NOT NULL,
    onaylanma_tarihi TIMESTAMP NULL DEFAULT NULL,
    
    -- Yabancı Anahtarlar (İlişkiler)
    FOREIGN KEY (danisman_id) REFERENCES danismanlar(id),
    FOREIGN KEY (portfoy_id) REFERENCES portfoyler(id),
    
    -- Hızlı sorgulama için indeksler
    INDEX idx_onay_kodu (onay_kodu),
    INDEX idx_musteri_telefon (musteri_telefon)
);