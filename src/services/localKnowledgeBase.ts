export interface KnowledgeEntry {
  keywords: string[];
  response: string;
}

// ─── 1. WASTE SEGREGATION ─────────────────────────────────────────────────

const wasteSegrigation: KnowledgeEntry[] = [
  {
    keywords: ['wet waste', 'organic bin', 'green bin', 'food scrap', 'leftover', 'cooked food', 'vegetable peel', 'fruit peel'],
    response: `🟢 Wet Waste Guide

Wet waste is biodegradable — it can be composted or processed into biogas.

What goes in the green bin:
• Vegetable and fruit peels
• Leftover cooked food
• Tea bags, coffee grounds
• Eggshells, nutshells
• Flowers, leaves, garden trimmings

Tips:
• Drain excess water before disposal
• Use newspaper to line your bin instead of plastic bags
• Never mix wet waste with dry/recyclable waste

♻️ Wet waste composted at home can reduce your household landfill waste by up to 30%.`,
  },
  {
    keywords: ['dry waste', 'recyclable', 'blue bin', 'dry bin', 'recyclable waste'],
    response: `🔵 Dry Waste Guide

Dry waste includes all recyclable and non-biodegradable materials.

What goes in the blue bin:
• Paper, newspapers, cardboard
• Plastic bottles, containers, bags
• Glass bottles and jars
• Metal cans, foil, tins
• Tetra packs, cartons

Tips:
• Rinse containers before putting them in
• Keep dry waste away from moisture
• Flatten boxes and bottles to save space
• Remove food residue — contaminated items cannot be recycled

♻️ Properly sorted dry waste has an 80% higher recycling rate than mixed waste.`,
  },
  {
    keywords: ['plastic', 'plastic bottle', 'plastic bag', 'polythene', 'polybag', 'plastic recycl', 'plastic waste', 'single use plastic', 'pet bottle'],
    response: `♻️ Plastic Waste Guide

Not all plastics are the same — check the number inside the recycling triangle:

✅ Widely recyclable:
• #1 PET — water bottles, food containers
• #2 HDPE — milk jugs, shampoo bottles
• #5 PP — yogurt containers, bottle caps

⚠️ Harder to recycle (minimize use):
• #3 PVC, #6 PS, #7 Other

Best practices:
• Rinse before recycling
• Flatten bottles to save space
• Never burn plastic — it releases toxic fumes
• Switch to reusable bags and bottles

🌱 Every kg of plastic recycled saves ~2 kg of CO₂ emissions.`,
  },
  {
    keywords: ['paper', 'newspaper', 'paper recycl', 'paper waste', 'office paper', 'magazine', 'book'],
    response: `📄 Paper Recycling Guide

Paper is one of the easiest materials to recycle!

✅ Recyclable:
• Newspapers, magazines
• Office and printing paper
• Paper bags, envelopes
• Books (remove hard covers)

❌ Not recyclable:
• Greasy or food-soiled paper
• Wax-coated cups or paper
• Thermal receipt paper
• Laminated or glossy paper

Tips:
• Keep paper dry — wet paper loses recycling value
• Remove plastic windows from envelopes
• Donate readable books to libraries or NGOs before recycling

🌱 Recycling 1 tonne of paper saves 17 trees and 26,500 litres of water.`,
  },
  {
    keywords: ['glass', 'glass bottle', 'glass jar', 'glass recycl', 'glass waste', 'broken glass'],
    response: `🫙 Glass Recycling Guide

Glass is 100% recyclable and can be recycled endlessly without losing quality!

✅ Recyclable glass:
• Beverage bottles (clear, green, brown)
• Food jars (pickle, jam, sauce)
• Medicine bottles

❌ Not recyclable in regular bins:
• Mirrors and window glass (coated)
• Light bulbs — take to e-waste centre
• Ceramics and porcelain
• Ovenware (Pyrex)

Tips:
• Rinse before recycling
• Remove metal lids and recycle separately
• Wrap broken glass in newspaper before disposal

🌱 Recycling glass saves 40% of the energy needed to make new glass.`,
  },
  {
    keywords: ['metal', 'aluminium', 'aluminum', 'steel', 'tin can', 'iron', 'copper', 'brass', 'scrap metal', 'metal recycl', 'metal waste'],
    response: `🔩 Metal Recycling Guide

Metal is infinitely recyclable and extremely valuable!

✅ Recyclable metals:
• Aluminium cans, foil, trays
• Steel and tin food cans
• Copper wires and pipes
• Iron and steel scraps

Tips:
• Rinse food cans before recycling
• Crush aluminium cans to save space
• Take copper, brass and aluminium to your local kabadiwala — they often pay for it!
• Aerosol cans: only recycle when completely empty

🌱 Recycling aluminium uses 95% less energy than producing it from raw bauxite ore.`,
  },
  {
    keywords: ['cloth', 'clothes', 'textile', 'fabric', 'old clothes', 'donate clothes', 'shirt', 'dress', 'uniform', 'garment'],
    response: `👕 Clothes & Textile Disposal Guide

Textiles are one of the most wasteful categories — but there are better options than landfill!

♻️ Options for old clothes:
• Donate to NGOs, shelters, or community drives if wearable
• Give to local kabadiwala — they buy old clothes by weight
• Drop at H&M, Zara or brand recycling bins
• Repurpose as cleaning rags, bags, or quilts
• Use textile recycling bins if available in your city

❌ Avoid:
• Burning old clothes — releases toxic chemicals
• Dumping in regular trash

🌱 Extending a garment's life by 9 months reduces its environmental impact by 20–30%.`,
  },
  {
    keywords: ['cardboard', 'carton', 'box', 'corrugated', 'cardboard recycl', 'cardboard box'],
    response: `📦 Cardboard Recycling Guide

Cardboard is one of the most recycled materials in the world!

✅ Recyclable:
• Corrugated cardboard boxes
• Cereal and food boxes
• Tissue and shoe boxes
• Paper tubes and rolls

❌ Not recyclable:
• Greasy pizza boxes (the grease contaminates pulp)
• Wax-coated cardboard
• Cardboard with heavy tape or staples (remove them first)

Tips:
• Always flatten boxes before putting in the bin
• Remove plastic packaging tape
• Keep dry — wet cardboard loses its fibre strength

🌱 Recycling cardboard uses 75% less energy than making it from virgin wood pulp.`,
  },
];

