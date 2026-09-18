// Stockhouse AI — shared knowledge base.
// A static snapshot of every module's mock data (items, warehouses, suppliers, transfers,
// purchase orders). Whichever page loads this file can override any one of these with its
// own LIVE in-memory array (via Stockhouse.init({...})) so answers about the module you're
// currently looking at always match what's on screen; every other module falls back to this
// shared baseline so numbers never contradict each other across pages.
var STOCKHOUSE_KB = {
  plants: ['Plant A · Gurgaon', 'Plant B · Pune', 'Plant C · Chennai', 'Plant D · Bhiwandi'],

  items: [
    { id: 1, name: 'Boxy Knit Vest', sku: 'TOP-1096', vendor: 'Hanover Works', category: 'Tops', plant: 'Plant A · Gurgaon', onHand: 444, reorder: 126, status: 'healthy', cover: '3.5x', coverPct: 70, dailyDemand: 16, cost: 1240 },
    { id: 2, name: 'Canvas Low Top', sku: 'FTW-1215', vendor: 'Verado Mills', category: 'Footwear', plant: 'Plant B · Pune', onHand: 259, reorder: 66, status: 'healthy', cover: '3.9x', coverPct: 78, dailyDemand: 42, cost: 2150 },
    { id: 3, name: 'Canvas Tote', sku: 'ACC-1285', vendor: 'Pergola Goods', category: 'Accessories', plant: 'Plant A · Gurgaon', onHand: 470, reorder: 150, status: 'healthy', cover: '3.1x', coverPct: 62, dailyDemand: 20, cost: 890 },
    { id: 4, name: 'Card Holder', sku: 'ACC-1292', vendor: 'Hanover Works', category: 'Accessories', plant: 'Plant C · Chennai', onHand: 98, reorder: 120, status: 'belowReorder', cover: '1.6x', coverPct: 33, dailyDemand: 22, cost: 420 },
    { id: 5, name: 'Cargo Pant', sku: 'BTM-1124', vendor: 'Kestrel Supply Co.', category: 'Bottoms', plant: 'Plant B · Pune', onHand: 0, reorder: 126, status: 'stockout', cover: '0x', coverPct: 4, dailyDemand: 15, cost: 1560 },
    { id: 6, name: 'Cashmere Scarf', sku: 'ACC-1306', vendor: 'Northline Textile', category: 'Accessories', plant: 'Plant D · Bhiwandi', onHand: 272, reorder: 78, status: 'healthy', cover: '3.5x', coverPct: 70, dailyDemand: 9, cost: 3200 },
    { id: 7, name: 'Ceramic Vase', sku: 'HOM-1362', vendor: 'Verado Mills', category: 'Home', plant: 'Plant C · Chennai', onHand: 444, reorder: 108, status: 'overstock', cover: '4.1x', coverPct: 100, dailyDemand: 6, cost: 680 },
    { id: 8, name: 'Chino Short', sku: 'BTM-1131', vendor: 'Hanover Works', category: 'Bottoms', plant: 'Plant A · Gurgaon', onHand: 566, reorder: 198, status: 'healthy', cover: '2.9x', coverPct: 66, dailyDemand: 24, cost: 1180 },
    { id: 9, name: 'Denim Jacket', sku: 'TOP-1103', vendor: 'Verado Mills', category: 'Tops', plant: 'Plant B · Pune', onHand: 180, reorder: 90, status: 'healthy', cover: '2.0x', coverPct: 40, dailyDemand: 12, cost: 1850 },
    { id: 10, name: 'Leather Belt', sku: 'ACC-1319', vendor: 'Meridian Leather Works', category: 'Accessories', plant: 'Plant C · Chennai', onHand: 140, reorder: 80, status: 'healthy', cover: '1.8x', coverPct: 36, dailyDemand: 8, cost: 540 },
    { id: 11, name: 'Wool Beanie', sku: 'ACC-1327', vendor: 'Northline Textile', category: 'Accessories', plant: 'Plant D · Bhiwandi', onHand: 150, reorder: 210, status: 'belowReorder', cover: '0.7x', coverPct: 14, dailyDemand: 8, cost: 340 },
    { id: 12, name: 'Linen Shirt', sku: 'TOP-1140', vendor: 'Hanover Works', category: 'Tops', plant: 'Plant A · Gurgaon', onHand: 210, reorder: 260, status: 'belowReorder', cover: '0.8x', coverPct: 16, dailyDemand: 14, cost: 1420 },
    { id: 13, name: 'Suede Loafer', sku: 'FTW-1228', vendor: 'Verado Mills', category: 'Footwear', plant: 'Plant B · Pune', onHand: 95, reorder: 140, status: 'belowReorder', cover: '0.7x', coverPct: 14, dailyDemand: 5, cost: 2680 },
    { id: 14, name: 'Corduroy Trouser', sku: 'BTM-1148', vendor: 'Kestrel Supply Co.', category: 'Bottoms', plant: 'Plant C · Chennai', onHand: 175, reorder: 230, status: 'belowReorder', cover: '0.8x', coverPct: 15, dailyDemand: 10, cost: 1560 },
    { id: 15, name: 'Table Runner', sku: 'HOM-1375', vendor: 'Pergola Goods', category: 'Home', plant: 'Plant A · Gurgaon', onHand: 120, reorder: 160, status: 'belowReorder', cover: '0.8x', coverPct: 15, dailyDemand: 6, cost: 890 },
    { id: 16, name: 'Puffer Vest', sku: 'TOP-1152', vendor: 'Verado Mills', category: 'Tops', plant: 'Plant B · Pune', onHand: 0, reorder: 140, status: 'stockout', cover: '0x', coverPct: 4, dailyDemand: 11, cost: 2450 },
    { id: 17, name: 'Ankle Boot', sku: 'FTW-1241', vendor: 'Kestrel Supply Co.', category: 'Footwear', plant: 'Plant D · Bhiwandi', onHand: 0, reorder: 95, status: 'stockout', cover: '0x', coverPct: 4, dailyDemand: 7, cost: 3120 },
    { id: 18, name: 'Wide-Leg Jean', sku: 'BTM-1155', vendor: 'Hanover Works', category: 'Bottoms', plant: 'Plant A · Gurgaon', onHand: 0, reorder: 180, status: 'stockout', cover: '0x', coverPct: 4, dailyDemand: 18, cost: 1680 },
    { id: 19, name: 'Leather Tote', sku: 'ACC-1334', vendor: 'Meridian Leather Works', category: 'Accessories', plant: 'Plant C · Chennai', onHand: 0, reorder: 85, status: 'stockout', cover: '0x', coverPct: 4, dailyDemand: 6, cost: 3450 },
    { id: 20, name: 'Throw Pillow', sku: 'HOM-1382', vendor: 'Pergola Goods', category: 'Home', plant: 'Plant B · Pune', onHand: 0, reorder: 110, status: 'stockout', cover: '0x', coverPct: 4, dailyDemand: 9, cost: 560 },
    { id: 21, name: 'Fleece Hoodie', sku: 'TOP-1167', vendor: 'Hanover Works', category: 'Tops', plant: 'Plant A · Gurgaon', onHand: 520, reorder: 140, status: 'overstock', cover: '3.7x', coverPct: 100, dailyDemand: 7, cost: 1780 },
    { id: 22, name: 'Suede Sneaker', sku: 'FTW-1254', vendor: 'Verado Mills', category: 'Footwear', plant: 'Plant B · Pune', onHand: 610, reorder: 160, status: 'overstock', cover: '3.8x', coverPct: 100, dailyDemand: 9, cost: 2340 },
    { id: 23, name: 'Straw Tote', sku: 'ACC-1341', vendor: 'Pergola Goods', category: 'Accessories', plant: 'Plant A · Gurgaon', onHand: 480, reorder: 130, status: 'overstock', cover: '3.7x', coverPct: 100, dailyDemand: 6, cost: 760 },
    { id: 24, name: 'Wide Belt', sku: 'ACC-1348', vendor: 'Meridian Leather Works', category: 'Accessories', plant: 'Plant C · Chennai', onHand: 390, reorder: 100, status: 'overstock', cover: '3.9x', coverPct: 100, dailyDemand: 5, cost: 580 },
    { id: 25, name: 'Ceramic Planter', sku: 'HOM-1389', vendor: 'Verado Mills', category: 'Home', plant: 'Plant D · Bhiwandi', onHand: 560, reorder: 145, status: 'overstock', cover: '3.9x', coverPct: 100, dailyDemand: 8, cost: 720 }
  ],

  warehouses: [
    { id: 1, name: 'Plant A · Gurgaon', code: 'WH-GGN-01', location: 'Gurgaon, Haryana', manager: 'Priya Nair', units: 8120, capacity: 10000, utilPct: 81, status: 'normal' },
    { id: 2, name: 'Plant B · Pune', code: 'WH-PUN-02', location: 'Pune, Maharashtra', manager: 'Rahul Mehta', units: 5430, capacity: 7500, utilPct: 72, status: 'normal' },
    { id: 3, name: 'Plant C · Chennai', code: 'WH-CHN-03', location: 'Chennai, Tamil Nadu', manager: 'Mira Delgado', units: 3860, capacity: 6000, utilPct: 64, status: 'normal' },
    { id: 4, name: 'Plant D · Bhiwandi', code: 'WH-BHW-04', location: 'Bhiwandi, Maharashtra', manager: 'Priya Nair', units: 2975, capacity: 4500, utilPct: 66, status: 'normal' },
    { id: 5, name: 'Central DC · Delhi', code: 'WH-DEL-05', location: 'Delhi NCR', manager: 'Rahul Mehta', units: 4690, capacity: 5000, utilPct: 94, status: 'nearCapacity' },
    { id: 6, name: 'Returns Hub · Mumbai', code: 'WH-MUM-06', location: 'Mumbai, Maharashtra', manager: 'Mira Delgado', units: 948, capacity: 3000, utilPct: 32, status: 'lowUtilization' },
    { id: 7, name: 'Plant E · Nagpur', code: 'WH-NGP-07', location: 'Nagpur, Maharashtra', manager: 'Devika Rao', units: 3355, capacity: 5500, utilPct: 61, status: 'normal' },
    { id: 8, name: 'Plant F · Kochi', code: 'WH-KCH-08', location: 'Kochi, Kerala', manager: 'Arjun Menon', units: 2310, capacity: 4200, utilPct: 55, status: 'normal' },
    { id: 9, name: 'Hub · Kolkata', code: 'WH-KOL-09', location: 'Kolkata, West Bengal', manager: 'Ishaan Verma', units: 2660, capacity: 3800, utilPct: 70, status: 'normal' },
    { id: 10, name: 'Depot · Jaipur', code: 'WH-JAI-10', location: 'Jaipur, Rajasthan', manager: 'Kabir Malhotra', units: 1536, capacity: 3200, utilPct: 48, status: 'normal' }
  ],

  suppliers: [
    { id: 1, name: 'Hanover Works', category: 'Apparel & Accessories', contact: 'Ananya Bose', openPOs: 3, ratePct: 96, status: 'active', priceVariancePct: 4, fulfillmentAccuracyPct: 97, complianceStatus: 'current', volumeTrend: 'up' },
    { id: 2, name: 'Verado Mills', category: 'Footwear', contact: 'Devraj Singh', openPOs: 2, ratePct: 91, status: 'active', priceVariancePct: 18, fulfillmentAccuracyPct: 93, complianceStatus: 'current', volumeTrend: 'stable' },
    { id: 3, name: 'Pergola Goods', category: 'Home & Accessories', contact: 'Leela Krishnan', openPOs: 2, ratePct: 88, status: 'active', priceVariancePct: 2, fulfillmentAccuracyPct: 95, complianceStatus: 'current', volumeTrend: 'stable' },
    { id: 4, name: 'Kestrel Supply Co.', category: 'Bottoms', contact: 'Omar Farooqi', openPOs: 1, ratePct: 79, status: 'onHold', priceVariancePct: 9, fulfillmentAccuracyPct: 84, complianceStatus: 'expiring', volumeTrend: 'down' },
    { id: 5, name: 'Northline Textile', category: 'Accessories', contact: 'Sana Iqbal', openPOs: 1, ratePct: 97, status: 'active', priceVariancePct: -3, fulfillmentAccuracyPct: 98, complianceStatus: 'current', volumeTrend: 'up' },
    { id: 6, name: 'Solano Freight & Textiles', category: 'Raw Materials', contact: 'Marco Solano', openPOs: 0, ratePct: 92, status: 'inactive', priceVariancePct: 1, fulfillmentAccuracyPct: 90, complianceStatus: 'current', volumeTrend: 'down' },
    { id: 7, name: 'Ridgeview Apparel Co.', category: 'Apparel', contact: 'Farah Khan', openPOs: 2, ratePct: 85, status: 'active', priceVariancePct: 7, fulfillmentAccuracyPct: 91, complianceStatus: 'expiring', volumeTrend: 'stable' },
    { id: 8, name: 'Meridian Leather Works', category: 'Leather Goods', contact: 'Tomas Rivera', openPOs: 0, ratePct: 90, status: 'inactive', priceVariancePct: 0, fulfillmentAccuracyPct: 93, complianceStatus: 'current', volumeTrend: 'down' },
    { id: 9, name: 'Bellweather Textiles', category: 'Raw Materials', contact: 'Priyanka Shah', openPOs: 1, ratePct: 94, status: 'active', priceVariancePct: 3, fulfillmentAccuracyPct: 96, complianceStatus: 'current', volumeTrend: 'stable' },
    { id: 10, name: 'Coral Bay Footwear', category: 'Footwear', contact: 'Neel Bhatt', openPOs: 2, ratePct: 82, status: 'active', priceVariancePct: 11, fulfillmentAccuracyPct: 88, complianceStatus: 'expiring', volumeTrend: 'down' }
  ],

  transfers: [
    { id: 1, tid: 'TRF-2041', item: 'Boxy Knit Vest', from: 'Plant A · Gurgaon', to: 'Plant B · Pune', qty: 30, status: 'completed', requestedBy: 'Priya Nair', date: 'Sep 6, 2026' },
    { id: 2, tid: 'TRF-2042', item: 'Canvas Low Top', from: 'Plant B · Pune', to: 'Plant C · Chennai', qty: 45, status: 'inTransit', requestedBy: 'Rahul Mehta', date: 'Sep 12, 2026' },
    { id: 3, tid: 'TRF-2043', item: 'Cashmere Scarf', from: 'Plant D · Bhiwandi', to: 'Plant A · Gurgaon', qty: 60, status: 'pending', requestedBy: 'Abhishek Gupta', date: 'Sep 14, 2026' },
    { id: 4, tid: 'TRF-2044', item: 'Chino Short', from: 'Plant A · Gurgaon', to: 'Plant D · Bhiwandi', qty: 80, status: 'completed', requestedBy: 'Priya Nair', date: 'Sep 2, 2026' },
    { id: 5, tid: 'TRF-2045', item: 'Ceramic Vase', from: 'Plant C · Chennai', to: 'Plant B · Pune', qty: 25, status: 'inTransit', requestedBy: 'Rahul Mehta', date: 'Sep 15, 2026' },
    { id: 6, tid: 'TRF-2046', item: 'Canvas Tote', from: 'Plant A · Gurgaon', to: 'Plant C · Chennai', qty: 50, status: 'cancelled', requestedBy: 'Abhishek Gupta', date: 'Aug 30, 2026' },
    { id: 7, tid: 'TRF-2047', item: 'Card Holder', from: 'Plant C · Chennai', to: 'Plant A · Gurgaon', qty: 40, status: 'pending', requestedBy: 'Priya Nair', date: 'Sep 15, 2026' },
    { id: 8, tid: 'TRF-2048', item: 'Cargo Pant', from: 'Plant B · Pune', to: 'Plant D · Bhiwandi', qty: 35, status: 'completed', requestedBy: 'Rahul Mehta', date: 'Sep 8, 2026' },
    { id: 9, tid: 'TRF-2049', item: 'Denim Jacket', from: 'Plant B · Pune', to: 'Plant A · Gurgaon', qty: 20, status: 'inTransit', requestedBy: 'Abhishek Gupta', date: 'Sep 16, 2026' },
    { id: 10, tid: 'TRF-2050', item: 'Leather Belt', from: 'Plant C · Chennai', to: 'Plant D · Bhiwandi', qty: 15, status: 'completed', requestedBy: 'Abhishek Gupta', date: 'Sep 10, 2026' }
  ],

  purchaseOrders: [
    { id: 1, poId: 'PO-3081', vendor: 'Hanover Works', itemsCount: 6, lineCount: 2, value: '₹4,82,000', valueNum: 482000, status: 'received', orderDate: 'Aug 20, 2026', expectedDate: 'Aug 30, 2026' },
    { id: 2, poId: 'PO-3082', vendor: 'Verado Mills', itemsCount: 9, lineCount: 2, value: '₹6,15,500', valueNum: 615500, status: 'inTransit', orderDate: 'Sep 5, 2026', expectedDate: 'Sep 18, 2026' },
    { id: 3, poId: 'PO-3083', vendor: 'Pergola Goods', itemsCount: 4, lineCount: 1, value: '₹1,84,200', valueNum: 184200, status: 'pending', orderDate: 'Sep 12, 2026', expectedDate: 'Sep 25, 2026' },
    { id: 4, poId: 'PO-3084', vendor: 'Kestrel Supply Co.', itemsCount: 7, lineCount: 2, value: '₹3,40,000', valueNum: 340000, status: 'draft', orderDate: '—', expectedDate: '—' },
    { id: 5, poId: 'PO-3085', vendor: 'Northline Textile', itemsCount: 3, lineCount: 1, value: '₹92,400', valueNum: 92400, status: 'received', orderDate: 'Aug 15, 2026', expectedDate: 'Aug 22, 2026' },
    { id: 6, poId: 'PO-3086', vendor: 'Hanover Works', itemsCount: 11, lineCount: 3, value: '₹7,88,900', valueNum: 788900, status: 'inTransit', orderDate: 'Sep 8, 2026', expectedDate: 'Sep 20, 2026' },
    { id: 7, poId: 'PO-3087', vendor: 'Verado Mills', itemsCount: 5, lineCount: 2, value: '₹2,64,750', valueNum: 264750, status: 'pending', orderDate: 'Sep 14, 2026', expectedDate: 'Sep 28, 2026' },
    { id: 8, poId: 'PO-3088', vendor: 'Pergola Goods', itemsCount: 2, lineCount: 1, value: '₹1,12,300', valueNum: 112300, status: 'draft', orderDate: '—', expectedDate: '—' },
    { id: 9, poId: 'PO-3089', vendor: 'Ridgeview Apparel Co.', itemsCount: 9, lineCount: 2, value: '₹5,77,500', valueNum: 577500, status: 'inTransit', orderDate: 'Sep 10, 2026', expectedDate: 'Sep 24, 2026' },
    { id: 10, poId: 'PO-3090', vendor: 'Meridian Leather Works', itemsCount: 8, lineCount: 1, value: '₹1,72,000', valueNum: 172000, status: 'draft', orderDate: '—', expectedDate: '—' }
  ]
};

