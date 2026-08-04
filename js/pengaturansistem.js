async function muatDataPenggunaSupabase() {
    try {
        const { data, error } = await supabaseClient.from('users').select('*').order('id', { ascending: true });
        if (!error && data) {
            systemUsers = data;
        } else {
            systemUsers = [
                { id: 1, username: 'admin', password: '123', role: 'admin' },
                { id: 2, username: 'bendahara', password: '123', role: 'bendahara' },
                { id: 3, username: 'sekretaris', password: '123', role: 'sekretaris' }
            ];
        }
        renderTableUsers();
    } catch (err) {
        console.log("Menggunakan akun lokal default:", err.message);
    }
}

function muatPengaturanLokal() {
    const savedPrimary = localStorage.getItem('rt_theme_primary');
    const savedLight = localStorage.getItem('rt_theme_light');
    if (savedPrimary && savedLight) {
        document.documentElement.style.setProperty('--primary', savedPrimary);
        document.documentElement.style.setProperty('--primary-light', savedLight);
    }
}

function ubahTemaWarna(primaryColor, lightColor) {
    document.documentElement.style.setProperty('--primary', primaryColor);
    document.documentElement.style.setProperty('--primary-light', lightColor);
    localStorage.setItem('rt_theme_primary', primaryColor);
    localStorage.setItem('rt_theme_light', lightColor);
    alert("Tema warna aplikasi berhasil diubah!");
}

async function simpanAkunPengguna(e) {
    e.preventDefault();
    const editId = document.getElementById('user-edit-id').value;
    const username = document.getElementById('input-username-sys').value.trim();
    const password = document.getElementById('input-password-sys').value.trim();
    const role = document.getElementById('input-role-sys').value;

    if (!username || !password) {
        alert("Username dan password tidak boleh kosong!");
        return;
    }

    try {
        if (editId) {
            const { error } = await supabaseClient
                .from('users')
                .update({ username, password, role })
                .eq('id', editId);
            if (error) throw error;
            alert("Akun pengguna berhasil diperbarui!");
        } else {
            const { error } = await supabaseClient
                .from('users')
                .insert([{ username, password, role }]);
            if (error) throw error;
            alert("Akun baru berhasil didaftarkan ke sistem!");
        }

        resetFormUser();
        await muatDataPenggunaSupabase();
    } catch (err) {
        alert("Gagal menyimpan akun ke Supabase: " + err.message);
    }
}

function renderTableUsers() {
    const tbody = document.getElementById('table-users-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (systemUsers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="color:#64748b; padding:16px;">Belum ada data akun pengguna.</td></tr>`;
        return;
    }

    systemUsers.forEach((usr, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${usr.username}</strong></td>
                <td><span class="badge" style="background:var(--primary-light); color:var(--primary); padding:2px 8px; border-radius:4px; font-weight:600;">${usr.role.toUpperCase()}</span></td>
                <td><code>${usr.password}</code></td>
                <td class="text-center">
                    <button class="btn-action btn-edit" onclick="editAkunPengguna(${usr.id})"><i data-lucide="edit-2" style="width:12px;height:12px;"></i> Edit</button>
                    <button class="btn-action btn-delete" onclick="hapusAkunPengguna(${usr.id})"><i data-lucide="trash-2" style="width:12px;height:12px;"></i> Hapus</button>
                </td>
            </tr>
        `;
    });
    if(window.lucide) lucide.createIcons();
}

function editAkunPengguna(id) {
    const usr = systemUsers.find(u => u.id === id);
    if (!usr) return;

    document.getElementById('user-edit-id').value = usr.id;
    document.getElementById('input-username-sys').value = usr.username;
    document.getElementById('input-password-sys').value = usr.password;
    document.getElementById('input-role-sys').value = usr.role;

    document.getElementById('form-user-title').innerText = `Edit Akun: ${usr.username}`;
    document.getElementById('btn-cancel-edit').style.display = 'inline-block';
}

function resetFormUser() {
    document.getElementById('form-manage-user').reset();
    document.getElementById('user-edit-id').value = '';
    document.getElementById('form-user-title').innerText = 'Form Tambah Akun Baru';
    document.getElementById('btn-cancel-edit').style.display = 'none';
}

async function hapusAkunPengguna(id) {
    if (confirm("Apakah Anda yakin ingin menghapus akun pengguna ini dari sistem?")) {
        try {
            const { error } = await supabaseClient.from('users').delete().eq('id', id);
            if (error) throw error;
            await muatDataPenggunaSupabase();
            alert("Akun berhasil dihapus!");
        } catch (err) {
            alert("Gagal menghapus akun: " + err.message);
        }
    }
}