// ─── 2. E-WASTE ───────────────────────────────────────────────────────────

const eWaste: KnowledgeEntry[] = [
  {
    keywords: ['battery', 'batteries', 'aa battery', 'aaa battery', 'lithium battery', 'alkaline battery', 'button cell', 'coin battery', 'battery disposal', 'battery recycl'],
    response: `🔋 Battery Disposal Guide

Batteries are hazardous — NEVER put them in regular trash or drains!

Types and how to dispose:
• 🔋 AA/AAA/9V alkaline — drop at electronics store collection points
• 📱 Lithium-ion (phone/laptop) — return to manufacturer or e-waste centre
• 🚗 Car/lead-acid batteries — return to mechanic or battery dealer (they buy them back!)
• 🔦 Button/coin cells — take to pharmacy or e-waste drop-off

Why it matters:
• Batteries release lead, mercury and cadmium when they leak
• These toxins contaminate soil and water for decades
• Li-ion batteries can cause fires if damaged

Safe storage tip: Tape the terminals of lithium batteries before storage.

📍 Find collection points via Parivartan's Recycler Partners section.`,
  },
  {
    keywords: ['mobile phone', 'old phone', 'phone disposal', 'phone recycl', 'smartphone', 'broken phone', 'used phone'],
    response: `📱 Mobile Phone Disposal Guide

Your old phone contains valuable materials — gold, silver, copper — and toxic ones too.

Steps to dispose responsibly:
1. 🔒 Factory reset and wipe all personal data
2. Remove SIM card and memory card
3. Take to an authorized e-waste recycler or brand take-back program
4. Or sell/donate if still functional

Take-back programs available:
• Samsung, Apple, Xiaomi, OnePlus — all have exchange/recycling offers
• Flipkart and Amazon offer exchange discounts on old devices

❌ Never throw in regular bin — phones contain lead, mercury and cadmium.

🌱 1 million recycled phones recover ~35,000 lbs of copper and 772 lbs of silver.`,
  },
  {
    keywords: ['laptop', 'old laptop', 'laptop disposal', 'laptop recycl', 'computer', 'desktop', 'pc disposal'],
    response: `💻 Laptop & Computer Disposal Guide

Computers contain hazardous materials — handle with care.

Steps:
1. 🔒 Backup data, then factory reset or destroy hard drive
2. Remove battery if possible (dispose separately)
3. Contact certified e-waste recyclers

Options:
• Brand take-back programs (Dell, HP, Lenovo, Apple all offer this)
• Authorized e-waste collection centres
• Exchange offers at electronics stores
• Donate to schools or NGOs if still functional

Check your state's Pollution Control Board (PCB) website for certified recyclers near you.

🌱 Proper e-waste recycling recovers rare earth metals that would otherwise be mined destructively.`,
  },
  {
    keywords: ['charger', 'cable', 'wire', 'adapter', 'old charger', 'usb cable', 'power adapter'],
    response: `🔌 Chargers & Cables Disposal Guide

Old chargers and cables are e-waste — don't bin them!

Why they're hazardous:
• Contain PVC plastic, copper, and lead solder
• Burning releases toxic fumes

How to dispose:
• Drop at any e-waste collection bin or centre
• Many electronics stores (Croma, Reliance Digital) accept them
• Bundle with other e-waste for kabadiwala pickup

Reuse tip: Old USB cables can be repurposed as cable ties, plant ties, or kept as backup chargers.

📍 Use Parivartan's Recycler Partners to find the nearest e-waste drop-off.`,
  },
  {
    keywords: ['e-waste', 'ewaste', 'electronic waste', 'electronic', 'electronics', 'appliance', 'tv', 'television', 'refrigerator', 'fridge', 'ac', 'air conditioner', 'washing machine', 'microwave', 'printer', 'monitor'],
    response: `🖥️ E-Waste Disposal Guide

E-waste is the fastest growing waste stream globally — handle it responsibly!

What counts as e-waste:
• Mobile phones, laptops, computers, tablets
• TVs, monitors, printers, scanners
• Refrigerators, ACs, washing machines
• Chargers, cables, batteries, bulbs

Why it's dangerous:
• Contains lead, mercury, cadmium, arsenic
• Burning releases toxic fumes
• Pollutes soil and groundwater for decades

How to dispose responsibly:
• 📍 Drop at authorized e-waste centres
• 🏪 Brand take-back programs (Samsung, LG, Whirlpool, HP)
• 🔄 Exchange old appliances during upgrade offers
• 🏭 Check PCB certified recyclers for your state

🌱 Only 20% of global e-waste is formally recycled — be part of the solution!`,
  },
];

