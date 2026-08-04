async function tambahWargaBaru(e) {
    e.preventDefault();
    let nama = document.getElementById('warga-nama').value;
    let jenis = parseInt(document.getElementById('warga-jenis').value) || 10;
    
    let noBaru = dataWarga.length > 0 ? Math.max(...dataWarga.map(w => w.no)) + 1 : 1;

    let wargaObj = {
        tahun: tahunAktif,
        no: noBaru,
        nama: nama,
        jenis: jenis,
        jan: "", feb: "", mar: "", apr: "", mei: "", jun: "",
        jul: "", agu: "", sep: "", okt: "", nov: "", des: ""
    };

    try {
        const { data, error } = await supabaseClient.from('data_warga').insert([wargaObj]).select();
        if (error) throw error;

        if (data && data.length > 0) {
            dataWarga.push(data[0]);
        }

        document.getElementById('form-tambah-warga').reset();
        renderAll();
        alert(`Warga atas nama "${nama}" berhasil didaftarkan di Tahun ${tahunAktif}!`);
    } catch (err) {
        alert("Gagal mendaftarkan warga: " + err.message);
    }
}

async function updateMatriksIuran(wargaIdx, bulanKey, nilaiBaru) {
    let warga = dataWarga[wargaIdx];
    warga[bulanKey] = nilaiBaru;

    try {
        const { error } = await supabaseClient
            .from('data_warga')
            .update({ [bulanKey]: nilaiBaru })
            .eq('id', warga.id);

        if (error) throw error;
        renderAll();
    } catch (err) {
        alert("Gagal memperbarui iuran: " + err.message);
    }
}

async function updateJenisWarga(wargaIdx, jenisBaru) {
    let warga = dataWarga[wargaIdx];
    let parsedJenis = parseInt(jenisBaru) || 10;
    warga.jenis = parsedJenis;

    try {
        const { error } = await supabaseClient
            .from('data_warga')
            .update({ jenis: parsedJenis })
            .eq('id', warga.id);

        if (error) throw error;
        renderAll();
    } catch (err) {
        alert("Gagal memperbarui jenis warga: " + err.message);
    }
}

async function editNamaWarga(wargaIdx) {
    let warga = dataWarga[wargaIdx];
    let namaBaru = prompt("Ubah Nama Warga:", warga.nama);
    
    if (namaBaru !== null && namaBaru.trim() !== "") {
        warga.nama = namaBaru.trim();
        try {
            const { error } = await supabaseClient
                .from('data_warga')
                .update({ nama: warga.nama })
                .eq('id', warga.id);

            if (error) throw error;
            renderAll();
        } catch (err) {
            alert("Gagal mengubah nama: " + err.message);
        }
    }
}

async function hapusWarga(wargaIdx) {
    let warga = dataWarga[wargaIdx];
    if (confirm(`Apakah Anda yakin ingin menghapus data warga "${warga.nama}"?`)) {
        try {
            const { error } = await supabaseClient.from('data_warga').delete().eq('id', warga.id);
            if (error) throw error;

            dataWarga.splice(wargaIdx, 1);
            renderAll();
        } catch (err) {
            alert("Gagal menghapus warga: " + err.message);
        }
    }
}

