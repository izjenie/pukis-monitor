# Panduan Deployment Pukis Monitoring ke Ubuntu Server

Panduan lengkap untuk deploy aplikasi Pukis Monitoring ke server Ubuntu.

## Arsitektur Baru

Aplikasi ini sekarang menggunakan arsitektur terpisah:
- **Frontend**: Next.js 14 (port 3000)
- **Backend**: Python FastAPI (port 8000)
- **Database**: SQLite (dapat di-upgrade ke PostgreSQL)

---

## Persyaratan

- Ubuntu Server 20.04 atau lebih baru
- Minimum RAM 2GB (disarankan 4GB)
- Domain name (opsional)
- Akses SSH ke server
- Python 3.10+ dan Node.js 20+

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

## Step 3: Install Python 3.10+

```bash
# Install Python dan pip
sudo apt install python3 python3-pip python3-venv -y

# Verifikasi instalasi
python3 --version  # harus 3.10+
pip3 --version
```

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

## Step 7: Setup Backend (FastAPI)

```bash
cd /var/www/pukis-monitoring/backend

# Buat virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Buat file .env untuk backend
nano .env
```

**Isi .env backend:**

```env
# JWT Secret (generate random string)
JWT_SECRET_KEY=your_random_secret_key_minimal_32_characters

# Database (SQLite path)
SQLITE_DATABASE_URL=sqlite:///./pukis_monitoring.db

# Object Storage (opsional)
OBJECT_STORAGE_BUCKET_ID=your-bucket-id
```

**Inisialisasi database dan seed super admin:**

```bash
# Jalankan seed script untuk membuat super admin
python seed.py

# Verifikasi
sqlite3 pukis_monitoring.db "SELECT email, role FROM users;"
```

---

## Step 8: Setup Frontend (Next.js)

```bash
cd /var/www/pukis-monitoring

# Install dependencies
npm install

# Buat file .env.production
nano .env.production
```

**Isi .env.production:**

```env
# API Backend URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Production URL (ganti dengan domain Anda)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Build aplikasi:**

```bash
npm run build
```

---

## Step 9: Konfigurasi PM2 untuk Kedua Service

```bash
# Buat file ecosystem PM2
nano ecosystem.config.js
```

**Isi dengan:**

```javascript
module.exports = {
  apps: [
    {
      name: "pukis-frontend",
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
    {
      name: "pukis-backend",
      script: "/var/www/pukis-monitoring/backend/venv/bin/python",
      args: "-m uvicorn app.main:app --host 0.0.0.0 --port 8000",
      cwd: "/var/www/pukis-monitoring/backend",
      env: {
        PYTHONPATH: "/var/www/pukis-monitoring/backend",
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
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
pm2 logs

# Enable auto-start saat server reboot
pm2 startup systemd
# Jalankan command yang muncul dari output di atas
pm2 save
```

**Test aplikasi:**
```bash
# Test backend
curl http://localhost:8000/api/health

# Test frontend
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
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (Next.js)
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
    }

    # Backend API (FastAPI)
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60;
        proxy_connect_timeout 60;

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

## Commands untuk Maintenance

### PM2 Commands

```bash
# Lihat semua proses
pm2 list

# Restart semua
pm2 restart all

# Restart spesifik
pm2 restart pukis-frontend
pm2 restart pukis-backend

# Lihat logs
pm2 logs
pm2 logs pukis-backend --lines 100

# Monitor resource
pm2 monit
```

### Update Aplikasi

```bash
cd /var/www/pukis-monitoring

# Pull kode terbaru
git pull origin main

# Update backend dependencies
cd backend
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..

# Update frontend dependencies
npm install

# Build ulang frontend
npm run build

# Restart aplikasi
pm2 restart all
```

---

## Troubleshooting

### Backend tidak bisa diakses

```bash
# Cek PM2 berjalan
pm2 list

# Cek backend respond
curl http://localhost:8000/api/health

# Cek logs untuk error
pm2 logs pukis-backend --lines 100
```

### Frontend 502 Bad Gateway

```bash
# Pastikan PM2 running
pm2 list

# Test localhost
curl http://localhost:3000

# Cek Nginx error log
sudo tail -f /var/log/nginx/error.log
```

### Database error

```bash
cd /var/www/pukis-monitoring/backend

# Check database file exists
ls -la pukis_monitoring.db

# Check database content
sqlite3 pukis_monitoring.db ".tables"
```

---

## Backup Database

### Manual Backup

```bash
# Backup SQLite database
cp /var/www/pukis-monitoring/backend/pukis_monitoring.db /var/backups/pukis_$(date +%Y%m%d_%H%M%S).db
```

### Restore dari Backup

```bash
# Restore dari file backup
cp /var/backups/pukis_backup.db /var/www/pukis-monitoring/backend/pukis_monitoring.db
pm2 restart pukis-backend
```

---

## Struktur File di Server

```
/var/www/pukis-monitoring/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models/
│   │   ├── routers/
│   │   └── services/
│   ├── venv/               # Python virtual environment
│   ├── pukis_monitoring.db # SQLite database
│   ├── requirements.txt
│   └── seed.py
├── app/                     # Next.js App Router
├── src/                     # React components & hooks
├── .env.production          # Frontend env vars
├── ecosystem.config.js      # PM2 config
├── package.json
└── ...
```

---

## Checklist Deployment

- [ ] Server Ubuntu sudah diupdate
- [ ] Node.js 20.x terinstall
- [ ] Python 3.10+ terinstall
- [ ] PM2 terinstall
- [ ] Nginx terinstall dan running
- [ ] Repository sudah di-clone
- [ ] Backend virtual environment dibuat
- [ ] Backend dependencies terinstall
- [ ] Backend .env terkonfigurasi
- [ ] Super admin di-seed ke database
- [ ] Frontend dependencies terinstall
- [ ] Frontend .env.production terkonfigurasi
- [ ] Frontend build berhasil
- [ ] PM2 menjalankan kedua service
- [ ] Nginx reverse proxy terkonfigurasi
- [ ] SSL certificate terpasang
- [ ] Firewall terkonfigurasi
- [ ] Aplikasi bisa diakses via browser

---

## Kredensial Default

**Super Admin:**
- Email: superadmin@pukis.id
- Password: superadmin123

**PENTING:** Segera ganti password super admin setelah deployment!

---

**Aplikasi Pukis Monitoring sekarang live di production!**