// ─── 3. COMPOSTING ────────────────────────────────────────────────────────

const composting: KnowledgeEntry[] = [
  {
    keywords: ['compost', 'composting', 'home compost', 'backyard compost', 'compost bin', 'compost pit', 'vermicompost', 'earthworm'],
    response: `🌱 Home Composting Guide

Turn your kitchen waste into rich fertilizer — it's easier than you think!

What to compost:
✅ Vegetable and fruit peels, tea leaves, coffee grounds, eggshells, dry leaves, garden trimmings, plain cooked rice/bread (small amounts)

❌ Avoid:
Meat, fish, dairy, oily food, pet waste, diseased plants

3 easy methods:
1. 🪣 Bin composting — layer green (wet) and brown (dry) waste, turn every 2 weeks
2. 🕳️ Pit composting — dig a small pit, add waste in layers, cover with soil
3. 🪱 Vermicomposting — use red wriggler earthworms for faster, richer compost

Timeline: Ready in 6–8 weeks. Signs it's done: dark, crumbly, earthy smell.

🌱 Composting can divert up to 30% of your household waste from landfill.`,
  },
  {
    keywords: ['food waste', 'wasted food', 'leftover food', 'food disposal', 'kitchen waste', 'reduce food waste'],
    response: `🍽️ Food Waste Guide

India wastes ~68 million tonnes of food every year — here's how to reduce your share:

Reduce food waste at source:
• Plan meals before grocery shopping
• Store food properly to extend shelf life
• Use FIFO — First In, First Out for your pantry
• Repurpose leftovers creatively

If food waste is unavoidable:
• Compost vegetable peels and organic scraps
• Donate excess cooked food via apps like No Food Waste or Robin Hood Army
• Use vegetable scraps to make stock

❌ Avoid:
• Throwing food in dry waste bin
• Mixing food waste with recyclables

🌱 Reducing food waste is the single most impactful climate action an individual can take.`,
  },
  {
    keywords: ['organic waste', 'biodegradable', 'biodegradable waste', 'organic material', 'natural waste'],
    response: `🍃 Organic Waste Guide

Organic/biodegradable waste is nature's raw material — don't waste it!

What is organic waste:
• Food scraps and peels
• Garden and plant waste
• Paper and natural fibres
• Wood shavings, sawdust

Best ways to handle it:
• 🌱 Compost at home (bin, pit, or vermicomposting)
• 🐄 Give to nearby farms or dairy — vegetable peels are great animal feed
• ♻️ Put in green bin for municipal biogas/composting plant

Never:
• Burn organic waste — it releases methane and particulates
• Mix with hazardous or plastic waste

🌱 Organic waste composted produces humus that improves soil health and reduces need for chemical fertilizers.`,
  },
];

// ─── 4. SUSTAINABILITY ────────────────────────────────────────────────────

const sustainability: KnowledgeEntry[] = [
  {
    keywords: ['reduce plastic', 'avoid plastic', 'less plastic', 'plastic free', 'no plastic', 'plastic alternative', 'reusable bag', 'carry bag'],
    response: `🚫 Reducing Plastic Usage

Small plastic-free swaps that make a big difference:

Easy replacements:
• 🛍️ Plastic bag → cloth or jute bag
• 🍶 Plastic water bottle → stainless steel or glass bottle
• 🥤 Plastic straw → bamboo or metal straw
• 🪥 Plastic toothbrush → bamboo toothbrush
• 🧴 Liquid soap in plastic → bar soap
• 🧻 Cling wrap → beeswax wrap or reusable containers

Shopping habits:
• Buy in bulk to reduce packaging
• Choose loose produce over packaged
• Carry your own containers for takeaway food
• Avoid individually wrapped snacks

🌱 If every person in India refused one plastic bag per day, we'd eliminate 1.3 billion bags daily.`,
  },
  {
    keywords: ['water conservation', 'save water', 'water saving', 'water waste', 'water usage'],
    response: `💧 Water Conservation Guide

Every drop matters — India faces a serious water crisis.

At home:
• Fix leaky taps immediately (1 drip = ~20 litres/day wasted)
• Take shorter showers (5 mins saves ~50 litres vs 10 mins)
• Use bucket instead of hose for washing vehicles
• Run dishwasher and washing machine only when full
• Reuse cooking water for plants

In the garden:
• Water plants early morning or evening
• Use drip irrigation instead of sprinklers
• Collect rainwater for garden use

In daily life:
• Turn off tap while brushing teeth (saves 8 litres/brush)
• Fix running toilets — can waste 200 litres/day

🌱 India has 18% of the world's population but only 4% of its freshwater resources.`,
  },
  {
    keywords: ['energy conservation', 'save energy', 'electricity saving', 'energy saving', 'power saving', 'electricity bill'],
    response: `⚡ Energy Conservation Guide

Saving energy reduces both your bills and carbon footprint!

At home:
• 💡 Switch to LED bulbs — use 75% less energy than incandescent
• 🔌 Unplug chargers and appliances when not in use (standby power adds up!)
• ❄️ Set AC to 24°C — every degree lower increases energy use by 6%
• 🌞 Use natural light during the day
• 🧺 Air-dry clothes instead of using a dryer

Appliances:
• Buy 5-star BEE rated appliances
• Keep refrigerator coils clean
• Use pressure cooker — saves up to 70% cooking energy

At work:
• Shut down computers, don't just sleep them
• Use power strips with switches

🌱 If every Indian household switched to LED lighting, we'd save 40 billion kWh per year.`,
  },
  {
    keywords: ['sustainable lifestyle', 'sustainable living', 'sustainable habit', 'green lifestyle', 'eco lifestyle', 'zero waste', 'zero waste living'],
    response: `🌍 Sustainable Lifestyle Guide

Sustainability isn't perfection — it's making better choices every day.

The 5 R's framework:
1. 🚫 Refuse — what you don't need
2. ↘️ Reduce — what you do use
3. 🔁 Reuse — before buying new
4. ♻️ Recycle — what remains
5. 🌱 Rot (compost) — the rest

Daily habits:
• Carry a reusable kit (bag, bottle, straw, container)
• Shop local and seasonal food
• Choose quality over quantity — buy less, buy better
• Repair before replacing
• Opt for digital receipts and bills

Community actions:
• Participate in clean-up drives
• Share/borrow items instead of buying
• Support local recyclers through Parivartan

🌱 You don't need to be zero-waste perfectly — a million people doing it imperfectly beats a few doing it perfectly.`,
  },
  {
    keywords: ['eco friendly', 'eco-friendly', 'eco habit', 'green habit', 'green tip', 'daily eco', 'environment habit', 'go green', 'save earth', 'save environment'],
    response: `💚 Eco-Friendly Daily Habits

Easy wins for a greener life:

Morning:
• Bamboo toothbrush instead of plastic
• Bar soap instead of body wash in plastic bottle
• Cold water wash for clothes (saves energy)

Shopping:
• Bring your own bags and containers
• Buy local, seasonal produce
• Choose minimal packaging

At home:
• Compost kitchen scraps
• Fix dripping taps
• Use both sides of paper
• Air-dry dishes and clothes

Digital life:
• Unsubscribe from spam (data centres use energy!)
• Stream at lower resolution when quality doesn't matter
• Use video calls to avoid travel

Community:
• Share and borrow tools/equipment
• Join local clean-up drives
• Teach children about segregation

🌱 Small consistent habits compound into massive environmental impact over time.`,
  },
];

