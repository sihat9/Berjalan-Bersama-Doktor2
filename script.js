document.addEventListener('DOMContentLoaded', function() {
    // Elemen DOM
    const form = document.getElementById('registrationForm');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const earlyBirdMessage = document.getElementById('earlyBirdMessage');
    const registeredCountElement = document.getElementById('registeredCount');
    const progressBar = document.getElementById('progressBar');
    
    // Konfigurasi
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwRSq4IDDG59UimVrhA226--hAjbJ0tWocnKvoglY706Bvj6R3jOei3iG8IqtpIUwBC/exec';
    const MAX_EARLY_BIRDS = 10;
    let registeredCount = 0;

    // Fungsi utama untuk mengirim data
    async function submitFormData(formData) {
        try {
            // Gunakan teknik JSONP untuk menghindari CORS
            const url = `${GOOGLE_SCRIPT_URL}?callback=handleResponse&data=${encodeURIComponent(JSON.stringify(formData))}`;
            
            // Buat elemen script untuk JSONP
            const script = document.createElement('script');
            script.src = url;
            document.body.appendChild(script);
            document.body.removeChild(script);
            
            // Simpan ke localStorage sebagai fallback
            saveToLocalStorage(formData);
            
            return true;
        } catch (error) {
            console.error('Error:', error);
            saveToLocalStorage(formData);
            return false;
        }
    }

    // Fungsi untuk handle response (JSONP callback)
    window.handleResponse = function(response) {
        if (response.result === 'success') {
            showConfirmation(response.isEarlyBird);
            updateCounter();
        } else {
            showError(response.message || 'Pendaftaran gagal. Sila cuba lagi.');
        }
    };

    // Fungsi-fungsi pendukung
    function saveToLocalStorage(data) {
        const pending = JSON.parse(localStorage.getItem('pendingRegistrations') || []);
        pending.push(data);
        localStorage.setItem('pendingRegistrations', JSON.stringify(pending));
    }

    function showConfirmation(isEarlyBird) {
        form.style.display = 'none';
        confirmationMessage.style.display = 'block';
        earlyBirdMessage.textContent = isEarlyBird 
            ? 'Tahniah! Anda antara 10 peserta terawal yang layak hadiah!'
            : 'Pendaftaran berjaya! Hadiah untuk 10 peserta pertama sudah habis.';
        earlyBirdMessage.style.color = isEarlyBird ? '#2ecc71' : '#e74c3c';
    }

    function showError(message) {
        alert(`Ralat: ${message}`);
    }

    function updateCounter() {
        registeredCount++;
        registeredCountElement.textContent = registeredCount;
        progressBar.style.width = `${Math.min(100, (registeredCount / MAX_EARLY_BIRDS) * 100)}%`;
    }

    // Event listeners
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            fullName: document.getElementById('fullName').value.trim(),
            icNumber: document.getElementById('icNumber').value.trim(),
            phoneNumber: '6' + document.getElementById('phoneNumber').value.trim(),
            address: document.getElementById('address').value.trim(),
            email: document.getElementById('email').value.trim() || 'N/A'
        };

        // Validasi
        if (!formData.fullName || !formData.icNumber || !formData.phoneNumber || !formData.address) {
            showError('Sila isi semua maklumat yang diperlukan');
            return;
        }

        if (!/^\d{6}-\d{2}-\d{4}$/.test(formData.icNumber)) {
            showError('Format No. Kad Pengenalan tidak sah');
            return;
        }

        await submitFormData(formData);
    });

    // Inisialisasi
    function init() {
        // Untuk demo, set nilai awal
        registeredCount = 3;
        registeredCountElement.textContent = registeredCount;
        progressBar.style.width = `${(registeredCount / MAX_EARLY_BIRDS) * 100}%`;
        
        // Coba kirim data yang tertunda
        processPendingSubmissions();
    }

    async function processPendingSubmissions() {
        const pending = JSON.parse(localStorage.getItem('pendingRegistrations') || []);
        if (pending.length > 0) {
            for (const data of pending) {
                await submitFormData(data);
            }
            localStorage.removeItem('pendingRegistrations');
        }
    }

    init();
});
