# Panduan Deployment Pukis Monitoring ke Ubuntu Server

Panduan lengkap untuk deploy aplikasi Pukis Monitoring ke server Ubuntu.

## Persyaratan

- Ubuntu Server 20.04 atau lebih baru
- Minimum RAM 2GB (disarankan 4GB)
- Domain name (opsional)
- Akses SSH ke server
- PostgreSQL database (lokal atau managed seperti Neon, Supabase)

---

## Step 1: Update Sistem Ubuntu

```bash
# Login ke server via SSH
ssh username@your_server_ip

# Update system packages
sudo apt update && sudo apt upgrade -y
```

---

## Step 2: Install Node.js 20.x

```bash
# Install Node.js 20.x (diperlukan untuk Next.js 14)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verifikasi instalasi
node --version   # harus v20.x.x
npm --version
```

---

## Step 3: Install PostgreSQL (Opsional - jika database lokal)

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start dan enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Buat database dan user
sudo -u postgres psql

# Di dalam psql:
CREATE DATABASE pukis_monitoring;
CREATE USER pukis_user WITH ENCRYPTED PASSWORD 'password_anda';
GRANT ALL PRIVILEGES ON DATABASE pukis_monitoring TO pukis_user;
\q
```

**Jika menggunakan managed database (Neon, Supabase, dll):**
- Siapkan DATABASE_URL dari provider database Anda

---

## Step 4: Install PM2 (Process Manager)

```bash
# Install PM2 secara global
sudo npm install -g pm2

# Verifikasi instalasi
pm2 --version
```

---

## Step 5: Install Nginx

```bash
# Install Nginx
sudo apt install nginx -y

# Start dan enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Cek status
sudo systemctl status nginx
```

---

## Step 6: Clone Repository Aplikasi

```bash
# Install Git jika belum ada
sudo apt install git -y

# Buat direktori untuk aplikasi
sudo mkdir -p /var/www
cd /var/www

# Clone repository (ganti dengan URL repo Anda)
sudo git clone https://github.com/username/pukis-monitoring.git
cd pukis-monitoring

# Ubah ownership ke user Anda
sudo chown -R $USER:$USER /var/www/pukis-monitoring
```

---

## Step 7: Konfigurasi Environment Variables

```bash
# Buat file .env.production
nano .env.production
```

**Isi dengan konfigurasi berikut:**

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database_name

# Session Secret (generate random string)
SESSION_SECRET=your_random_secret_key_minimal_32_characters

# Optional: Object Storage (jika menggunakan)
PRIVATE_OBJECT_DIR=/bucket-id-anda

# Production URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Generate SESSION_SECRET:**
```bash
openssl rand -base64 32
```

---

## Step 8: Install Dependencies dan Build

```bash
# Install dependencies
npm install

# Build aplikasi untuk production
npm run build

# Push database schema (jika database baru)
npm run db:push
```

**Jika build gagal karena memory:**
```bash
# Tambahkan swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Coba build lagi
npm run build
```

---

## Step 9: Jalankan Aplikasi dengan PM2

```bash
# Buat file ecosystem PM2
nano ecosystem.config.js
```

**Isi dengan:**

```javascript
module.exports = {
  apps: [
    {
      name: "pukis-monitoring",
      script: "npm",
      args: "start",
      cwd: "/var/www/pukis-monitoring",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
    },
  ],
};
```

**Jalankan aplikasi:**

```bash
# Start dengan PM2
pm2 start ecosystem.config.js

# Cek status
pm2 list
pm2 logs pukis-monitoring

# Enable auto-start saat server reboot
pm2 startup systemd
# Jalankan command yang muncul dari output di atas
pm2 save
```

**Test aplikasi:**
```bash
curl http://localhost:3000
```

---

## Step 10: Konfigurasi Nginx Reverse Proxy

```bash
# Buat konfigurasi Nginx
sudo nano /etc/nginx/sites-available/pukis-monitoring
```

**Isi dengan:**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;  # Ganti dengan domain/IP Anda

    # Redirect semua HTTP ke HTTPS (aktifkan setelah SSL terpasang)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60;
        proxy_connect_timeout 60;
        proxy_redirect off;

        # Upload file size limit (untuk upload bukti pengeluaran)
        client_max_body_size 20M;
    }
}
```

**Aktifkan konfigurasi:**

