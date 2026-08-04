function renderNeracaDanLaporan() {
    let labelThn = (tahunFilterGlobal === 'ALL') ? 'Semua Tahun' : tahunFilterGlobal;
    document.getElementById('neraca-tahun-label').innerText = `Tahun: ${labelThn}`;
    document.getElementById('laporan-header-title').innerText = `Laporan Keuangan RT002 RW002 - Tahun ${labelThn}`;

    let filteredKas = getFilteredBukuKas();

    let m17 = 0, k17 = 0;
    let mKaleng = 0;
    let mSos = 0, kSos = 0;

    filteredKas.forEach(item => {
        m17 += (item['17an_masuk'] || 0);
        k17 += (item['17an_keluar'] || 0);
        mKaleng += (item.kaleng_masuk || 0);
        mSos += (item.sosial_masuk || 0);
        kSos += (item.sosial_keluar || 0);
    });

    let s17 = m17 - k17;
    let sKaleng = mKaleng;
    let sSos = mSos - kSos;

    let totMasuk = m17 + mKaleng + mSos;
    let totKeluar = k17 + kSos;
    let totSaldo = totMasuk - totKeluar;

    document.getElementById('neraca-17an-masuk').innerText = formatRupiah(m17);
    document.getElementById('neraca-17an-keluar').innerText = formatRupiah(k17);
    document.getElementById('neraca-17an-saldo').innerText = formatRupiah(s17);

    document.getElementById('neraca-kaleng-masuk').innerText = formatRupiah(mKaleng);
    document.getElementById('neraca-kaleng-saldo').innerText = formatRupiah(sKaleng);

    document.getElementById('neraca-sosial-masuk').innerText = formatRupiah(mSos);
    document.getElementById('neraca-sosial-keluar').innerText = formatRupiah(kSos);
    document.getElementById('neraca-sosial-saldo').innerText = formatRupiah(sSos);

    document.getElementById('neraca-total-masuk').innerText = formatRupiah(totMasuk);
    document.getElementById('neraca-total-keluar').innerText = formatRupiah(totKeluar);
    document.getElementById('neraca-total-saldo').innerText = formatRupiah(totSaldo);

    document.getElementById('lap-tot-masuk').innerText = formatRupiah(totMasuk);
    document.getElementById('lap-tot-keluar').innerText = formatRupiah(totKeluar);
    document.getElementById('lap-tot-netto').innerText = formatRupiah(totSaldo);

    document.getElementById('lap-17-masuk').innerText = formatRupiah(m17);
    document.getElementById('lap-17-keluar').innerText = formatRupiah(k17);
    document.getElementById('lap-17-sisa').innerText = formatRupiah(s17);

    document.getElementById('lap-kaleng-masuk').innerText = formatRupiah(mKaleng);
    document.getElementById('lap-kaleng-sisa').innerText = formatRupiah(sKaleng);

    document.getElementById('lap-sos-masuk').innerText = formatRupiah(mSos);
    document.getElementById('lap-sos-keluar').innerText = formatRupiah(kSos);
    document.getElementById('lap-sos-sisa').innerText = formatRupiah(sSos);
}