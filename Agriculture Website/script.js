
// === GLOBAL API URL - PASTE GOOGLE SHEET WEB APP URL HERE ===
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx-tkbgPa8sQ_iXWj3cr5zKI8jEX2W3t-aK8YLNvcdpY_tPP3-6sgi3vnilHa5xnBzpcQ/exec";

AOS.init({ duration: 800, once: true, offset: 50 });

let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.slider-dot');
function setSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    currentSlide = index;
}
setInterval(() => { setSlide((currentSlide + 1) % slides.length); }, 4000);

function openEMICalculator(price = 100000) {
    document.getElementById('emi-price').value = price;
    calculateEMI();
    document.getElementById('emi-modal').style.display = 'flex';
}

function closeEMICalculator() {
    document.getElementById('emi-modal').style.display = 'none';
}

function calculateEMI() {
    const price = parseFloat(document.getElementById('emi-price').value) || 0;
    const down = parseFloat(document.getElementById('emi-down').value) || 0;
    const rate = parseFloat(document.getElementById('emi-rate').value) || 0;
    const months = parseFloat(document.getElementById('emi-months').value) || 0;
    const loanAmt = price - down;
    document.getElementById('emi-loan-amt').innerText = `₹${loanAmt > 0 ? loanAmt.toLocaleString() : 0}`;
    if (loanAmt > 0 && rate > 0 && months > 0) {
        const r = (rate / 12) / 100;
        const emi = loanAmt * r * (Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1));
        document.getElementById('emi-result').innerText = `₹${Math.round(emi).toLocaleString()}`;
    } else {
        document.getElementById('emi-result').innerText = `₹0`;
    }
}

function whatsappEMI() {
    const price = document.getElementById('emi-price').value;
    const down = document.getElementById('emi-down').value;
    const months = document.getElementById('emi-months').value;
    const emi = document.getElementById('emi-result').innerText;
    const msg = `Namaste! 🙏\nMujhe Finance/EMI ki detail janni thi:\n\n🚜 Machine Price: ₹${price}\n💸 Down Payment: ₹${down}\n📅 EMI Tenure: ${months} Months\n💳 Approx EMI: ${emi}\n\nKripya guide karein ki loan kaise hoga?`;
    window.open(`https://wa.me/919368330256?text=${encodeURIComponent(msg)}`, '_blank');
}

let products = [];
let cart = JSON.parse(localStorage.getItem('paw_cart')) || [];
let currentFilteredList = [];
let displayedCount = 0;
const ITEMS_PER_PAGE = 6;

window.addEventListener('hashchange', handleRoute);
window.addEventListener('load', handleRoute);

function handleRoute() {
    const hash = window.location.hash;
    if (hash === '#admin' || hash === '#developer') {
        if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
            showSection('admin');
        } else {
            showSection('login');
        }
    } else {
        showSection('home');
    }
}

function updateNavAuth() {
    const isAdmin = sessionStorage.getItem('isAdminLoggedIn') === 'true';
    document.getElementById('nav-admin').style.display = isAdmin ? 'block' : 'none';
    document.getElementById('nav-logout').style.display = isAdmin ? 'block' : 'none';
}

function login() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    if (user === 'admin' && pass === 'pradhan123') {
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        Swal.fire({ icon: 'success', title: 'Welcome Owner', confirmButtonColor: '#2E7D32' });
        updateNavAuth();
        window.location.hash = '#admin';
        document.getElementById('username').value = ''; document.getElementById('password').value = '';
    } else {
        Swal.fire({ icon: 'error', title: 'Access Denied', text: 'Invalid Credentials.', confirmButtonColor: '#DD2C00' });
    }
}

function logout() {
    sessionStorage.removeItem('isAdminLoggedIn');
    Swal.fire({ icon: 'info', title: 'Logged Out', confirmButtonColor: '#2E7D32', timer: 1500 });
    updateNavAuth();
    window.location.hash = '';
}

function showSection(section) {
    document.getElementById('home-view').style.display = 'none';
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'none';

    if (section === 'home') {
        document.getElementById('home-view').style.display = 'block';
        fetchProducts();
    } else if (section === 'login') {
        document.getElementById('login-view').style.display = 'block';
    } else if (section === 'admin') {
        document.getElementById('admin-panel').style.display = 'block';
        fetchProducts();
    }
    window.scrollTo(0, 0);
    setTimeout(() => AOS.refresh(), 200);
    updateNavAuth();
    updateCartUI();
}

