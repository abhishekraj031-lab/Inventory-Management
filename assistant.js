// Stockhouse AI — shared chat widget (floating button + panel) with a real-voice mic input,
// loaded on every page. Each page can hand it its own LIVE data arrays (see Stockhouse.init
// below); anything not handed in falls back to the static snapshot in assistant-data.js so
// answers about other modules stay consistent no matter which page you're asking from.
var Stockhouse = (function () {
  var esc = stockhouseEsc;
  var fmtCr = stockhouseFmtCr;

  var DATA = null;
  var aiChat = { open: false, listening: false, messages: [], nextId: 1 };
  var recognition = null;
  var micSupported = false;

  var exampleQueries = [
    'Create a PO for items low on stock',
    'Show items below reorder point',
    'Which plant has the most Cargo Pant stock?',
    'How is Hanover Works doing?',
    'Which warehouse is near capacity?',
    'How many transfers are pending?',
    'Status of PO-3082',
    'Top vendors by spend'
  ];

  // ---------------------------------------------------------------- markup

  function injectMarkup() {
    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<button class="ai-fab" type="button" data-action="ai-toggle">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z"/><path d="M19 11a7 7 0 0 1-14 0"/><path d="M12 18v3"/><path d="M9 21h6"/></svg>' +
        'Ask Stockhouse AI' +
      '</button>' +
      '<div class="ai-chat-panel" id="aiChatPanel">' +
        '<div class="ai-chat-head">' +
          '<div class="ai-chat-head-text"><span class="t">Stockhouse AI</span><span class="s">Command chat · human review required before any PO sends</span></div>' +
          '<button class="ai-chat-close" type="button" data-action="ai-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '</div>' +
        '<div class="ai-chat-body" id="aiChatMessages"></div>' +
        '<div class="ai-chat-foot">' +
          '<div class="ai-input-row">' +
            '<input id="aiChatInput" type="text" placeholder="Ask Stockhouse AI…" autocomplete="off">' +
            '<button class="ai-mic-btn" id="aiMicBtn" type="button" data-action="ai-mic" title="Ask by voice"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></svg></button>' +
            '<button class="ai-send-btn" id="aiSendBtn" type="button" data-action="ai-send"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>' +
          '</div>' +
        '</div>' +
      '</div>';
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
  }

  // ------------------------------------------------------------- rendering

  function addMessage(role, html, chips) {
    var id = aiChat.nextId++;
    aiChat.messages.push({ id: id, role: role, html: html, chips: chips || null });
    renderChat();
  }

  function ensureGreeting() {
    if (aiChat.messages.length > 0) return;
    addMessage('assistant', 'Hi Abhishek — ask me about items, purchase orders, transfers, suppliers or warehouses, draft a PO for low-stock items, or answer spend questions. Nothing gets sent without your review. Tap the mic to ask out loud, or try one of these:', [
      { action: 'example', text: exampleQueries[1], label: 'Show items below reorder point' },
      { action: 'example', text: exampleQueries[3], label: 'How is Hanover Works doing?' },
      { action: 'example', text: exampleQueries[4], label: 'Which warehouse is near capacity?' },
      { action: 'example', text: exampleQueries[7], label: 'Top vendors by spend' }
    ]);
  }

  function renderChat() {
    var panel = document.getElementById('aiChatPanel');
    if (!panel) return;
    panel.style.display = aiChat.open ? 'flex' : 'none';
    var list = document.getElementById('aiChatMessages');
    list.innerHTML = aiChat.messages.map(function (m) {
      var chipsHtml = '';
      if (m.chips && m.chips.length) {
        chipsHtml = '<div class="ai-chip-row">' + m.chips.map(function (c, i) {
          return '<button type="button" class="ai-chip" data-action="ai-chip" data-mid="' + m.id + '" data-ci="' + i + '">' + esc(c.label) + '</button>';
        }).join('') + '</div>';
      }
      return '<div class="ai-msg ' + m.role + '"><div class="ai-bubble">' + m.html + '</div>' + chipsHtml + '</div>';
    }).join('');
    list.scrollTop = list.scrollHeight;
    var micBtn = document.getElementById('aiMicBtn');
    if (micBtn) {
      micBtn.classList.toggle('listening', aiChat.listening);
      micBtn.classList.toggle('unsupported', !micSupported);
      micBtn.title = micSupported ? 'Ask by voice' : 'Voice input not supported in this browser';
    }
    var input = document.getElementById('aiChatInput');
    if (input) input.placeholder = aiChat.listening ? 'Listening…' : 'Ask Stockhouse AI…';
  }

  // ---------------------------------------------------------- data lookups

  function findMentioned(list, text, nameKey) {
    // Matches the full name verbatim, or (for compound names like "Central DC \u00b7 Delhi")
    // the segment before the separator on its own, so a natural mention like "Central DC"
    // still resolves without the user having to say the full "Site \u00b7 City" form.
    var best = null, bestLen = 0;
    list.forEach(function (x) {
      var full = x[nameKey].toLowerCase();
      var candidates = [full];
      if (full.indexOf('\u00b7') !== -1) {
        full.split('\u00b7').forEach(function (seg) {
          var s = seg.replace(/^\s+|\s+$/g, '');
          if (s.length >= 3) candidates.push(s);
        });
      }
      candidates.forEach(function (c) {
        if (text.indexOf(c) !== -1 && c.length > bestLen) {
          best = x[nameKey];
          bestLen = c.length;
        }
      });
    });
    return best;
  }
  function byName(list, nameKey, name) {
    return list.filter(function (x) { return x[nameKey] === name; })[0];
  }
  function findPoId(text) {
    var m = text.match(/po[\s-]?(\d{4})/i);
    return m ? ('PO-' + m[1]) : null;
  }
  function findTransferId(text) {
    var m = text.match(/trf[\s-]?(\d{4})/i);
    return m ? ('TRF-' + m[1]) : null;
  }

  function plantSplitForItem(it) {
    var others = DATA.plants.filter(function (p) { return p !== it.plant; }).slice(0, 2);
    var splitPlants = [it.plant].concat(others);
    var fractions = [0.55, 0.30, 0.15];
    return splitPlants.map(function (p, i) { return { plant: p, units: Math.round(it.onHand * fractions[i]) }; });
  }

  function vendorSpendTotals() {
    var byVendor = {};
    DATA.purchaseOrders.forEach(function (p) {
      if (!byVendor[p.vendor]) byVendor[p.vendor] = { vendor: p.vendor, total: 0, count: 0 };
      byVendor[p.vendor].total += p.valueNum;
      byVendor[p.vendor].count += 1;
    });
    return Object.keys(byVendor).map(function (k) { return byVendor[k]; }).sort(function (a, b) { return b.total - a.total; });
  }
  function spendBarChartHtml(rows) {
    var max = rows.reduce(function (m, r) { return Math.max(m, r.total); }, 1);
    return rows.map(function (r) {
      var pct = Math.max(4, Math.round((r.total / max) * 100));
      return '<div class="spend-bar-row"><span class="spend-bar-name">' + esc(r.vendor) + '</span>' +
        '<div class="spend-bar-track"><div class="spend-bar-fill" style="width:' + pct + '%;"></div></div>' +
        '<span class="spend-bar-val">' + fmtCr(r.total) + '</span></div>';
    }).join('');
  }

  var STATUS_LABELS = { healthy: 'Healthy', belowReorder: 'Low on stock', stockout: 'Out of stock', overstock: 'Overstocked' };
  function statusLabel(s) { return STATUS_LABELS[s] || s; }

  function groupLowStockByVendor() {
    var lowStock = DATA.items.filter(function (it) { return it.status === 'belowReorder' || it.status === 'stockout'; });
    var byVendor = {};
    lowStock.forEach(function (it) {
      if (!byVendor[it.vendor]) byVendor[it.vendor] = { vendor: it.vendor, hasStockout: false, lines: [] };
      if (it.status === 'stockout') byVendor[it.vendor].hasStockout = true;
      var qty = Math.max(it.reorder * 2 - it.onHand, it.reorder);
      byVendor[it.vendor].lines.push({ item: it.name, qty: qty });
    });
    var groups = Object.keys(byVendor).map(function (k) { return byVendor[k]; });
    groups.sort(function (a, b) { return (b.hasStockout ? 1 : 0) - (a.hasStockout ? 1 : 0); });
    return groups;
  }
  function openGroupedPoDraft(groups) {
    try { localStorage.setItem('stockhouseRecSelection', JSON.stringify({ groups: groups, aiDrafted: true })); } catch (e) {}
    window.location.href = 'create-po.html';
  }

  // ---------------------------------------------------------------- intent

  function processCommand(raw) {
    addMessage('user', esc(raw));
    var text = raw.toLowerCase();

    // 1. Draft a PO for low-stock items
    var isPoIntent = /\b(po|purchase order)\b/.test(text);
    var isLowStockIntent = /(low.*stock|below reorder|reorder point|stockout|out of stock)/.test(text);
    if (isPoIntent && isLowStockIntent) {
      var groups = groupLowStockByVendor();
      if (groups.length === 0) {
        addMessage('assistant', "Good news — nothing is currently at or below its reorder point, so there's nothing to draft a PO for.");
        return;
      }
      var totalCount = groups.reduce(function (s, g) { return s + g.lines.length; }, 0);
      var msgHtml = '<b>' + totalCount + ' item' + (totalCount === 1 ? '' : 's') + '</b> ' + (totalCount === 1 ? 'is' : 'are') +
        ' currently low on stock (at or below reorder point), across ' + groups.length + ' vendor' + (groups.length === 1 ? '' : 's') + '. ' +
        'Nothing sends automatically — review the items or go straight to a grouped PO for your approval.';
      addMessage('assistant', msgHtml, [
        { action: 'viewItems', label: 'View Items' },
        { action: 'createPoGroups', groups: groups, label: 'Create PO' }
      ]);
      return;
    }

    // 2. Spend questions
    var isSpendIntent = /\bspen(d|t|ding)\b/.test(text);
    if (isSpendIntent) {
      var totals = vendorSpendTotals();
      var grandTotal = totals.reduce(function (s, r) { return s + r.total; }, 0);
      var mentionedVendor = findMentioned(DATA.purchaseOrders.filter(function (p, i, arr) { return arr.findIndex(function (x) { return x.vendor === p.vendor; }) === i; }), text, 'vendor');
      if (mentionedVendor) {
        var row = totals.filter(function (r) { return r.vendor === mentionedVendor; })[0];
        addMessage('assistant', 'You’ve spent <b>' + fmtCr(row.total) + '</b> with <b>' + esc(mentionedVendor) + '</b> across ' + row.count + ' purchase order' + (row.count === 1 ? '' : 's') + ' — ' + Math.round((row.total / grandTotal) * 100) + '% of total spend.');
        return;
      }
      if (/top|highest|biggest|most\b/.test(text) || /by vendor/.test(text)) {
        var top = totals.slice(0, 5);
        addMessage('assistant', 'Here’s spend by vendor, ranked, across your ' + DATA.purchaseOrders.length + ' purchase orders on record:' + spendBarChartHtml(top));
        return;
      }
      addMessage('assistant', 'Total spend across all purchase orders on record is <b>' + fmtCr(grandTotal) + '</b>. Ask about a specific vendor (e.g. “How much have we spent with Verado Mills?”) or say “top vendors by spend” for the full breakdown.');
      return;
    }

    // 3. Direct PO / Transfer ID lookups
    var poId = findPoId(text);
    if (poId) {
      var po = DATA.purchaseOrders.filter(function (p) { return p.poId === poId; })[0];
      if (po) {
        addMessage('assistant', '<b>' + esc(po.poId) + '</b> — ' + esc(po.vendor) + ', ' + po.lineCount + ' product' + (po.lineCount === 1 ? '' : 's') + ' (' + po.itemsCount + ' units), ' + po.value + ', status <b>' + esc(po.status) + '</b>' + (po.orderDate !== '—' ? ', ordered ' + esc(po.orderDate) : '') + '.', [
          { action: 'navigate', href: 'po-detail.html?po=' + encodeURIComponent(po.poId), label: 'View ' + po.poId }
        ]);
      } else {
        addMessage('assistant', 'I couldn’t find a purchase order with ID ' + esc(poId) + '.');
      }
      return;
    }
    var transferId = findTransferId(text);
    if (transferId) {
      var tr = DATA.transfers.filter(function (t) { return t.tid === transferId; })[0];
      if (tr) {
        addMessage('assistant', '<b>' + esc(tr.tid) + '</b>: ' + tr.qty + ' units of ' + esc(tr.item) + ' from ' + esc(tr.from) + ' to ' + esc(tr.to) + ' — status <b>' + esc(tr.status) + '</b>, requested by ' + esc(tr.requestedBy) + '.', [
          { action: 'navigate', href: 'transfers.html', label: 'View Transfers' }
        ]);
      } else {
        addMessage('assistant', 'I couldn’t find a transfer with ID ' + esc(transferId) + '.');
      }
      return;
    }

    // 4. Supplier health
    var supplierHealthKeywords = /(health|risk|reliab|score|doing|status|rating|perform|trust|issue|problem|trouble)/.test(text);
    var mentionedSupplierEarly = supplierHealthKeywords ? findMentioned(DATA.suppliers, text, 'name') : null;
    var isSupplierIntent = supplierHealthKeywords && (mentionedSupplierEarly || /\b(supplier|vendor)\b/.test(text));
    if (isSupplierIntent) {
      var mentionedSupplier = mentionedSupplierEarly;
      if (mentionedSupplier) {
        var sup = byName(DATA.suppliers, 'name', mentionedSupplier);
        var hs = stockhouseHealthScore(sup);
        var insight = hs.band === 'bad' ? 'Consider a formal review before placing further orders, or sourcing this category from a backup vendor.'
          : hs.band === 'mid' ? 'Worth keeping an eye on — price variance or fulfillment accuracy is starting to slip.'
          : 'Performing well across on-time rate, pricing and compliance.';
        addMessage('assistant', '<b>' + esc(mentionedSupplier) + '</b> has a health score of <b>' + hs.score + '/100</b> (' + hs.label + '). ' + insight, [
          { action: 'navigate', href: 'supplier-detail.html?id=' + sup.id, label: 'View ' + mentionedSupplier }
        ]);
        return;
      }
      var ranked = DATA.suppliers.map(function (s) { return { s: s, hs: stockhouseHealthScore(s) }; }).sort(function (a, b) { return a.hs.score - b.hs.score; });
      if (/at risk|worst|lowest|weak|underperform/.test(text)) {
        var worst = ranked[0];
        addMessage('assistant', '<b>' + esc(worst.s.name) + '</b> is currently your lowest-scoring supplier — <b>' + worst.hs.score + '/100</b> (' + worst.hs.label + ').' + (ranked.length > 1 ? ' Next: ' + esc(ranked[1].s.name) + ' at ' + ranked[1].hs.score + '.' : ''), [
          { action: 'navigate', href: 'supplier-detail.html?id=' + worst.s.id, label: 'View ' + worst.s.name }
        ]);
        return;
      }
      if (/top|best|highest|reliab/.test(text)) {
        var best = ranked[ranked.length - 1];
        addMessage('assistant', '<b>' + esc(best.s.name) + '</b> is your top-scoring supplier — <b>' + best.hs.score + '/100</b> (' + best.hs.label + ').', [
          { action: 'navigate', href: 'supplier-detail.html?id=' + best.s.id, label: 'View ' + best.s.name }
        ]);
        return;
      }
      var bandCounts = { good: 0, mid: 0, bad: 0 };
      ranked.forEach(function (r) { bandCounts[r.hs.band]++; });
      addMessage('assistant', 'Across your ' + DATA.suppliers.length + ' suppliers: <b>' + bandCounts.good + ' reliable</b>, <b>' + bandCounts.mid + ' need attention</b>, <b>' + bandCounts.bad + ' at risk</b>. Ask about a specific vendor (e.g. “how is Hanover Works doing?”) or say “which supplier is at risk”.', [
        { action: 'navigate', href: 'suppliers.html', label: 'View Suppliers' }
      ]);
      return;
    }

    // 5. Warehouse capacity / utilization
    var isWarehouseIntent = /(capacity|utiliz|near capacity|underutil|low utilization|how full|warehouse status|space left|room (left|available)|how much space|full up|any room)/.test(text);
    if (isWarehouseIntent) {
      var mentionedWh = findMentioned(DATA.warehouses, text, 'name');
      if (mentionedWh) {
        var wh = byName(DATA.warehouses, 'name', mentionedWh);
        var whNote = wh.status === 'nearCapacity' ? 'It’s flagged near capacity.' : wh.status === 'lowUtilization' ? 'It’s flagged for low utilization.' : 'Operating normally.';
        addMessage('assistant', '<b>' + esc(wh.name) + '</b> is holding <b>' + wh.units.toLocaleString('en-IN') + ' units</b> of ' + wh.capacity.toLocaleString('en-IN') + ' capacity — <b>' + wh.utilPct + '%</b> utilized. ' + whNote, [
          { action: 'navigate', href: 'warehouses.html', label: 'View Warehouses' }
        ]);
        return;
      }
      if (/near capacity|full/.test(text)) {
        var near = DATA.warehouses.filter(function (w) { return w.status === 'nearCapacity'; });
        if (!near.length) { addMessage('assistant', 'No warehouses are currently flagged near capacity.'); return; }
        addMessage('assistant', near.map(function (w) { return '<b>' + esc(w.name) + '</b> at ' + w.utilPct + '%'; }).join(', ') + ' — flagged near capacity.', [
          { action: 'navigate', href: 'warehouses.html?filter=capacityImbalance', label: 'View flagged warehouses' }
        ]);
        return;
      }
      if (/underutil|low utilization/.test(text)) {
        var low = DATA.warehouses.filter(function (w) { return w.status === 'lowUtilization'; });
        if (!low.length) { addMessage('assistant', 'No warehouses are currently flagged for low utilization.'); return; }
        addMessage('assistant', low.map(function (w) { return '<b>' + esc(w.name) + '</b> at ' + w.utilPct + '%'; }).join(', ') + ' — flagged for low utilization.', [
          { action: 'navigate', href: 'warehouses.html?filter=capacityImbalance', label: 'View flagged warehouses' }
        ]);
        return;
      }
      var avgUtil = Math.round(DATA.warehouses.reduce(function (s, w) { return s + w.utilPct; }, 0) / DATA.warehouses.length);
      addMessage('assistant', 'Average utilization across your ' + DATA.warehouses.length + ' warehouses is <b>' + avgUtil + '%</b>. Ask about a specific site (e.g. “how full is Central DC?”) or say “which warehouse is near capacity”.', [
        { action: 'navigate', href: 'warehouses.html', label: 'View Warehouses' }
      ]);
      return;
    }

    // 6. Transfer status
    if (/\btransfer/.test(text)) {
      if (/pending/.test(text)) {
        var pend = DATA.transfers.filter(function (t) { return t.status === 'pending'; });
        addMessage('assistant', '<b>' + pend.length + '</b> transfer' + (pend.length === 1 ? '' : 's') + ' pending approval' + (pend.length ? ' — ' + pend.map(function (t) { return esc(t.tid); }).join(', ') : '') + '.', [
          { action: 'navigate', href: 'transfers.html', label: 'View Transfers' }
        ]);
        return;
      }
      if (/in transit|transit/.test(text)) {
        var inTr = DATA.transfers.filter(function (t) { return t.status === 'inTransit'; });
        addMessage('assistant', '<b>' + inTr.length + '</b> transfer' + (inTr.length === 1 ? '' : 's') + ' currently in transit.', [
          { action: 'navigate', href: 'transfers.html', label: 'View Transfers' }
        ]);
        return;
      }
      if (/complet/.test(text)) {
        var comp = DATA.transfers.filter(function (t) { return t.status === 'completed'; });
        addMessage('assistant', '<b>' + comp.length + '</b> transfer' + (comp.length === 1 ? '' : 's') + ' completed on record.', [
          { action: 'navigate', href: 'transfers.html', label: 'View Transfers' }
        ]);
        return;
      }
      var trCounts = { pending: 0, inTransit: 0, completed: 0, cancelled: 0 };
      DATA.transfers.forEach(function (t) { trCounts[t.status] = (trCounts[t.status] || 0) + 1; });
      addMessage('assistant', 'Across your ' + DATA.transfers.length + ' transfers on record: <b>' + trCounts.pending + ' pending</b>, <b>' + trCounts.inTransit + ' in transit</b>, <b>' + trCounts.completed + ' completed</b>, <b>' + trCounts.cancelled + ' cancelled</b>.', [
        { action: 'navigate', href: 'transfers.html', label: 'View Transfers' }
      ]);
      return;
    }

    // 7. PO status (by keyword, not ID)
    var isPoStatusIntent = /\b(po|purchase order)s?\b/.test(text) && /(pending|draft|in transit|received|cancelled|status|how many)/.test(text);
    if (isPoStatusIntent) {
      var statusWord = null;
      if (/draft/.test(text)) statusWord = 'draft';
      else if (/pending/.test(text)) statusWord = 'pending';
      else if (/in transit|transit/.test(text)) statusWord = 'inTransit';
      else if (/received/.test(text)) statusWord = 'received';
      else if (/cancell?ed/.test(text)) statusWord = 'cancelled';
      if (statusWord) {
        var matchingPos = DATA.purchaseOrders.filter(function (p) { return p.status === statusWord; });
        addMessage('assistant', '<b>' + matchingPos.length + '</b> purchase order' + (matchingPos.length === 1 ? '' : 's') + (matchingPos.length ? ' — ' + matchingPos.map(function (p) { return esc(p.poId); }).join(', ') : '') + '.', [
          { action: 'navigate', href: 'purchasing.html?status=' + statusWord, label: 'View in Purchasing' }
        ]);
        return;
      }
      var poCounts = {};
      DATA.purchaseOrders.forEach(function (p) { poCounts[p.status] = (poCounts[p.status] || 0) + 1; });
      addMessage('assistant', 'Across your ' + DATA.purchaseOrders.length + ' purchase orders: ' + Object.keys(poCounts).map(function (k) { return '<b>' + poCounts[k] + ' ' + esc(k) + '</b>'; }).join(', ') + '.', [
        { action: 'navigate', href: 'purchasing.html', label: 'View Purchasing' }
      ]);
      return;
    }

    // 8. Which plant has the most stock of an item
    var isLocationIntent = /(which plant|which location|which warehouse|what plant|what location|by plant|by location)/.test(text);
    if (isLocationIntent) {
      var mentionedItem = findMentioned(DATA.items, text, 'name');
      if (mentionedItem) {
        var mi = byName(DATA.items, 'name', mentionedItem);
        if (mi.onHand === 0) {
          addMessage('assistant', '<b>' + esc(mentionedItem) + '</b> is currently out of stock at every plant (0 units on hand, primarily stocked at ' + esc(mi.plant) + ').');
          return;
        }
        var split = plantSplitForItem(mi);
        var topPlant = split[0];
        var breakdown = split.map(function (s) { return esc(s.plant) + ': ' + s.units + ' units'; }).join(', ');
        addMessage('assistant', '<b>' + esc(topPlant.plant) + '</b> has the most ' + esc(mentionedItem) + ' stock, with <b>' + topPlant.units + ' units</b>. Full breakdown — ' + breakdown + '.', [
          { action: 'navigate', href: 'item-detail.html?id=' + mi.id, label: 'View ' + mentionedItem }
        ]);
        return;
      }
      var byPlant = {};
      DATA.plants.forEach(function (p) { byPlant[p] = 0; });
      DATA.items.forEach(function (it) { byPlant[it.plant] = (byPlant[it.plant] || 0) + it.onHand; });
      addMessage('assistant', 'Total units on hand by plant — ' + DATA.plants.map(function (p) { return esc(p) + ': ' + byPlant[p] + ' units'; }).join(', ') + '. Ask about a specific item (e.g. “which plant has the most Cargo Pant stock?”) for a per-item breakdown.');
      return;
    }

    // 9. Item lookup (stock level, SKU, reorder point, cost)
    if (/(how much|how many|stock level|sku|reorder point|cost of|price of|do we have|on hand|units of|quantity of|inventory of|units left|in stock)/.test(text)) {
      var lookedUpItem = findMentioned(DATA.items, text, 'name');
      if (lookedUpItem) {
        var itm = byName(DATA.items, 'name', lookedUpItem);
        addMessage('assistant', '<b>' + esc(lookedUpItem) + '</b> (' + esc(itm.sku) + ') — <b>' + itm.onHand + ' units</b> on hand at ' + esc(itm.plant) + ', reorder point ' + itm.reorder + ', unit cost ' + fmtCr(itm.cost) + '. Status: ' + esc(statusLabel(itm.status)) + '.', [
          { action: 'navigate', href: 'item-detail.html?id=' + itm.id, label: 'View ' + lookedUpItem }
        ]);
        return;
      }
    }

    // 10. Show / filter the item list — matched on topic keywords ANYWHERE in the sentence
    // (not just when the sentence starts with "show"), so casual phrasing and imperfect voice
    // transcriptions ("you haven't shown me low stock items") still land here instead of falling
    // all the way through to the fallback.
    var filterMap = [
      { re: /below reorder|reorder point|need(s)? to reorder|reorder soon|due for reorder/, key: 'belowReorder', label: 'low on stock' },
      { re: /stock[\s-]?out|out of stock|no stock left|zero stock|not in stock|sold out|nothing left/, key: 'stockout', label: 'out of stock' },
      { re: /over[\s-]?stock(ed)?|excess (stock|inventory)|surplus stock|too much stock|extra stock/, key: 'overstock', label: 'overstocked' },
      { re: /\bhealthy\b|well stocked|good stock levels?|in good shape|stock (is|looks) (fine|good|ok)/, key: 'healthy', label: 'healthy' },
      { re: /low (on )?stock|running low|what'?s low|short on stock|almost out|nearly out|about to run out|low inventory/, key: 'belowReorder', label: 'low on stock' },
      { re: /\b(inventory|items?|products?|stock)\b.*\ball\b|\ball\b.*\b(inventory|items?|products?|stock)\b|everything|full inventory|complete list/, key: 'all', label: 'all items' }
    ];
    var match = filterMap.filter(function (f) { return f.re.test(text); })[0];
    if (match) {
      if (DATA.onFilterItems) {
        var count = DATA.onFilterItems(match.key);
        addMessage('assistant', 'Showing ' + count + ' item' + (count === 1 ? '' : 's') + (match.key === 'all' ? '' : ' — ' + esc(match.label)) + '.');
      } else {
        var matchingItems = match.key === 'all' ? DATA.items : DATA.items.filter(function (it) { return it.status === match.key; });
        addMessage('assistant', '<b>' + matchingItems.length + '</b> item' + (matchingItems.length === 1 ? '' : 's') + (match.key === 'all' ? '' : ' — ' + esc(match.label)) + (matchingItems.length ? ': ' + matchingItems.map(function (it) { return esc(it.name); }).join(', ') : '') + '.', [
          { action: 'navigate', href: 'index.html', label: 'View in Inventory' }
        ]);
      }
      return;
    }

    // 11. Best-effort real-data lookup: the message didn't match a specific keyworded intent
    // above, but if it names a real item, supplier or warehouse, answer with that entity's
    // actual data anyway rather than punting straight to "I don't understand".
    var fbItemName = findMentioned(DATA.items, text, 'name');
    if (fbItemName) {
      var fbItm = byName(DATA.items, 'name', fbItemName);
      addMessage('assistant', '<b>' + esc(fbItemName) + '</b> (' + esc(fbItm.sku) + ') — <b>' + fbItm.onHand + ' units</b> on hand at ' + esc(fbItm.plant) + ', reorder point ' + fbItm.reorder + ', unit cost ' + fmtCr(fbItm.cost) + '. Status: ' + esc(statusLabel(fbItm.status)) + '.', [
        { action: 'navigate', href: 'item-detail.html?id=' + fbItm.id, label: 'View ' + fbItemName }
      ]);
      return;
    }
    var fbSupplierName = findMentioned(DATA.suppliers, text, 'name');
    if (fbSupplierName) {
      var fbSup = byName(DATA.suppliers, 'name', fbSupplierName);
      var fbHs = stockhouseHealthScore(fbSup);
      addMessage('assistant', '<b>' + esc(fbSupplierName) + '</b> — health score <b>' + fbHs.score + '/100</b> (' + fbHs.label + '), ' + fbSup.openPOs + ' open PO' + (fbSup.openPOs === 1 ? '' : 's') + ', ' + esc(fbSup.category) + '.', [
        { action: 'navigate', href: 'supplier-detail.html?id=' + fbSup.id, label: 'View ' + fbSupplierName }
      ]);
      return;
    }
    var fbWarehouseName = findMentioned(DATA.warehouses, text, 'name');
    if (fbWarehouseName) {
      var fbWh = byName(DATA.warehouses, 'name', fbWarehouseName);
      addMessage('assistant', '<b>' + esc(fbWarehouseName) + '</b> — <b>' + fbWh.units.toLocaleString('en-IN') + '</b> of ' + fbWh.capacity.toLocaleString('en-IN') + ' units stored (' + fbWh.utilPct + '% utilized).', [
        { action: 'navigate', href: 'warehouses.html', label: 'View Warehouses' }
      ]);
      return;
    }

    // 12. Fallback — rotates between a few phrasings (with a nudge toward typing after repeated
    // misses) so voice mis-transcriptions or unrecognized phrasing don't read as a stuck, broken
    // record repeating the exact same sentence.
    aiChat.missCount = (aiChat.missCount || 0) + 1;
    var askedQuoted = '\u201c' + esc(raw.length > 60 ? raw.slice(0, 60) + '\u2026' : raw) + '\u201d';
    var fallbackVariants = [
      'No data available for ' + askedQuoted + ' — I checked items, suppliers, warehouses, transfers and purchase orders and didn\u2019t find a match. I can help with things like:',
      'Still no match for ' + askedQuoted + ' in Stockhouse. I can look up stock levels, purchase orders, transfers, supplier health or warehouse capacity — try rephrasing, or one of these:',
      'Still not landing — if you\u2019re using voice and it keeps mishearing you, try typing the question instead. Here\u2019s what I can reliably answer:'
    ];
    var fallbackText = aiChat.missCount >= 3 ? fallbackVariants[2] : fallbackVariants[(aiChat.missCount - 1) % 2];
    var fallbackChipPool = [
      { action: 'example', text: exampleQueries[0], label: 'Create a PO for items low on stock' },
      { action: 'example', text: exampleQueries[1], label: 'Show items below reorder point' },
      { action: 'example', text: exampleQueries[3], label: 'How is Hanover Works doing?' },
      { action: 'example', text: exampleQueries[4], label: 'Which warehouse is near capacity?' },
      { action: 'example', text: exampleQueries[5], label: 'How many transfers are pending?' },
      { action: 'example', text: exampleQueries[7], label: 'Top vendors by spend' }
    ];
    var offset = (aiChat.missCount - 1) % fallbackChipPool.length;
    var fallbackChips = [fallbackChipPool[offset % 6], fallbackChipPool[(offset + 2) % 6], fallbackChipPool[(offset + 4) % 6]];
    addMessage('assistant', fallbackText, fallbackChips);
  }

  function handleChipClick(el) {
    var mid = parseInt(el.getAttribute('data-mid'), 10);
    var ci = parseInt(el.getAttribute('data-ci'), 10);
    var m = aiChat.messages.filter(function (x) { return x.id === mid; })[0];
    if (!m || !m.chips || !m.chips[ci]) return;
    var chip = m.chips[ci];
    if (chip.action === 'example') {
      document.getElementById('aiChatInput').value = chip.text;
      sendChatMessage();
    } else if (chip.action === 'viewItems') {
      window.location.href = 'index.html?filter=reorderIssues';
    } else if (chip.action === 'createPoGroups') {
      openGroupedPoDraft(chip.groups);
    } else if (chip.action === 'navigate') {
      window.location.href = chip.href;
    }
  }

  function sendChatMessage() {
    var input = document.getElementById('aiChatInput');
    var raw = input.value.trim();
    if (!raw) return;
    input.value = '';
    processCommand(raw);
  }

  // ------------------------------------------------------------- real mic

  function setupSpeechRecognition() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { micSupported = false; return; }
    micSupported = true;
    recognition = new SR();
    recognition.lang = 'en-IN';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = function () {
      aiChat.listening = true;
      renderChat();
    };
    recognition.onresult = function (e) {
      var transcript = '';
      for (var i = 0; i < e.results.length; i++) transcript += e.results[i][0].transcript;
      var input = document.getElementById('aiChatInput');
      if (input) input.value = transcript;
    };
    recognition.onerror = function (e) {
      aiChat.listening = false;
      renderChat();
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        addMessage('assistant', 'I need microphone access to hear you — allow it in your browser’s site permissions and try the mic again.');
      } else if (e.error === 'no-speech' || e.error === 'aborted') {
        // quiet — user just didn't say anything or cancelled
      } else {
        addMessage('assistant', 'Voice input hit a snag (' + esc(e.error) + '). Try again, or just type your question.');
      }
    };
    recognition.onend = function () {
      aiChat.listening = false;
      renderChat();
      var input = document.getElementById('aiChatInput');
      if (input && input.value.trim()) sendChatMessage();
    };
  }

  function toggleMic() {
    if (!recognition) {
      addMessage('assistant', 'Voice input isn’t supported in this browser — try Chrome or Edge on desktop, or just type your question below.');
      return;
    }
    if (aiChat.listening) {
      recognition.stop();
      return;
    }
    if (!aiChat.open) { aiChat.open = true; ensureGreeting(); renderChat(); }
    try { recognition.start(); } catch (e) { /* already started */ }
  }

  // -------------------------------------------------------------- wiring

  function wireEvents() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-action]');
      if (!el) return;
      var action = el.getAttribute('data-action');
      if (action === 'ai-toggle') { aiChat.open = !aiChat.open; if (aiChat.open) ensureGreeting(); renderChat(); return; }
      if (action === 'ai-close') { aiChat.open = false; renderChat(); return; }
      if (action === 'ai-mic') { toggleMic(); return; }
      if (action === 'ai-send') { sendChatMessage(); return; }
      if (action === 'ai-chip') { handleChipClick(el); return; }
    });
    document.getElementById('aiChatInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); sendChatMessage(); }
    });
  }

  // ---------------------------------------------------------------- init

  function init(opts) {
    opts = opts || {};
    DATA = {
      plants: STOCKHOUSE_KB.plants,
      items: opts.items || STOCKHOUSE_KB.items,
      warehouses: opts.warehouses || STOCKHOUSE_KB.warehouses,
      suppliers: opts.suppliers || STOCKHOUSE_KB.suppliers,
      transfers: opts.transfers || STOCKHOUSE_KB.transfers,
      purchaseOrders: opts.purchaseOrders || STOCKHOUSE_KB.purchaseOrders,
      onFilterItems: opts.onFilterItems || null
    };
    injectMarkup();
    wireEvents();
    setupSpeechRecognition();
    renderChat();
  }

  return { init: init };
})();