var STOCKHOUSE_HEALTH_META = {
  good: { bg: '#ecfdf1', fg: '#047857', dot: '#10bc83' },
  mid: { bg: '#fff7ed', fg: '#b84509', dot: '#e56106' },
  bad: { bg: '#feecec', fg: '#b91c1c', dot: '#dc2626' }
};

function stockhouseHealthScore(sup) {
  var score = 90;
  score += (sup.ratePct >= 95 ? 0 : sup.ratePct >= 88 ? -3 : sup.ratePct >= 80 ? -10 : -22);
  score += (sup.priceVariancePct <= 0 ? 0 : sup.priceVariancePct < 10 ? -3 : sup.priceVariancePct < 18 ? -10 : -18);
  score += (sup.fulfillmentAccuracyPct >= 95 ? 0 : sup.fulfillmentAccuracyPct >= 90 ? -3 : sup.fulfillmentAccuracyPct >= 85 ? -8 : -16);
  score += (sup.complianceStatus === 'current' ? 0 : sup.complianceStatus === 'expiring' ? -6 : -20);
  score += (sup.volumeTrend === 'up' ? 2 : sup.volumeTrend === 'stable' ? 0 : -6);
  score = Math.max(5, Math.min(98, score));
  var band = score >= 80 ? 'good' : (score >= 60 ? 'mid' : 'bad');
  var bandLabel = { good: 'Reliable', mid: 'Needs attention', bad: 'At risk' };
  return { score: score, band: band, meta: STOCKHOUSE_HEALTH_META[band], label: bandLabel[band] };
}

function stockhouseEsc(s) {
  return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
}

function stockhouseFmtCr(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}