function switchAdminTab(tabName, element) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    element.classList.add('active');
    document.getElementById('tab-' + tabName).classList.add('active');
}

function showLoader(show) {
    document.getElementById('loader').style.display = show ? 'flex' : 'none';
}

// Fetch data from Google Sheet
async function fetchProducts() {
    if (SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE") {
        // Fallback to local default data if API is not set
        products = [
            { id: 1, name: "Premium Red Seed Drill (11 Tyner)", category: "Seed Drill", badge: "Best Seller", desc: "Heavy-duty Seed Drill for precise sowing and fertilizing.", image: "https://images.unsplash.com/photo-1628543105335-512ce24e8371?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", price: 65000, discount: 10 },
            { id: 2, name: "Advanced Paddy Cleaner", category: "Paddy Cleaner", badge: "Top Rated", desc: "Baba Ahejati Pradhan Paddy Cleaner. Heavy motor to separate dust and stones.", image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", price: 45000, discount: 5 }
        ];
        handleFilterChange();
        if (document.getElementById('admin-panel').style.display === 'block') renderAdminTable();
        return;
    }

    showLoader(true);
    try {
        const response = await fetch(SCRIPT_URL + "?action=get");
        const data = await response.json();
        products = data || [];
        handleFilterChange();
        if (document.getElementById('admin-panel').style.display === 'block') renderAdminTable();
    } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire('Network Error', 'Could not load machines from database.', 'error');
    }
    showLoader(false);
}

function handleFilterChange() {
    const search = document.getElementById('search-input') ? document.getElementById('search-input').value.toLowerCase() : '';
    const cat = document.getElementById('category-filter') ? document.getElementById('category-filter').value : 'All';
    const sortType = document.getElementById('sort-filter') ? document.getElementById('sort-filter').value : 'newest';

    currentFilteredList = products.filter(p => {
        const matchS = p.name.toLowerCase().includes(search) || p.desc.toLowerCase().includes(search);
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
        container.innerHTML = `<h3 style="grid-column:1/-1; text-align:center; color:#795548; padding:50px; font-size:1.5rem;"><i class="fas fa-tractor fa-2x" style="opacity:0.5; display:block; margin-bottom:15px;"></i>No machines match your criteria.</h3>`;
        if (loadBtn) loadBtn.style.display = 'none'; return;
    }

    const nextBatch = currentFilteredList.slice(displayedCount, displayedCount + ITEMS_PER_PAGE);

    nextBatch.forEach((product, index) => {
        let finalPrice = product.price - ((product.price * product.discount) / 100);
        let badgeHTML = '';
        if (product.badge) badgeHTML += `<span class="badge-pro">${product.badge}</span>`;
        if (product.discount > 0) badgeHTML += `<span class="badge-discount">${product.discount}% OFF</span>`;

        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.animation = `fadeUp 0.6s ease-out forwards`;
        card.style.animationDelay = `${index * 0.1}s`;
        card.style.opacity = '0';

        card.innerHTML = `
    <div class="card-badges">${badgeHTML}</div>
    <div class="img-container" onclick="openQuickView(${product.id})">
        <img src="${product.image}" alt="${product.name}">
    </div>
    <div class="product-content">
        <span class="cat-tag">${product.category}</span>
        <h3 onclick="openQuickView(${product.id})">${product.name}</h3>
        <p style="color:var(--text-gray); font-size:0.95rem; margin-bottom:20px; font-weight:500;">${product.desc.substring(0, 80)}...</p>
        <div class="price-box">
            <span class="new-price">₹${finalPrice.toLocaleString()}</span>
            ${product.discount > 0 ? `<span class="old-price">₹${product.price.toLocaleString()}</span>` : ''}
        </div>
        <div class="card-actions">
            <button class="btn-add-cart" onclick="addToCart(${product.id})"><i class="fas fa-cart-plus"></i> Add List</button>
            <button class="btn-quick-view" onclick="openQuickView(${product.id})" title="Quick View"><i class="far fa-eye"></i></button>
        </div>
    </div>
    `;
        container.appendChild(card);
    });

    displayedCount += nextBatch.length;
    if (loadBtn) loadBtn.style.display = displayedCount >= currentFilteredList.length ? 'none' : 'block';

    if (!document.getElementById('dynamic-anim')) {
        const style = document.createElement('style'); style.id = 'dynamic-anim';
        style.innerHTML = `@keyframes fadeUp {from {opacity: 0; transform: translateY(30px); } to {opacity: 1; transform: translateY(0); } }`;
        document.head.appendChild(style);
    }
}

function openQuickView(id) {
    const p = products.find(x => x.id == id);
    let finalP = p.price - ((p.price * p.discount) / 100);
    document.getElementById('qv-img').src = p.image;
    document.getElementById('qv-cat').innerText = p.category;
    document.getElementById('qv-name').innerText = p.name;
    document.getElementById('qv-price').innerHTML = `₹${finalP.toLocaleString()} ${p.discount > 0 ? `<span style="font-size:1.2rem; color:#A0A0A0; text-decoration:line-through;">₹${p.price.toLocaleString()}</span>` : ''}`;
    document.getElementById('qv-desc').innerText = p.desc;

    const btn = document.getElementById('qv-add-btn');
    btn.onclick = function () { addToCart(p.id); closeQuickView(); };

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
        let finalPrice = p.price - ((p.price * p.discount) / 100);
        cart.push({ ...p, finalPrice: finalPrice, qty: 1 });
    }
    localStorage.setItem('paw_cart', JSON.stringify(cart));
    updateCartUI();
    Swal.fire({ toast: true, position: 'bottom-end', icon: 'success', title: 'Machine Added to List', showConfirmButton: false, timer: 2000, background: '#2E7D32', color: '#fff' });
}

