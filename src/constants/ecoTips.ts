// Daily Eco Tips — 60 tips, 3 languages
// Selection logic: tipIndex = dayOfYear % TIPS.length
// Same tip shown to all users on the same calendar day.

export interface EcoTip {
  badge: string;
  en: string;
  hi: string;
  mr: string;
  icon: string;
  gradient: [string, string];
  footer?: { en: string; hi: string; mr: string };
}

export const ECO_TIPS: EcoTip[] = [
  {
    badge: '💡 DID YOU KNOW?',
    en: 'Recycling 1 ton of paper saves 17 trees and 7,000 gallons of water!',
    hi: '1 टन कागज़ रीसाइकल करने से 17 पेड़ और 7,000 गैलन पानी बचता है!',
    mr: '1 टन कागद रिसायकल केल्याने 17 झाडे आणि 7,000 गॅलन पाणी वाचते!',
    icon: 'recycle',
    gradient: ['#10b981', '#059669'],
    footer: { en: 'Impact: High', hi: 'प्रभाव: उच्च', mr: 'परिणाम: उच्च' },
  },
  {
    badge: '🌊 WATER FACT',
    en: 'Recycling plastic saves 50L of water per kg. Every drop counts!',
    hi: 'प्लास्टिक रीसाइकल करने से प्रति किग्रा 50 लीटर पानी बचता है!',
    mr: 'प्लास्टिक रिसायकल केल्याने प्रति किलो 50 लिटर पाणी वाचते!',
    icon: 'water',
    gradient: ['#3b82f6', '#2563eb'],
  },
  {
    badge: '⚡ ENERGY TIP',
    en: 'Recycling aluminum uses 95% less energy than making new cans from raw materials.',
    hi: 'एल्युमीनियम रीसाइकल करने में कच्चे माल से 95% कम ऊर्जा लगती है।',
    mr: 'अॅल्युमिनियम रिसायकल करण्यात कच्च्या मालापेक्षा 95% कमी ऊर्जा लागते.',
    icon: 'lightning-bolt',
    gradient: ['#f59e0b', '#d97706'],
    footer: { en: 'Save Energy!', hi: 'ऊर्जा बचाएं!', mr: 'ऊर्जा वाचवा!' },
  },
  {
    badge: '🌍 PLANET FACT',
    en: 'E-waste contains precious metals like gold and silver. Recycling recovers them!',
    hi: 'ई-कचरे में सोना और चांदी जैसी कीमती धातुएं होती हैं। रीसाइकलिंग उन्हें वापस लाती है!',
    mr: 'ई-कचऱ्यात सोने आणि चांदी सारख्या मौल्यवान धातू असतात. रिसायकलिंग त्या परत आणते!',
    icon: 'earth',
    gradient: ['#8b5cf6', '#7c3aed'],
  },
  {
    badge: '♻️ TIP',
    en: 'Segregate your waste at source: wet, dry, and hazardous. It makes recycling 3x more efficient!',
    hi: 'अपने कचरे को स्रोत पर अलग करें: गीला, सूखा और खतरनाक। इससे रीसाइकलिंग 3 गुना कुशल हो जाती है!',
    mr: 'कचऱ्याचे स्त्रोतावर वर्गीकरण करा: ओला, सुका आणि धोकादायक. यामुळे रिसायकलिंग 3 पट अधिक कार्यक्षम होते!',
    icon: 'delete-variant',
    gradient: ['#10b981', '#0d9488'],
  },
  {
    badge: '📦 GUIDE',
    en: 'Flatten cardboard boxes before recycling — it saves 60% more space in collection vehicles.',
    hi: 'रीसाइकल करने से पहले कार्डबोर्ड बक्से चपटे करें — इससे संग्रह वाहनों में 60% अधिक जगह बचती है।',
    mr: 'रिसायकल करण्यापूर्वी कार्डबोर्ड बॉक्स सपाट करा — यामुळे संकलन वाहनांमध्ये 60% अधिक जागा वाचते.',
    icon: 'package-variant',
    gradient: ['#f97316', '#ea580c'],
  },
  {
    badge: '🌿 GREEN TIP',
    en: 'Use cloth bags instead of plastic bags. One cloth bag replaces 700 plastic bags over its lifetime.',
    hi: 'प्लास्टिक बैग की जगह कपड़े के बैग का उपयोग करें। एक कपड़े का बैग अपने जीवनकाल में 700 प्लास्टिक बैग की जगह लेता है।',
    mr: 'प्लास्टिक पिशव्यांऐवजी कापडी पिशव्या वापरा. एक कापडी पिशवी तिच्या आयुष्यात 700 प्लास्टिक पिशव्यांची जागा घेते.',
    icon: 'bag-personal',
    gradient: ['#16a34a', '#15803d'],
  },
  {
    badge: '💧 SAVE WATER',
    en: 'Fix leaky taps immediately. A dripping tap wastes up to 20 litres of water per day.',
    hi: 'टपकने वाले नलों को तुरंत ठीक करें। एक टपकता नल प्रतिदिन 20 लीटर तक पानी बर्बाद करता है।',
    mr: 'गळणारे नळ लगेच दुरुस्त करा. एक गळणारा नळ दररोज 20 लिटर पाणी वाया घालवतो.',
    icon: 'water-alert',
    gradient: ['#0ea5e9', '#0284c7'],
  },
  {
    badge: '🔋 BATTERY TIP',
    en: 'Never throw batteries in regular bins. They contain toxic chemicals that pollute soil and water.',
    hi: 'बैटरी को कभी भी सामान्य कूड़ेदान में न फेंकें। इनमें जहरीले रसायन होते हैं जो मिट्टी और पानी को प्रदूषित करते हैं।',
    mr: 'बॅटरी कधीही सामान्य कचऱ्याच्या डब्यात टाकू नका. त्यात विषारी रसायने असतात जी माती आणि पाण्याला प्रदूषित करतात.',
    icon: 'battery-alert',
    gradient: ['#dc2626', '#b91c1c'],
  },
  {
    badge: '🌱 COMPOSTING',
    en: 'Composting kitchen waste reduces landfill by 30% and creates rich fertilizer for plants.',
    hi: 'रसोई के कचरे की खाद बनाने से लैंडफिल में 30% की कमी होती है और पौधों के लिए समृद्ध उर्वरक बनता है।',
    mr: 'स्वयंपाकघरातील कचऱ्याचे कंपोस्टिंग लँडफिल 30% कमी करते आणि झाडांसाठी समृद्ध खत तयार करते.',
    icon: 'sprout',
    gradient: ['#65a30d', '#4d7c0f'],
  },
  {
    badge: '👕 CLOTHES TIP',
    en: 'Donate old clothes instead of throwing them. One donated garment keeps 2kg of textile waste out of landfills.',
    hi: 'पुराने कपड़ों को फेंकने की बजाय दान करें। एक दान किया हुआ कपड़ा 2 किग्रा कपड़ा कचरा लैंडफिल से बाहर रखता है।',
    mr: 'जुने कपडे फेकण्याऐवजी दान करा. एक दान केलेले कपडे 2 किलो कापड कचरा लँडफिलमधून बाहेर ठेवतो.',
    icon: 'tshirt-crew',
    gradient: ['#ec4899', '#db2777'],
  },
  {
    badge: '🥤 PLASTIC FREE',
    en: 'Switch to a reusable water bottle. It can eliminate 156 plastic bottles per person per year.',
    hi: 'पुन्हः उपयोग योग्य पानी की बोतल अपनाएं। यह प्रति व्यक्ति प्रति वर्ष 156 प्लास्टिक बोतलों को खत्म कर सकती है।',
    mr: 'पुन्हा वापरता येणारी पाण्याची बाटली वापरा. हे दरवर्षी प्रति व्यक्ती 156 प्लास्टिक बाटल्या कमी करू शकते.',
    icon: 'bottle-soda',
    gradient: ['#06b6d4', '#0891b2'],
  },
  {
    badge: '💡 ELECTRICITY',
    en: 'Turn off lights and electronics when not in use. Standby mode still consumes 10% of the energy.',
    hi: 'उपयोग न होने पर लाइट और इलेक्ट्रॉनिक्स बंद करें। स्टैंडबाय मोड अभी भी 10% ऊर्जा खपत करता है।',
    mr: 'वापरात नसताना दिवे आणि इलेक्ट्रॉनिक्स बंद करा. स्टँडबाय मोड अजूनही 10% ऊर्जा वापरतो.',
    icon: 'lightbulb-off',
    gradient: ['#eab308', '#ca8a04'],
  },
  {
    badge: '🐟 OCEAN FACT',
    en: 'Over 8 million tonnes of plastic enter the ocean every year. Proper disposal starts with you.',
    hi: 'हर साल 8 मिलियन टन से अधिक प्लास्टिक समुद्र में प्रवेश करती है। उचित निपटान आपसे शुरू होता है।',
    mr: 'दरवर्षी 8 दशलक्ष टनांहून अधिक प्लास्टिक समुद्रात जाते. योग्य विल्हेवाट तुमच्यापासून सुरू होते.',
    icon: 'fish',
    gradient: ['#0369a1', '#075985'],
  },
  {
    badge: '🍃 FOOD WASTE',
    en: 'Plan your meals to reduce food waste. One-third of all food produced globally is wasted.',
    hi: 'खाद्य अपशिष्ट को कम करने के लिए अपने भोजन की योजना बनाएं। विश्व स्तर पर उत्पादित सभी भोजन का एक तिहाई बर्बाद होता है।',
    mr: 'अन्न कचरा कमी करण्यासाठी जेवणाचे नियोजन करा. जागतिक स्तरावर उत्पादित सर्व अन्नाचा एक तृतीयांश वाया जातो.',
    icon: 'food-apple',
    gradient: ['#84cc16', '#65a30d'],
  },
  {
    badge: '☀️ SOLAR TIP',
    en: 'Solar energy is the fastest-growing energy source. Even small solar devices reduce carbon footprint.',
    hi: 'सौर ऊर्जा सबसे तेज़ी से बढ़ने वाला ऊर्जा स्रोत है। छोटे सौर उपकरण भी कार्बन फुटप्रिंट कम करते हैं।',
    mr: 'सौर ऊर्जा हा सर्वात वेगाने वाढणारा ऊर्जा स्रोत आहे. लहान सौर उपकरणे देखील कार्बन फूटप्रिंट कमी करतात.',
    icon: 'solar-power',
    gradient: ['#f59e0b', '#b45309'],
  },
  {
    badge: '🏙️ CITY TIP',
    en: 'Use public transport or cycle for short distances. It reduces urban air pollution by up to 45%.',
    hi: 'छोटी दूरियों के लिए सार्वजनिक परिवहन या साइकिल का उपयोग करें। यह शहरी वायु प्रदूषण को 45% तक कम करता है।',
    mr: 'लहान अंतरांसाठी सार्वजनिक वाहतूक किंवा सायकल वापरा. हे शहरी वायू प्रदूषण 45% पर्यंत कमी करते.',
    icon: 'bus',
    gradient: ['#7c3aed', '#6d28d9'],
  },
  {
    badge: '🧴 REDUCE',
    en: 'Buy products with minimal packaging. Excess packaging accounts for 30% of household waste.',
    hi: 'न्यूनतम पैकेजिंग वाले उत्पाद खरीदें। अतिरिक्त पैकेजिंग घरेलू कचरे का 30% है।',
    mr: 'कमीत कमी पॅकेजिंग असलेली उत्पादने विकत घ्या. जास्तीची पॅकेजिंग घरगुती कचऱ्याच्या 30% आहे.',
    icon: 'package-variant-closed',
    gradient: ['#14b8a6', '#0d9488'],
  },
  {
    badge: '🌳 TREE FACT',
    en: 'A single tree absorbs up to 48 pounds of CO2 per year. Plant one today if you can!',
    hi: 'एक पेड़ प्रति वर्ष 48 पाउंड CO2 तक अवशोषित करता है। यदि हो सके तो आज एक पेड़ लगाएं!',
    mr: 'एकच झाड दरवर्षी 48 पाउंड CO2 शोषून घेते. शक्य असल्यास आज एक झाड लावा!',
    icon: 'tree',
    gradient: ['#166534', '#15803d'],
  },
  {
    badge: '🛒 SHOPPING',
    en: 'Choose products made from recycled materials. It closes the recycling loop and supports green industry.',
    hi: 'पुनर्नवीनीकृत सामग्री से बने उत्पाद चुनें। यह रीसाइकलिंग लूप को बंद करता है और हरित उद्योग का समर्थन करता है।',
    mr: 'पुनर्वापरलेल्या सामग्रीपासून बनवलेली उत्पादने निवडा. हे रिसायकलिंग लूप बंद करते आणि हरित उद्योगाला पाठिंबा देते.',
    icon: 'cart-check',
    gradient: ['#10b981', '#047857'],
  },
  {
    badge: '🔥 BURNING',
    en: 'Never burn plastic or rubber waste. It releases toxic dioxins that cause serious health issues.',
    hi: 'कभी भी प्लास्टिक या रबर का कचरा न जलाएं। इससे विषाक्त डाइऑक्सिन निकलते हैं जो गंभीर स्वास्थ्य समस्याएं पैदा करते हैं।',
    mr: 'प्लास्टिक किंवा रबर कचरा कधीही जाळू नका. यातून विषारी डायऑक्सिन सुटतात जे गंभीर आरोग्य समस्या निर्माण करतात.',
    icon: 'fire-alert',
    gradient: ['#ef4444', '#dc2626'],
  },
  {
    badge: '💧 RAINWATER',
    en: 'Collect rainwater for watering plants. One hour of rain on a small roof collects 1,000 litres.',
    hi: 'पौधों को पानी देने के लिए वर्षा जल संग्रह करें। एक छोटी छत पर एक घंटे की बारिश 1,000 लीटर पानी जमा करती है।',
    mr: 'झाडांना पाणी देण्यासाठी पावसाचे पाणी गोळा करा. लहान छतावर एक तासाचा पाऊस 1,000 लिटर पाणी गोळा करतो.',
    icon: 'weather-rainy',
    gradient: ['#2563eb', '#1d4ed8'],
  },
  {
    badge: '🥗 EAT GREEN',
    en: 'Eating less meat once a week can save 500 kg of CO2 emissions per person per year.',
    hi: 'सप्ताह में एक बार कम मांस खाने से प्रति व्यक्ति प्रति वर्ष 500 किग्रा CO2 उत्सर्जन बचाया जा सकता है।',
    mr: 'आठवड्यातून एकदा कमी मांस खाल्ल्याने प्रति व्यक्ती दरवर्षी 500 किलो CO2 उत्सर्जन वाचवता येते.',
    icon: 'leaf',
    gradient: ['#4ade80', '#16a34a'],
  },
  {
    badge: '📱 E-WASTE',
    en: 'Recycle your old phone. The materials in one smartphone can be recovered and reused completely.',
    hi: 'अपना पुराना फोन रीसाइकल करें। एक स्मार्टफोन की सामग्री पूरी तरह से पुनर्प्राप्त और पुन: उपयोग की जा सकती है।',
    mr: 'तुमचा जुना फोन रिसायकल करा. एका स्मार्टफोनमधील साहित्य पूर्णपणे पुनर्प्राप्त करून पुन्हा वापरता येते.',
    icon: 'cellphone',
    gradient: ['#6366f1', '#4f46e5'],
  },
  {
    badge: '🏡 HOME TIP',
    en: 'Use LED bulbs instead of incandescent ones. LEDs use 75% less energy and last 25 times longer.',
    hi: 'तापदीप्त बल्ब की जगह LED बल्ब का उपयोग करें। LED 75% कम ऊर्जा का उपयोग करते हैं और 25 गुना अधिक समय तक चलते हैं।',
    mr: 'इनकॅन्डेसेंट बल्बऐवजी LED बल्ब वापरा. LED 75% कमी ऊर्जा वापरतात आणि 25 पट जास्त काळ टिकतात.',
    icon: 'lightbulb-on',
    gradient: ['#fbbf24', '#f59e0b'],
  },
  {
    badge: '🌊 MICROPLASTICS',
    en: 'Avoid single-use plastic straws. Over 8.3 billion plastic straws pollute the world\'s beaches.',
    hi: 'एकल उपयोग प्लास्टिक स्ट्रॉ से बचें। 8.3 बिलियन से अधिक प्लास्टिक स्ट्रॉ दुनिया के समुद्र तटों को प्रदूषित करते हैं।',
    mr: 'एकल-वापर प्लास्टिक स्ट्रॉ टाळा. 8.3 अब्जांहून अधिक प्लास्टिक स्ट्रॉ जगातील समुद्रकिनारे प्रदूषित करतात.',
    icon: 'cup-water',
    gradient: ['#0891b2', '#0e7490'],
  },
  {
    badge: '🌿 HERBS',
    en: 'Grow herbs at home to reduce packaging from store-bought products and enjoy fresh produce.',
    hi: 'घर पर जड़ी-बूटियां उगाएं, दुकान से खरीदे उत्पादों की पैकेजिंग कम करें और ताजा उपज का आनंद लें।',
    mr: 'घरी औषधी वनस्पती वाढवा, दुकानातील उत्पादनांची पॅकेजिंग कमी करा आणि ताज्या उत्पादनाचा आनंद घ्या.',
    icon: 'herb',
    gradient: ['#22c55e', '#16a34a'],
  },
  {
    badge: '🖨️ PAPER TIP',
    en: 'Print on both sides of paper and choose digital documents over printed ones whenever possible.',
    hi: 'कागज़ के दोनों तरफ प्रिंट करें और जब भी संभव हो मुद्रित दस्तावेज़ों के बजाय डिजिटल दस्तावेज़ चुनें।',
    mr: 'कागदाच्या दोन्ही बाजूंनी प्रिंट करा आणि शक्य तेव्हा मुद्रित दस्तऐवजांऐवजी डिजिटल दस्तऐवज निवडा.',
    icon: 'printer',
    gradient: ['#64748b', '#475569'],
  },
  {
    badge: '🐄 METHANE',
    en: 'Food rotting in landfills produces methane — a greenhouse gas 25x more potent than CO2.',
    hi: 'लैंडफिल में सड़ने वाला भोजन मीथेन पैदा करता है — एक ग्रीनहाउस गैस जो CO2 से 25 गुना अधिक शक्तिशाली है।',
    mr: 'लँडफिलमध्ये कुजणारे अन्न मिथेन तयार करते — CO2 पेक्षा 25 पट अधिक शक्तिशाली हरितगृह वायू.',
    icon: 'cow',
    gradient: ['#78350f', '#92400e'],
  },
  {
    badge: '🧹 CLEAN UP',
    en: 'Participate in local clean-up drives. Communities that clean together see 40% less littering.',
    hi: 'स्थानीय सफाई अभियानों में भाग लें। एक साथ सफाई करने वाले समुदायों में 40% कम कूड़ा फेंका जाता है।',
    mr: 'स्थानिक स्वच्छता मोहिमांमध्ये सहभागी व्हा. एकत्र साफ करणाऱ्या समुदायांमध्ये 40% कमी कचरा टाकला जातो.',
    icon: 'broom',
    gradient: ['#10b981', '#059669'],
  },
  {
    badge: '🪟 GLASS',
    en: 'Glass can be recycled infinitely without losing quality. Always separate glass from other waste.',
    hi: 'कांच को गुणवत्ता खोए बिना अनंत बार रीसाइकल किया जा सकता है। हमेशा कांच को अन्य कचरे से अलग करें।',
    mr: 'काच गुणवत्ता न गमावता अनंत वेळा रिसायकल करता येते. नेहमी काच इतर कचऱ्यापासून वेगळी करा.',
    icon: 'bottle-wine',
    gradient: ['#0284c7', '#0369a1'],
  },
  {
    badge: '🌡️ CLIMATE',
    en: 'Global temperature has risen 1.1°C since pre-industrial times. Every action to reduce waste matters.',
    hi: 'पूर्व-औद्योगिक समय से वैश्विक तापमान 1.1°C बढ़ा है। कचरे को कम करने के लिए हर कदम मायने रखता है।',
    mr: 'पूर्व-औद्योगिक काळापासून जागतिक तापमान 1.1°C वाढले आहे. कचरा कमी करण्यासाठी प्रत्येक कृती महत्त्वाची आहे.',
    icon: 'thermometer',
    gradient: ['#f97316', '#ea580c'],
  },
  {
    badge: '🚰 TAP WATER',
    en: 'Tap water is 300x cheaper than bottled water and produces 1,000x less waste. Choose wisely.',
    hi: 'नल का पानी बोतलबंद पानी से 300 गुना सस्ता है और 1,000 गुना कम कचरा पैदा करता है। समझदारी से चुनें।',
    mr: 'नळाचे पाणी बाटलीतील पाण्यापेक्षा 300 पट स्वस्त आहे आणि 1,000 पट कमी कचरा तयार करते.',
    icon: 'faucet',
    gradient: ['#38bdf8', '#0ea5e9'],
  },
  {
    badge: '🛠️ REPAIR',
    en: 'Repair before replacing. Extending a product\'s life by 1 year reduces its carbon footprint by 30%.',
    hi: 'बदलने से पहले मरम्मत करें। किसी उत्पाद की आयु 1 वर्ष बढ़ाने से उसका कार्बन फुटप्रिंट 30% कम हो जाता है।',
    mr: 'बदलण्यापूर्वी दुरुस्त करा. उत्पादनाचे आयुष्य 1 वर्षाने वाढवल्याने त्याचा कार्बन फूटप्रिंट 30% कमी होतो.',
    icon: 'tools',
    gradient: ['#6b7280', '#4b5563'],
  },
  {
    badge: '🏗️ CONSTRUCTION',
    en: 'Construction waste makes up 30% of all waste globally. Reuse building materials where possible.',
    hi: 'निर्माण कचरा विश्व स्तर पर सभी कचरे का 30% है। जहां संभव हो वहां निर्माण सामग्री का पुन: उपयोग करें।',
    mr: 'बांधकाम कचरा जागतिक स्तरावर सर्व कचऱ्याच्या 30% आहे. शक्य तिथे बांधकाम साहित्याचा पुनर्वापर करा.',
    icon: 'domain',
    gradient: ['#d97706', '#b45309'],
  },
  {
    badge: '🌺 NATURE',
    en: 'Biodiversity loss is accelerating. Avoid chemical pesticides — use natural alternatives for gardens.',
    hi: 'जैव विविधता की हानि तेज़ हो रही है। रासायनिक कीटनाशकों से बचें — बगीचों के लिए प्राकृतिक विकल्पों का उपयोग करें।',
    mr: 'जैवविविधता नष्ट होण्याचा वेग वाढत आहे. रासायनिक कीटकनाशके टाळा — बागांसाठी नैसर्गिक पर्याय वापरा.',
    icon: 'flower',
    gradient: ['#d946ef', '#c026d3'],
  },
  {
    badge: '🧃 TETRA PACK',
    en: 'Rinse and flatten tetra packs before recycling. They contain aluminium, plastic and paper — all recyclable.',
    hi: 'रीसाइकल करने से पहले टेट्रा पैक को धोएं और चपटा करें। इनमें एल्युमीनियम, प्लास्टिक और कागज़ होता है — सभी रीसाइकल योग्य।',
    mr: 'रिसायकल करण्यापूर्वी टेट्रा पॅक धुवून सपाट करा. त्यात अॅल्युमिनियम, प्लास्टिक आणि कागद असतात — सर्व रिसायकल करण्यायोग्य.',
    icon: 'cube-outline',
    gradient: ['#10b981', '#0d9488'],
  },
  {
    badge: '🎓 EDUCATE',
    en: 'Teaching children about waste segregation creates lifelong habits. One child influences 3 families.',
    hi: 'बच्चों को कचरा अलगाव के बारे में सिखाना आजीवन आदतें बनाता है। एक बच्चा 3 परिवारों को प्रभावित करता है।',
    mr: 'मुलांना कचरा वर्गीकरणाबद्दल शिकवल्याने आजीवन सवयी तयार होतात. एक मूल 3 कुटुंबांवर प्रभाव टाकते.',
    icon: 'school',
    gradient: ['#8b5cf6', '#6d28d9'],
  },
  {
    badge: '💰 SAVE MONEY',
    en: 'Reducing, reusing and recycling saves an average household ₹5,000–₹8,000 per year.',
    hi: 'घटाना, पुन: उपयोग करना और रीसाइकल करना औसत परिवार को प्रति वर्ष ₹5,000–₹8,000 बचाता है।',
    mr: 'कमी करणे, पुन्हा वापरणे आणि रिसायकल केल्याने सरासरी कुटुंबाला दरवर्षी ₹5,000–₹8,000 वाचतात.',
    icon: 'currency-inr',
    gradient: ['#16a34a', '#15803d'],
  },
  {
    badge: '🌙 NIGHT TIP',
    en: 'Unplug chargers at night. Phantom load from idle chargers adds up to 10% of your electricity bill.',
    hi: 'रात को चार्जर अनप्लग करें। निष्क्रिय चार्जर से फैंटम लोड आपके बिजली बिल का 10% तक जोड़ता है।',
    mr: 'रात्री चार्जर अनप्लग करा. निष्क्रिय चार्जरचा फॅंटम लोड तुमच्या वीज बिलाच्या 10% पर्यंत जोडतो.',
    icon: 'power-plug-off',
    gradient: ['#1e293b', '#334155'],
  },
  {
    badge: '🧺 REUSE',
    en: 'Glass jars from food products make excellent storage containers. Clean and reuse before recycling.',
    hi: 'खाद्य उत्पादों के ग्लास जार उत्कृष्ट स्टोरेज कंटेनर बनाते हैं। रीसाइकल करने से पहले साफ करें और पुन: उपयोग करें।',
    mr: 'अन्न उत्पादनांचे काचेचे जार उत्कृष्ट साठवण डबे बनतात. रिसायकल करण्यापूर्वी स्वच्छ करा आणि पुन्हा वापरा.',
    icon: 'bottle-tonic',
    gradient: ['#0891b2', '#0e7490'],
  },
  {
    badge: '🚿 SHORT SHOWER',
    en: 'Cut shower time by 2 minutes to save 15 litres of water per shower — 5,475 litres per year.',
    hi: 'नहाने का समय 2 मिनट कम करने से प्रति शॉवर 15 लीटर पानी बचता है — प्रति वर्ष 5,475 लीटर।',
    mr: 'शॉवरचा वेळ 2 मिनिटांनी कमी केल्यास प्रति शॉवर 15 लिटर पाणी वाचते — दरवर्षी 5,475 लिटर.',
    icon: 'shower',
    gradient: ['#06b6d4', '#0891b2'],
  },
  {
    badge: '🍕 ZERO WASTE',
    en: 'Use vegetable peels and scraps to make compost or vegetable stock instead of throwing them away.',
    hi: 'सब्जी के छिलके और बचे हुए टुकड़ों का उपयोग खाद बनाने या सब्जी स्टॉक बनाने के लिए करें।',
    mr: 'भाजीपाल्याच्या साली आणि तुकड्यांचा उपयोग खत किंवा भाजी स्टॉक बनवण्यासाठी करा.',
    icon: 'food',
    gradient: ['#65a30d', '#4d7c0f'],
  },
  {
    badge: '🐝 BEES MATTER',
    en: 'Bees pollinate 70% of global food crops. Plant native flowers to support local bee populations.',
    hi: 'मधुमक्खियां वैश्विक खाद्य फसलों का 70% परागण करती हैं। स्थानीय मधुमक्खी आबादी का समर्थन करने के लिए देशी फूल लगाएं।',
    mr: 'मधमाश्या जागतिक अन्न पिकांच्या 70% परागण करतात. स्थानिक मधमाशी लोकसंख्येला पाठिंबा देण्यासाठी देशी फुले लावा.',
    icon: 'bee',
    gradient: ['#fbbf24', '#d97706'],
  },
  {
    badge: '🎨 UPCYCLE',
    en: 'Upcycle old items into new ones — turn old tyres into planters or bottles into lamps.',
    hi: 'पुरानी वस्तुओं को नई में बदलें — पुराने टायर को प्लांटर में या बोतलों को लैंप में बदलें।',
    mr: 'जुन्या वस्तू नव्यात बदला — जुने टायर प्लांटरमध्ये किंवा बाटल्या दिव्यांमध्ये बदला.',
    icon: 'palette',
    gradient: ['#ec4899', '#be185d'],
  },
  {
    badge: '🌾 AGRICULTURE',
    en: 'Organic farming uses 45% less energy than conventional farming and produces zero chemical runoff.',
    hi: 'जैविक खेती पारंपरिक खेती की तुलना में 45% कम ऊर्जा का उपयोग करती है और शून्य रासायनिक अपवाह पैदा करती है।',
    mr: 'सेंद्रिय शेती पारंपरिक शेतीपेक्षा 45% कमी ऊर्जा वापरते आणि शून्य रासायनिक प्रवाह तयार करते.',
    icon: 'barley',
    gradient: ['#84cc16', '#65a30d'],
  },
  {
    badge: '🚗 CAR TIP',
    en: 'Keep tyres properly inflated. Under-inflated tyres reduce fuel efficiency by up to 3%.',
    hi: 'टायर ठीक से फुलाए रखें। कम फुले टायर ईंधन दक्षता को 3% तक कम करते हैं।',
    mr: 'टायर योग्य प्रकारे फुगवलेले ठेवा. कमी फुगवलेले टायर इंधन कार्यक्षमता 3% पर्यंत कमी करतात.',
    icon: 'car',
    gradient: ['#64748b', '#475569'],
  },
  {
    badge: '📰 NEWSPAPER',
    en: 'Old newspapers make excellent packaging material and are 100% recyclable. Use them instead of bubble wrap.',
    hi: 'पुराने अखबार उत्कृष्ट पैकेजिंग सामग्री बनाते हैं और 100% रीसाइकल योग्य हैं।',
    mr: 'जुने वर्तमानपत्रे उत्कृष्ट पॅकेजिंग साहित्य बनतात आणि 100% रिसायकल करण्यायोग्य आहेत.',
    icon: 'newspaper',
    gradient: ['#6b7280', '#374151'],
  },
  {
    badge: '🌊 GROUNDWATER',
    en: 'Improper chemical disposal contaminates groundwater. Always dispose chemicals at designated centres.',
    hi: 'अनुचित रासायनिक निपटान भूजल को दूषित करता है। हमेशा निर्दिष्ट केंद्रों पर रसायनों का निपटान करें।',
    mr: 'अयोग्य रासायनिक विल्हेवाट भूजल दूषित करते. नेहमी निर्दिष्ट केंद्रांवर रसायनांची विल्हेवाट लावा.',
    icon: 'water-pump',
    gradient: ['#2563eb', '#1d4ed8'],
  },
  {
    badge: '🏪 LOCAL BUY',
    en: 'Buy locally grown food. It travels less distance, uses less fuel and supports local farmers.',
    hi: 'स्थानीय रूप से उगाया हुआ खाना खरीदें। यह कम दूरी तय करता है, कम ईंधन का उपयोग करता है और स्थानीय किसानों का समर्थन करता है।',
    mr: 'स्थानिक पिकवलेले अन्न विकत घ्या. हे कमी अंतर प्रवास करते, कमी इंधन वापरते आणि स्थानिक शेतकऱ्यांना पाठिंबा देते.',
    icon: 'store',
    gradient: ['#f97316', '#c2410c'],
  },
  {
    badge: '🌬️ AIR QUALITY',
    en: 'Indoor plants like spider plants and peace lilies can improve indoor air quality by up to 60%.',
    hi: 'स्पाइडर प्लांट और पीस लिली जैसे इनडोर पौधे इनडोर वायु गुणवत्ता में 60% तक सुधार कर सकते हैं।',
    mr: 'स्पायडर प्लांट्स आणि पीस लिलीजसारखी इनडोर रोपे इनडोर हवेची गुणवत्ता 60% पर्यंत सुधारू शकतात.',
    icon: 'air-filter',
    gradient: ['#22d3ee', '#0891b2'],
  },
  {
    badge: '📦 PACKAGING',
    en: 'Choose concentrated cleaning products. They use less packaging and last 3x longer than regular ones.',
    hi: 'सांद्रित सफाई उत्पाद चुनें। वे कम पैकेजिंग का उपयोग करते हैं और सामान्य उत्पादों की तुलना में 3 गुना अधिक समय तक चलते हैं।',
    mr: 'एकाग्र स्वच्छता उत्पादने निवडा. ते कमी पॅकेजिंग वापरतात आणि सामान्य उत्पादनांपेक्षा 3 पट जास्त काळ टिकतात.',
    icon: 'package-down',
    gradient: ['#10b981', '#059669'],
  },
  {
    badge: '🔄 CIRCULAR',
    en: 'A circular economy could reduce global waste by 80%. Every time you recycle, you contribute to it.',
    hi: 'एक परिपत्र अर्थव्यवस्था वैश्विक कचरे को 80% तक कम कर सकती है। हर बार जब आप रीसाइकल करते हैं, तो आप इसमें योगदान करते हैं।',
    mr: 'एक वर्तुळाकार अर्थव्यवस्था जागतिक कचरा 80% पर्यंत कमी करू शकते. जेव्हाही तुम्ही रिसायकल करता, तेव्हा तुम्ही त्यात योगदान देता.',
    icon: 'recycle',
    gradient: ['#7c3aed', '#5b21b6'],
  },
  {
    badge: '🌅 START TODAY',
    en: 'You don\'t need to be perfect. One small eco-friendly habit each week creates a green lifestyle.',
    hi: 'आपको सही होने की जरूरत नहीं है। हर सप्ताह एक छोटी पर्यावरण-अनुकूल आदत एक हरी जीवन शैली बनाती है।',
    mr: 'तुम्हाला परिपूर्ण असण्याची गरज नाही. दर आठवड्यात एक छोटी पर्यावरण-अनुकूल सवय एक हरित जीवनशैली तयार करते.',
    icon: 'emoticon-happy-outline',
    gradient: ['#f59e0b', '#d97706'],
  },
  {
    badge: '🦋 BIODIVERSITY',
    en: 'Reducing pesticide use protects pollinators. 75% of flowering plants depend on animal pollinators.',
    hi: 'कीटनाशकों का उपयोग कम करने से परागणकर्ताओं की रक्षा होती है। 75% फूल वाले पौधे पशु परागणकर्ताओं पर निर्भर हैं।',
    mr: 'कीटकनाशकांचा वापर कमी केल्याने परागकांचे रक्षण होते. 75% फुलझाडे प्राणी परागकांवर अवलंबून असतात.',
    icon: 'butterfly-outline',
    gradient: ['#a855f7', '#7e22ce'],
  },
  {
    badge: '🧪 CHEMICALS',
    en: 'Make DIY cleaners with vinegar and baking soda. They work just as well and create zero toxic waste.',
    hi: 'सिरका और बेकिंग सोडा से DIY क्लीनर बनाएं। वे उतनी ही अच्छी तरह काम करते हैं और शून्य विषाक्त कचरा पैदा करते हैं।',
    mr: 'व्हिनेगर आणि बेकिंग सोडाने DIY क्लीनर बनवा. ते तितकेच चांगले काम करतात आणि शून्य विषारी कचरा तयार करतात.',
    icon: 'flask',
    gradient: ['#2dd4bf', '#0f766e'],
  },
  {
    badge: '🏋️ WASTE FACTS',
    en: 'India generates 62 million tonnes of waste annually. Only 28% is processed or treated.',
    hi: 'भारत सालाना 62 मिलियन टन कचरा उत्पन्न करता है। केवल 28% संसाधित या उपचारित किया जाता है।',
    mr: 'भारत वार्षिक 62 दशलक्ष टन कचरा निर्माण करतो. केवळ 28% प्रक्रिया केली जाते किंवा उपचार केले जाते.',
    icon: 'chart-bar',
    gradient: ['#ef4444', '#b91c1c'],
  },
  {
    badge: '🌍 CARBON',
    en: 'Recycling one aluminium can saves enough energy to run a TV for 3 hours.',
    hi: 'एक एल्युमीनियम कैन रीसाइकल करने से इतनी ऊर्जा बचती है कि टीवी 3 घंटे चला सकते हैं।',
    mr: 'एक अॅल्युमिनियम कॅन रिसायकल केल्याने 3 तास टीव्ही चालवण्याइतकी ऊर्जा वाचते.',
    icon: 'television',
    gradient: ['#10b981', '#047857'],
  },
  {
    badge: '🌻 URBAN GARDEN',
    en: 'Start a terrace or balcony garden. Growing even 10% of your vegetables reduces packaging by 50%.',
    hi: 'छत या बालकनी का बगीचा शुरू करें। अपनी 10% सब्जियां उगाने से पैकेजिंग 50% कम हो जाती है।',
    mr: 'गच्ची किंवा बाल्कनी बाग सुरू करा. तुमच्या 10% भाज्या वाढवल्याने पॅकेजिंग 50% कमी होते.',
    icon: 'sunflower',
    gradient: ['#fbbf24', '#f59e0b'],
  },
  {
    badge: '♻️ PARIVARTAN',
    en: 'Using Parivartan to schedule pickups diverts waste from landfills and earns you EcoPoints. You are making a difference!',
    hi: 'परिवर्तन का उपयोग करके पिकअप शेड्यूल करने से कचरा लैंडफिल से दूर होता है और आपको इको पॉइंट्स मिलते हैं। आप फर्क बना रहे हैं!',
    mr: 'पिकअप शेड्यूल करण्यासाठी परिवर्तन वापरल्याने कचरा लँडफिलपासून दूर होतो आणि तुम्हाला इको पॉइंट्स मिळतात. तुम्ही फरक करत आहात!',
    icon: 'leaf-circle',
    gradient: ['#10b981', '#059669'],
    footer: { en: 'Keep it up! 🌱', hi: 'जारी रखें! 🌱', mr: 'सुरू ठेवा! 🌱' },
  },
];

/**
 * Returns the tip index for today based on the calendar date.
 * All users get the same tip on the same day.
 * Updates automatically at midnight when the app restarts or regains focus.
 */
export const getDailyTipIndex = (): number => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return dayOfYear % ECO_TIPS.length;
};

export const getDailyTip = (): EcoTip => ECO_TIPS[getDailyTipIndex()];

/**
 * Returns the featured tip for today + 4 non-duplicate extras.
 * The featured tip index is deterministic (same for all users on same day).
 * The 4 extras are the next 4 tips after the featured one (wrapping around).
 */
export const getCarouselTips = (): EcoTip[] => {
  const featuredIndex = getDailyTipIndex();
  const total = ECO_TIPS.length;
  const carousel: EcoTip[] = [ECO_TIPS[featuredIndex]];
  for (let i = 1; i <= 4; i++) {
    carousel.push(ECO_TIPS[(featuredIndex + i) % total]);
  }
  return carousel;
};
