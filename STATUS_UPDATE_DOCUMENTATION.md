# Status Update Documentation

## Status yang Telah Diperbaharui Sesuai Database Schema

### 1. Order Status
Berdasarkan schema database, status order telah diperbaharui menjadi:

**Status Order (`orders.status`):**
- `pending` - Pesanan Dibuat
- `confirmed` - Pesanan Dikonfirmasi  
- `picked_up` - Dijemput
- `in_process` - Sedang Diproses
- `ready` - Siap Diantar
- `delivered` - Selesai
- `cancelled` - Dibatalkan
- `pending_cancellation` - Menunggu Pembatalan *(BARU)*

### 2. Payment Status
Berdasarkan schema database, payment status telah diperbaharui menjadi:

**Payment Status (`orders.payment_status`):**
- `pending` - Menunggu Pembayaran
- `paid` - Lunas
- `settlement` - Settlement *(BARU)*
- `failed` - Gagal
- `cancelled` - Dibatalkan
- `expired` - Kedaluwarsa *(BARU)*

### 3. Payment Table Status
Untuk tabel `payments` yang terpisah (digunakan untuk manajemen pembayaran):

**Payment Table Status (`payments.status`):**
- `Pending` - Menunggu Verifikasi
- `Verified` - Terverifikasi
- `Rejected` - Ditolak

## File yang Diperbaharui

### 1. Database Types (`lib/database.types.ts`)
✅ Diperbaharui dengan type definitions yang tepat untuk:
- Order status dan payment status
- Service types dengan structure yang benar
- Payment table definition

### 2. Orders Page (`app/dashboard/orders/page.tsx`)
✅ Diperbaharui:
- Interface Order dengan status yang tepat
- Interface ServiceType sesuai database
- Function `getStatusBadge()` dengan status baru
- Function `getPaymentStatusBadge()` dengan status baru
- Dropdown filters untuk status order dan payment
- Dialog selectors untuk update status
- **BARU**: Highlight visual mencolok untuk `pending_cancellation`:
  - Badge merah dengan animasi pulse dan teks "🚨 MENUNGGU PEMBATALAN"
  - Baris tabel dengan background merah dan border kiri merah
  - Animasi pulse untuk menarik perhatian admin

### 3. Payments Page (`app/dashboard/payments/page.tsx`)
✅ Diperbaharui:
- Interface Payment dengan status yang tepat
- Function `getStatusBadge()` untuk payments
- Filter dropdown untuk payment status

### 4. Dashboard Page (`app/dashboard/page.tsx`)
✅ Diperbaharui:
- Interface Order dengan status yang tepat
- **BARU**: Card khusus untuk Request Cancel:
  - Card dengan border merah dan background merah muda
  - Animasi pulse ketika ada pending cancellation
  - Tombol "Lihat Sekarang" untuk navigasi langsung ke orders
  - Counter yang menampilkan jumlah request cancel
  - Highlight visual untuk baris order dengan status pending_cancellation

### 5. API Routes
✅ Diperbaharui:
- `app/api/payments/midtrans/notification/route.ts` - Type safety untuk payment status

### 6. Database Schema
✅ Dibuat file baru:
- `scripts/updated-schema.sql` - Schema yang sesuai dengan database definition

## Perubahan UI untuk Request Cancel

### � Fitur Pembeda Visual untuk Request Cancel (Profesional)

1. **Badge Status Khusus**:
   - Background merah muda dengan border merah
   - Font semi-bold untuk penekanan
   - Teks: "Menunggu Pembatalan" (tanpa emoji)

2. **Highlight Baris Tabel**:
   - Background merah muda (`bg-red-50`)
   - Border kiri merah (`border-l-4 border-l-red-400`)
   - Tampilan yang clean tanpa animasi

3. **Card Dashboard**:
   - Card dengan border merah dan background merah muda
   - Counter angka merah yang jelas
   - Tombol aksi "Lihat Detail" berwarna merah
   - Text informatif "Perlu ditinjau"

4. **Konsistensi Visual**:
   - Warna merah konsisten untuk semua elemen pending cancellation
   - Tampilan yang profesional tanpa animasi berlebihan
   - Typography yang mudah dibaca

## Status yang Ditambahkan

### Status Order Baru:
- **Menunggu Pembatalan** (`pending_cancellation`) - Badge merah mencolok dengan animasi

### Status Payment Baru:
- **Settlement** (`settlement`) - Badge biru dengan label "Settlement"
- **Kedaluwarsa** (`expired`) - Badge orange dengan label "Kedaluwarsa"

## Catatan Penting

1. **Visual Priority**: Request cancel mendapat prioritas visual dengan warna merah yang jelas namun profesional
2. **Quick Access**: Tombol langsung ke halaman orders dengan filter pending_cancellation
3. **Real-time Alert**: Dashboard menampilkan alert real-time untuk request cancel
4. **Professional Design**: Tampilan yang clean tanpa animasi berlebihan atau emoji yang mengganggu
5. **Backward Compatibility**: Semua status yang ada sebelumnya tetap didukung
6. **Type Safety**: Semua interface menggunakan union types yang tepat
7. **Database Consistency**: Status sekarang konsisten dengan schema database
8. **UX Improvement**: Admin dapat dengan mudah melihat dan merespons request cancel

## Cara Menerapkan Perubahan

1. Pastikan database schema sudah sesuai dengan `scripts/updated-schema.sql`
2. Restart aplikasi untuk memuat type definitions yang baru
3. Periksa bahwa request cancel ditampilkan dengan highlight yang mencolok
4. Test tombol navigasi dari dashboard ke orders
5. Verifikasi bahwa animasi dan styling berjalan dengan baik

## Request Cancel Workflow

1. **Customer Request**: Customer mengirim request cancel (status: `pending_cancellation`)
2. **Visual Alert**: Dashboard dan orders page menampilkan alert visual merah
3. **Admin Action**: Admin dapat melihat dan merespons request cancel
4. **Status Update**: Admin mengubah status menjadi `cancelled` atau kembali ke status sebelumnya

Fitur ini memastikan admin dapat dengan mudah melihat request cancel dari customer dengan tampilan yang profesional dan tidak mengganggu! �
