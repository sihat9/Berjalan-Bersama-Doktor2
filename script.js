document.addEventListener('DOMContentLoaded', function() {
    // Elemen DOM
    const form = document.getElementById('registrationForm');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const earlyBirdMessage = document.getElementById('earlyBirdMessage');
    const registeredCountElement = document.getElementById('registeredCount');
    const progressBar = document.getElementById('progressBar');
    
    // Variabel counter
    let registeredCount = 0;
    const MAX_EARLY_BIRDS = 10;
    
    // URL Google Apps Script Anda
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwRSq4IDDG59UimVrhA226--hAjbJ0tWocnKvoglY706Bvj6R3jOei3iG8IqtpIUwBC/exec';
    
    // Fungsi untuk menampilkan pesan error
    function showError(message) {
        alert(message);
        console.error(message);
    }
    
    // Fungsi untuk mengirim data ke Google Sheets
    async function sendDataToGoogleSheets(formData) {
        try {
            // Gunakan CORS proxy untuk menghindari masalah CORS
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const targetUrl = proxyUrl + GOOGLE_SCRIPT_URL;
            
            // Tambahkan parameter acak untuk menghindari cache
            const finalUrl = targetUrl + '?rand=' + Math.random();
            
            const response = await fetch(finalUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('Error sending data:', error);
            throw error;
        }
    }
    
    // Fungsi untuk menyimpan data ke localStorage sebagai cadangan
    function saveToLocalStorage(formData) {
        try {
            const pendingSubmissions = JSON.parse(localStorage.getItem('pendingSubmissions') || '[]');
            pendingSubmissions.push(formData);
            localStorage.setItem('pendingSubmissions', JSON.stringify(pendingSubmissions));
            console.log('Data disimpan di localStorage sebagai cadangan');
            return true;
        } catch (e) {
            console.error('Gagal menyimpan ke localStorage:', e);
            return false;
        }
    }
    
    // Fungsi untuk menampilkan konfirmasi pendaftaran
    function showConfirmation(isEarlyBird) {
        form.style.display = 'none';
        confirmationMessage.style.display = 'block';
        
        // Update counter
        registeredCount++;
        registeredCountElement.textContent = registeredCount;
        progressBar.style.width = `${(registeredCount / MAX_EARLY_BIRDS) * 100}%`;
        
        // Tampilkan pesan early bird
        if (isEarlyBird) {
            earlyBirdMessage.textContent = `Tahniah! Anda adalah antara 10 peserta terawal dan layak menebus hadiah istimewa di kaunter pendaftaran Klinik SihatSokmo.`;
            earlyBirdMessage.style.color = 'var(--secondary-color)';
        } else {
            earlyBirdMessage.textContent = `Maaf, 10 hadiah istimewa untuk peserta terawal telah habis. Namun, anda masih boleh menyertai program ini.`;
            earlyBirdMessage.style.color = 'var(--gray-color)';
        }
    }
    
    // Event listener untuk form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validasi checkbox persetujuan
        if (!document.getElementById('agreeTerms').checked) {
            showError('Sila setujui terma dan syarat sebelum mendaftar.');
            return;
        }
        
        // Ambil data dari form
        const formData = {
            fullName: document.getElementById('fullName').value.trim(),
            icNumber: document.getElementById('icNumber').value.trim(),
            phoneNumber: '6' + document.getElementById('phoneNumber').value.trim(),
            address: document.getElementById('address').value.trim(),
            email: document.getElementById('email').value.trim() || 'N/A',
            timestamp: new Date().toISOString()
        };
        
        // Validasi data
        if (!formData.fullName || !formData.icNumber || !formData.phoneNumber || !formData.address) {
            showError('Sila isi semua maklumat yang diperlukan.');
            return;
        }
        
        // Validasi format No. IC
        if (!/^\d{6}-\d{2}-\d{4}$/.test(formData.icNumber)) {
            showError('Sila masukkan No. Kad Pengenalan yang sah (contoh: 901231-01-1234)');
            return;
        }
        
        // Validasi No. Telefon
        if (formData.phoneNumber.length < 10 || formData.phoneNumber.length > 12) {
            showError('Sila masukkan No. Telefon yang sah (10-12 digit termasuk awalan 6)');
            return;
        }
        
        try {
            // Coba kirim data ke Google Sheets
            const result = await sendDataToGoogleSheets(formData);
            
            // Tampilkan konfirmasi
            const isEarlyBird = registeredCount < MAX_EARLY_BIRDS;
            showConfirmation(isEarlyBird);
            
        } catch (error) {
            // Jika gagal, simpan ke localStorage
            const saved = saveToLocalStorage(formData);
            
            if (saved) {
                showError('Pendaftaran anda telah disimpan secara offline. Kami akan cuba menghantar data anda secara automatik apabila sambungan internet pulih.');
            } else {
                showError('Maaf, pendaftaran gagal. Sila cuba lagi atau hubungi kami untuk bantuan.');
            }
        }
    });
    
    // Format input No. IC
    document.getElementById('icNumber').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 6) {
            value = value.substring(0, 6) + '-' + value.substring(6);
        }
        
        if (value.length > 9) {
            value = value.substring(0, 9) + '-' + value.substring(9);
        }
        
        e.target.value = value.substring(0, 14);
    });
    
    // Format input No. Telefon (pastikan hanya angka)
    document.getElementById('phoneNumber').addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
    
    // Inisialisasi counter
    function initializeCounter() {
        // Untuk demo, kita set nilai awal
        registeredCount = 3;
        registeredCountElement.textContent = registeredCount;
        progressBar.style.width = `${(registeredCount / MAX_EARLY_BIRDS) * 100}%`;
        
        // Dalam implementasi nyata, Anda bisa fetch jumlah pendaftar dari server
        /*
        fetch('https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=getCount')
            .then(response => response.json())
            .then(data => {
                registeredCount = data.count;
                registeredCountElement.textContent = registeredCount;
                progressBar.style.width = `${(registeredCount / MAX_EARLY_BIRDS) * 100}%`;
            })
            .catch(error => {
                console.error('Error fetching count:', error);
            });
        */
    }
    
    // Coba kirim data yang tersimpan di localStorage
    function processPendingSubmissions() {
        try {
            const pendingSubmissions = JSON.parse(localStorage.getItem('pendingSubmissions') || '[]');
            if (pendingSubmissions.length > 0) {
                console.log('Mencoba mengirim data yang tersimpan...');
                
                pendingSubmissions.forEach(async (submission, index) => {
                    try {
                        await sendDataToGoogleSheets(submission);
                        // Jika berhasil, hapus dari localStorage
                        pendingSubmissions.splice(index, 1);
                        localStorage.setItem('pendingSubmissions', JSON.stringify(pendingSubmissions));
                    } catch (error) {
                        console.error(`Gagal mengirim data tersimpan #${index}:`, error);
                    }
                });
            }
        } catch (e) {
            console.error('Error processing pending submissions:', e);
        }
    }
    
    // Inisialisasi
    initializeCounter();
    
    // Cek dan proses data tersimpan setiap kali halaman dimuat
    window.addEventListener('load', processPendingSubmissions);
    
    // Cek koneksi internet
    window.addEventListener('online', processPendingSubmissions);
});
