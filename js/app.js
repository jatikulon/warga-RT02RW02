window.addEventListener('DOMContentLoaded', () => {
    muatPengaturanLokal();
    muatDataPenggunaSupabase();
    muatHistoryPengumumanSupabase();
    if(window.lucide) lucide.createIcons();
});

async function muatDataAplikasi() {
    try {
        const resKas = await supabaseClient.from('buku_kas').select('*').order('id', { ascending: true });
        if (resKas.error) throw resKas.error;
        bukuKas = resKas.data || [];

        const resWarga = await supabaseClient
            .from('data_warga')
            .select('*')
            .eq('tahun', tahunAktif)
            .order('no', { ascending: true });

        if (resWarga.error) throw resWarga.error;
        dataWarga = resWarga.data || [];

        const resInfo = await supabaseClient.from('pengumuman').select('*').limit(1).single();
        if (!resInfo.error && resInfo.data) {
            informasiRT = resInfo.data;
        } else {
            informasiRT = {
                judul: "Informasi & Ketentuan Pembayaran Iuran RT 002 / RW 002",
                pesan: "Selamat datang di Sistem Keuangan RT 002 / RW 002. Berikut adalah informasi penting:\n• Iuran Bulanan 17an & Sosial dibayar paling lambat tanggal 10.\n• Kategori Warga: Jenis 10 (Rp10rb), Jenis 5 (Rp5rb), dan Jenis 60 (Rp60rb)."
            };
        }

        const inpJudul = document.getElementById('input-info-judul');
        const inpPesan = document.getElementById('input-info-pesan');
        if(inpJudul) inpJudul.value = informasiRT.judul || '';
        if(inpPesan) inpPesan.value = informasiRT.pesan || '';

        renderAll();
    } catch (err) {
        console.error("Gagal memuat data dari Supabase:", err.message);
    }
}

async function gantiTahunGlobal(tahun) {
    tahunFilterGlobal = String(tahun);

    if (tahun !== 'ALL') {
        tahunAktif = parseInt(tahun);
    }

    await muatDataAplikasi();
}

function toggleSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    const toggleBtn = document.getElementById('toggle-btn');
    sidebar.classList.toggle('active');
    
    if (sidebar.classList.contains('active')) {
        toggleBtn.classList.add('hide');
    } else {
        toggleBtn.classList.remove('hide');
    }
}

function closeSidebarOnClickOutside(e) {
    const sidebar = document.getElementById('app-sidebar');
    const toggleBtn = document.getElementById('toggle-btn');
    if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        toggleBtn.classList.remove('hide');
    }
}