// ─── 5. PARIVARTAN APP FEATURES ───────────────────────────────────────────

const appFeatures: KnowledgeEntry[] = [
  {
    keywords: ['pickup', 'schedule pickup', 'waste pickup', 'request pickup', 'pickup request', 'book pickup', 'arrange pickup', 'how to pickup'],
    response: `📦 How to Schedule a Waste Pickup

Scheduling a pickup on Parivartan is quick and easy!

Steps:
1. Open the app and tap the 📷 Identify button at the bottom
2. Photograph or select your waste type
3. Confirm the waste category and quantity
4. Choose a pickup address and time slot
5. Submit your request

What happens next:
• A verified recycler partner near you gets notified
• They confirm and arrive at your scheduled time
• After successful pickup, you earn EcoPoints! 🌱

Tips:
• Have your waste segregated and ready before the pickup
• Add clear notes if your location is tricky to find
• Track your request status in the Requests tab

♻️ Every pickup you schedule contributes to keeping your community cleaner!`,
  },
  {
    keywords: ['ecopoint', 'eco point', 'eco points', 'green point', 'points', 'how points work', 'earn points', 'point system'],
    response: `🌱 How EcoPoints Work

EcoPoints are Parivartan's reward currency for responsible waste disposal!

How to earn:
• ✅ Completing a waste pickup request
• ✅ Identifying waste using the camera
• ✅ Engaging in the community (posts, comments)
• ✅ Achieving recycling milestones

How to track:
• Your current points are shown on the Home screen
• Full history is in the Rewards tab

What EcoPoints represent:
• Each point = a step toward a cleaner environment
• Points reflect your environmental contribution
• Higher points = higher impact ranking in your community

🎯 The more you recycle through Parivartan, the more EcoPoints you earn — and the more impact you make!`,
  },
  {
    keywords: ['reward', 'rewards', 'redeem', 'prize', 'benefit', 'reward program', 'what can i get', 'use points'],
    response: `🎁 Rewards Program

Your EcoPoints can unlock real rewards!

How it works:
• Earn EcoPoints by completing pickups and engaging with the app
• View available rewards in the Rewards tab
• Redeem points for discounts, vouchers, and eco-products

Types of rewards:
• 🛒 Discounts with partner brands
• 🌱 Eco-friendly product vouchers
• 🏆 Community recognition badges
• 📊 Impact certificates

Tips:
• Check the Rewards tab regularly for new offers
• Some rewards are time-limited
• The more you recycle, the faster you unlock higher-tier rewards

🌱 Parivartan believes responsible recycling should be rewarding — literally!`,
  },
  {
    keywords: ['recycler partner', 'recycler', 'partner', 'nearby recycler', 'find recycler', 'recycler network', 'who picks up', 'collection partner'],
    response: `🤝 Recycler Partners

Parivartan works with a network of verified recycling partners to collect your waste!

Who are they:
• Local kabadiwala businesses
• Certified e-waste recyclers
• NGO-run collection centres
• Municipal authorized collectors

How they work:
• Partners receive your pickup request
• They confirm availability and arrive at your scheduled time
• They ensure waste goes to the right facility (not landfill!)

Finding partners:
• Go to Home → Recycler Partners
• See verified partners near your location
• View their ratings, waste types accepted, and availability

🌱 All Parivartan recycler partners are verified to ensure responsible handling of your waste.`,
  },
  {
    keywords: ['identify waste', 'waste identification', 'scan waste', 'camera', 'detect waste', 'what type of waste', 'classify waste', 'waste scanner'],
    response: `📷 Waste Identification Feature

Not sure what category your waste belongs to? Let Parivartan identify it for you!

How to use:
1. Tap the 📷 central button on the bottom navigation
2. Point your camera at the waste item
3. The AI model identifies the waste type automatically
4. Confirm the result and proceed to schedule a pickup

Waste types it can identify:
• Cardboard, Glass, Metal, Paper, Plastic, General trash

Tips:
• Ensure good lighting for better accuracy
• Hold the camera steady
• Place waste on a plain background for best results

🌱 The waste identification model runs directly on your device — no internet needed!`,
  },
  {
    keywords: ['community', 'community feature', 'post', 'community post', 'share', 'social', 'feed', 'community tips', 'parivartan community'],
    response: `👥 Community Feature

Parivartan's community connects eco-conscious people like you!

What you can do:
• 📝 Share recycling tips and sustainability ideas
• 📸 Post photos of your recycling activities
• 💬 Comment and engage with other members
• 🌱 Inspire your neighbourhood to recycle more

How to access:
• Go to Home → Community
• Browse the community feed
• Tap the + button to create a new post

Community guidelines:
• Keep posts related to waste management and sustainability
• Be respectful and encouraging
• No spam or unrelated content

🌱 Together, small individual actions create community-wide change. Share your eco journey!`,
  },
];

