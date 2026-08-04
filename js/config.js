const SUPABASE_URL = "https://zisvzjqhcrnwjpanocco.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ibb9Nex4yjHLIS1-L-uKEg_uWQbouSQ";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const saldoAwal17an = 0;
const saldoAwalSosial = 0;

let bukuKas = [];
let dataWarga = [];
let systemUsers = []; 
let informasiRT = { judul: "", pesan: "" };
let historyPengumuman = [];
let tahunAktif = 2026; 
let tahunFilterGlobal = "2026"; 

let selectedRoleLogin = "admin";
let currentUserRole = null;

function formatRupiah(angka) {
    return "Rp " + new Intl.NumberFormat("id-ID").format(angka || 0);
}

function getColorClassForValue(val) {
    if(!val) return "";
    let cleanVal = String(val).trim().toUpperCase();
    if(cleanVal === "LIBUR") return "val-libur";
    
    let num = parseInt(cleanVal);
    if(!isNaN(num) && num >= 1 && num <= 12) {
        return "val-" + num;
    }
    return "";
}

function setTanggalOtomatis() {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('tx-date');
    if(dateInput) dateInput.value = today;
}

function preventEnterSubmit(e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault();
        return false;
    }
}