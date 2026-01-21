// Verifica script do Telegram apenas por segurança
if(!document.querySelector('script[src*="telegram-web-app.js"]')) { const s = document.createElement('script'); s.src = "https://telegram.org/js/telegram-web-app.js"; document.head.appendChild(s); }

let transactions = JSON.parse(localStorage.getItem('btc_transactions_v7')) || [];
let prices = { brl: 0, usd: 0 };
let charts = {};
let privacyMode = false;

window.onload = function() {
    // Data atual no input (UTC Fix)
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('eco-date').value = now.toISOString().slice(0,16);
    
    truncateAddresses();
    fetchData();
    renderHistory();
    updateBalances();
};

function goTo(screenId) {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById('screen-' + screenId).classList.add('active');
    if(screenId === 'cotacao') { fetchData(); loadPriceCharts(); }
    if(screenId === 'dashboard') loadPortfolioChart();
}

function truncateAddresses() {
    document.querySelectorAll('.truncated-address').forEach(el => {
        const full = el.innerText;
        if(full.length > 25) el.innerText = `${full.substring(0,18)}...${full.substring(full.length-4)}`;
    });
}

// --- API & DATA ---
async function fetchData() {
    try {
        // Preços (USD e BRL)
        const pRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl,usd');
        const pData = await pRes.json();
        prices.brl = pData.bitcoin.brl;
        prices.usd = pData.bitcoin.usd;
        
        updateBalances();

        // Sentimento
        const sRes = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin');
        const sData = await sRes.json();
        const up = sData.sentiment_votes_up_percentage;
        const down = sData.sentiment_votes_down_percentage;
        
        if(up && down) {
            document.getElementById('sentiment-up').style.width = up + '%';
            document.getElementById('sentiment-down').style.width = down + '%';
            document.getElementById('sentiment-up-val').innerText = up + '%';
            document.getElementById('sentiment-down-val').innerText = down + '%';
        }

    } catch (e) { console.error("Erro API", e); }
}

async function forceUpdate() {
    const btn = document.getElementById('btn-update'); btn.innerHTML = '...';
    await fetchData(); await loadPriceCharts();
    btn.innerHTML = '<i class="fas fa-sync-alt"></i> Atualizar';
}

// --- CHARTS ---
async function loadPriceCharts() {
    loadChart('brl', 'chartBRL', 'chart-price-brl');
    loadChart('usd', 'chartUSD', 'chart-price-usd');
}

async function loadChart(curr, canvasId, priceElemId) {
    if(charts[curr]) charts[curr].destroy();
    const ctx = document.getElementById(canvasId).getContext('2d');
    try {
        const r = await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=${curr}&days=7`);
        const d = await r.json();
        const pricesArr = d.prices.filter((_, i) => i % 6 === 0);
        const labels = pricesArr.map(p => new Date(p[0]).toLocaleDateString('pt-BR'));
        const values = pricesArr.map(p => p[1]);
        
        document.getElementById(priceElemId).innerText = formatMoney(values[values.length-1], curr.toUpperCase());
        
        const color = values[values.length-1] >= values[0] ? '#00E096' : '#FF3B30';
        charts[curr] = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets: [{ data: values, borderColor: color, borderWidth: 2, pointRadius: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: false }, scales: { x: {display:false}, y: {position:'right', grid: {color:'rgba(255,255,255,0.05)'}, ticks: {color:'#555'} } } }
        });
    } catch(e){}
}

async function loadPortfolioChart() {
    const ctx = document.getElementById('portfolioChart').getContext('2d');
    if(charts['portfolio']) charts['portfolio'].destroy();
    // Simulação baseada no preço BRL
    try {
        const r = await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=brl&days=7&interval=daily`);
        const d = await r.json();
        const totalSats = transactions.reduce((acc, t) => t.type === 'buy' ? acc + t.satsVal : acc - t.satsVal, 0);
        
        const labels = d.prices.map(p => new Date(p[0]).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'}));
        const data = d.prices.map(p => (totalSats/100000000) * p[1]);
        
        charts['portfolio'] = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets: [{ data, borderColor: '#F7931A', backgroundColor: 'rgba(247,147,26,0.1)', fill: true, tension: 0.4, pointRadius: 3 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: false }, scales: { x: {display:false}, y: {display:false} } }
        });
    } catch(e){}
}

// --- TRANSACTIONS & LOGIC ---
function addTransaction(type) {
    const dateInput = document.getElementById('eco-date').value;
    const currency = document.getElementById('eco-currency').value;
    const fiatVal = parseFloat(document.getElementById('eco-fiat').value)||0;
    const satsVal = parseInt(document.getElementById('eco-sats').value)||0;
    
    if(!dateInput || (fiatVal===0 && satsVal===0)) return alert("Preencha data e valores.");
    
    // Formatar data visualmente
    const dateObj = new Date(dateInput);
    const formattedDate = dateObj.toLocaleDateString('pt-BR') + ' ' + dateObj.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});

    transactions.unshift({
        id: Date.now(), type, currency, fiatVal, satsVal, 
        desc: document.getElementById('eco-desc').value || (type==='buy'?'Aporte':'Saque'), 
        date: formattedDate // Salva a string exata
    });
    
    saveData(); renderHistory(); updateBalances();
    document.getElementById('eco-fiat').value=''; document.getElementById('eco-sats').value='';
    alert("Salvo!");
}

