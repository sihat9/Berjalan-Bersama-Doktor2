document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const earlyBirdMessage = document.getElementById('earlyBirdMessage');
    const registeredCountElement = document.getElementById('registeredCount');
    const progressBar = document.getElementById('progressBar');
    
    // Simpan counter peserta (dalam aplikasi nyata, ini akan diambil dari Google Sheets)
    let registeredCount = 0;
    const MAX_EARLY_BIRDS = 10;
    
    // URL Google Apps Script untuk mengirim data ke Google Sheets
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwRSq4IDDG59UimVrhA226--hAjbJ0tWocnKvoglY706Bvj6R3jOei3iG8IqtpIUwBC/exec';
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Ambil nilai dari form
        const formData = {
            fullName: document.getElementById('fullName').value,
            icNumber: document.getElementById('icNumber').value,
            phoneNumber: '6' + document.getElementById('phoneNumber').value,
            address: document.getElementById('address').value,
            email: document.getElementById('email').value || 'N/A',
            timestamp: new Date().toISOString()
        };
        
        // Kirim data ke Google Sheets
        axios.post(GOOGLE_SCRIPT_URL, formData)
            .then(function(response) {
                // Tampilkan pesan konfirmasi
                form.style.display = 'none';
                confirmationMessage.style.display = 'block';
                
                // Update counter
                registeredCount++;
                registeredCountElement.textContent = registeredCount;
                progressBar.style.width = `${(registeredCount / MAX_EARLY_BIRDS) * 100}%`;
                
                // Tampilkan pesan early bird jika termasuk 10 terawal
                if (registeredCount <= MAX_EARLY_BIRDS) {
                    earlyBirdMessage.textContent = `Tahniah! Anda adalah antara 10 peserta terawal dan layak menebus hadiah istimewa di kaunter pendaftaran Klinik SihatSokmo.`;
                    earlyBirdMessage.style.color = 'var(--secondary-color)';
                } else {
                    earlyBirdMessage.textContent = `Maaf, 10 hadiah istimewa untuk peserta terawal telah habis. Namun, anda masih boleh menyertai program ini.`;
                    earlyBirdMessage.style.color = 'var(--gray-color)';
                }
            })
            .catch(function(error) {
                alert('Maaf, terdapat masalah dengan pendaftaran. Sila cuba lagi.');
                console.error('Error:', error);
            });
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
    
    // Untuk demo, kita akan set counter awal ke 3
    // Dalam aplikasi nyata, ini akan diambil dari Google Sheets
    registeredCount = 3;
    registeredCountElement.textContent = registeredCount;
    progressBar.style.width = `${(registeredCount / MAX_EARLY_BIRDS) * 100}%`;
});