// ─── 6. ENVIRONMENTAL AWARENESS ──────────────────────────────────────────

const environmentalAwareness: KnowledgeEntry[] = [
  {
    keywords: ['benefit of recycling', 'why recycle', 'importance of recycling', 'recycling benefit', 'recycling help', 'why should i recycle'],
    response: `🌍 Benefits of Recycling

Recycling is one of the most impactful actions you can take for the planet!

Environmental benefits:
• Reduces landfill waste and methane emissions
• Saves raw materials and natural resources
• Reduces energy consumption in manufacturing
• Lowers greenhouse gas emissions
• Protects soil, water, and wildlife

Economic benefits:
• Creates jobs in the recycling industry
• Reduces manufacturing costs
• Saves government waste management costs
• Kabadiwala economy supports millions of livelihoods in India

Personal benefits:
• Earn EcoPoints on Parivartan
• Contributes to a cleaner neighbourhood
• Teaches children responsibility

By the numbers:
• Recycling 1 aluminium can saves energy to power a TV for 3 hours
• Recycling 1 glass bottle saves enough energy to power a bulb for 4 hours

🌱 Recycling is not just good — it's essential.`,
  },
  {
    keywords: ['circular economy', 'circular', 'linear economy', 'waste to resource', 'cradle to cradle', 'closed loop'],
    response: `🔄 What is the Circular Economy?

The circular economy is a smarter alternative to our current "take-make-waste" system.

Linear economy (current):
🌍 Extract → 🏭 Make → 🛒 Use → 🗑️ Throw away

Circular economy:
🌍 Extract → 🏭 Make → 🛒 Use → ♻️ Recycle/Reuse → back to 🏭 Make

Key principles:
• Design products to last longer
• Repair and reuse before discarding
• Recycle materials back into production
• Eliminate waste and pollution

Examples in everyday life:
• Buying second-hand clothing
• Choosing refillable products
• Composting food waste
• Using Parivartan to connect waste with recyclers

🌱 The circular economy could reduce global greenhouse gas emissions by 39% by 2032.`,
  },
  {
    keywords: ['climate', 'climate change', 'climate impact', 'global warming', 'greenhouse', 'carbon footprint', 'carbon emission', 'co2'],
    response: `🌡️ Waste & Climate Change

Waste management is directly linked to climate change — here's how:

How waste contributes to climate change:
• Landfills produce methane — 80x more potent than CO₂ over 20 years
• Burning waste releases CO₂, black carbon and toxic gases
• Manufacturing new products (instead of recycling) uses massive energy
• Food waste decomposing in landfills = significant methane source

What you can do:
• ♻️ Recycle — reduces energy needed for manufacturing
• 🌱 Compost — diverts organic waste from methane-producing landfills
• 🚫 Reduce — the most powerful action (less production = less emissions)
• 🛒 Buy less, buy better quality

India context:
• India is the 3rd largest emitter globally
• Waste sector contributes ~5% of India's total GHG emissions

🌱 Your recycling choices directly reduce carbon emissions — every action counts.`,
  },
  {
    keywords: ['waste reduction', 'reduce waste', 'less waste', 'minimize waste', 'waste minimization', 'produce less waste'],
    response: `📉 Waste Reduction Guide

The best waste is waste that was never created.

The waste reduction hierarchy:
1. 🚫 Refuse — don't take what you don't need (free pens, plastic bags, flyers)
2. ↘️ Reduce — buy less, choose quality over quantity
3. 🔁 Reuse — repair, repurpose, donate before discarding
4. ♻️ Recycle — only after the above options are exhausted
5. 🌱 Recover — compost organic waste

Practical tips:
• Go digital — bills, tickets, receipts
• Borrow or rent items used occasionally
• Choose products with minimal or recyclable packaging
• Cook at home to reduce takeaway packaging
• Say no to freebies you don't need

Shopping wisely:
• One good quality item > three cheap disposable ones
• Buy refillable versions of cleaning products
• Choose concentrated products (less packaging)

🌱 If India reduced household waste by 50%, it would be equivalent to taking 12 million cars off the road.`,
  },
];

