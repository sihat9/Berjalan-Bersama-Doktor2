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

    // Fungsi untuk menampilkan error
    function showError(message) {
        alert(`Error: ${message}`);
        console.error(message);
    }

    // Fungsi untuk menyimpan data ke localStorage
    function saveToLocalStorage(data) {
        try {
            const pending = JSON.parse(localStorage.getItem('pendingRegistrations') || '[]');
            const pendingArray = pending.length ? JSON.parse(pending) : [];
            pendingArray.push(data);
            localStorage.setItem('pendingRegistrations', JSON.stringify(pendingArray));
            console.log('Data disimpan di localStorage');
            return true;
        } catch (error) {
            console.error('Error menyimpan ke localStorage:', error);
            localStorage.setItem('pendingRegistrations', JSON.stringify([data]));
            return false;
        }
    }

    // Fungsi untuk mengirim data ke Google Sheets
    async function submitFormData(formData) {
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error mengirim data:', error);
            saveToLocalStorage(formData);
            throw error;
        }
    }

    // Fungsi untuk menampilkan konfirmasi
    function showConfirmation(isEarlyBird) {
        form.style.display = 'none';
        confirmationMessage.style.display = 'block';
        earlyBirdMessage.textContent = isEarlyBird 
            ? 'Tahniah! Anda antara 10 peserta terawal yang layak hadiah!'
            : 'Pendaftaran berjaya! Hadiah untuk 10 peserta pertama sudah habis.';
        earlyBirdMessage.style.color = isEarlyBird ? '#2ecc71' : '#e74c3c';
    }

    // Fungsi untuk update counter
    function updateCounter() {
        registeredCount++;
        registeredCountElement.textContent = registeredCount;
        progressBar.style.width = `${Math.min(100, (registeredCount / MAX_EARLY_BIRDS) * 100)}%`;
    }

    // Fungsi untuk memproses data tertunda
    async function processPendingSubmissions() {
        try {
            const pendingData = localStorage.getItem('pendingRegistrations');
            if (!pendingData) return;

            const pending = JSON.parse(pendingData);
            if (!Array.isArray(pending) || pending.length === 0) return;

            const successItems = [];
            const failedItems = [];

            for (const data of pending) {
                try {
                    await submitFormData(data);
                    successItems.push(data);
                } catch (error) {
                    console.error('Gagal mengirim data tertunda:', error);
                    failedItems.push(data);
                }
            }

            localStorage.setItem('pendingRegistrations', JSON.stringify(failedItems));
            
            if (successItems.length > 0) {
                console.log(`Berhasil mengirim ${successItems.length} data tertunda`);
            }
        } catch (error) {
            console.error('Error memproses data tertunda:', error);
        }
    }

    // Event listener untuk form submission
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
            showError('Format No. Kad Pengenalan tidak sah (contoh: 901231-01-1234)');
            return;
        }

        try {
            const response = await submitFormData(formData);
            showConfirmation(response.isEarlyBird);
            updateCounter();
        } catch (error) {
            showError('Pendaftaran gagal. Data telah disimpan dan akan cuba dihantar semula nanti.');
        }
    });

    // Inisialisasi
    function init() {
        registeredCount = 0;
        registeredCountElement.textContent = registeredCount;
        progressBar.style.width = '0%';
        processPendingSubmissions();
    }

    init();
});
