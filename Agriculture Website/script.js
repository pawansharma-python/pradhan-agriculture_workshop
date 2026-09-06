
// === GLOBAL API URL === 
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzLwQazVpJIl_G8LLVw4D2lwPtbW6QJbaBTg-PMC4uHK6KxSTGvyWs1huRXmI-It6YKIw/exec";

AOS.init({ duration: 800, once: true, offset: 30 });

function parseNum(val) {
    if (val === null || val === undefined || val === '') return 0;
    return Number(val.toString().replace(/[^0-9.]/g, '')) || 0;
}

// ==========================================
// SMART ANTI-BLOCK WHATSAPP ENGINE
// ==========================================
function openWhatsApp(msg) {
    const phone = "919368330256"; // Explicitly using correct number
    const encodedMsg = encodeURIComponent(msg);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const url = isMobile
        ? `whatsapp://send?phone=${phone}&text=${encodedMsg}`
        : `https://web.whatsapp.com/send?phone=${phone}&text=${encodedMsg}`;

    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
// ==========================================

function openEMICalculator(price = 100000) {
    document.getElementById('emi-val-price').value = price;
    document.getElementById('emi-slide-price').value = price;
    calculateEMI();
    document.getElementById('emi-modal').style.display = 'flex';
}
function closeEMICalculator() { document.getElementById('emi-modal').style.display = 'none'; }

function syncEMI(field, source) {
    let valId = `emi-val-${field}`;
    let slideId = `emi-slide-${field}`;
    if (source === 'slide') document.getElementById(valId).value = document.getElementById(slideId).value;
    else document.getElementById(slideId).value = document.getElementById(valId).value;
    calculateEMI();
}

function calculateEMI() {
    const price = parseNum(document.getElementById('emi-val-price').value);
    const down = parseNum(document.getElementById('emi-val-down').value);
    const rate = parseNum(document.getElementById('emi-val-rate').value);
    const months = parseNum(document.getElementById('emi-val-month').value);

    const loanAmt = price - down;
    document.getElementById('cool-emi-principal').innerText = `₹${loanAmt > 0 ? loanAmt.toLocaleString('en-IN') : 0}`;

    if (loanAmt > 0 && rate > 0 && months > 0) {
        const r = (rate / 12) / 100;
        const emi = loanAmt * r * (Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1));
        const totalInterest = (emi * months) - loanAmt;

        document.getElementById('cool-emi-result').innerText = `₹${Math.round(emi).toLocaleString('en-IN')}`;
        document.getElementById('cool-emi-interest').innerText = `₹${Math.round(totalInterest).toLocaleString('en-IN')}`;
    } else {
        document.getElementById('cool-emi-result').innerText = `₹0`;
        document.getElementById('cool-emi-interest').innerText = `₹0`;
    }
}

function whatsappEMI() {
    const price = document.getElementById('emi-val-price').value;
    const down = document.getElementById('emi-val-down').value;
    const months = document.getElementById('emi-val-month').value;
    const emi = document.getElementById('cool-emi-result').innerText;
    const msg = `Namaste! 🙏\nMujhe Finance/EMI ki detail janni thi:\n🚜 Machine Price: ₹${price}\n💸 Down Payment: ₹${down}\n📅 EMI Tenure: ${months} Months\n💳 Approx EMI: ${emi}`;
    openWhatsApp(msg); // Uses Anti-block logic
}

function openEmiFromQuickView() {
    const pVal = parseNum(document.getElementById('qv-price').innerText);
    closeQuickView(); openEMICalculator(pVal);
}

let products = [];
let cart = JSON.parse(localStorage.getItem('paw_cart_final_deploy')) || [];
let currentFilteredList = [];
let displayedCount = 0;
const ITEMS_PER_PAGE = 6;

window.addEventListener('hashchange', handleRoute);
window.addEventListener('load', handleRoute);

function handleRoute() {
    const hash = window.location.hash;
    if (hash === '#admin' || hash === '#developer') {
        if (localStorage.getItem('paw_admin_auth') === 'true') showSection('admin');
        else showSection('login');
    } else { showSection('home'); }
}

function updateNavAuth() {
    const isAdmin = localStorage.getItem('paw_admin_auth') === 'true';
    document.getElementById('nav-admin').style.display = isAdmin ? 'block' : 'none';
    document.getElementById('nav-logout').style.display = isAdmin ? 'block' : 'none';
}

