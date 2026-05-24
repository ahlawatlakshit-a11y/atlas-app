// Role + hub catalog for Jumbotail field recruitment.
// Hubs match the actual JD (Bala Nagar / Attapur / Kompally) and roles cover
// the four blue-collar lines a field recruiter hires for: van delivery boys,
// pickers, packers, and warehouse loaders (the original prototype role).

export const HUBS = [
  { id: 'bala_nagar', name: 'Bala Nagar', area: 'Hyderabad', lat: 17.4719, lng: 78.4378 },
  { id: 'attapur',    name: 'Attapur',    area: 'Hyderabad', lat: 17.3735, lng: 78.4421 },
  { id: 'kompally',   name: 'Kompally',   area: 'Hyderabad', lat: 17.5402, lng: 78.4854 },
  { id: 'patancheru', name: 'Patancheru', area: 'Hyderabad', lat: 17.5314, lng: 78.2629 },
];

// Standard dimension max scores — total = 100, mirrors prototype scoring
export const DIMENSION_MAX = [20, 25, 20, 20, 15];

// Each role defines:
//   - dimensions: 5 short labels used in the score breakdown
//   - chipMappings: per-question, what value to set when chip i is tapped
//   - i18n.{lang}.questions: the 5 questions with chip options
//   - i18n.{lang}.demoAnswers / demoMapped: what demo mode types out
export const ROLES = [
  // ============================================================
  // 1. VAN DELIVERY BOY
  // ============================================================
  {
    id: 'van_delivery',
    name: 'Van Delivery Boy',
    short: 'Delivery',
    emoji: '🚐',
    blurb: 'Last-mile B2B delivery to kirana stores. Own vehicle + license required.',
    dimensions: ['Age', 'Own vehicle', 'Driving licence', 'Smartphone', 'Area familiarity'],
    chipMappings: [
      [22, 26, 32, 38],
      ['yes', 'yes', 'partial', 'no'],
      ['yes', 'yes', 'partial', 'no'],
      ['yes', 'yes', 'partial', 'no'],
      ['yes', 'partial', 'partial', 'no'],
    ],
    i18n: {
      en: {
        questions: [
          { text: 'What is your age?', expects: 'number', options: ['22', '26', '32', '38'] },
          { text: 'Do you own a 2-wheeler?', expects: 'yesno', options: ['Yes, my own', 'Family / borrowed', 'Plan to get one', 'No vehicle'] },
          { text: 'Do you have a valid 2-wheeler driving licence?', expects: 'yesno', options: ['Yes, MCWG', 'Yes, LMV', 'Applied / learning', 'No licence'] },
          { text: 'Do you have a smartphone with WhatsApp and GPS?', expects: 'yesno', options: ['Yes, both', 'WhatsApp only', 'Basic phone', 'No phone'] },
          { text: 'How well do you know this hub area and surrounding streets?', expects: 'yesno', options: ['Very well', 'Some areas', 'New to area', 'Outside city'] },
        ],
        demoAnswers: ['Twenty six', 'Yes my own bike', 'Yes MCWG licence', 'Yes both', 'Very well'],
        demoMapped: [26, 'yes', 'yes', 'yes', 'yes'],
      },
      hi: {
        questions: [
          { text: 'आपकी उम्र कितनी है?', expects: 'number', options: ['22 साल', '26 साल', '32 साल', '38 साल'] },
          { text: 'क्या आपके पास खुद की 2-व्हीलर है?', expects: 'yesno', options: ['हाँ, खुद की', 'परिवार की', 'लेना चाहता हूँ', 'नहीं है'] },
          { text: 'क्या आपका 2-व्हीलर का valid लाइसेंस है?', expects: 'yesno', options: ['हाँ MCWG', 'हाँ LMV', 'Apply किया है', 'नहीं है'] },
          { text: 'क्या आपके पास WhatsApp और GPS वाला smartphone है?', expects: 'yesno', options: ['हाँ, दोनों', 'सिर्फ WhatsApp', 'साधारण फोन', 'कोई फोन नहीं'] },
          { text: 'इस hub के इलाके / रास्तों को कितना जानते हैं?', expects: 'yesno', options: ['बहुत अच्छे से', 'कुछ इलाके', 'नया हूँ', 'बाहर से'] },
        ],
        demoAnswers: ['छब्बीस साल', 'हाँ खुद की बाइक', 'हाँ MCWG लाइसेंस', 'हाँ दोनों', 'बहुत अच्छे से'],
        demoMapped: [26, 'yes', 'yes', 'yes', 'yes'],
      },
      te: {
        questions: [
          { text: 'మీ వయస్సు ఎంత?', expects: 'number', options: ['22 సం.', '26 సం.', '32 సం.', '38 సం.'] },
          { text: 'మీకు సొంత 2-వీలర్ ఉందా?', expects: 'yesno', options: ['అవును, సొంత', 'కుటుంబం / అరువు', 'కొనాలనుకుంటున్నాను', 'వాహనం లేదు'] },
          { text: 'మీకు చెల్లుబాటయ్యే 2-వీలర్ లైసెన్స్ ఉందా?', expects: 'yesno', options: ['అవును MCWG', 'అవును LMV', 'దరఖాస్తు చేశాను', 'లేదు'] },
          { text: 'మీ దగ్గర WhatsApp & GPS ఉన్న smartphone ఉందా?', expects: 'yesno', options: ['అవును, రెండూ', 'WhatsApp మాత్రమే', 'సాధారణ ఫోన్', 'ఫోన్ లేదు'] },
          { text: 'ఈ hub ప్రాంతం & రోడ్లు మీకు ఎంత తెలుసు?', expects: 'yesno', options: ['చాలా బాగా', 'కొన్ని ప్రాంతాలు', 'కొత్త', 'బయటి నుండి'] },
        ],
        demoAnswers: ['ఇరవై ఆరు సంవత్సరాలు', 'అవును సొంత బైక్', 'అవును MCWG', 'అవును రెండూ', 'చాలా బాగా'],
        demoMapped: [26, 'yes', 'yes', 'yes', 'yes'],
      },
    },
  },

  // ============================================================
  // 2. PICKER
  // ============================================================
  {
    id: 'picker',
    name: 'Picker',
    short: 'Picker',
    emoji: '📦',
    blurb: 'Walks aisles, picks SKUs against an order list. Needs label literacy.',
    dimensions: ['Age', 'SKU literacy', 'Experience', 'Stand 8 hrs', 'Day shift'],
    chipMappings: [
      [22, 28, 35, 42],
      ['yes', 'partial', 'partial', 'no'],
      [0, 1, 3, 5],
      ['yes', 'partial', 'partial', 'no'],
      ['yes', 'yes', 'partial', 'no'],
    ],
    i18n: {
      en: {
        questions: [
          { text: 'What is your age?', expects: 'number', options: ['22', '28', '35', '42'] },
          { text: 'Can you read Hindi/English SKU labels and order slips?', expects: 'yesno', options: ['Yes, both', 'Hindi only', 'A little', 'Cannot read'] },
          { text: 'How many years of warehouse picking experience?', expects: 'number', options: ['New', '1 yr', '3 yrs', '5+ yrs'] },
          { text: 'Can you stand and walk for 8 hours per shift?', expects: 'yesno', options: ['Yes, easily', '4-6 hours OK', 'Need breaks', 'Cannot stand long'] },
          { text: 'Available for day shift 9 AM – 6 PM, 6 days a week?', expects: 'yesno', options: ['Yes, every day', 'Yes, weekdays', 'Half-day only', 'Not available'] },
        ],
        demoAnswers: ['Twenty eight', 'Yes both Hindi and English', 'Three years', 'Yes easily', 'Yes every day'],
        demoMapped: [28, 'yes', 3, 'yes', 'yes'],
      },
      hi: {
        questions: [
          { text: 'आपकी उम्र कितनी है?', expects: 'number', options: ['22 साल', '28 साल', '35 साल', '42 साल'] },
          { text: 'क्या आप Hindi/English SKU labels और order slips पढ़ सकते हैं?', expects: 'yesno', options: ['हाँ, दोनों', 'सिर्फ Hindi', 'थोड़ा सा', 'नहीं पढ़ सकता'] },
          { text: 'आपको warehouse picking का कितने साल का experience है?', expects: 'number', options: ['नया हूँ', '1 साल', '3 साल', '5+ साल'] },
          { text: 'क्या आप 8 घंटे खड़े होकर / चलकर काम कर सकते हैं?', expects: 'yesno', options: ['हाँ, आसानी से', '4-6 घंटे ठीक', 'break चाहिए', 'नहीं कर सकता'] },
          { text: 'क्या आप day shift (9 बजे - 6 बजे, हफ्ते में 6 दिन) कर सकते हैं?', expects: 'yesno', options: ['हाँ, रोज', 'हाँ, सोम-शुक्र', 'सिर्फ half-day', 'नहीं'] },
        ],
        demoAnswers: ['अट्ठाईस साल', 'हाँ दोनों', 'तीन साल', 'हाँ आसानी से', 'हाँ रोज'],
        demoMapped: [28, 'yes', 3, 'yes', 'yes'],
      },
      te: {
        questions: [
          { text: 'మీ వయస్సు ఎంత?', expects: 'number', options: ['22 సం.', '28 సం.', '35 సం.', '42 సం.'] },
          { text: 'Hindi/English SKU లేబుల్స్ & ఆర్డర్ స్లిప్‌లు చదవగలరా?', expects: 'yesno', options: ['అవును, రెండూ', 'Hindi మాత్రమే', 'కొంచెం', 'చదవలేను'] },
          { text: 'మీకు వేర్‌హౌస్ picking అనుభవం ఎన్ని సంవత్సరాలు?', expects: 'number', options: ['కొత్తవారు', '1 సం.', '3 సం.', '5+ సం.'] },
          { text: '8 గంటలు నిలబడి / నడిచి పని చేయగలరా?', expects: 'yesno', options: ['అవును సులభంగా', '4-6 గంటలు ఓకే', 'విరామం కావాలి', 'చేయలేను'] },
          { text: 'పగటి shift (9 AM - 6 PM, వారానికి 6 రోజులు) చేయగలరా?', expects: 'yesno', options: ['అవును రోజూ', 'అవును సోమ-శుక్ర', 'half-day మాత్రమే', 'లేదు'] },
        ],
        demoAnswers: ['ఇరవై ఎనిమిది సంవత్సరాలు', 'అవును రెండూ', 'మూడు సంవత్సరాలు', 'అవును సులభంగా', 'అవును రోజూ'],
        demoMapped: [28, 'yes', 3, 'yes', 'yes'],
      },
    },
  },

  // ============================================================
  // 3. PACKER
  // ============================================================
  {
    id: 'packer',
    name: 'Packer',
    short: 'Packer',
    emoji: '📮',
    blurb: 'Boxes orders for dispatch. Handles fragile + heavy mixed goods.',
    dimensions: ['Age', 'Packing exp', 'Lift 25kg', 'Bilingual labels', 'Day shift'],
    chipMappings: [
      [22, 28, 35, 42],
      [0, 1, 3, 5],
      ['yes', 'partial', 'partial', 'no'],
      ['yes', 'partial', 'partial', 'no'],
      ['yes', 'yes', 'partial', 'no'],
    ],
    i18n: {
      en: {
        questions: [
          { text: 'What is your age?', expects: 'number', options: ['22', '28', '35', '42'] },
          { text: 'How many years of packing / dispatch experience?', expects: 'number', options: ['New', '1 yr', '3 yrs', '5+ yrs'] },
          { text: 'Can you lift 25 kg cartons comfortably for full shift?', expects: 'yesno', options: ['Yes, easily', 'Yes, but tiring', '15-20 kg max', 'Cannot lift heavy'] },
          { text: 'Can you read product labels in Hindi and English?', expects: 'yesno', options: ['Yes, both', 'Hindi only', 'A little', 'Cannot read'] },
          { text: 'Available for day shift 9 AM – 6 PM?', expects: 'yesno', options: ['Yes, every day', 'Yes, weekdays', 'Half-day only', 'Night shift only'] },
        ],
        demoAnswers: ['Twenty eight', 'Three years', 'Yes easily', 'Yes both', 'Yes every day'],
        demoMapped: [28, 3, 'yes', 'yes', 'yes'],
      },
      hi: {
        questions: [
          { text: 'आपकी उम्र कितनी है?', expects: 'number', options: ['22 साल', '28 साल', '35 साल', '42 साल'] },
          { text: 'आपको packing / dispatch का कितने साल का experience है?', expects: 'number', options: ['नया हूँ', '1 साल', '3 साल', '5+ साल'] },
          { text: 'क्या आप 25 किलो के डिब्बे पूरी shift उठा सकते हैं?', expects: 'yesno', options: ['हाँ, आसानी से', 'हाँ, थोड़ा भारी', '15-20 किलो तक', 'भारी नहीं उठा सकता'] },
          { text: 'क्या आप Hindi और English दोनों labels पढ़ सकते हैं?', expects: 'yesno', options: ['हाँ, दोनों', 'सिर्फ Hindi', 'थोड़ा सा', 'नहीं पढ़ सकता'] },
          { text: 'क्या आप day shift (9 बजे - 6 बजे) कर सकते हैं?', expects: 'yesno', options: ['हाँ, रोज', 'हाँ, सोम-शुक्र', 'सिर्फ half-day', 'सिर्फ night shift'] },
        ],
        demoAnswers: ['अट्ठाईस साल', 'तीन साल', 'हाँ आसानी से', 'हाँ दोनों', 'हाँ रोज'],
        demoMapped: [28, 3, 'yes', 'yes', 'yes'],
      },
      te: {
        questions: [
          { text: 'మీ వయస్సు ఎంత?', expects: 'number', options: ['22 సం.', '28 సం.', '35 సం.', '42 సం.'] },
          { text: 'మీకు packing / dispatch అనుభవం ఎన్ని సంవత్సరాలు?', expects: 'number', options: ['కొత్తవారు', '1 సం.', '3 సం.', '5+ సం.'] },
          { text: '25 కిలోల కార్టన్‌లు shift అంతా ఎత్తగలరా?', expects: 'yesno', options: ['అవును సులభంగా', 'అవును కొంచెం కష్టం', '15-20 కిలో', 'భారీవి లేవు'] },
          { text: 'Hindi & English రెండు labels చదవగలరా?', expects: 'yesno', options: ['అవును రెండూ', 'Hindi మాత్రమే', 'కొంచెం', 'చదవలేను'] },
          { text: 'పగటి shift (9 AM - 6 PM) చేయగలరా?', expects: 'yesno', options: ['అవును రోజూ', 'అవును సోమ-శుక్ర', 'half-day', 'night shift మాత్రమే'] },
        ],
        demoAnswers: ['ఇరవై ఎనిమిది సం.', 'మూడు సం.', 'అవును సులభంగా', 'అవును రెండూ', 'అవును రోజూ'],
        demoMapped: [28, 3, 'yes', 'yes', 'yes'],
      },
    },
  },

  // ============================================================
  // 4. WAREHOUSE LOADER (original prototype role)
  // ============================================================
  {
    id: 'warehouse_loader',
    name: 'Warehouse Loader',
    short: 'Loader',
    emoji: '👷',
    blurb: 'Loads / unloads trucks at the warehouse. Night shift, heavy lifting.',
    dimensions: ['Age', 'Experience', 'Distance', 'Lift 25kg', 'Night shift'],
    chipMappings: [
      [22, 28, 35, 45],
      [0, 1, 3, 5],
      [3, 10, 20, 32],
      ['yes', 'yes', 'partial', 'no'],
      ['yes', 'yes', 'partial', 'no'],
    ],
    i18n: {
      en: {
        questions: [
          { text: 'What is your age?', expects: 'number', options: ['22', '28', '35', '45'] },
          { text: 'How many years of warehouse work experience do you have?', expects: 'number', options: ['0', '1', '3', '5+'] },
          { text: 'How far do you live from the hub?', expects: 'distance', options: ['Under 5 km', '10 km', '20 km', '30+ km'] },
          { text: 'Can you lift 25 kilograms comfortably?', expects: 'yesno', options: ['Yes, 25 kg easily', 'Yes, but tiring', '20 kg max', 'Cannot lift'] },
          { text: 'Are you available for night shift, 8 PM to 4 AM?', expects: 'yesno', options: ['Yes, every day', 'Yes, weekdays only', 'Day shift only', 'Not sure'] },
        ],
        demoAnswers: ['Twenty eight', 'Three years', 'About ten kilometres', 'Yes twenty five kilos easily', 'Yes every day'],
        demoMapped: [28, 3, 10, 'yes', 'yes'],
      },
      hi: {
        questions: [
          { text: 'आपकी उम्र कितनी है?', expects: 'number', options: ['22 साल', '28 साल', '35 साल', '45 साल'] },
          { text: 'आपको वेयरहाउस का कितने साल का अनुभव है?', expects: 'number', options: ['नया हूँ', '1 साल', '3 साल', '5+ साल'] },
          { text: 'आप hub से कितनी दूर रहते हैं?', expects: 'distance', options: ['5 किमी से कम', '10 किमी', '20 किमी', '30+ किमी'] },
          { text: 'क्या आप 25 किलो वजन आसानी से उठा सकते हैं?', expects: 'yesno', options: ['हाँ, आसानी से', 'हाँ, थोड़ा भारी', '20 किलो तक', 'नहीं उठा सकता'] },
          { text: 'क्या आप रात की shift (8 बजे - 4 बजे) कर सकते हैं?', expects: 'yesno', options: ['हाँ, रोज', 'हाँ, सोम-शुक्र', 'सिर्फ दिन की', 'पता नहीं'] },
        ],
        demoAnswers: ['अट्ठाईस साल', 'तीन साल', 'दस किलोमीटर', 'हाँ पच्चीस किलो आसानी से', 'हाँ रोज'],
        demoMapped: [28, 3, 10, 'yes', 'yes'],
      },
      te: {
        questions: [
          { text: 'మీ వయస్సు ఎంత?', expects: 'number', options: ['22 సం.', '28 సం.', '35 సం.', '45 సం.'] },
          { text: 'మీకు వేర్‌హౌస్ అనుభవం ఎన్ని సంవత్సరాలు?', expects: 'number', options: ['కొత్తవారు', '1 సం.', '3 సం.', '5+ సం.'] },
          { text: 'hub నుండి మీరు ఎంత దూరంలో నివసిస్తున్నారు?', expects: 'distance', options: ['5 కిమీ కంటే తక్కువ', '10 కిమీ', '20 కిమీ', '30+ కిమీ'] },
          { text: '25 కిలోల బరువును సులభంగా ఎత్తగలరా?', expects: 'yesno', options: ['అవును, సులభంగా', 'అవును, కొంచెం కష్టం', '20 కిలోల వరకు', 'ఎత్తలేను'] },
          { text: 'రాత్రి shift (8 PM - 4 AM) చేయగలరా?', expects: 'yesno', options: ['అవును, రోజూ', 'అవును, సోమ-శుక్ర', 'పగటి shift మాత్రమే', 'తెలియదు'] },
        ],
        demoAnswers: ['ఇరవై ఎనిమిది సం.', 'మూడు సం.', 'పది కిలోమీటర్లు', 'అవును ఇరవై ఐదు కిలోలు సులభంగా', 'అవును రోజూ'],
        demoMapped: [28, 3, 10, 'yes', 'yes'],
      },
    },
  },
];

export const ROLE_BY_ID = Object.fromEntries(ROLES.map((r) => [r.id, r]));
export const HUB_BY_ID = Object.fromEntries(HUBS.map((h) => [h.id, h]));

export const DEFAULT_ROLE_ID = 'van_delivery';
export const DEFAULT_HUB_ID = 'bala_nagar';