function removeCartItem(id) {
    cart = cart.filter(x => x.id != id);
    localStorage.setItem('paw_cart', JSON.stringify(cart));
    updateCartUI();
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
            total += (item.finalPrice * item.qty); totalQty += item.qty;
            container.innerHTML += `
                        <div class="cart-item">
                            <img src="${item.image}">
                            <div style="flex-grow: 1;">
                                <h4 style="font-weight:900; color:var(--brown-dark); margin-bottom:5px;">${item.name}</h4>
                                <span class="cart-item-price">₹${item.finalPrice.toLocaleString()} x ${item.qty}</span><br>
                                <span style="color:#DD2C00; font-size:0.9rem; cursor:pointer; margin-top:10px; display:inline-block; font-weight:800;" onclick="removeCartItem(${item.id})"><i class="fas fa-trash-alt"></i> Remove</span>
                            </div>
                        </div>
                    `;
        });
    }
    countBadge.innerText = totalQty;
    totalText.innerText = `₹${total.toLocaleString()}`;
}

function checkoutWhatsApp() {
    if (cart.length === 0) { Swal.fire('Empty List', 'Please add machines first.', 'warning'); return; }
    let message = "राम राम जी! 🙏\n\nPradhan Agriculture, mujhe aapki website se in machines ki requirement hai:\n\n";
    let total = 0;
    cart.forEach((item, index) => {
        message += `${index + 1}. *${item.name}*\n   🖼️ *Photo Link:* ${item.image}\n   📦 Qty: ${item.qty} | 💰 Price: ₹${(item.finalPrice * item.qty).toLocaleString()}\n\n`;
        total += (item.finalPrice * item.qty);
    });
    message += `*Total Estimate: ₹${total.toLocaleString()}*\n\nKripya mujhe iska aage ka process batayein.`;
    window.open(`https://wa.me/919368330256?text=${encodeURIComponent(message)}`, '_blank');
}