function scrollToTop() {
    const mainElem = document.getElementById('main-container');
    mainElem.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

const mainElem = document.getElementById('main-container');
function handleScroll() {
    const scrollTopBtn = document.getElementById('btn-scroll-top');
    const st1 = mainElem.scrollTop;
    const st2 = window.pageYOffset || document.documentElement.scrollTop;
    
    if (st1 > 200 || st2 > 200) {
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.remove('show');
    }
}
mainElem.addEventListener('scroll', handleScroll);
window.addEventListener('scroll', handleScroll);

function renderAll() {
    let teksTahun = (tahunFilterGlobal === 'ALL') ? '(SEMUA TAHUN)' : `(${tahunFilterGlobal})`;
    
    document.getElementById('label-tahun-dashboard').innerText = `Tahun: ${tahunFilterGlobal}`;
    document.getElementById('title-stat-kaleng-dash').innerText = `KALENG SOSIAL (AKUMULASI) ${teksTahun}`;
    document.getElementById('title-stat-kaleng-buku').innerText = `KALENG SOSIAL (AKUMULASI) ${teksTahun}`;

    const infoTitle = document.getElementById('info-box-title-view');
    const infoDesc = document.getElementById('info-box-desc-view');
    if(infoTitle) infoTitle.innerHTML = `<i data-lucide="info" style="width: 22px; height: 22px;"></i> ${informasiRT.judul || 'Informasi Warga RT'}`;
    if(infoDesc) infoDesc.innerText = informasiRT.pesan || '';

    hitungUlangKas();
    renderNeracaDanLaporan();

    let filteredKas = getFilteredBukuKas();

    const kasBody = document.getElementById('buku-kas-body');
    if(kasBody) {
        kasBody.innerHTML = '';
        if (filteredKas.length === 0) {
            kasBody.innerHTML = '<tr><td colspan="12" class="text-center" style="padding: 20px; color: #94a3b8;">Tidak ada data transaksi kas pada tahun ini.</td></tr>';
        } else {
            let reversedKas = filteredKas.map((item, idx) => ({ ...item, displayIndex: idx })).reverse();
            
            reversedKas.forEach((item, displayIdx) => {
                kasBody.innerHTML += `
                    <tr>
                        <td>${filteredKas.length - displayIdx}</td>
                        <td>${item.tanggal}</td>
                        <td>${item.ket}</td>
                        <td class="text-right text-success">${item['17an_masuk'] ? formatRupiah(item['17an_masuk']) : '-'}</td>
                        <td class="text-right text-danger">${item['17an_keluar'] ? formatRupiah(item['17an_keluar']) : '-'}</td>
                        <td class="text-right fw-bold">${formatRupiah(item['saldo_17an'])}</td>
                        <td class="text-right" style="background:#faf5ff; color:var(--purple); font-weight:600;">${item.kaleng_masuk ? formatRupiah(item.kaleng_masuk) : '-'}</td>
                        <td class="text-right text-success">${item.sosial_masuk ? formatRupiah(item.sosial_masuk) : '-'}</td>
                        <td class="text-right text-danger">${item.sosial_keluar ? formatRupiah(item.sosial_keluar) : '-'}</td>
                        <td class="text-right fw-bold">${formatRupiah(item.saldo_sosial)}</td>
                        <td class="text-right fw-bold" style="background:var(--primary-light); color:var(--primary)">${formatRupiah(item.saldo_akhir)}</td>
                        <td class="text-center">
                            <button class="btn-action btn-delete" onclick="hapusTransaksiSpesifik(${item.displayIndex})" title="Hapus transaksi ini">
                                <i data-lucide="trash-2" style="width:12px;height:12px;"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
    }

    const dashBody = document.getElementById('dashboard-recent-logs');
    if(dashBody) {
        dashBody.innerHTML = '';
        if (filteredKas.length === 0) {
            dashBody.innerHTML = '<tr><td colspan="10" class="text-center" style="padding: 20px; color: #94a3b8;">Tidak ada data transaksi pada tahun ini.</td></tr>';
        } else {
            let recentItems = filteredKas.slice(-5).reverse();
            recentItems.forEach(item => {
                dashBody.innerHTML += `
                    <tr>
                        <td>${item.tanggal}</td>
                        <td><span class="badge badge-primary">${item.ket}</span></td>
                        <td class="text-success">${item['17an_masuk'] ? formatRupiah(item['17an_masuk']) : '-'}</td>
                        <td class="text-danger">${item['17an_keluar'] ? formatRupiah(item['17an_keluar']) : '-'}</td>
                        <td>${formatRupiah(item['saldo_17an'])}</td>
                        <td style="color:var(--purple); font-weight:600">${item.kaleng_masuk ? formatRupiah(item.kaleng_masuk) : '-'}</td>
                        <td class="text-success">${item.sosial_masuk ? formatRupiah(item.sosial_masuk) : '-'}</td>
                        <td class="text-danger">${item.sosial_keluar ? formatRupiah(item.sosial_keluar) : '-'}</td>
                        <td>${formatRupiah(item.saldo_sosial)}</td>
                        <td class="fw-bold text-primary">${formatRupiah(item.saldo_akhir)}</td>
                    </tr>
                `;
            });
        }
    }

    renderDashboardIuran();
    renderMatriksIuran();

    if(window.lucide) lucide.createIcons();
}