// ─── MASTER KNOWLEDGE BASE ────────────────────────────────────────────────

const knowledge: KnowledgeEntry[] = [
  ...wasteSegrigation,
  ...eWaste,
  ...composting,
  ...sustainability,
  ...appFeatures,
  ...environmentalAwareness,
];

const FALLBACK_RESPONSE = `🌱 Hi! I'm Pari, your waste management assistant.

I can help you with topics like:
• 🗑️ Waste segregation (wet, dry, plastic, paper, glass, metal)
• 💻 E-waste & 🔋 battery disposal
• 🌱 Composting & organic waste
• 🌍 Sustainability & eco-friendly habits
• 📦 Parivartan app features (pickups, EcoPoints, rewards)
• ♻️ Recycling benefits & environmental awareness

Try asking me something like:
"How do I dispose of batteries?"
"What goes in the blue bin?"
"How do EcoPoints work?"
"How can I reduce plastic waste?"`;

export function getLocalResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  for (const entry of knowledge) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.response;
    }
  }
  return FALLBACK_RESPONSE;
}

// ─── SUGGESTED PROMPTS (used on welcome screen) ───────────────────────────

export const SUGGESTED_PROMPTS = [
  { label: '🔋 Battery disposal', text: 'How do I dispose of batteries?' },
  { label: '🌱 EcoPoints', text: 'How do EcoPoints work?' },
  { label: '📦 Cardboard recycling', text: 'Can cardboard be recycled?' },
  { label: '💻 E-waste', text: 'What is e-waste?' },
  { label: '📦 Schedule pickup', text: 'How do I schedule a pickup?' },
  { label: '🚫 Reduce plastic', text: 'How can I reduce plastic waste?' },
  { label: '♻️ After recycling', text: 'What happens after recycling?' },
  { label: '🤝 Recycler partners', text: 'How do recycler partners work?' },
  { label: '🌱 Composting', text: 'What is composting?' },
  { label: '📷 Waste identification', text: 'How does waste identification work?' },
];