function login(e) {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    if (user === 'admin' && pass === 'pradhan123') {
        localStorage.setItem('paw_admin_auth', 'true');
        Swal.fire({ icon: 'success', title: 'Welcome Owner', confirmButtonColor: '#2E7D32' });
        updateNavAuth();
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        showSection('admin');
        window.location.hash = '#admin';
    } else { Swal.fire({ icon: 'error', title: 'Access Denied', text: 'Invalid Credentials.', confirmButtonColor: '#DD2C00' }); }
}

function logout() {
    localStorage.removeItem('paw_admin_auth');
    Swal.fire({ icon: 'info', title: 'Logged Out', confirmButtonColor: '#2E7D32', timer: 1500 });
    updateNavAuth(); window.location.hash = '';
}

function showSection(section) {
    document.getElementById('home-view').style.display = 'none';
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'none';

    if (section === 'home') {
        document.getElementById('home-view').style.display = 'block';
        if (products.length === 0) fetchProducts(); else handleFilterChange();
    } else if (section === 'login') {
        document.getElementById('login-view').style.display = 'block';
    } else if (section === 'admin') {
        document.getElementById('admin-panel').style.display = 'block';
        if (products.length === 0) fetchProducts(); else { renderAdminTable(); renderCRMTable(); }
    }
    window.scrollTo(0, 0); setTimeout(() => AOS.refresh(), 200);
    updateNavAuth(); updateCartUI();
}

function switchAdminTab(tabName, element) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    element.classList.add('active');
    document.getElementById('tab-' + tabName).classList.add('active');
}

function showLoader(show) { document.getElementById('loader').style.display = show ? 'flex' : 'none'; }

async function fetchProducts() {
    showLoader(true);
    try {
        const response = await fetch(SCRIPT_URL + "?action=get&t=" + new Date().getTime());
        const data = await response.json();

        if (Array.isArray(data)) {
            products = data.filter(row => row.name && row.name.trim() !== '').map(row => {
                return {
                    id: row.id || Date.now().toString(),
                    name: row.name || 'Unnamed Machine',
                    category: row.category || 'Other',
                    desc: row.desc || '',
                    image: row.image || 'https://images.unsplash.com/photo-1592982537447-6f2a6a0a3023?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                    price: parseNum(row.price),
                    discount: Math.min(parseNum(row.discount), 100),
                    badge: row.badge || ''
                };
            });
        }
        handleFilterChange();
        if (document.getElementById('admin-panel').style.display === 'block') { renderAdminTable(); renderCRMTable(); }
    } catch (error) { console.error("Error fetching data:", error); }
    showLoader(false); setTimeout(() => AOS.refresh(), 300);
}

function handleFilterChange() {
    const search = document.getElementById('search-input') ? document.getElementById('search-input').value.toLowerCase() : '';
    const cat = document.getElementById('category-filter') ? document.getElementById('category-filter').value : 'All';
    const sortType = document.getElementById('sort-filter') ? document.getElementById('sort-filter').value : 'newest';

    currentFilteredList = products.filter(p => {
        const matchS = (p.name || '').toLowerCase().includes(search) || (p.desc || '').toLowerCase().includes(search);
        const matchC = cat === 'All' ? true : p.category === cat;
        return matchS && matchC;
    });

    if (sortType === 'newest') currentFilteredList.sort((a, b) => b.id - a.id);
    else if (sortType === 'price-low') currentFilteredList.sort((a, b) => (a.price - (a.price * a.discount / 100)) - (b.price - (b.price * b.discount / 100)));
    else if (sortType === 'price-high') currentFilteredList.sort((a, b) => (b.price - (b.price * b.discount / 100)) - (a.price - (a.price * a.discount / 100)));

    displayedCount = 0;
    const container = document.getElementById('product-container');
    if (container) container.innerHTML = '';
    loadMoreProducts();
}

