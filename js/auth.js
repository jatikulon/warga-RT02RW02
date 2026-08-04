function selectLoginRole(role) {
    selectedRoleLogin = role;
    const adminBtn = document.getElementById('role-admin-btn');
    const bendaharaBtn = document.getElementById('role-bendahara-btn');
    const sekretarisBtn = document.getElementById('role-sekretaris-btn');
    const wargaBtn = document.getElementById('role-warga-btn');
    const credentialInputs = document.getElementById('credential-inputs');
    const wargaInputs = document.getElementById('warga-inputs');
    const labelUser = document.getElementById('label-login-user');

    adminBtn.classList.remove('active');
    bendaharaBtn.classList.remove('active');
    sekretarisBtn.classList.remove('active');
    wargaBtn.classList.remove('active');

    if (role === 'admin') {
        adminBtn.classList.add('active');
        credentialInputs.style.display = 'block';
        wargaInputs.style.display = 'none';
        labelUser.innerText = 'Username Admin';
    } else if (role === 'bendahara') {
        bendaharaBtn.classList.add('active');
        credentialInputs.style.display = 'block';
        wargaInputs.style.display = 'none';
        labelUser.innerText = 'Username Bendahara';
    } else if (role === 'sekretaris') {
        sekretarisBtn.classList.add('active');
        credentialInputs.style.display = 'block';
        wargaInputs.style.display = 'none';
        labelUser.innerText = 'Username Sekretaris';
    } else {
        wargaBtn.classList.add('active');
        credentialInputs.style.display = 'none';
        wargaInputs.style.display = 'block';
    }
}

async function prosesLogin(e) {
    e.preventDefault();
    if (selectedRoleLogin === 'warga') {
        setSession('warga', 'Warga RT');
        return;
    }

    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value.trim();

    let matchedUser = systemUsers.find(usr => usr.username === u && usr.password === p && usr.role === selectedRoleLogin);

    if (!matchedUser) {
        if (selectedRoleLogin === 'admin' && u === 'admin' && p === '123') {
            matchedUser = { username: 'admin', role: 'admin' };
        } else if (selectedRoleLogin === 'bendahara' && u === 'bendahara' && p === '123') {
            matchedUser = { username: 'bendahara', role: 'bendahara' };
        } else if (selectedRoleLogin === 'sekretaris' && u === 'sekretaris' && p === '123') {
            matchedUser = { username: 'sekretaris', role: 'sekretaris' };
        }
    }

    if (matchedUser) {
        setSession(matchedUser.role, matchedUser.username);
    } else {
        alert(`Username atau Password ${selectedRoleLogin} salah!`);
    }
}

function setSession(role, username) {
    currentUserRole = role;
    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('display-user-role').innerText = `Role: ${role.toUpperCase()} (${username})`;
    
    const adminOnlyNavs = document.querySelectorAll('.role-access-admin');
    const bendaharaNavs = document.querySelectorAll('.role-access-bendahara');
    const sekretarisNavs = document.querySelectorAll('.role-access-sekretaris');

    if (role === 'warga') {
        bendaharaNavs.forEach(el => el.style.display = 'none');
        sekretarisNavs.forEach(el => el.style.display = 'none');
        adminOnlyNavs.forEach(el => el.style.display = 'none');
        switchTab('dashboard');
    } else if (role === 'sekretaris') {
        bendaharaNavs.forEach(el => el.style.display = 'none');
        sekretarisNavs.forEach(el => el.style.display = 'flex'); 
        adminOnlyNavs.forEach(el => el.style.display = 'none');
        switchTab('dashboard');
    } else if (role === 'bendahara') {
        bendaharaNavs.forEach(el => el.style.display = 'flex');
        sekretarisNavs.forEach(el => el.style.display = 'none');
        adminOnlyNavs.forEach(el => el.style.display = 'none');
        switchTab('dashboard');
    } else {
        bendaharaNavs.forEach(el => el.style.display = 'flex');
        sekretarisNavs.forEach(el => el.style.display = 'flex');
        adminOnlyNavs.forEach(el => el.style.display = 'flex');
        switchTab('dashboard');
    }

    setTanggalOtomatis();
    muatDataAplikasi();
}

function prosesLogout() {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
        currentUserRole = null;
        document.getElementById('login-modal').style.display = 'flex';
        document.getElementById('form-login').reset();
        selectLoginRole('admin');
    }
}

function switchTab(tabId, evt) {
    if (currentUserRole === 'warga' && tabId !== 'dashboard') {
        alert("Akses Ditolak! Warga hanya memiliki akses ke Dashboard.");
        return;
    }
    if (currentUserRole === 'sekretaris' && tabId !== 'dashboard' && tabId !== 'pengumuman') {
        alert("Akses Ditolak! Sekretaris hanya bisa akses Dashboard dan Info Warga.");
        return;
    }
    if (currentUserRole === 'bendahara' && (tabId === 'pengumuman' || tabId === 'setting')) {
        alert("Akses Ditolak! Menu ini khusus untuk Admin RT / Sekretaris.");
        return;
    }

    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    
    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add('active');
    } else {
        const targetNav = document.getElementById('nav-' + tabId);
        if (targetNav) targetNav.classList.add('active');
    }
    
    const saldoBox = document.getElementById('rangkuman-saldo-box');
    if (tabId === 'dashboard') {
        saldoBox.style.display = 'grid';
    } else {
        saldoBox.style.display = 'none';
    }
    
    const titleMap = { 
        'dashboard': 'Dashboard Utama Keuangan', 
        'pengumuman': 'Kelola Kotak Informasi Warga',
        'saldo': 'Buku Kas Umum RT', 
        'iuran': 'Data Iuran Warga',
        'neraca': 'Neraca Keuangan Tahunan',
        'laporan': 'Laporan Keuangan Tahunan',
        'setting': 'Pengaturan Sistem & Manajemen Pengguna'
    };
    document.getElementById('page-title').innerText = titleMap[tabId];
    
    closeSidebarOnClickOutside();
    renderAll();
}