async function salinDataKeTahunBerikutnya() {
    let tahunDepan = tahunAktif + 1;
    
    if (!confirm(`Apakah Anda yakin ingin membuat matriks iuran baru untuk Tahun ${tahunDepan} berdasarkan daftar warga tahun ${tahunAktif}?`)) {
        return;
    }

    try {
        const { data: wargaSaatIni, error: errFetch } = await supabaseClient
            .from('data_warga')
            .select('*')
            .eq('tahun', tahunAktif);

        if (errFetch) throw errFetch;

        if (!wargaSaatIni || wargaSaatIni.length === 0) {
            alert(`Tidak ada data warga di tahun ${tahunAktif} untuk disalin.`);
            return;
        }

        let dataTahunBaru = wargaSaatIni.map(w => ({
            tahun: tahunDepan,
            no: w.no,
            nama: w.nama,
            jenis: w.jenis,
            jan: "", feb: "", mar: "", apr: "", mei: "", jun: "",
            jul: "", agu: "", sep: "", okt: "", nov: "", des: ""
        }));

        const { error: errInsert } = await supabaseClient
            .from('data_warga')
            .insert(dataTahunBaru);

        if (errInsert) throw errInsert;

        let globalSelect = document.getElementById('select-global-tahun');
        let optionExist = Array.from(globalSelect.options).some(opt => opt.value == tahunDepan);
        if (!optionExist) {
            let opt = document.createElement('option');
            opt.value = tahunDepan;
            opt.innerHTML = tahunDepan;
            globalSelect.appendChild(opt);
        }

        globalSelect.value = String(tahunDepan);
        await gantiTahunGlobal(tahunDepan);
        alert(`Berhasil membuat data iuran warga untuk Tahun ${tahunDepan}!`);
    } catch (err) {
        alert("Gagal membuat data tahun berikutnya: " + err.message);
    }
}