function loadMoreProducts() {
    const container = document.getElementById('product-container');
    const loadBtn = document.getElementById('load-more-container');
    if (!container) return;

    if (currentFilteredList.length === 0) {
        container.innerHTML = `<h3 style="grid-column:1/-1; text-align:center; color:#795548; padding:50px; font-size:1.8rem;"><i class="fas fa-tractor fa-2x" style="opacity:0.5; display:block; margin-bottom:15px;"></i>No machines match your search.</h3>`;
        if (loadBtn) loadBtn.style.display = 'none'; return;
    }

    const nextBatch = currentFilteredList.slice(displayedCount, displayedCount + ITEMS_PER_PAGE);

    nextBatch.forEach((product, index) => {
        let pPrice = parseNum(product.price);
        let pDisc = parseNum(product.discount);
        let finalPrice = pPrice - (pPrice * pDisc / 100);

        let badgeHTML = '';
        if (product.badge) badgeHTML += `<span class="badge-pro">${product.badge}</span>`;
        if (pDisc > 0) badgeHTML += `<span class="badge-discount">${pDisc}% OFF</span>`;

        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', (index * 50).toString());

        card.innerHTML = `
                    <div class="card-badges">${badgeHTML}</div>
                    <div class="img-container" onclick="openQuickView('${product.id}')">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="product-content">
                        <span class="cat-tag">${product.category}</span>
                        <h3 onclick="openQuickView('${product.id}')">${product.name}</h3>
                        <p style="color:var(--text-gray); font-size:1rem; margin-bottom:20px; font-weight:500;">${(product.desc || '').substring(0, 80)}...</p>
                        <div class="price-box">
                            <span class="new-price">₹${finalPrice.toLocaleString('en-IN')}</span>
                            ${pDisc > 0 ? `<span class="old-price">₹${pPrice.toLocaleString('en-IN')}</span>` : ''}
                        </div>
                        <div class="card-actions">
                            <button class="btn-add-cart" onclick="addToCart('${product.id}')"><i class="fas fa-cart-plus"></i> Add List</button>
                            <button class="btn-quick-view" onclick="openQuickView('${product.id}')" title="Quick View"><i class="far fa-eye"></i></button>
                        </div>
                    </div>
                `;
        container.appendChild(card);
    });

    displayedCount += nextBatch.length;
    if (loadBtn) loadBtn.style.display = displayedCount >= currentFilteredList.length ? 'none' : 'block';
    setTimeout(() => AOS.refresh(), 100);
}

function openQuickView(id) {
    const p = products.find(x => x.id == id);
    if (!p) return;
    let pPrice = parseNum(p.price);
    let pDisc = parseNum(p.discount);
    let finalP = pPrice - (pPrice * pDisc / 100);

    document.getElementById('qv-img').src = p.image;
    document.getElementById('qv-cat').innerText = p.category;
    document.getElementById('qv-name').innerText = p.name;
    document.getElementById('qv-price').innerHTML = `₹${finalP.toLocaleString('en-IN')} ${pDisc > 0 ? `<span style="font-size:1.4rem; color:#A0A0A0; text-decoration:line-through;">₹${pPrice.toLocaleString('en-IN')}</span>` : ''}`;
    document.getElementById('qv-desc').innerText = p.desc;

    const btnAdd = document.getElementById('qv-add-btn');
    btnAdd.onclick = function () { addToCart(p.id); closeQuickView(); };

    const btnEmi = document.getElementById('qv-emi-btn');
    btnEmi.onclick = function () { closeQuickView(); openEMICalculator(finalP); };

    document.getElementById('quick-view-modal').style.display = 'flex';
}

function closeQuickView() { document.getElementById('quick-view-modal').style.display = 'none'; }

function toggleCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer.classList.contains('open')) {
        drawer.classList.remove('open'); setTimeout(() => overlay.style.display = 'none', 300); overlay.style.opacity = '0';
    } else {
        overlay.style.display = 'block'; setTimeout(() => overlay.style.opacity = '1', 10); drawer.classList.add('open');
    }
}

function addToCart(id) {
    const p = products.find(x => x.id == id);
    const exists = cart.find(x => x.id == id);
    if (exists) { exists.qty += 1; }
    else {
        let pPrice = parseNum(p.price);
        let pDisc = parseNum(p.discount);
        let finalPrice = pPrice - (pPrice * pDisc / 100);
        cart.push({ ...p, finalPrice: finalPrice, qty: 1 });
    }
    localStorage.setItem('paw_cart_final_deploy', JSON.stringify(cart));
    updateCartUI();
    if (document.getElementById('admin-panel').style.display === 'block') renderCRMTable();
    Swal.fire({ toast: true, position: 'bottom-end', icon: 'success', title: 'Added to List', showConfirmButton: false, timer: 2000, background: '#2E7D32', color: '#fff' });
}

function removeCartItem(id) {
    cart = cart.filter(x => x.id != id);
    localStorage.setItem('paw_cart_final_deploy', JSON.stringify(cart));
    updateCartUI();
    if (document.getElementById('admin-panel').style.display === 'block') renderCRMTable();
}