function removeTransaction(id) {
    if(confirm("Apagar?")) { transactions = transactions.filter(t => t.id !== id); saveData(); renderHistory(); updateBalances(); }
}

function updateBalances() {
    if(prices.brl === 0) return;
    
    const calc = (curr) => {
        let inv = 0, sats = 0;
        transactions.filter(t => t.currency === curr).forEach(t => { if(t.type === 'buy') { inv += t.fiatVal; sats += t.satsVal; } else { inv -= t.fiatVal; sats -= t.satsVal; } });
        return { inv, sats, val: (sats > 0 ? (sats/100000000)*prices[curr.toLowerCase()] : 0) };
    };

    const brl = calc('BRL');
    const usd = calc('USD'); // USDT labeled as USD internally for logic

    document.getElementById('dash-brl-current').innerText = formatMoney(brl.val, 'BRL');
    document.getElementById('dash-usd-current').innerText = formatMoney(usd.val, 'USD'); // Será exibido como USD/USDT

    // Hero Total em BRL
    const totalSats = brl.sats + usd.sats; 
    const totalVal = (totalSats / 100000000) * prices.brl;
    document.getElementById('hero-balance').innerText = formatMoney(totalVal, 'BRL');
    document.getElementById('hero-sats').innerText = totalSats.toLocaleString() + ' sats';

    // Ticket Médio BRL
    const brlBuys = transactions.filter(t => t.type === 'buy' && t.currency === 'BRL');
    if(brlBuys.length > 0) {
        const sumFiat = brlBuys.reduce((a,t)=>a+t.fiatVal,0);
        const sumSats = brlBuys.reduce((a,t)=>a+t.satsVal,0);
        const tm = (sumFiat/sumSats)*100000000;
        const el = document.getElementById('tm-value');
        el.innerText = formatMoney(tm, 'BRL');
        el.style.color = prices.brl > tm ? 'var(--success)' : 'var(--danger)';
    }
}

function renderHistory() {
    const l = document.getElementById('history-list'); l.innerHTML = '';
    transactions.slice(0,10).forEach(tx => {
        const color = tx.type==='buy'?'var(--success)':'var(--danger)';
        l.innerHTML += `<div style="display:flex; justify-content:space-between; align-items:center; padding:15px; background:rgba(255,255,255,0.05); margin-bottom:10px; border-radius:12px; border-left:3px solid ${color};"><div><div style="font-weight:bold; font-size:0.9rem;">${tx.desc}</div><div style="font-size:0.7rem; color:#888;">${tx.date}</div></div><div style="text-align:right;"><div style="color:${color}; font-weight:bold;">${tx.type==='buy'?'+':'-'} ${formatMoney(tx.fiatVal,tx.currency)}</div><div style="font-size:0.8rem; color:#888;">${tx.satsVal} sats</div><i class="fas fa-trash" onclick="removeTransaction(${tx.id})" style="font-size:0.8rem; color:#555; margin-top:5px; cursor:pointer;"></i></div></div>`;
    });
}

// --- UTILS ---
function togglePrivacy() {
    privacyMode = !privacyMode;
    document.getElementById('privacy-btn').innerHTML = privacyMode ? '<i class="fas fa-eye-slash" style="color:var(--danger)"></i>' : '<i class="fas fa-eye"></i>';
    document.querySelectorAll('.sensitive-data').forEach(el => el.classList.toggle('blur-effect', privacyMode));
}
function showCopyModal(addr, type) { 
    navigator.clipboard.writeText(addr);
    const m = document.getElementById('copy-modal');
    const badge = document.getElementById('modal-network-badge');
    const icon = document.getElementById('modal-network-icon');
    const inst = document.getElementById('modal-instruction');
    
    if(type==='btc') { badge.innerText='Rede Bitcoin'; icon.className='fab fa-bitcoin'; inst.innerText='Envie apenas BTC nativo.'; }
    if(type==='ln') { badge.innerText='Lightning Network'; icon.className='fas fa-bolt'; inst.innerText='Use carteira Lightning (LNURL).'; }
    if(type==='bsc') { badge.innerText='BNB Smart Chain'; icon.className='fas fa-cube'; inst.innerText='Selecione rede BEP20.'; }
    
    m.classList.add('active');
}
function closeModal() { document.getElementById('copy-modal').classList.remove('active'); }
function saveData() { localStorage.setItem('btc_transactions_v7', JSON.stringify(transactions)); }
function exportData() { const d = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transactions)); const a = document.createElement('a'); a.href=d; a.download="backup.json"; a.click(); }
function importData(inp) { const f=inp.files[0]; const r=new FileReader(); r.onload=e=>{ transactions=JSON.parse(e.target.result); saveData(); renderHistory(); updateBalances(); alert("Restaurado!"); }; r.readAsText(f); }
function formatMoney(v, c) { return v.toLocaleString('pt-BR', { style: 'currency', currency: c==='USDT'?'USD':c }); }
