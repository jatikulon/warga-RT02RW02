function renderDashboardIuran() {
    const dashIuranBody = document.getElementById('dashboard-iuran-view-body');
    if(!dashIuranBody) return;

    const searchInput = document.getElementById('search-dashboard-warga');
    const keyword = searchInput ? searchInput.value.toLowerCase().trim() : '';

    let filteredWarga = dataWarga;
    if (keyword !== '') {
        filteredWarga = dataWarga.filter(w => w.nama.toLowerCase().includes(keyword));
    }

    dashIuranBody.innerHTML = '';
    if (filteredWarga.length === 0) {
        dashIuranBody.innerHTML = `<tr><td colspan="14" class="text-center" style="padding: 20px; color: #94a3b8;">Tidak ada data warga yang cocok.</td></tr>`;
        return;
    }

    const listBulan = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des'];
    filteredWarga.forEach(w => {
        let bulanCols = '';
        listBulan.forEach(bln => {
            let val = w[bln] || "";
            let colorClass = getColorClassForValue(val);
            bulanCols += `<td class="text-center"><span class="cell-badge ${colorClass}">${val}</span></td>`;
        });

        dashIuranBody.innerHTML += `
            <tr>
                <td>${w.no}</td>
                <td><span style="font-weight:600">${w.nama}</span></td>
                ${bulanCols}
            </tr>
        `;
    });
}