function updateCartUI() {
    const container = document.getElementById('cart-items-container');
    const countBadge = document.getElementById('cart-count');
    const totalText = document.getElementById('cart-total-price');
    if (!container) return;

    container.innerHTML = '';
    let total = 0; let totalQty = 0;

    if (cart.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:40px 0; color:#795548; font-weight:800;"><i class="fas fa-tractor fa-3x" style="margin-bottom:15px; opacity:0.5;"></i><br>No machines in list.</div>`;
    } else {
        cart.forEach(item => {
            let iPrice = parseNum(item.finalPrice);
            total += (iPrice * item.qty); totalQty += item.qty;
            container.innerHTML += `
                        <div class="cart-item">
                            <img src="${item.image}">
                            <div style="flex-grow: 1;">
                                <h4 style="font-weight:900; color:var(--brown-dark); margin-bottom:5px;">${item.name}</h4>
                                <span class="cart-item-price">₹${iPrice.toLocaleString('en-IN')} x ${item.qty}</span><br>
                                <span style="color:#DD2C00; font-size:1rem; cursor:pointer; margin-top:10px; display:inline-block; font-weight:800;" onclick="removeCartItem('${item.id}')"><i class="fas fa-trash-alt"></i> Remove</span>
                            </div>
                        </div>
                    `;
        });
    }
    countBadge.innerText = totalQty;
    totalText.innerText = `₹${total.toLocaleString('en-IN')}`;
}

function checkoutWhatsApp() {
    if (cart.length === 0) { Swal.fire('Empty List', 'Please add machines first.', 'warning'); return; }
    let message = "राम राम जी! 🙏\n\nPradhan Agriculture, mujhe aapki website se in machines ki requirement hai:\n\n";
    let total = 0;
    cart.forEach((item, index) => {
        let iPrice = parseNum(item.finalPrice);
        message += `${index + 1}. *${item.name}*\n   🖼️ Photo Link: ${item.image}\n   📦 Qty: ${item.qty} | 💰 Price: ₹${(iPrice * item.qty).toLocaleString('en-IN')}\n\n`;
        total += (iPrice * item.qty);
    });
    message += `*Total Estimate: ₹${total.toLocaleString('en-IN')}*\n\nKripya mujhe iska aage ka process batayein.`;
    openWhatsApp(message);
}

function renderAdminTable() {
    const tbody = document.getElementById('admin-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    [...products].reverse().forEach(product => {
        let pPrice = parseNum(product.price);
        let pDisc = parseNum(product.discount);
        const tr = document.createElement('tr');
        tr.innerHTML = `
                    <td>
                        <div style="display:flex; align-items:center; gap:15px;">
                            <img src="${product.image}" width="70" style="border-radius:10px; height:60px; object-fit:cover;">
                            <div>
                                <strong style="color:var(--text-dark); font-size:1.1rem;">${product.name}</strong><br>
                                <span style="color:var(--bhagwa-main); font-size:0.9rem; font-weight:800;">${product.category} ${product.badge ? `| ${product.badge}` : ''}</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <strong style="font-size:1.3rem; color:var(--brown-dark);">₹${(pPrice - (pPrice * pDisc / 100)).toLocaleString('en-IN')}</strong>
                        ${pDisc > 0 ? `<br><span style="font-size:0.9rem; color:#A0A0A0; text-decoration:line-through;">₹${pPrice.toLocaleString('en-IN')}</span>` : ''}
                    </td>
                    <td>
                        <button class="btn btn-green" style="padding:12px 18px; border-radius:8px;" onclick="editProduct('${product.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="btn" style="background:#3E2723; color:white; padding:12px 18px; border-radius:8px;" onclick="deleteProduct('${product.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                    </td>
                `;
        tbody.appendChild(tr);
    });
}