```bash
# Buat symbolic link
sudo ln -s /etc/nginx/sites-available/pukis-monitoring /etc/nginx/sites-enabled/

# Hapus default config (opsional)
sudo rm /etc/nginx/sites-enabled/default

# Test konfigurasi Nginx
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Step 11: Setup SSL dengan Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Dapatkan SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Ikuti prompt:
# - Masukkan email
# - Setujui terms
# - Pilih redirect HTTP ke HTTPS (opsi 2)

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## Step 12: Konfigurasi Firewall

```bash
# Aktifkan UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Cek status
sudo ufw status
```

---

## Step 13: Buat Super Admin User

```bash
# Masuk ke database
psql $DATABASE_URL

# Atau jika PostgreSQL lokal:
sudo -u postgres psql -d pukis_monitoring
```

**Jalankan SQL untuk membuat super admin:**

```sql
-- Generate bcrypt hash untuk password (contoh: superadmin123)
-- Anda bisa generate hash di: https://bcrypt-generator.com/

INSERT INTO users (id, email, first_name, last_name, role, password, created_at)
VALUES (
  gen_random_uuid(),
  'superadmin@pukis.id',
  'Super',
  'Admin',
  'super_admin',
  '$2b$10$hashedpasswordanda',  -- Ganti dengan bcrypt hash
  NOW()
);
```

---

## Commands untuk Maintenance

### PM2 Commands

```bash
# Lihat semua proses
pm2 list

# Restart aplikasi
pm2 restart pukis-monitoring

# Stop aplikasi
pm2 stop pukis-monitoring

# Lihat logs
pm2 logs pukis-monitoring

# Monitor resource
pm2 monit

# Clear logs
pm2 flush
```

### Update Aplikasi

```bash
cd /var/www/pukis-monitoring

# Pull kode terbaru
git pull origin main

# Install dependencies baru (jika ada)
npm install

# Build ulang
npm run build

# Push schema database (jika ada perubahan)
npm run db:push

# Restart aplikasi
pm2 restart pukis-monitoring
```

### Nginx Commands

```bash
# Test konfigurasi
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Reload tanpa downtime
sudo systemctl reload nginx

# Lihat error logs
sudo tail -f /var/log/nginx/error.log

# Lihat access logs
sudo tail -f /var/log/nginx/access.log
```

---

## Troubleshooting

### Aplikasi tidak bisa diakses

```bash
# Cek PM2 berjalan
pm2 list

# Cek aplikasi respond
curl http://localhost:3000

# Cek logs untuk error
pm2 logs pukis-monitoring --lines 100
```

### Nginx 502 Bad Gateway

```bash
# Pastikan PM2 running
pm2 list

# Test localhost
curl http://localhost:3000

# Cek Nginx error log
sudo tail -f /var/log/nginx/error.log
```

### Database connection error

```bash
# Test koneksi database
psql $DATABASE_URL -c "SELECT 1"

# Cek PostgreSQL running (jika lokal)
sudo systemctl status postgresql
```

### Out of Memory saat build

```bash
# Cek memory tersedia
free -h

# Tambah swap jika diperlukan
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Build lagi
npm run build
```

---

## Backup Database

### Manual Backup

```bash
# Backup ke file SQL
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore dari Backup

```bash
# Restore dari file SQL
psql $DATABASE_URL < backup_file.sql
```

### Automated Daily Backup (Cron)

```bash
# Edit crontab
crontab -e

# Tambahkan baris ini (backup setiap hari jam 2 pagi)
0 2 * * * pg_dump $DATABASE_URL > /var/backups/pukis_$(date +\%Y\%m\%d).sql
```

---

## Struktur File di Server

```
/var/www/pukis-monitoring/
├── .env.production          # Environment variables
├── .next/                   # Build output
├── app/                     # Next.js app directory
├── src/                     # Source code
├── shared/                  # Shared schema
├── ecosystem.config.js      # PM2 config
├── package.json
└── ...
```

---

## Checklist Deployment

- [ ] Server Ubuntu sudah diupdate
- [ ] Node.js 20.x terinstall
- [ ] PostgreSQL terinstall atau database URL tersedia
- [ ] PM2 terinstall
- [ ] Nginx terinstall dan running
- [ ] Repository sudah di-clone
- [ ] .env.production sudah dikonfigurasi
- [ ] npm install selesai
- [ ] npm run build berhasil
- [ ] npm run db:push berhasil
- [ ] PM2 menjalankan aplikasi
- [ ] Nginx reverse proxy terkonfigurasi
- [ ] SSL certificate terpasang
- [ ] Firewall terkonfigurasi
- [ ] Super admin user dibuat
- [ ] Aplikasi bisa diakses via browser

---

**Aplikasi Pukis Monitoring sekarang live di production!** 🚀
