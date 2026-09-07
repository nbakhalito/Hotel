import { getRooms } from './data.js';
import { money } from './app.js';

const roomList = document.querySelector('#room-list');
const emptyMessage = document.querySelector('#room-empty');
const filterForm = document.querySelector('#room-filter');
const guestFilter = document.querySelector('#room-guests');
const typeFilter = document.querySelector('#room-type');

let rooms = [];

function roomCard(room) {
  return `
    <article class="card-luxury img-zoom">
      <img src="${room.images?.[0] || ''}" alt="${room.name}" class="h-72 w-full object-cover">
      <div class="p-7">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs uppercase tracking-widest text-amber-600">${room.category}</p>
            <h3 class="mt-2 font-serif text-3xl font-bold">${room.name}</h3>
          </div>
          <span class="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
            ${room.is_available ? 'Available' : 'Unavailable'}
          </span>
        </div>
        <p class="mt-4 text-sm leading-relaxed text-stone-600">${room.description}</p>
        <div class="mt-5 flex flex-wrap gap-2 text-xs text-stone-500">
          ${(room.amenities || []).slice(0, 4).map((amenity) => `<span class="rounded-full bg-stone-100 px-3 py-1">${amenity}</span>`).join('')}
        </div>
        <div class="mt-7 flex items-center justify-between">
          <div><strong class="text-lg">${money(room.price_per_night)}</strong><span class="text-sm text-stone-500"> / night</span></div>
          <div class="flex gap-2">
            <button data-room-details="${room.id}" class="rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold hover:border-amber-600 hover:text-amber-700">Details</button>
            <a href="booking.html?room=${room.slug}" class="btn-primary px-4 py-2 text-sm">Book</a>
          </div>
        </div>
      </div>
    </article>`;
}

function showRoomDetails(room) {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal-panel p-7">
      <button class="float-right text-2xl" aria-label="Close">×</button>
      <img src="${room.images?.[0] || ''}" alt="${room.name}" class="h-72 w-full rounded-xl object-cover">
      <p class="section-subtitle mt-7">${room.category}</p>
      <h2 class="section-title">${room.name}</h2>
      <p class="mt-4 leading-relaxed text-stone-600">${room.description}</p>
      <div class="mt-6 grid grid-cols-2 gap-3 text-sm text-stone-600">
        <span>Guests: ${room.max_guests}</span>
        <span>Bed: ${room.bed_type}</span>
        <span>Size: ${room.room_size}</span>
        <span>Rate: ${money(room.price_per_night)} / night</span>
      </div>
      <a href="booking.html?room=${room.slug}" class="btn-primary mt-7">Book this room</a>
    </div>`;
  document.body.append(modal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal || event.target.closest('button')) modal.remove();
  });
}

function renderRooms() {
  const guests = Number(guestFilter.value || 0);
  const type = typeFilter.value;
  const visibleRooms = rooms.filter((room) =>
    (!guests || room.max_guests >= guests) && (!type || room.category === type)
  );

  roomList.innerHTML = visibleRooms.map(roomCard).join('');
  emptyMessage.classList.toggle('hidden', visibleRooms.length > 0);

  roomList.querySelectorAll('[data-room-details]').forEach((button) => {
    button.addEventListener('click', () => {
      const room = rooms.find((item) => item.id === button.dataset.roomDetails);
      if (room) showRoomDetails(room);
    });
  });
}

export async function initRooms() {
  const params = new URLSearchParams(location.search);
  guestFilter.value = params.get('guests') || '';
  rooms = await getRooms();

  [...new Set(rooms.map((room) => room.category))].forEach((category) => {
    typeFilter.insertAdjacentHTML('beforeend', `<option value="${category}">${category}</option>`);
  });
  typeFilter.value = params.get('type') || '';

  filterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    renderRooms();
  });

  renderRooms();
}

