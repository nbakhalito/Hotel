const fallbackRooms = [
  { id:'room-deluxe', name:'Deluxe Room', slug:'deluxe-room', category:'Deluxe', description:'A calm, beautifully finished room with everything you need for a restful Lagos stay.', short_description:'Comfortable and refined for short stays.', max_guests:2, bed_type:'King Bed', room_size:'28 sqm', price_per_night:85000, amenities:['Wi-Fi','Air conditioning','Smart TV','Private bathroom'], images:['https://images.pexels.com/photos/27164969/pexels-photo-27164969.jpeg?auto=compress&cs=tinysrgb&w=1200'], is_available:true },
  { id:'room-executive', name:'Executive Suite', slug:'executive-suite', category:'Executive', description:'More room to settle in, with an elegant lounge area and generous natural light.', short_description:'Space, privacy, and quiet luxury.', max_guests:3, bed_type:'King Bed', room_size:'42 sqm', price_per_night:125000, amenities:['Wi-Fi','Air conditioning','Living area','Breakfast'], images:['https://images.pexels.com/photos/7174113/pexels-photo-7174113.jpeg?auto=compress&cs=tinysrgb&w=1200'], is_available:true },
  { id:'room-luxury', name:'Luxury Apartment', slug:'luxury-apartment', category:'Luxury', description:'Our most spacious apartment for guests who want a complete home-away-from-home experience.', short_description:'A premium apartment experience in Eti-Osa.', max_guests:4, bed_type:'King Bed + Sofa Bed', room_size:'65 sqm', price_per_night:185000, amenities:['Wi-Fi','Air conditioning','Kitchenette','Lounge','Breakfast'], images:['https://images.pexels.com/photos/6585598/pexels-photo-6585598.jpeg?auto=compress&cs=tinysrgb&w=1200'], is_available:true }
];
const fallbackMenu = [
  {id:'jollof',name:'L-Rina Jollof Rice',description:'Fragrant party jollof with grilled chicken.',price:8500,category:'Food',subcategory:'Main',image_url:'https://images.pexels.com/photos/5409010/pexels-photo-5409010.jpeg?auto=compress&cs=tinysrgb&w=900',is_available:true},
  {id:'pasta',name:'Creamy Chicken Pasta',description:'Penne, tender chicken and parmesan cream.',price:9500,category:'Food',subcategory:'Main',image_url:'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=900',is_available:true},
  {id:'grill',name:'Mixed Grill Platter',description:'A generous selection from the grill.',price:14000,category:'Food',subcategory:'Main',image_url:'https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg?auto=compress&cs=tinysrgb&w=900',is_available:true},
  {id:'juice',name:'Fresh Tropical Juice',description:'A chilled blend of seasonal fruit.',price:3500,category:'Drinks',subcategory:'Non-alcoholic',image_url:'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=900',is_available:true},
  {id:'water',name:'Bottled Water',description:'Chilled still water.',price:1000,category:'Drinks',subcategory:'Non-alcoholic',image_url:'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=900',is_available:true}
];
const fallbackGallery = [
  ['Living room','Interior','https://images.pexels.com/photos/6585598/pexels-photo-6585598.jpeg?auto=compress&cs=tinysrgb&w=1200'],
  ['A quiet morning','Interior','https://images.pexels.com/photos/7174113/pexels-photo-7174113.jpeg?auto=compress&cs=tinysrgb&w=1200'],
  ['The apartment','Exterior','https://images.pexels.com/photos/8135492/pexels-photo-8135492.jpeg?auto=compress&cs=tinysrgb&w=1200'],
  ['Lounge details','Interior','https://images.pexels.com/photos/8146150/pexels-photo-8146150.jpeg?auto=compress&cs=tinysrgb&w=1200'],
  ['A place to unwind','Amenities','https://images.pexels.com/photos/3201921/pexels-photo-3201921.jpeg?auto=compress&cs=tinysrgb&w=1200'],
  ['Premium comfort','Rooms','https://images.pexels.com/photos/8082217/pexels-photo-8082217.jpeg?auto=compress&cs=tinysrgb&w=1200']
].map((item,index)=>({id:`gallery-${index}`,title:item[0],category:item[1],image_url:item[2]}));

const defaults = { business_name:'L-Rina Apartment', tagline:'Comfort, privacy, and a better way to experience Lagos.', phone_display:'08127057823', whatsapp_number:'2348127057823', email:'Lrinahomesluxuryapartment8@gmail.com', address:'No 2 Francis Omojiade Crescent, off Howard Edafe Street, Eti-Osa, Lagos 105102, Lagos, Nigeria', plus_code:'GCW2+5V Lagos', hero_headline:'Your private escape in the heart of Lagos', hero_subtext:'Thoughtfully designed short-stay apartments for comfort, privacy, and effortless living.', service_charge_pct:10, payment_methods:['Pay on arrival','Bank transfer'] };

let clientPromise;
async function supabaseClient() {
  const config = window.LRINA_CONFIG || {};
  if (!config.supabaseUrl || !config.supabaseAnonKey) return null;
  clientPromise ||= import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm').then(({createClient}) => createClient(config.supabaseUrl, config.supabaseAnonKey, {auth:{persistSession:true,autoRefreshToken:true}}));
  return clientPromise;
}
async function read(table, fallback, order='sort_order') {
  try { const client=await supabaseClient(); if (!client) return fallback; const query=client.from(table).select('*'); const {data,error}=order ? await query.order(order,{ascending:true}) : await query; if (error) throw error; return data?.length ? data : fallback; } catch { return fallback; }
}
export const getSettings = async () => { try { const client=await supabaseClient(); if (!client) return defaults; const {data,error}=await client.from('settings').select('*'); if(error) throw error; return Object.fromEntries((data||[]).map(row=>[row.key,row.value])); } catch { return defaults; } };
export const getRooms = () => read('rooms', fallbackRooms);
export const getMenu = () => read('menu_items', fallbackMenu);
export const getGallery = () => read('gallery_images', fallbackGallery);
export const getAmenities = () => read('amenities', ['Wi-Fi','24-hour power','Air conditioning','Secure parking','Housekeeping','In-room dining'].map((name,i)=>({id:`amenity-${i}`,name,icon:'Check'})));
export const getReviews = () => read('reviews', [{first_name:'Amaka',rating:5,review_text:'Beautiful, peaceful, and exactly as described. The team made our stay easy.',room_name:'Executive Suite'},{first_name:'Tunde',rating:5,review_text:'A very comfortable apartment in a convenient part of Lagos.',room_name:'Deluxe Room'}], null);
export const insertRecord = async (table, payload) => { const client=await supabaseClient(); if (!client) { const ref=payload.reference_number || `DEMO-${Date.now().toString().slice(-6)}`; return {...payload,id:`demo-${Date.now()}`,reference_number:ref,status:payload.status||'Pending',created_at:new Date().toISOString()}; } const {data,error}=await client.from(table).insert(payload).select().single(); if(error) throw error; return data; };
export const findByReference = async (table, reference) => { try { const client=await supabaseClient(); if (!client) return JSON.parse(localStorage.getItem(`lrina-${table}-${reference.toUpperCase()}`)||'null'); const {data,error}=await client.from(table).select('*').eq('reference_number',reference.toUpperCase()).maybeSingle(); if(error) throw error; return data; } catch { return null; } };
export const updateRecord = async (table,id,payload) => { const client=await supabaseClient(); if(!client) return {...payload,id}; const {data,error}=await client.from(table).update(payload).eq('id',id).select().single(); if(error) throw error; return data; };
export { defaults, fallbackRooms, fallbackMenu, fallbackGallery };