function exportDataWargaExcel() {
    if (dataWarga.length === 0) {
        alert("Tidak ada data warga yang bisa di-export.");
        return;
    }

    const excelData = dataWarga.map(w => ({
        "Tahun": w.tahun || tahunAktif,
        "No": w.no,
        "Nama Warga": w.nama,
        "Jenis": w.jenis,
        "Jan": w.jan || "",
        "Feb": w.feb || "",
        "Mar": w.mar || "",
        "Apr": w.apr || "",
        "Mei": w.mei || "",
        "Jun": w.jun || "",
        "Jul": w.jul || "",
        "Agu": w.agu || "",
        "Sep": w.sep || "",
        "Okt": w.okt || "",
        "Nov": w.nov || "",
        "Des": w.des || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Warga_${tahunAktif}`);

    XLSX.writeFile(workbook, `Data_Warga_RT_${tahunAktif}.xlsx`);
}

function triggerImportWarga() {
    document.getElementById('import-file-input').click();
}

async function importDataWargaExcel(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet);

            if (rows.length === 0) {
                alert("File Excel kosong atau format tidak sesuai.");
                return;
            }

            if (confirm(`Berhasil membaca ${rows.length} data warga dari file Excel. Ingin memasukkannya ke Supabase untuk Tahun ${tahunAktif}?`)) {
                let formattedRows = rows.map((r, index) => ({
                    tahun: tahunAktif,
                    no: index + 1,
                    nama: r["Nama Warga"] || r["nama"] || `Warga ${index+1}`,
                    jenis: parseInt(r["Jenis"] || r["jenis"]) || 10,
                    jan: String(r["Jan"] || r["jan"] || ""),
                    feb: String(r["Feb"] || r["feb"] || ""),
                    mar: String(r["Mar"] || r["mar"] || ""),
                    apr: String(r["Apr"] || r["apr"] || ""),
                    mei: String(r["Mei"] || r["mei"] || ""),
                    jun: String(r["Jun"] || r["jun"] || ""),
                    jul: String(r["Jul"] || r["jul"] || ""),
                    agu: String(r["Agu"] || r["agu"] || ""),
                    sep: String(r["Sep"] || r["sep"] || ""),
                    okt: String(r["Okt"] || r["okt"] || ""),
                    nov: String(r["Nov"] || r["nov"] || ""),
                    des: String(r["Des"] || r["des"] || "")
                }));

                const { error } = await supabaseClient.from('data_warga').insert(formattedRows);
                if (error) throw error;

                await muatDataAplikasi();
                alert("Data warga dari Excel berhasil di-import ke Supabase!");
            }
        } catch (err) {
            alert("Gagal mengimpor file Excel: " + err.message);
        }
    };
    reader.readAsBuffer(file);
    event.target.value = '';
}

function renderMatriksIuran() {
    const matriksBody = document.getElementById('matriks-iuran-body');
    if(!matriksBody) return;

    const searchInput = document.getElementById('search-admin-warga');
    const keyword = searchInput ? searchInput.value.toLowerCase().trim() : '';

    let filteredWarga = dataWarga;
    if (keyword !== '') {
        filteredWarga = dataWarga.filter(w => w.nama.toLowerCase().includes(keyword));
    }

    matriksBody.innerHTML = '';
    
    let total17an = { jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0, jul: 0, agu: 0, sep: 0, okt: 0, nov: 0, des: 0 };
    let totalSosial = { jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0, jul: 0, agu: 0, sep: 0, okt: 0, nov: 0, des: 0 };

    const listBulan = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des'];

    dataWarga.forEach(w => {
        let nilaiJenis = parseInt(w.jenis) || 10;
        listBulan.forEach(bln => {
            let val = w[bln] || "";
            if(val !== "" && String(val).toUpperCase() !== "LIBUR") {
                let targetBulanKe = parseInt(val);
                if(!isNaN(targetBulanKe) && targetBulanKe >= 1 && targetBulanKe <= 12) {
                    let namaBulanTarget = listBulan[targetBulanKe - 1];
                    if (nilaiJenis === 10) {
                        total17an[namaBulanTarget] += 5000;
                        totalSosial[namaBulanTarget] += 5000;
                    } else if (nilaiJenis === 5) {
                        totalSosial[namaBulanTarget] += 5000;
                    } else if (nilaiJenis === 60) {
                        total17an[namaBulanTarget] += 30000;
                        totalSosial[namaBulanTarget] += 30000;
                    }
                }
            }
        });
    });

    if (filteredWarga.length === 0) {
        matriksBody.innerHTML = `<tr><td colspan="16" class="text-center" style="padding: 20px; color: #94a3b8;">Tidak ada data warga yang cocok dengan pencarian.</td></tr>`;
    } else {
        filteredWarga.forEach((w) => {
            let realIdx = dataWarga.findIndex(item => item.id === w.id);
            if(realIdx === -1) realIdx = dataWarga.indexOf(w);

            let nilaiJenis = parseInt(w.jenis) || 10;
            let bulanCols = '';

            listBulan.forEach(bln => {
                let val = w[bln] || "";
                let colorClass = getColorClassForValue(val);
                
                bulanCols += `
                    <td class="text-center">
                        <input type="text" 
                               class="matrix-input ${colorClass}" 
                               value="${val}" 
                               onchange="updateMatriksIuran(${realIdx}, '${bln}', this.value)" />
                    </td>`;
            });

            matriksBody.innerHTML += `
                <tr>
                    <td>${w.no}</td>
                    <td><span style="font-weight:600; cursor:pointer;" onclick="editNamaWarga(${realIdx})" title="Klik untuk ubah nama">${w.nama}</span></td>
                    <td>
                        <select class="select-jenis" onchange="updateJenisWarga(${realIdx}, this.value)">
                            <option value="10" ${nilaiJenis===10?'selected':''}>10</option>
                            <option value="5" ${nilaiJenis===5?'selected':''}>5</option>
                            <option value="60" ${nilaiJenis===60?'selected':''}>60</option>
                        </select>
                    </td>
                    ${bulanCols}
                    <td class="text-center">
                        <button class="btn-action btn-delete" onclick="hapusWarga(${realIdx})" title="Hapus Warga">
                            <i data-lucide="trash-2" style="width:12px;height:12px;"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    listBulan.forEach(bln => {
        const el17 = document.getElementById('17-' + bln);
        const elSoc = document.getElementById('soc-' + bln);
        if(el17) el17.innerText = formatRupiah(total17an[bln]);
        if(elSoc) elSoc.innerText = formatRupiah(totalSosial[bln]);
    });

    if(window.lucide) lucide.createIcons();
}