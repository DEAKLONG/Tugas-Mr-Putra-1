// Link API Google Apps Script milikmu
const API_URL = 'https://script.google.com/macros/s/AKfycbx3T1rvzjuFvnxCk2yjoN2A043eHR4ayfB3mschEtK8JYbCLimm-xHHE4nlfVAA6G6EsQ/exec';
let daftarRoti = [];

// 1. READ: Ambil data dari Google Sheets saat halaman dibuka
async function loadData() {
    const tbody = document.getElementById('tabel-roti');
    try {
        const response = await fetch(`${API_URL}?action=read`);
        const result = await response.json();

        if (result.success) {
            daftarRoti = result.data;
            renderTabel();
        } else {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Gagal memuat: ${result.message}</td></tr>`;
        }
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Koneksi gagal: ${error.message}</td></tr>`;
    }
}

// Tampilkan data ke tabel HTML
function renderTabel() {
    const tbody = document.getElementById('tabel-roti');
    tbody.innerHTML = '';

    if (daftarRoti.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Belum ada data roti di Spreadsheet.</td></tr>';
        return;
    }

    daftarRoti.forEach((item, index) => {
        const hargaFormat = Number(item['HARGA ROTI'] || 0).toLocaleString('id-ID');
        tbody.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${item['NAMA ROTI'] || '-'}</td>
        <td>Rp ${hargaFormat}</td>
        <td>${item['KATEGORI'] || '-'}</td>
        <td>
          <button type="button" onclick="editData('${item.ID}')" style="cursor:pointer; padding:4px 8px;">Edit</button>
          <button type="button" onclick="hapusData('${item.ID}')" style="cursor:pointer; padding:4px 8px; color:red;">Hapus</button>
        </td>
      </tr>
    `;
    });
}

// 2. CREATE & UPDATE: Kirim data baru atau simpan perubahan
async function simpanData() {
    const id = document.getElementById('edit-id').value;
    const nama = document.getElementById('nama-roti').value.trim();
    const harga = document.getElementById('harga-satuan').value.trim();
    const kategori = document.getElementById('kategori-roti').value;

    // Validasi input tidak boleh kosong
    if (!nama || !harga || !kategori) {
        alert('Harap isi Nama Roti, Harga Satuan, dan Kategori terlebih dahulu!');
        return;
    }

    const btnSimpan = document.getElementById('btn-simpan');
    btnSimpan.disabled = true;
    btnSimpan.innerText = 'Menyimpan...';

    // Key objek sudah disesuaikan 100% dengan header di Spreadsheet: NAMA ROTI, HARGA ROTI, KATEGORI
    const dataPayload = {
        'NAMA ROTI': nama,
        'HARGA ROTI': Number(harga),
        'KATEGORI': kategori
    };

    const bodyRequest = id
        ? { action: 'update', id: id, data: dataPayload }
        : { action: 'create', data: dataPayload };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(bodyRequest)
        });
        const result = await response.json();

        if (result.success) {
            alert(result.message);
            resetForm();
            loadData();
        } else {
            alert('Gagal: ' + result.message);
        }
    } catch (error) {
        alert('Terjadi kesalahan: ' + error.message);
    } finally {
        btnSimpan.disabled = false;
        btnSimpan.innerText = id ? 'Update Data Roti' : '+ Tambahkan ke Stok';
    }
}

// Masukkan data ke form untuk diedit
function editData(id) {
    const item = daftarRoti.find(r => String(r.ID) === String(id));
    if (!item) return;

    document.getElementById('edit-id').value = item.ID;
    document.getElementById('nama-roti').value = item['NAMA ROTI'];
    document.getElementById('harga-satuan').value = item['HARGA ROTI'];
    document.getElementById('kategori-roti').value = item['KATEGORI'];

    document.getElementById('btn-simpan').innerText = 'Update Data Roti';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 3. DELETE: Hapus baris dari Spreadsheet
async function hapusData(id) {
    if (!confirm('Yakin ingin menghapus data roti ini?')) return;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'delete', id: id })
        });
        const result = await response.json();

        if (result.success) {
            alert(result.message);
            loadData();
        } else {
            alert('Gagal menghapus: ' + result.message);
        }
    } catch (error) {
        alert('Terjadi kesalahan: ' + error.message);
    }
}

// Bersihkan form input
function resetForm() {
    document.getElementById('edit-id').value = '';
    document.getElementById('nama-roti').value = '';
    document.getElementById('harga-satuan').value = '';
    document.getElementById('kategori-roti').value = '';
    document.getElementById('btn-simpan').innerText = '+ Tambahkan ke Stok';
}

// Jalankan otomatis saat halaman selesai dimuat
window.addEventListener('DOMContentLoaded', loadData);
