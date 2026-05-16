// Lifted from atlas-prototype.html — screening questions in 3 languages
// plus demo answers for the demo-mode mic fallback.

export const speechLangCode = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN' };

export const i18n = {
  en: {
    listening: 'Listening… speak now',
    processing: 'Processing your answer…',
    questions: [
      { text: 'What is your age?', expects: 'number', options: ['22', '28', '35', '45'] },
      { text: 'How many years of warehouse work experience do you have?', expects: 'number', options: ['0', '1', '3', '5+'] },
      { text: 'How far do you live from Patancheru, Hyderabad?', expects: 'distance', options: ['Under 5 km', '10 km', '20 km', '30+ km'] },
      { text: 'Can you lift 25 kilograms comfortably?', expects: 'yesno', options: ['Yes, 25 kg easily', 'Yes, but tiring', '20 kg max', 'Cannot lift'] },
      { text: 'Are you available for night shift, 8 PM to 4 AM?', expects: 'yesno', options: ['Yes, every day', 'Yes, weekdays only', 'Day shift only', 'Not sure'] },
    ],
    demoAnswers: ['Twenty eight', 'Three years', 'About ten kilometres', 'Yes twenty five kilos easily', 'Yes every day'],
    demoMapped: [28, 3, 10, 'yes', 'yes'],
  },
  hi: {
    listening: 'सुन रहे हैं… अभी बोलें',
    processing: 'आपका जवाब प्रोसेस कर रहे हैं…',
    questions: [
      { text: 'आपकी उम्र कितनी है?', expects: 'number', options: ['22 साल', '28 साल', '35 साल', '45 साल'] },
      { text: 'आपको वेयरहाउस का कितने साल का अनुभव है?', expects: 'number', options: ['नया हूँ', '1 साल', '3 साल', '5+ साल'] },
      { text: 'आप पाटनचेरु, हैदराबाद से कितनी दूर रहते हैं?', expects: 'distance', options: ['5 किमी से कम', '10 किमी', '20 किमी', '30+ किमी'] },
      { text: 'क्या आप 25 किलो वजन आसानी से उठा सकते हैं?', expects: 'yesno', options: ['हाँ, आसानी से', 'हाँ, थोड़ा भारी', '20 किलो तक', 'नहीं उठा सकता'] },
      { text: 'क्या आप रात की शिफ्ट (रात 8 से सुबह 4) में काम कर सकते हैं?', expects: 'yesno', options: ['हाँ, रोज', 'हाँ, सोम-शुक्र', 'सिर्फ दिन की', 'पता नहीं'] },
    ],
    demoAnswers: ['अट्ठाईस साल', 'तीन साल', 'दस किलोमीटर', 'हाँ पच्चीस किलो आसानी से', 'हाँ रोज'],
    demoMapped: [28, 3, 10, 'yes', 'yes'],
  },
  te: {
    listening: 'వింటున్నాము… ఇప్పుడు మాట్లాడండి',
    processing: 'మీ సమాధానాన్ని ప్రాసెస్ చేస్తున్నాము…',
    questions: [
      { text: 'మీ వయస్సు ఎంత?', expects: 'number', options: ['22 సంవత్సరాలు', '28 సంవత్సరాలు', '35 సంవత్సరాలు', '45 సంవత్సరాలు'] },
      { text: 'మీకు ఎన్ని సంవత్సరాల వేర్‌హౌస్ అనుభవం ఉంది?', expects: 'number', options: ['కొత్తవారు', '1 సంవత్సరం', '3 సంవత్సరాలు', '5+ సంవత్సరాలు'] },
      { text: 'పటాన్‌చెరు, హైదరాబాద్ నుండి ఎంత దూరంలో నివసిస్తున్నారు?', expects: 'distance', options: ['5 కిమీ కంటే తక్కువ', '10 కిమీ', '20 కిమీ', '30+ కిమీ'] },
      { text: '25 కిలోల బరువును సులభంగా ఎత్తగలరా?', expects: 'yesno', options: ['అవును, సులభంగా', 'అవును, కొంచెం కష్టం', '20 కిలోల వరకు', 'ఎత్తలేను'] },
      { text: 'రాత్రి షిఫ్ట్‌లో (రాత్రి 8 నుండి తెల్లవారు 4) పని చేయగలరా?', expects: 'yesno', options: ['అవును, రోజూ', 'అవును, సోమ-శుక్ర', 'పగటి షిఫ్ట్ మాత్రమే', 'తెలియదు'] },
    ],
    demoAnswers: ['ఇరవై ఎనిమిది సంవత్సరాలు', 'మూడు సంవత్సరాలు', 'పది కిలోమీటర్లు', 'అవును ఇరవై ఐదు కిలోలు సులభంగా', 'అవును రోజూ'],
    demoMapped: [28, 3, 10, 'yes', 'yes'],
  },
};
