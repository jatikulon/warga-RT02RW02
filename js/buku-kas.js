function getFilteredBukuKas() {
    if (tahunFilterGlobal === 'ALL') {
        return bukuKas;
    }
    return bukuKas.filter(item => {
        if (!item.tanggal) return false;
        let yearString = String(item.tanggal).substring(0, 4);
        return yearString === String(tahunFilterGlobal);
    });
}

function hitungUlangKas() {
    let filteredKas = getFilteredBukuKas();
    
    let current17an = saldoAwal17an;
    let currentSosial = saldoAwalSosial;
    let totalKalengFiltered = 0;

    filteredKas.forEach((item) => {
        current17an += (item['17an_masuk'] || 0) - (item['17an_keluar'] || 0);
        currentSosial += (item.kaleng_masuk || 0) + (item.sosial_masuk || 0) - (item.sosial_keluar || 0);
        totalKalengFiltered += (item.kaleng_masuk || 0);

        item['saldo_17an'] = current17an;
        item.saldo_sosial = currentSosial;
        item.saldo_akhir = current17an + currentSosial;
    });

    let txtSaldoAkhir = "Rp 0";
    let txtSaldo17an = "Rp 0";
    let txtSaldoSosial = "Rp 0";

    if(filteredKas.length > 0) {
        txtSaldoAkhir = formatRupiah(filteredKas[filteredKas.length - 1].saldo_akhir);
        txtSaldo17an = formatRupiah(filteredKas[filteredKas.length - 1]['saldo_17an']);
        txtSaldoSosial = formatRupiah(filteredKas[filteredKas.length - 1].saldo_sosial);
    }

    document.getElementById('stat-saldo-akhir').innerText = txtSaldoAkhir;
    document.getElementById('stat-saldo-17an').innerText = txtSaldo17an;
    document.getElementById('stat-saldo-sosial').innerText = txtSaldoSosial;
    document.getElementById('stat-saldo-kaleng').innerText = formatRupiah(totalKalengFiltered);

    document.getElementById('stat-buku-saldo-akhir').innerText = txtSaldoAkhir;
    document.getElementById('stat-buku-saldo-17an').innerText = txtSaldo17an;
    document.getElementById('stat-buku-saldo-sosial').innerText = txtSaldoSosial;
    document.getElementById('stat-buku-kaleng').innerText = formatRupiah(totalKalengFiltered);
}

async function tambahMutasi(e) {
    e.preventDefault();
    let date = document.getElementById('tx-date').value;
    let desc = document.getElementById('tx-desc').value;

    const inputsNominal = document.querySelectorAll('.tx-input-nominal');
    let adaInput = false;

    let rowTrx = { 
        tanggal: date, 
        ket: desc, 
        '17an_masuk': 0, 
        '17an_keluar': 0, 
        kaleng_masuk: 0, 
        sosial_masuk: 0, 
        sosial_keluar: 0 
    };

    inputsNominal.forEach(input => {
        let amount = parseInt(input.value) || 0;
        let jenis = input.getAttribute('data-jenis');

        if (amount > 0) {
            adaInput = true;
            if(jenis === '17an_masuk') rowTrx['17an_masuk'] = amount;
            else if(jenis === '17an_keluar') rowTrx['17an_keluar'] = amount;
            else if(jenis === 'kaleng_masuk') rowTrx.kaleng_masuk = amount;
            else if(jenis === 'sosial_masuk') rowTrx.sosial_masuk = amount;
            else if(jenis === 'sosial_keluar') rowTrx.sosial_keluar = amount;
        }
    });

    if (!adaInput) {
        alert("Masukkan minimal satu nominal pada pos kas yang tersedia!");
        return;
    }

    try {
        const { data, error } = await supabaseClient.from('buku_kas').insert([rowTrx]).select();
        if (error) throw error;

        if (data && data.length > 0) {
            bukuKas.push(data[0]);
        }
        
        document.getElementById('form-transaksi').reset();
        setTanggalOtomatis();
        renderAll();
        alert("Berhasil mencatat mutasi kas ke Supabase!");
    } catch (err) {
        alert("Gagal menyimpan transaksi: " + err.message);
    }
}

async function hapusTransaksiSpesifik(index) {
    let filteredKas = getFilteredBukuKas();
    let item = filteredKas[index];
    if (confirm(`Apakah Anda yakin ingin menghapus transaksi "${item.ket}" pada tanggal ${item.tanggal}?`)) {
        try {
            const { error } = await supabaseClient.from('buku_kas').delete().eq('id', item.id);
            if (error) throw error;

            bukuKas = bukuKas.filter(b => b.id !== item.id);
            renderAll();
        } catch (err) {
            alert("Gagal menghapus transaksi: " + err.message);
        }
    }
}