function renderAdminTable() {
    const tbody = document.getElementById('admin-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    [...products].reverse().forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
    <td>
        <div style="display:flex; align-items:center; gap:15px;">
            <img src="${product.image}" width="70" style="border-radius:10px; height:60px; object-fit:cover;">
                <div>
                    <strong style="color:var(--text-dark); font-size:1.1rem;">${product.name}</strong><br>
                        <span style="color:var(--bhagwa-main); font-size:0.85rem; font-weight:800;">${product.category} ${product.badge ? `| ${product.badge}` : ''}</span>
                </div>
        </div>
    </td>
    <td>
        <strong style="font-size:1.2rem; color:var(--brown-dark);">₹${(product.price - (product.price * product.discount / 100)).toLocaleString()}</strong>
        ${product.discount > 0 ? `<br><span style="font-size:0.85rem; color:#A0A0A0; text-decoration:line-through;">₹${product.price.toLocaleString()}</span>` : ''}
    </td>
    <td>
        <button class="btn btn-green" style="padding:10px 15px; border-radius:8px;" onclick="editProduct(${product.id})" title="Edit"><i class="fas fa-edit"></i></button>
        <button class="btn" style="background:#3E2723; color:white; padding:10px 15px; border-radius:8px;" onclick="deleteProduct(${product.id})" title="Delete"><i class="fas fa-trash"></i></button>
    </td>
    `;
        tbody.appendChild(tr);
    });
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

// Add/Update to Google Sheet API
document.getElementById('productForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    if (SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE") {
        Swal.fire('API Missing', 'Please paste the Google Apps Script Web App URL in SCRIPT_URL variable at the top of JS code to make database live.', 'warning');
        return;
    }

    const idInput = document.getElementById('edit-id').value;
    let image = document.querySelector('input[name="img_type"]:checked').value === 'url' ? document.getElementById('p-image-url').value : document.getElementById('saved-base64-image').value;

    if (!image && !idInput) { Swal.fire('Wait!', 'Please provide an image.', 'warning'); return; }

    // Generate unique ID based on time if it's new
    const newId = idInput ? idInput : Date.now();

    if (idInput) {
        const index = products.findIndex(p => p.id == idInput);
        if (document.querySelector('input[name="img_type"]:checked').value === 'file' && !image) { image = products[index].image; }
    }

    const productData = {
        id: newId,
        name: document.getElementById('p-name').value,
        category: document.getElementById('p-category').value,
        desc: document.getElementById('p-desc').value,
        price: parseFloat(document.getElementById('p-price').value),
        discount: parseFloat(document.getElementById('p-discount').value) || 0,
        badge: document.getElementById('p-badge').value,
        image: image,
        action: idInput ? 'update' : 'add'
    };

    showLoader(true);
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // 'text/plain' bypasses strict CORS preflight
            body: JSON.stringify(productData)
        });

        await fetchProducts(); // Refresh list from sheet

        this.reset();
        document.getElementById('edit-id').value = '';
        document.getElementById('saved-base64-image').value = '';
        document.querySelector('input[value="url"]').checked = true; toggleImgInput();

        Swal.fire({ icon: 'success', title: 'Catalog Updated', confirmButtonColor: '#2E7D32', timer: 1500 });
    } catch (error) {
        Swal.fire('Error', 'Failed to save to database. Check connection or API.', 'error');
    }
    showLoader(false);
});

function editProduct(id) {
    const p = products.find(p => p.id == id);
    document.getElementById('edit-id').value = p.id;
    document.getElementById('p-name').value = p.name;
    document.getElementById('p-category').value = p.category || 'Other';
    document.getElementById('p-desc').value = p.desc;
    document.getElementById('p-price').value = p.price;
    document.getElementById('p-discount').value = p.discount;
    document.getElementById('p-badge').value = p.badge || '';
    document.querySelector('input[value="url"]').checked = true; toggleImgInput();
    document.getElementById('p-image-url').value = p.image;

    document.getElementById('submit-btn').innerHTML = '<i class="fas fa-save"></i> Save Changes';
    window.scrollTo({ top: 300, behavior: 'smooth' });
}

async function deleteProduct(id) {
    Swal.fire({ title: 'Delete Machine?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#DD2C00', confirmButtonText: 'Delete' }).then(async (result) => {
        if (result.isConfirmed) {
            if (SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE") return;

            showLoader(true);
            try {
                await fetch(SCRIPT_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({ action: 'delete', id: id })
                });
                await fetchProducts();
                Swal.fire({ title: 'Deleted!', icon: 'success', timer: 1500, showConfirmButton: false });
            } catch (error) {
                Swal.fire('Error', 'Failed to delete.', 'error');
            }
            showLoader(false);
        }
    });
}
