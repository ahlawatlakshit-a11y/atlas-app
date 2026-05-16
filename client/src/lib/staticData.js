// Pure presentational data lifted from atlas-prototype.html.
// Channels are also seeded server-side; this client copy carries colour/logo/copy
// fields the UI needs that don't belong in the DB.

export const channels = [
  { key: 'apna',     name: 'Apna',           color: '#0066FF', logo: 'Ap', reach: '50M users',         desc: 'Largest blue-collar app · auto-syndicate JD with API' },
  { key: 'workindia',name: 'WorkIndia',      color: '#FF6B00', logo: 'Wi', reach: '30M users',         desc: 'Voice-call apply · tier-2/3 cities · India' },
  { key: 'quikrjobs',name: 'QuikrJobs',      color: '#7C3AED', logo: 'Qj', reach: 'Urban tier-1',      desc: 'Driver, helper, retail floor listings' },
  { key: 'vahan',    name: 'Vahan',          color: '#16A34A', logo: 'Vh', reach: '1M+ drivers',       desc: 'WhatsApp-bot driven · best for delivery & logistics' },
  { key: 'wagroups', name: 'WhatsApp Groups',color: '#25D366', logo: 'WA', reach: '47 groups · 12K',   desc: 'Local labour chowk + kirana groups Jumbotail owns' },
  { key: 'kirana',   name: 'Kirana Network', color: '#F26522', logo: 'Kr', reach: '73 partner shops',  desc: 'Highest-trust referrals · ₹500/joined hire' },
];

export const whatsappGroups = [
  { name: 'Patancheru Loaders Group',     members: 1240, lang: 'Telugu·Hindi', views: 312 },
  { name: 'BHEL Labour Chowk',            members: 890,  lang: 'Hindi',        views: 287 },
  { name: 'Hyderabad Warehouse Workers',  members: 760,  lang: 'Hindi·Telugu', views: 198 },
  { name: 'Telugu Migrant Workers HYD',   members: 2180, lang: 'Telugu',       views: 521 },
  { name: 'Miyapur Day Labourers',        members: 540,  lang: 'Hindi·Telugu', views: 145 },
];

export const kiranaPartners = [
  { name: 'Sri Lakshmi Stores', area: 'Patancheru',  refers: 8 },
  { name: 'Balaji Kirana',      area: 'Miyapur',     refers: 12 },
  { name: 'Annapurna General',  area: 'Beeramguda',  refers: 5 },
  { name: 'Ravi Provisions',    area: 'Lingampally', refers: 9 },
  { name: 'Hanuman Kirana',     area: 'BHEL area',   refers: 6 },
];

// 19-message scripted WhatsApp conversation from prototype.
// `step` (when present) advances the right-hand flow tracker.
export const waScript = [
  { from: 'bot', text: '🙏 नमस्ते! ATLAS से Jumbotail Hyderabad warehouse के लिए 12 लोडर भर्ती चालू है।', delay: 600, step: 0 },
  { from: 'bot', text: 'अपनी भाषा चुनें / Select language:<br>1. हिन्दी<br>2. English<br>3. తెలుగు', quick: ['1','2','3'], delay: 800, step: 1 },
  { from: 'me',  text: '1', delay: 700 },
  { from: 'bot', text: 'बढ़िया! हिन्दी में बात करते हैं। 5 छोटे सवाल हैं — आप टाइप कर सकते हैं या voice note भेज सकते हैं 🎙', delay: 800, step: 2 },
  { from: 'bot', text: '<strong>सवाल 1/5:</strong> आपकी उम्र कितनी है?', quick: ['22','28','35','45'], delay: 900 },
  { from: 'me',  text: '28', delay: 700 },
  { from: 'bot', text: '✅ ठीक है। <strong>सवाल 2/5:</strong> warehouse का कितने साल का experience है?', quick: ['नया','1 साल','3 साल','5+ साल'], delay: 800 },
  { from: 'me',  voice: '0:04', delay: 800 },
  { from: 'bot', text: '🎙 आपने कहा: "तीन साल" ✓', delay: 700 },
  { from: 'bot', text: '<strong>सवाल 3/5:</strong> आप पाटनचेरु से कितनी दूर रहते हैं?', quick: ['<5 km','10 km','20 km','30+ km'], delay: 800 },
  { from: 'me',  text: '10 km', delay: 600 },
  { from: 'bot', text: '<strong>सवाल 4/5:</strong> क्या आप 25 किलो वजन आसानी से उठा सकते हैं?', quick: ['हाँ','थोड़ा भारी','नहीं'], delay: 800 },
  { from: 'me',  text: 'हाँ', delay: 500 },
  { from: 'bot', text: '<strong>सवाल 5/5:</strong> क्या रात की shift (8 बजे से 4 बजे) में काम कर सकते हैं?', quick: ['हाँ रोज','सोम-शुक्र','नहीं'], delay: 800 },
  { from: 'me',  text: 'हाँ रोज', delay: 600 },
  { from: 'bot', text: '🎉 बधाई हो! आपका score है <strong>88/100</strong> — आप QUALIFIED हैं!', delay: 1100, step: 3 },
  { from: 'bot', text: '📅 अपना interview slot चुनें (Patancheru warehouse में in-person):', quick: ['Wed 9 AM','Wed 11 AM','Thu 2 PM'], delay: 900, step: 4 },
  { from: 'me',  text: 'Wed 11 AM', delay: 700 },
  { from: 'bot', text: '✅ Booked! <strong>Wednesday May 6, 11:00 AM</strong><br>Reference: ATL-48217<br>Location: Jumbotail Warehouse, Patancheru<br><br><em>कुछ documents लाने की जरूरत नहीं है — सिर्फ Aadhaar (optional)</em>', delay: 1100 },
  { from: 'bot', text: '💡 <strong>Bonus:</strong> किसी दोस्त को refer करें और ₹500 पाएं जब वो join करे।', quick: ['Refer a friend','Done'], delay: 900, step: 5 },
];

export const flowSteps = [
  { lbl: 'Worker receives WhatsApp', sub: 'From referrer or jumbotail.com/jobs QR' },
  { lbl: 'Picks language',           sub: 'Quick-reply buttons (1/2/3)' },
  { lbl: 'Voice or text answers',    sub: '5 questions · supports voice notes' },
  { lbl: 'Real-time scoring',        sub: 'LLM + rules · result in chat' },
  { lbl: 'Slot self-booked',         sub: 'Tap a button · calendar invite sent' },
  { lbl: 'Offer + onboarding',       sub: 'PDF offer → reply YES → joining kit' },
];