function renderCRMTable() {
    const crmBody = document.getElementById('crm-table-body');
    if (!crmBody) return;
    crmBody.innerHTML = '';
    if (cart.length > 0) {
        cart.forEach(item => {
            let randomPhone = `98${Math.floor(Math.random() * 90 + 10)}XX XX${Math.floor(Math.random() * 90 + 10)}`;
            let msg = `Namaste! Aapne cart me ${item.name} add ki thi, kya main aapki madad kar sakta hu?`;
            crmBody.innerHTML += `
                        <tr>
                            <td><strong style="font-size:1.1rem; color:var(--brown-dark);">+91 ${randomPhone}</strong><br><small style="color:var(--primary-green); font-weight:800;">Active Session</small></td>
                            <td><strong style="color:var(--text-dark);">${item.name}</strong> <br>Qty: ${item.qty}</td>
                            <td><span style="background:#FFF9C4; color:#F57F17; padding:6px 12px; border-radius:30px; font-weight:800; font-size:0.85rem;">Follow-up Needed</span></td>
                            <td><button class="btn btn-green" style="padding:10px 20px; font-size:0.9rem;" onclick="openWhatsApp('${msg}')"><i class="fab fa-whatsapp"></i> Chat</button></td>
                        </tr>
                    `;
        });
    } else {
        crmBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:30px; font-size:1.2rem; color:var(--text-gray); font-weight:700;">No Active Leads Right Now. Cart is empty.</td></tr>`;
    }
}

function toggleImgInput() {
    const type = document.querySelector('input[name="img_type"]:checked').value;
    document.getElementById('p-image-url').style.display = type === 'url' ? 'block' : 'none';
    document.getElementById('p-image-file').style.display = type === 'file' ? 'block' : 'none';
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (e) {
        const img = new Image();
        img.src = e.target.result;
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1000;
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            document.getElementById('saved-base64-image').value = canvas.toDataURL('image/jpeg', 0.8);
        }
    };
}

document.getElementById('productForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const idInput = document.getElementById('edit-id').value;
    let image = document.querySelector('input[name="img_type"]:checked').value === 'url' ? document.getElementById('p-image-url').value : document.getElementById('saved-base64-image').value;

    if (!image && !idInput) { Swal.fire('Wait!', 'Please provide an image.', 'warning'); return; }

    const newId = idInput ? idInput : Date.now().toString();

    const productData = {
        id: newId,
        name: document.getElementById('p-name').value || 'Unknown',
        category: document.getElementById('p-category').value || 'Other',
        desc: document.getElementById('p-desc').value || '',
        price: parseNum(document.getElementById('p-price').value),
        discount: Math.min(parseNum(document.getElementById('p-discount').value), 100),
        badge: document.getElementById('p-badge').value || '',
        image: image,
        action: idInput ? 'update' : 'add'
    };

    if (idInput) {
        const index = products.findIndex(p => p.id == idInput);
        if (document.querySelector('input[name="img_type"]:checked').value === 'file' && !image && index > -1) { productData.image = products[index].image; }
        if (index > -1) products[index] = productData;
    } else {
        products.push(productData);
    }

    renderAdminTable();
    handleFilterChange();

    document.getElementById('productForm').reset();
    document.getElementById('edit-id').value = '';
    document.getElementById('saved-base64-image').value = '';
    document.querySelector('input[value="url"]').checked = true; toggleImgInput();
    document.getElementById('submit-btn').innerHTML = '<i class="fas fa-plus-circle"></i> Publish to Catalog';

    Swal.fire({ icon: 'success', title: 'Catalog Updated', text: 'Machine is now live.', confirmButtonColor: '#2E7D32', timer: 1500 });

    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(productData)
        });
    } catch (error) { console.error('Failed to sync to database', error); }
});

function editProduct(id) {
    const p = products.find(p => p.id == id);
    if (!p) return;
    document.getElementById('edit-id').value = p.id;
    document.getElementById('p-name').value = p.name;
    document.getElementById('p-category').value = p.category || 'Other';
    document.getElementById('p-desc').value = p.desc;
    document.getElementById('p-price').value = p.price || 0;
    document.getElementById('p-discount').value = p.discount || 0;
    document.getElementById('p-badge').value = p.badge || '';
    document.querySelector('input[value="url"]').checked = true; toggleImgInput();
    document.getElementById('p-image-url').value = p.image;

    document.getElementById('submit-btn').innerHTML = '<i class="fas fa-save"></i> Save Changes';
    window.scrollTo({ top: 300, behavior: 'smooth' });
}

async function deleteProduct(id) {
    Swal.fire({ title: 'Delete Machine?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#DD2C00', confirmButtonText: 'Delete' }).then(async (result) => {
        if (result.isConfirmed) {

            products = products.filter(p => p.id != id);
            renderAdminTable();
            handleFilterChange();
            Swal.fire({ title: 'Deleted!', icon: 'success', timer: 1500, showConfirmButton: false });

            try {
                await fetch(SCRIPT_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({ action: 'delete', id: id })
                });
            } catch (error) { console.error('Failed to delete from DB', error); }
        }
    });
}