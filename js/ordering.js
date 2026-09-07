import { getMenu, insertRecord } from './data.js';
import { money, ref, toast } from './app.js';

const menuList = document.querySelector('#menu-list');
const categories = document.querySelector('#menu-categories');
const cartButton = document.querySelector('#cart-button');

let menu = [];
let cart = JSON.parse(localStorage.getItem('lrina-cart') || '[]');
let selectedCategory = 'All';

function saveCart() {
  localStorage.setItem('lrina-cart', JSON.stringify(cart));
}

function cartTotal() {
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const serviceCharge = Math.round(subtotal * 0.1);
  return { subtotal, serviceCharge, total: subtotal + serviceCharge };
}

function renderCategories() {
  const categoryNames = ['All', ...new Set(menu.map((item) => item.category))];
  categories.innerHTML = categoryNames.map((category) => `
    <button data-category="${category}" class="rounded-full px-5 py-2 text-sm font-semibold ${selectedCategory === category ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-700'}" type="button">
      ${category}
    </button>`).join('');

  categories.querySelectorAll('[data-category]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedCategory = button.dataset.category;
      renderCategories();
      renderMenu();
    });
  });
}

function renderMenu() {
  const visibleItems = menu.filter((item) =>
    item.is_available !== false && (selectedCategory === 'All' || item.category === selectedCategory)
  );

  menuList.innerHTML = visibleItems.map((item) => `
    <article class="card-luxury img-zoom">
      <img src="${item.image_url || ''}" alt="${item.name}" class="h-56 w-full object-cover">
      <div class="p-6">
        <p class="text-xs uppercase tracking-widest text-amber-600">${item.category}</p>
        <h3 class="mt-2 font-serif text-3xl font-bold">${item.name}</h3>
        <p class="mt-2 min-h-10 text-sm text-stone-600">${item.description || ''}</p>
        <div class="mt-5 flex items-center justify-between">
          <strong>${money(item.price)}</strong>
          <button data-add-item="${item.id}" class="btn-primary px-4 py-2 text-sm" type="button">Add</button>
        </div>
      </div>
    </article>`).join('');

  menuList.querySelectorAll('[data-add-item]').forEach((button) => {
    button.addEventListener('click', () => addToCart(button.dataset.addItem));
  });
}

function addToCart(itemId) {
  const item = menu.find((menuItem) => menuItem.id === itemId);
  if (!item) return;
  const existing = cart.find((cartItem) => cartItem.id === itemId);
  if (existing) existing.quantity += 1;
  else cart.push({ id: item.id, name: item.name, price: item.price, quantity: 1 });
  saveCart();
  updateCartButton();
  toast(`${item.name} added to your cart`);
}

function updateCartButton() {
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const { total } = cartTotal();
  cartButton.textContent = `Cart (${itemCount}) · ${money(total)}`;
}

function openCart() {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  renderCartModal(modal);
  document.body.append(modal);
}

function renderCartModal(modal) {
  const { subtotal, serviceCharge, total } = cartTotal();
  modal.innerHTML = `
    <div class="modal-panel p-7">
      <button class="float-right text-2xl" aria-label="Close" type="button">×</button>
      <p class="section-subtitle">Your order</p>
      <h2 class="section-title">Cart</h2>
      <div class="mt-6 space-y-4">
        ${cart.length ? cart.map((item) => `
          <div class="flex items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div><strong>${item.name}</strong><p class="text-sm text-stone-500">${money(item.price)} each</p></div>
            <div class="flex items-center gap-2">
              <button data-decrease="${item.id}" class="h-8 w-8 rounded-full bg-stone-100" type="button">−</button>
              <span>${item.quantity}</span>
              <button data-increase="${item.id}" class="h-8 w-8 rounded-full bg-stone-100" type="button">+</button>
              <button data-remove="${item.id}" class="ml-2 text-sm text-red-600" type="button">Remove</button>
            </div>
          </div>`).join('') : '<p class="text-stone-500">Your cart is empty.</p>'}
      </div>
      ${cart.length ? `
        <div class="mt-7 border-t border-stone-100 pt-5">
          <p class="flex justify-between text-sm">Subtotal <span>${money(subtotal)}</span></p>
          <p class="flex justify-between text-sm">Service charge <span>${money(serviceCharge)}</span></p>
          <p class="mt-3 flex justify-between font-semibold">Total <span>${money(total)}</span></p>
          <form id="order-form" class="mt-7 space-y-4">
            <input name="customer_name" required placeholder="Your name" class="input-luxury">
            <input name="customer_phone" required placeholder="Phone number" class="input-luxury">
            <input name="room_number" placeholder="Room number" class="input-luxury">
            <button class="btn-primary w-full justify-center" type="submit">Submit order request</button>
          </form>
        </div>` : ''}
    </div>`;

  modal.querySelector('button').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (event) => {
    if (event.target === modal) modal.remove();
  });
  modal.querySelectorAll('[data-increase]').forEach((button) => button.addEventListener('click', () => changeQuantity(button.dataset.increase, 1, modal)));
  modal.querySelectorAll('[data-decrease]').forEach((button) => button.addEventListener('click', () => changeQuantity(button.dataset.decrease, -1, modal)));
  modal.querySelectorAll('[data-remove]').forEach((button) => button.addEventListener('click', () => removeFromCart(button.dataset.remove, modal)));
  modal.querySelector('#order-form')?.addEventListener('submit', submitOrder);
}

function changeQuantity(itemId, amount, modal) {
  const item = cart.find((cartItem) => cartItem.id === itemId);
  if (!item) return;
  item.quantity += amount;
  cart = cart.filter((cartItem) => cartItem.quantity > 0);
  saveCart();
  updateCartButton();
  renderCartModal(modal);
}

function removeFromCart(itemId, modal) {
  cart = cart.filter((item) => item.id !== itemId);
  saveCart();
  updateCartButton();
  renderCartModal(modal);
}

async function submitOrder(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const { subtotal, serviceCharge, total } = cartTotal();
  const reference = ref('ORD');
  const payload = {
    reference_number: reference,
    room_number: formData.get('room_number'),
    customer_name: formData.get('customer_name'),
    customer_phone: formData.get('customer_phone'),
    items: cart,
    subtotal,
    service_charge: serviceCharge,
    total,
    status: 'Order Received',
    payment_status: 'Pending',
  };

  try {
    const result = await insertRecord('orders', payload);
    localStorage.setItem(`lrina-orders-${reference}`, JSON.stringify(result));
    cart = [];
    saveCart();
    event.currentTarget.closest('.modal-backdrop').remove();
    updateCartButton();
    toast(`Order received. Reference: ${reference}`);
  } catch {
    toast('We could not submit the order. Please try WhatsApp.');
  }
}

export async function initOrdering() {
  menu = await getMenu();
  renderCategories();
  renderMenu();
  updateCartButton();
  cartButton.addEventListener('click', openCart);
}
