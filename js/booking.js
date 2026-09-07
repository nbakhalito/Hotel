import { getRooms, insertRecord } from './data.js';
import { money, nights, ref, toast } from './app.js';

const form = document.querySelector('#booking-form');
const roomSelect = document.querySelector('#booking-room');
const guestSelect = document.querySelector('#booking-guests');
const checkIn = document.querySelector('#booking-checkin');
const checkOut = document.querySelector('#booking-checkout');
const message = document.querySelector('#booking-message');
const summaryRoom = document.querySelector('#summary-room');
const summaryIn = document.querySelector('#summary-in');
const summaryOut = document.querySelector('#summary-out');
const summaryGuests = document.querySelector('#summary-guests');
const summaryNights = document.querySelector('#summary-nights');
const summaryTotal = document.querySelector('#summary-total');

let rooms = [];

function selectedRoom() {
  return rooms.find((room) => room.slug === roomSelect.value) || rooms[0];
}

function updateSummary() {
  const room = selectedRoom();
  const stayNights = checkIn.value && checkOut.value ? nights(checkIn.value, checkOut.value) : 0;

  if (!room) return;
  summaryRoom.textContent = room.name;
  summaryIn.textContent = checkIn.value || 'Choose a date';
  summaryOut.textContent = checkOut.value || 'Choose a date';
  summaryGuests.textContent = guestSelect.value;
  summaryNights.textContent = stayNights || '-';
  summaryTotal.textContent = money(room.price_per_night * stayNights);
}

function populateRooms(initialSlug) {
  roomSelect.innerHTML = rooms.map((room) => `
    <option value="${room.slug}" ${room.slug === initialSlug ? 'selected' : ''}>
      ${room.name} - ${money(room.price_per_night)}/night
    </option>`).join('');
}

async function submitBooking(event) {
  event.preventDefault();
  message.textContent = '';
  updateSummary();

  if (new Date(checkOut.value) <= new Date(checkIn.value)) {
    message.textContent = 'Check-out must be after check-in.';
    message.className = 'mt-4 text-sm text-red-700';
    return;
  }

  const room = selectedRoom();
  const formData = new FormData(form);
  const stayNights = nights(checkIn.value, checkOut.value);
  const reference = ref('LRINA');
  const payload = {
    reference_number: reference,
    room_id: room.id,
    room_name: room.name,
    full_name: formData.get('full_name'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    num_guests: Number(formData.get('guests')),
    check_in: checkIn.value,
    check_out: checkOut.value,
    nights: stayNights,
    special_requests: formData.get('special_requests'),
    status: 'Pending',
    payment_status: 'Pending',
    total_amount: room.price_per_night * stayNights,
  };

  try {
    const result = await insertRecord('bookings', payload);
    localStorage.setItem(`lrina-bookings-${reference}`, JSON.stringify(result));
    message.className = 'mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-800';
    message.innerHTML = `Booking request received. Your reference is <strong>${reference}</strong>. We will contact you to confirm availability. <a class="underline" href="my-booking.html?ref=${reference}">View booking</a>`;
    form.querySelector('button[type="submit"]').disabled = true;
  } catch {
    toast('We could not submit the booking. Please try WhatsApp or call us.');
  }
}

export async function initBooking() {
  const params = new URLSearchParams(location.search);
  rooms = await getRooms();
  populateRooms(params.get('room') || rooms[0]?.slug);
  guestSelect.value = params.get('guests') || '1';
  checkIn.value = params.get('checkin') || '';
  checkOut.value = params.get('checkout') || '';

  [roomSelect, guestSelect, checkIn, checkOut].forEach((field) => {
    field.addEventListener('input', updateSummary);
  });
  form.addEventListener('submit', submitBooking);
  updateSummary();
}
