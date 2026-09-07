import { findByReference, getSettings, updateRecord } from './data.js';
import { money, toast } from './app.js';

export async function initAbout() {
  return true;
}

export async function initContact() {
  const settings = await getSettings();
  const phone = settings.phone_display || '08127057823';
  const whatsapp = settings.whatsapp_number || '2348127057823';
  const email = settings.email || 'Lrinahomesluxuryapartment8@gmail.com';
  const address = settings.address || 'No 2 Francis Omojiade Crescent, off Howard Edafe Street, Eti-Osa, Lagos 105102, Lagos, Nigeria';
  const details = document.querySelector('#contact-details');

  details.innerHTML = `<p><strong class="block text-stone-900">Address</strong>${address}</p><p><strong class="block text-stone-900">Phone</strong><a href="tel:${phone}" class="text-amber-700">${phone}</a></p><p><strong class="block text-stone-900">Email</strong><a href="mailto:${email}" class="text-amber-700">${email}</a></p><div><a href="https://wa.me/${whatsapp}" target="_blank" rel="noopener" class="btn-whatsapp">Chat on WhatsApp</a><a href="https://www.google.com/maps/search/?api=1&query=GCW2%2B5V%20Lagos" target="_blank" rel="noopener" class="btn-dark ml-2">Get directions</a></div>`;
  document.querySelector('#contact-form').action = `mailto:${email}`;
  document.querySelector('#contact-form').method = 'post';
  document.querySelector('#contact-form').enctype = 'text/plain';
}

export function initLookup(type) {
  const isBooking = type === 'booking';
  const reference = new URLSearchParams(location.search).get('ref') || '';
  const app = document.querySelector('#app');
  app.innerHTML = `<section class="relative flex h-[360px] items-end bg-cover bg-center" style="background-image:url('${isBooking ? 'https://images.pexels.com/photos/8134775/pexels-photo-8134775.jpeg?auto=compress&cs=tinysrgb&w=1800' : 'https://images.pexels.com/photos/16199069/pexels-photo-16199069.jpeg?auto=compress&cs=tinysrgb&w=1800'}')"><div class="absolute inset-0 bg-black/45"></div><div class="container-lr relative z-10 pb-14 text-white"><p class="section-subtitle text-amber-400">L-Rina Apartment</p><h1 class="font-serif text-6xl font-bold">${isBooking ? 'My Booking' : 'Track Order'}</h1></div></section><section class="py-20"><div class="container-lr max-w-3xl"><form id="lookup-form" class="flex flex-col gap-3 sm:flex-row"><label class="sr-only" for="reference">Reference number</label><input id="reference" name="reference" required value="${reference}" placeholder="Enter your reference number" class="input-luxury"><button class="btn-primary justify-center" type="submit">Look up</button></form><div id="lookup-result" class="mt-8"></div></div></section>`;
  const form = document.querySelector('#lookup-form');
  const result = document.querySelector('#lookup-result');

  async function lookup() {
    const value = form.reference.value.trim().toUpperCase();
    if (!value) return;
    const record = await findByReference(isBooking ? 'bookings' : 'orders', value);
    if (!record) {
      result.innerHTML = '<div class="rounded-xl bg-amber-50 p-6 text-amber-900">No record found. Check the reference and try again.</div>';
      return;
    }
    result.innerHTML = `<article class="card-luxury p-7"><p class="section-subtitle">Reference ${record.reference_number}</p><h2 class="section-title">${isBooking ? record.room_name || 'Booking request' : 'Order received'}</h2><div class="mt-6 grid gap-3 text-sm text-stone-600 sm:grid-cols-2">${isBooking ? `<p>Guest: ${record.full_name}</p><p>Status: ${record.status}</p><p>Check-in: ${record.check_in}</p><p>Check-out: ${record.check_out}</p><p>Nights: ${record.nights}</p><p>Total: ${money(record.total_amount)}</p>` : `<p>Customer: ${record.customer_name || 'Guest'}</p><p>Status: ${record.status}</p><p>Items: ${(record.items || []).length}</p><p>Total: ${money(record.total)}</p>`}</div>${isBooking && record.status !== 'Cancelled' ? '<button id="cancel-booking" class="mt-7 rounded-full border border-red-200 px-5 py-2 text-sm font-semibold text-red-700" type="button">Request cancellation</button>' : ''}</article>`;
    document.querySelector('#cancel-booking')?.addEventListener('click', async () => {
      try { await updateRecord('bookings', record.id, { status: 'Cancelled' }); toast('Cancellation request recorded.'); lookup(); }
      catch { toast('Please contact us to request cancellation.'); }
    });
  }

  form.addEventListener('submit', (event) => { event.preventDefault(); lookup(); });
  if (reference) lookup();
}
