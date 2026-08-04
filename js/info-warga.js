async function muatHistoryPengumumanSupabase() {
    try {
        const { data, error } = await supabaseClient.from('pengumuman_history').select('*').order('created_at', { ascending: false });
        if (!error && data) {
            historyPengumuman = data;
        } else {
            historyPengumuman = [];
        }
        renderHistoryPengumuman();
    } catch (err) {
        console.log("Gagal memuat history pengumuman:", err.message);
    }
}

function renderHistoryPengumuman() {
    const tbody = document.getElementById('table-history-pengumuman');
    if(!tbody) return;
    tbody.innerHTML = '';

    if(historyPengumuman.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center" style="color:#64748b; padding:16px;">Belum ada riwayat history perubahan informasi.</td></tr>`;
        return;
    }

    historyPengumuman.forEach((item, index) => {
        let tanggalFormat = item.created_at ? new Date(item.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-';
        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td><small style="color:#64748b; font-weight:600;">${tanggalFormat}</small></td>
                <td><strong>${item.judul}</strong></td>
                <td><div style="max-height:60px; overflow-y:auto; font-size:0.85rem; color:#334155; white-space:pre-line;">${item.pesan}</div></td>
            </tr>
        `;
    });
}

async function simpanPengumuman(e) {
    e.preventDefault();
    let judulBaru = document.getElementById('input-info-judul').value.trim();
    let pesanBaru = document.getElementById('input-info-pesan').value.trim();

    try {
        const { data: existing } = await supabaseClient.from('pengumuman').select('id').limit(1).single();
        
        let error;
        if (existing) {
            let res = await supabaseClient.from('pengumuman').update({ judul: judulBaru, pesan: pesanBaru }).eq('id', existing.id);
            error = res.error;
        } else {
            let res = await supabaseClient.from('pengumuman').insert([{ judul: judulBaru, pesan: pesanBaru }]);
            error = res.error;
        }

        if (error) throw error;

        const { error: errHistory } = await supabaseClient.from('pengumuman_history').insert([{
            judul: judulBaru,
            pesan: pesanBaru,
            created_at: new Date().toISOString()
        }]);

        if(errHistory) {
            console.error("Gagal menyimpan ke history:", errHistory.message);
        }

        informasiRT.judul = judulBaru;
        informasiRT.pesan = pesanBaru;
        
        await muatHistoryPengumumanSupabase();
        renderAll();
        
        alert("Kotak informasi warga berhasil diperbarui dan history disimpan!");
        switchTab('dashboard');
    } catch (err) {
        alert("Gagal menyimpan informasi: " + err.message);
    }
}