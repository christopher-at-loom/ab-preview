(() => {
  'use strict';
  const data = window.AB_CATALOG;
  const $ = (selector, node = document) => node.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = n => new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'}).format(n);
  const unitMoney = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:4}).format(n);
  const arrow = '';
  const icon = name => ({search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>',bag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></svg>',menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6h18M3 12h18M3 18h18"/></svg>'}[name]);
  const sizedImage = (src,width) => { const url=new URL(src);url.searchParams.set('width',width);return url.href; };
  const imageCandidates = (src,width) => [...new Set([180,360,640,width].filter(n=>n<=width))].sort((a,b)=>a-b).map(n=>`${sizedImage(src,n)} ${n}w`).join(', ');
  const image = (src,alt,cls='',eager=false,width=640) => `<img src="${esc(sizedImage(src,width))}" srcset="${esc(imageCandidates(src,width))}" sizes="${width<=180?'100px':width>=1000?'(min-width:750px) 48vw, 350px':'(min-width:1100px) 280px, (min-width:750px) 30vw, 45vw'}" alt="${esc(alt)}" class="${cls}" width="${width}" height="${width}" ${eager?'fetchpriority="high" loading="eager"':'loading="lazy"'} decoding="async">`;

  const pById = id => data.products.find(p => p.id === Number(id));
  const cBySlug = slug => data.collections.find(c => c.slug === slug);
  const productLink = p => `#/products/${p.handle}`;
  const collectionLink = slug => `#/collections/${slug}`;
  const groups = [
    ['Clothing fixtures',['clothing-racks','clothes-hangers','forms','mannequins','garment-steamers']],
    ['Wall displays',['grid-wall','slatwall-panels']],
    ['Cases & counters',['showcases-and-counters','countertop-cases-acrylic-glass','countertop-spinners-displays']],
    ['Jewelry displays',['jewelry-displays','jewelry-boxes','travel-countertop-jewelry-cases-mirrors']],
    ['Bags & supplies',['plastic-bags','tissue-paper','labels-and-tags','message-signs','sign-holders-and-easels']]
  ];
  const labels = {'clothing-racks':'Clothing racks','clothes-hangers':'Hangers','grid-wall':'Gridwall','slatwall-panels':'Slatwall panels','plastic-bags':'Bags & packaging','showcases-and-counters':'Showcases & counters','jewelry-displays':'Jewelry displays','forms':'Dress forms','tissue-paper':'Tissue paper'};
  const label = c => labels[c.slug] || c.title;

  const plural = (word, n) => n === 1 ? word : word === 'box' ? 'boxes' : word === 'piece' ? 'pieces' : word + 's';
  const packText = p => p.pack ? `${p.pack.toLocaleString()} ${plural(p.piece,p.pack)} / ${p.unit}` : p.unitReview ? 'Pack size to confirm' : '';
  const quantityText = (p,n) => `${n} ${plural(p.unit,n)}${p.pack ? ` / ${(n*p.pack).toLocaleString()} ${plural(p.piece,n*p.pack)}` : ''}`;
  const totalText = (p,n) => `${quantityText(p,n)} / ${money(p.price*n)} before shipping & tax`;
  const helpLink = p => `#/help?product=${p.id}`;
  const leafCategory = p => p.categories.map(cBySlug).filter(Boolean).sort((a,b) => Number(!!b.parent)-Number(!!a.parent) || a.count-b.count)[0];
  const relatedProducts = p => {
    const leaf = leafCategory(p);
    const purpose = p.attributes['Display Type'] || [];
    const candidates = data.products.filter(q => q.id!==p.id && q.available && q.mode===p.mode && leaf && q.categories.includes(leaf.slug) && (!purpose.length || purpose.some(t=>(q.attributes['Display Type']||[]).includes(t))));
    const finish = p.attributes.Color || [];
    return candidates.sort((a,b)=>Number(finish.some(t=>(b.attributes.Color||[]).includes(t)))-Number(finish.some(t=>(a.attributes.Color||[]).includes(t)))).slice(0,4);
  };
  const collectionGuidance = {
    'plastic-bags':'Compare paper, plastic and zip bags by dimensions and pack quantity.',
    'kraft-paper-bags':'Compare bag dimensions, handle style and bags per case. Allow room for your merchandise and any tissue or box.',
    'pattern-soft-loop-handle-bags':'Compare dimensions, patterns and bags per case. Check the selected pattern before ordering.',
    't-shirt-colored-plastic-bags':'Compare bag style, dimensions, color and case quantity.',
    'zip-lock-bags-plastic-bags':'Choose the bag dimensions and check how many bags come in a pack.',
    'tissue-paper':'Compare sheet dimensions, color and sheets per ream.',
    'clothes-hangers':'Compare top and pant hangers by width, material and quantity per box or case.',
    'clothing-racks':'Compare rack type, footprint, height and included parts. Check whether the rack suits your space.',
    'forms':'Check form measurements and the base or stand included with each model.',
    'mannequins':'Check body measurements, included parts and delivery or collection arrangements.',
    'garment-steamers':'Review the steamer details and ask about setup or replacement parts for the model you need.',
    'grid-wall':'Choose panels, bases and accessories for your gridwall setup. Confirm support and mounting requirements.',
    'slatwall-panels':'Compare panel dimensions and finishes. Check mounting requirements and accessory fit.',
    'showcases-and-counters':'Compare case or counter dimensions, finish and included shelves. Request current pricing and receiving options.',
    'countertop-cases-acrylic-glass':'Compare acrylic and glass cases by dimensions, shelves and access. Check the space your display needs.',
    'countertop-spinners-displays':'Compare display purpose, height, footprint and included parts.',
    'jewelry-displays':'Choose necklace, bracelet, earring or ring displays. Compare measurements and finishes.',
    'necklace-displays':'Compare necklace display height, base and finish. Check the space needed for your necklaces.',
    'bracelet-watch-displays':'Compare bracelet and watch display styles, measurements and finishes.',
    'earring-ring-displays':'Choose stands, cards or holders for earrings and rings. Check measurements and pack quantity.',
    'jewelry-trays-inserts':'Compare trays and inserts by dimensions. Confirm that an insert fits the tray you plan to use.',
    'jewelry-boxes':'Compare box dimensions, jewelry type and boxes per case. Check the insert included.',
    'travel-countertop-jewelry-cases-mirrors':'Compare case dimensions, included inserts and mirrors. Check the details for transport and display.',
    'labels-and-tags':'Compare label or tag dimensions, attachment style and pack quantity.',
    'message-signs':'Choose the sign message or board you need, then check its size and mounting details.',
    'sign-holders-and-easels':'Check accepted sign dimensions, orientation and the stand or mounting parts included.'
  };
  const productCardPrice = p => p.mode==='quote' ? 'Request pricing' : money(p.price)+(p.pack ? ` <small>/ ${p.unit}</small>` : '');

  let cart;
  try { cart = JSON.parse(localStorage.getItem('ab-pages-preview-cart-v1') || '{}'); } catch { cart = {}; }
  if (!cart || typeof cart !== 'object' || Array.isArray(cart)) cart = {};
  for (const [id, qty] of Object.entries(cart)) {
    const p = pById(id);
    if (!p || !p.available || p.mode !== 'purchase' || p.unitReview || !Number.isInteger(qty) || qty < 1 || qty > 999) delete cart[id];
  }
  const announce = text => { $('#status').textContent = text; $('#status').classList.add('visible'); clearTimeout(announce.timer); announce.timer = setTimeout(() => $('#status').classList.remove('visible'), 4500); };
  const saveCart = () => { try { localStorage.setItem('ab-pages-preview-cart-v1', JSON.stringify(cart)); } catch {} updateCount(); };
  const updateCount = () => document.querySelectorAll('[data-cart-count]').forEach(el => { el.textContent = Object.values(cart).reduce((a,b) => a+b, 0); });
  const button = (href, text, secondary = false) => `<a class="button${secondary ? ' button--secondary' : ''}" href="${esc(href)}">${text}</a>`;
  const crumb = (current, parent) => `<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span>/</span>${parent ? `<a href="${collectionLink(parent.slug)}">${esc(label(parent))}</a><span>/</span>` : ''}<span aria-current="page">${esc(current)}</span></nav>`;
  const heading = (title, link = '') => `<div class="section-heading"><div><h2>${title}</h2></div>${link}</div>`;
  const card = p => `<article class="product-card-wrapper" data-product-id="${p.id}"><a class="product-image" href="${productLink(p)}">${image(p.images[0],p.title)}${!p.available?'<span class="badge">Sold out</span>':''}</a><div class="card-information">${p.sku?`<p class="card-kicker">${esc(p.sku)}</p>`:''}<h3><a href="${productLink(p)}">${esc(p.title)}</a></h3>${packText(p)||p.dimensions?`<p class="card-fact">${esc(packText(p)||p.dimensions)}</p>`:''}<p class="price">${productCardPrice(p)}</p>${p.pack?`<p class="unit-price">${unitMoney(p.price/p.pack)} per ${p.piece}</p>`:''}<a class="text-link card-action" href="${productLink(p)}">View ${p.mode==='quote'?'fixture':'product'} </a></div></article>`;
  const category = slug => { const c = cBySlug(slug); return `<a class="category-card" href="${collectionLink(slug)}"><div class="category-image">${c.image ? image(c.image, '') : '<span>Garment care</span>'}</div><h3>${esc(label(c))}</h3><p>${c.count} products</p></a>`; };
  const policyNote = `<p class="purchase-help"><a href="#/help">Shipping & order questions </a></p>`;

  function header() {
    $('#site-header').innerHTML = `<div class="header page-width"><button class="icon-button mobile-menu" aria-label="Open menu" aria-expanded="false" aria-controls="catalog-nav">${icon('menu')}</button><a class="brand" href="#/" aria-label="A&B Store Fixtures home"><img src="${esc(data.assets.logo)}" alt="A&B Store Fixtures" width="76" height="63"><span>STORE FIXTURES<span>RETAIL DISPLAY SUPPLY WAREHOUSE</span></span></a><form class="header-search" role="search"><label class="visually-hidden" for="header-search">Search products or SKU</label><input id="header-search" name="q" placeholder="Search fixtures, supplies, or SKU" type="search" autocomplete="off"><button type="submit" aria-label="Search">${icon('search')}</button></form><a class="header-help" href="#/help">Questions?<strong>Contact A&B ${arrow}</strong></a><a class="cart-link" href="#/cart" aria-label="View cart">${icon('bag')}<span>Cart</span><b data-cart-count>0</b></a></div><nav class="catalog-nav" id="catalog-nav" aria-label="Product categories"><div class="page-width nav-inner"><a href="#/collections/all" class="all-shop">Shop all</a>${groups.map(([title, slugs], index) => `<details><summary>${title}<svg class="disclosure-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 10h12"/><path class="disclosure-vertical" d="M10 4v12"/></svg></summary><div class="nav-dropdown"><a class="group-all" href="#/groups/${index}">Shop all ${esc(title.toLowerCase())} </a>${slugs.map(slug => `<a href="${collectionLink(slug)}">${esc(label(cBySlug(slug)))}</a>`).join('')}</div></details>`).join('')}<a class="used-link" href="#/used">Used fixtures ${arrow}</a></div></nav>`;
    $('#site-footer').innerHTML = `<div class="page-width"><div class="footer-top"><div><h2>A&B Store Fixtures</h2><p>Retail fixtures and everyday supplies.<br>Find us in Greensboro and Raleigh.</p></div><div><h3>Shop</h3><a href="#/collections/all">All fixtures & supplies</a><a href="${collectionLink('plastic-bags')}">Bags & packaging</a><a href="${collectionLink('jewelry-displays')}">Jewelry displays</a><a href="#/used">Used fixtures · Greensboro</a></div><div><h3>Get help</h3><a href="#/help">Buying & delivery</a><a href="#/help/returns">Returns & order questions</a><a href="#/guides">Plan your store</a><a href="#/about">About A&B</a></div><div><h3>Visit our stores</h3><a href="#/stores">Greensboro ${arrow}</a><p>6202 Swing Court<br><a href="tel:+13362924488">(336) 292-4488</a></p><a href="#/stores">Raleigh ${arrow}</a><p>2300 Capital Boulevard<br><a href="tel:+19198342445">(919) 834-2445</a></p></div></div><div class="footer-bottom"><span>© 2026 A&B Store Fixtures, Inc. · Local concept preview</span></div></div>`;
    updateCount();
  }

  function home() {
    return `<section class="hero" data-dawn-section="image-with-text"><div class="page-width hero-grid"><div class="hero-copy"><h1>Retail Display<br>Supply Warehouse</h1><p class="hero-description">Hangers, jewelry displays, racks and packaging for store owners. Shop online or visit our Greensboro and Raleigh locations.</p><div class="button-row">${button('#/collections/all','Shop fixtures & supplies '+arrow)}${button('#/stores','Visit our NC stores',true)}</div><p class="hero-note">Shopping for used? <a href="#/used">Start with Greensboro </a></p></div><div class="hero-media">${image(data.assets.showroom,'Display cases and counters inside the A&B warehouse','',true,1200)}</div></div></section><div class="service-strip page-width"><a href="${collectionLink('plastic-bags')}"><div><strong>Bags & packaging</strong><small>Compare sizes & case quantities</small></div></a><a href="${collectionLink('showcases-and-counters')}"><div><strong>Showcases & counters</strong><small>See details. Ask about delivery.</small></div></a><a href="#/used"><div><strong>Used store fixtures</strong><small>Check Greensboro availability</small></div></a></div><section class="section page-width" data-dawn-section="collection-list">${heading('Shop by category',`<a class="text-link" href="#/collections/all">All categories ${arrow}</a>`)}<div class="categories-grid">${['clothing-racks','clothes-hangers','jewelry-displays','plastic-bags','grid-wall','showcases-and-counters','forms','tissue-paper'].map(category).join('')}</div></section><section class="section section-tinted" data-dawn-section="featured-collection"><div class="page-width">${heading('From our online catalog',`<a class="text-link" href="#/collections/all">Explore the catalog ${arrow}</a>`)}<div class="product-grid">${data.featured.map(id => card(pById(id))).join('')}</div></div></section><section class="warehouse-section" data-dawn-section="image-with-text"><div class="page-width warehouse-grid"><div class="warehouse-media">${image(data.assets.warehouse,'Shelving and racks in the A&B Greensboro warehouse','',false,1000)}<span>FROM THE A&B WAREHOUSE ARCHIVE</span></div><div><h2>New and used<br>store fixtures</h2><p>Visit A&B in Greensboro or Raleigh. Looking for used fixtures? Our used selection is in Greensboro only. Contact the team to check what’s available before you travel.</p><div class="button-row">${button('#/used','Used store fixtures '+arrow)}${button('#/stores','Store details',true)}</div><p class="small-note">Archive photography shows the warehouse, not current stock.</p></div></div></section><section class="section page-width" data-dawn-section="multicolumn">${heading('Product guides',`<a class="text-link" href="#/help">Ask A&B ${arrow}</a>`)}<p class="small-note"><a href="#/guides/boutique">Opening a store? View the boutique checklist </a></p><div class="guide-grid"><a href="#/guides/bags"><h3>Paper shopping bag sizes</h3><p>Dimensions, case quantities and price per bag.</p></a><a href="#/guides/walls"><h3>Gridwall & slatwall</h3><p>Keep panels, bases and accessories in the right system.</p></a><a href="#/guides/freight"><h3>Showcase delivery</h3><p>Ask about freight, site access and unloading before ordering.</p></a></div></section>`;
  }

  function catalog(slug, params, searching = false, groupIndex = null) {
    const c=cBySlug(slug), group=groupIndex!==null?groups[Number(groupIndex)]:null;
    if(groupIndex!==null&&!group)return missing();
    if(!searching && slug!=='all' && !c && !group) return missing();
    const q=(params.get('q')||'').trim();
    const selected={stock:params.get('stock')||'',finish:params.get('finish')||'',type:params.get('type')||'',size:params.get('size')||'',pack:params.get('pack')||''};
    const sort=params.get('sort')||'featured';
    const title=searching?(q?`Results for “${q}”`:'Search the catalog'):group?group[0]:c?label(c):'Fixtures & supplies';
    const base=data.products.filter(p=>(!c||p.categories.includes(c.slug))&&(!group||group[1].some(slug=>p.categories.includes(slug))));
    const norm=s=>s.toLowerCase().replace(/grid\s+wall/g,'gridwall').replace(/slat\s+wall/g,'slatwall').replace(/display cases?/g,'showcase').replace(/[^a-z0-9]+/g,' ').trim();
    const terms=norm(q).split(' ').filter(Boolean);
    let found=base.filter(p=>(!q||terms.every(t=>norm(`${p.title} ${p.sku} ${p.categories.join(' ')} ${Object.values(p.attributes).flat().join(' ')}`).includes(t)))&&(!selected.stock||p.available)&&(!selected.finish||(p.attributes.Color||[]).includes(selected.finish))&&(!selected.type||(p.attributes['Display Type']||[]).includes(selected.type))&&(!selected.size||(p.attributes.Size||[]).includes(selected.size))&&(!selected.pack||String(p.pack)===selected.pack));
    const featuredRank=p=>{const n=data.featured.indexOf(p.id);return n<0?1000:n;};
    if(sort==='price-asc') found.sort((a,b)=>(a.mode==='quote'?Infinity:a.price)-(b.mode==='quote'?Infinity:b.price));
    else if(sort==='price-desc') found.sort((a,b)=>(b.mode==='quote'?-1:b.price)-(a.mode==='quote'?-1:a.price));
    else if(sort==='title') found.sort((a,b)=>a.title.localeCompare(b.title));
    else found.sort((a,b)=>Number(b.sku.toLowerCase()===q.toLowerCase()&&!!q)-Number(a.sku.toLowerCase()===q.toLowerCase()&&!!q)||Number(b.available)-Number(a.available)||featuredRank(a)-featuredRank(b)||a.title.localeCompare(b.title));
    const pageCount=Math.max(1,Math.ceil(found.length/24));
    const page=Math.min(pageCount,Math.max(1,Number(params.get('page'))||1));
    const route=searching?'#/search':group?`#/groups/${groupIndex}`:collectionLink(slug);
    const pageHref=n=>{const next=new URLSearchParams(params);next.set('page',n);return `${route}?${next}`;};
    const children=searching&&q?[]:group?group[1].map(cBySlug):c?data.collections.filter(child=>child.parent===c.id):data.collections.filter(child=>child.parent===0);
    const options=(values,current)=>[...new Set(values)].filter(Boolean).sort((a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true})).map(v=>`<option value="${esc(v)}"${String(v)===current?' selected':''}>${esc(v)}</option>`).join('');
    const refinement=(name,label,values)=>new Set(values.filter(Boolean)).size>1?`<label>${label}<select name="${name}"><option value="">All</option>${options(values,selected[name])}</select></label>`:'';
    const chips=Object.entries(selected).filter(([,value])=>value).map(([key,value])=>{const next=new URLSearchParams(params);next.delete(key);next.delete('page');return `<a class="filter-chip" href="${route}?${next}" aria-label="Remove ${esc(key==='stock'?'available only':value)} filter">${esc(key==='stock'?'Available only':key==='pack'?value+' per pack':value)} ×</a>`;}).join('');
    const guidance=searching?'Search by product name or exact SKU.':c?collectionGuidance[c.slug]:group?'Choose a category or compare the products below.':'Browse fixtures, displays and supplies. Compare product details and pack quantities.';
    return `<div class="page-width catalog-page">${crumb(title)}<div class="catalog-heading"><h1>${esc(title)}</h1><p>${guidance}</p></div>${searching?`<form class="catalog-search" data-catalog-search><label class="visually-hidden" for="catalog-query">Product, keyword or SKU</label><div><input type="search" id="catalog-query" name="q" value="${esc(q)}" placeholder="Product name or SKU"><button class="button" type="submit">Search</button></div></form>`:''}${children.length?`<details class="category-disclosure"><summary>Browse categories<svg class="disclosure-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 10h12"/><path class="disclosure-vertical" d="M10 4v12"/></svg></summary><div class="subcategory-links">${children.map(child=>`<a href="${collectionLink(child.slug)}">${esc(label(child))} <span>${child.count}</span></a>`).join('')}</div></details>`:''}<div class="catalog-tools"><details class="filter-disclosure" id="product-filters"><summary>Filter products${chips?' · filters applied':''} <svg class="disclosure-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 10h12"/><path class="disclosure-vertical" d="M10 4v12"/></svg></summary><form class="filters" data-filter-form data-route="${route}"><input type="hidden" name="q" value="${esc(q)}"><input type="hidden" name="sort" value="${esc(sort)}"><div class="filter-fields"><label>Availability<select name="stock"><option value="">All products</option><option value="in-stock"${selected.stock?' selected':''}>Available only</option></select></label>${refinement('finish','Color / finish',base.flatMap(p=>p.attributes.Color||[]))}${refinement('type','Display type',base.flatMap(p=>p.attributes['Display Type']||[]))}${refinement('size','Size',base.flatMap(p=>p.attributes.Size||[]))}${refinement('pack','Quantity per pack',base.map(p=>p.pack?String(p.pack):''))}</div><div class="filter-actions"><button class="button" type="submit">Apply filters</button><button class="text-link" type="button" data-close-filters>Close filters</button></div></form></details><label class="sort-label">Sort by<select data-sort><option value="featured"${sort==='featured'?' selected':''}>${searching&&q?'Best match':'Featured'}</option><option value="price-asc"${sort==='price-asc'?' selected':''}>Price: low to high</option><option value="price-desc"${sort==='price-desc'?' selected':''}>Price: high to low</option><option value="title"${sort==='title'?' selected':''}>Name: A–Z</option></select></label></div><div class="results-summary" role="status"><span>${found.length} ${found.length===1?'product':'products'}${found.length>24?` · Page ${page} of ${pageCount}`:''}</span><div>${chips}${chips?`<a href="${route}${q?'?q='+encodeURIComponent(q):''}">Clear filters</a>`:''}</div></div>${found.length?`<div class="product-grid">${found.slice((page-1)*24,page*24).map(card).join('')}</div>${pageCount>1?`<nav class="pagination" aria-label="Catalog pages">${page>1?button(pageHref(page-1),' Previous',true):''}<span>Page ${page} of ${pageCount}</span>${page<pageCount?button(pageHref(page+1),'Next ',true):''}</nav>`:''}`:`<div class="empty-state"><h2>No products found.</h2><p>Try a shorter term or an exact SKU${chips?', or clear your filters':''}.</p><div class="button-row">${button(chips?route+(q?'?q='+encodeURIComponent(q):''):'#/collections/all',chips?'Clear filters':'Browse all products')}${button('#/help?q='+encodeURIComponent(q),'Ask A&B about your search',true)}</div></div>`}</div>`;
  }

  function product(handle) {
    const p=data.products.find(item=>item.handle===handle);
    if(!p)return missing();
    const parent=leafCategory(p), related=relatedProducts(p);
    const specs=[['SKU',p.sku],['Measurements',p.dimensions],...(p.pack?[['Selling unit',packText(p)]]:[]),...Object.entries(p.attributes).map(([k,v])=>[k==='Color'?'Color / finish':k,v.join(', ')])].filter(([,v])=>v);
    const status=p.available?'Available':'Sold out';
    const identity=`<div class="product-identity"><h1>${esc(p.title)}</h1><p class="sku">${p.sku?'SKU '+esc(p.sku):'Product reference AB-'+p.id}</p><p class="product-price">${productCardPrice(p)}</p>${p.pack?`<p class="unit-summary">${esc(packText(p))} · ${unitMoney(p.price/p.pack)} per ${p.piece}</p>`:''}<p class="availability ${p.available?'':'sold-out'}">● ${status}</p></div>`;
    let action='';
    if(p.mode==='quote') action=`<p>Request current pricing and delivery or pickup options for this fixture.</p><button class="button purchase-button" data-quote="${p.id}">Request pricing & delivery ${arrow}</button><p class="small-note">A request is not an order or stock reservation.</p>`;
    else if(!p.available) action=`<div class="notice"><strong>This item is sold out.</strong><p>Ask about this item, or compare ${parent?esc(label(parent).toLowerCase()):'products'} below.</p><button class="button button--secondary" data-quote="${p.id}" data-intent="availability">Ask about availability</button></div>`;
    else if(p.unitReview) action=`<div class="notice"><strong>Confirm the pack quantity before ordering.</strong><p>The product name lists ${p.declaredCount} ${plural(p.piece,p.declaredCount)}. Ask A&B to confirm the selling unit.</p><button class="button button--secondary" data-quote="${p.id}" data-intent="pack">Ask about pack quantity</button></div>`;
    else action=`<form class="purchase-form" data-add-product="${p.id}"><label for="product-quantity">Quantity${p.pack?' ('+plural(p.unit,2)+')':''}</label><div class="purchase-row"><input id="product-quantity" type="number" name="quantity" min="1" max="999" value="1" required aria-describedby="quantity-summary"><button class="button" type="submit">Add to cart ${arrow}</button></div><p id="quantity-summary">${esc(totalText(p,1))}</p></form>`;
    const family=[895,897,899].includes(p.id)?`<label class="option-label" for="bag-size">Bag size</label><select id="bag-size" data-family-select>${[895,897,899].map(id=>{const b=pById(id);return `<option value="${b.handle}"${id===p.id?' selected':''}>${id===895?'Small':id===897?'Medium':'Large'} · ${money(b.price)} / ${b.unit}</option>`;}).join('')}</select>`:'';
    return `<div class="page-width product-page">${crumb(p.title,parent)}<div class="product-layout">${identity}<div class="product-gallery"><div class="primary-image"><a class="product-zoom" href="${esc(p.images[0])}" target="_blank" rel="noopener" aria-label="Open full-size product photo">${image(p.images[0],p.title,'',true,1000)}</a></div>${p.images.length>1?`<div class="thumbnails" role="group" aria-label="Product photos">${p.images.map((src,i)=>`<button type="button" data-gallery="${esc(src)}" aria-label="View product image ${i+1}" aria-pressed="${i===0}">${image(src,p.title+' — image '+(i+1),'',false,180)}</button>`).join('')}</div>`:''}</div><div class="product-info">${family}${p.dimensions?`<p class="product-measurement"><strong>Measurements</strong><br>${esc(p.dimensions)}</p>`:''}${action}<p class="purchase-help"><a href="${helpLink(p)}">Shipping & order questions </a></p></div></div><div class="product-details"><section><h2>Product details</h2><div class="source-description">${p.description?p.description.split(/\n+/).filter(Boolean).map(t=>`<p>${esc(t)}</p>`).join(''):'<p>Ask A&B about the measurements, included parts or setup for this item.</p>'}</div></section><section><h2>At a glance</h2><dl class="spec-table">${specs.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl><details><summary>Delivery & pickup<svg class="disclosure-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 10h12"/><path class="disclosure-vertical" d="M10 4v12"/></svg></summary><p>${p.mode==='quote'?'Include your destination and unloading needs when requesting delivery. For collection, choose pickup in the inquiry.':'Ask about delivery or collection for this item.'}</p><button class="text-link" data-quote="${p.id}" data-intent="question">Ask about this item</button></details><details><summary>Order questions<svg class="disclosure-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 10h12"/><path class="disclosure-vertical" d="M10 4v12"/></svg></summary><p>For minimum-order, return or damage questions, contact A&B with the product or order details.</p><a href="${helpLink(p)}">View contact options </a></details></section></div>${related.length?`<section class="section">${heading('Compare '+(parent?esc(label(parent).toLowerCase()):'products'))}<p class="small-note">Compare measurements and finishes. These products are not confirmed substitutes.</p><div class="product-grid">${related.map(card).join('')}</div></section>`:''}</div>`;
  }

  function cartPage() {
    const lines = Object.entries(cart).map(([id,qty])=>({p:pById(id),qty}));
    const total = lines.reduce((sum,{p,qty})=>sum+p.price*qty,0);
    return `<div class="page-width cart-page">${crumb('Your cart')}<div class="section-heading"><h1>Your cart</h1><a class="text-link" href="#/collections/all">Continue shopping </a></div>${!lines.length?`<div class="empty-state"><h2>Your cart is empty.</h2><p>Browse fixtures and supplies, then add products to your cart.</p>${button('#/collections/all','Shop fixtures & supplies')}</div>`:`<div class="cart-layout"><section aria-label="Cart items">${lines.map(({p,qty})=>`<article class="cart-item"><a href="${productLink(p)}">${image(p.images[0],p.title,'',false,250)}</a><div><p class="card-kicker">${esc(p.sku || 'Product reference AB-'+p.id)}</p><h2><a href="${productLink(p)}">${esc(p.title)}</a></h2><p>${money(p.price)} ${p.pack?`per ${p.unit} · ${esc(packText(p))}`:''}</p><label for="cart-quantity-${p.id}">Quantity${p.pack?' ('+plural(p.unit,2)+')':''}</label><div class="cart-controls"><input id="cart-quantity-${p.id}" data-cart-quantity="${p.id}" type="number" value="${qty}" min="1" max="999"><button class="text-link" data-remove="${p.id}">Remove</button></div>${p.pack?`<p class="unit-price">${quantityText(p,qty)}</p>`:''}</div><strong class="line-total">${money(p.price*qty)}</strong></article>`).join('')}</section><aside class="cart-summary"><div class="subtotal"><h2>Subtotal</h2><strong>${money(total)}</strong></div><p>Shipping and tax are not included.</p>${policyNote}<button class="button" data-checkout>Preview checkout step ${arrow}</button><p class="small-note">Local preview only. Checkout and payments are not connected.</p><div id="checkout-preview" role="status"></div></aside></div>`}</div>`;
  }

  function stores() {
    return `<div class="page-width editorial-page">${crumb('Our North Carolina stores')}<div class="editorial-intro"><h1>Locations</h1><p>Find A&B in Greensboro and Raleigh. Call ahead to check the items you need and discuss pickup or loading.</p></div><div class="wide-image">${image(data.assets.exterior,'A&B Store Fixtures Greensboro building','',true,1200)}</div><div class="store-grid">${[['Greensboro','6202 Swing Court','Greensboro, NC 27409','3362924488','(336) 292-4488','New & used fixtures'],['Raleigh','2300 Capital Boulevard','Raleigh, NC 27604','9198342445','(919) 834-2445','Retail fixtures & supplies']].map(([city,address,zip,phone,formatted,type])=>`<section><h2>${city}</h2><address>${address}<br>${zip}</address><p>Monday–Friday · 9am–5pm<br><span class="small-note">Call before visiting to confirm hours and item availability.</span></p><div class="button-row">${button('tel:+1'+phone,formatted)}${button('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(address+' '+zip),'Directions '+arrow,true)}</div>${city==='Greensboro'?'<p>Used merchandise is at Greensboro only.</p>':'<p>Contact Raleigh for local item availability.</p>'}</section>`).join('')}</div></div>`;
  }
  function used() {
    return `<div class="page-width editorial-page">${crumb('Used fixtures')}<div class="used-hero"><div><h1>Used store fixtures</h1><p>Looking for racks, shelving or other store fixtures? Contact the Greensboro team to check what’s available for your space.</p><div class="button-row"><button class="button" data-quote="used">Check used availability ${arrow}</button>${button('#/stores','Plan your visit',true)}</div></div><div>${image(data.assets.used,'Archive photograph of round clothing racks in the A&B warehouse','',true,900)}<p class="small-note">Archive photo. Items shown are not a current inventory listing.</p></div></div><div class="three-facts"><section><h2>Start with your space.</h2><p>Note the fixture type, dimensions and quantity you need.</p></section><section><h2>Check with Greensboro.</h2><p>Confirm current stock, condition and price before you travel.</p></section><section><h2>Plan collection.</h2><p>Ask about collection arrangements and loading needs. An inquiry does not reserve stock.</p></section></div></div>`;
  }
  const guides = {
    bags: ['Choosing a shopping bag','Start with the merchandise, then check the bag dimensions and selling unit.',[['Measure before you choose.','Allow room for the item you’re packaging and any tissue or box. The small kraft bag measures 5½ × 3½ × 8½ inches. Compare the listed dimensions with your merchandise and allow room for tissue or a box.'],['Count cases and pieces.','The small kraft bag is $42 for a case of 100 in this catalog: $0.42 per bag. Two cases means 200 bags and an $84 subtotal before shipping and tax.'],['Confirm the order terms.','Review the order and delivery terms before purchasing. For questions about a particular item, contact A&B with its name or SKU.']], 'kraft-paper-bags'],
    walls: ['Gridwall & slatwall','Choose a display system before choosing its accessories.',[['Keep the systems distinct.','Gridwall panels and slatwall panels are separate catalog categories. Do not assume hooks, brackets or shelves fit both.'],['Check the complete setup.','Review panel size, support or mounting requirements, and what is included. Ask A&B to confirm required bases and compatible accessories.'],['Bring the details.','For an existing display, have its measurements and photographs ready when you speak with the team. Ask which bases or mounting parts the panel needs and what is sold separately.']], 'grid-wall'],
    freight: ['Plan for a large fixture’s arrival','A display case needs more planning than a box of bags.',[['Check the product.','Confirm the model, finish, dimensions, current price and availability. For a fixture listed with pricing on request, ask for the product price and delivery costs separately.'],['Describe the destination.','Have your ZIP, business or residential destination, access constraints and unloading equipment ready. Ask whether a liftgate is needed.'],['Agree on delivery before payment.','Confirm the freight scope, unloading arrangements, pickup alternative and damage process with A&B. A quote request is not an order.']], 'showcases-and-counters'],
    boutique: ['Your boutique starting checklist','Work through the store tasks before filling the cart.',[['Display & hang.','Compare racks, dress forms and hangers. Measure your space and check what each fixture includes.'],['Price & present.','Consider sign holders, labels and jewelry displays where they suit your merchandise. Check dimensions and finish.'],['Pack & replenish.','Choose shopping bags and tissue around your products. Check case counts, stock and delivery before placing an order.']], 'clothing-racks']
  };
  function guidePage(key) {
    if (!guides[key]) return `<div class="page-width editorial-page">${crumb('Plan your store')}<h1>Product guides</h1><div class="guide-grid">${Object.entries(guides).map(([k,[title,desc]])=>`<a href="#/guides/${k}"><h2>${title}</h2><p>${desc}</p><span>Read the guide </span></a>`).join('')}</div></div>`;
    const [title,desc,parts,slug] = guides[key];
    return `<article class="page-width editorial-page narrow">${crumb(title)}<h1>${title}</h1><p class="intro">${desc}</p>${key==='walls'?'<div class="review-status"><p>Plan the setup as a system: a panel, the support or mounting it requires, and accessories made for that panel. Check the product details with A&B before combining parts.</p></div>':''}${parts.map(([h,t])=>`<section><h2>${h}</h2><p>${t}</p></section>`).join('')}${key==='walls'?'<div class="guide-link-list"><a href="#/collections/grid-wall">Gridwall panels & accessories </a><a href="#/collections/slatwall-panels">Slatwall panels </a></div>':key==='boutique'?'<div class="guide-link-list"><a href="#/collections/clothing-racks">Racks </a><a href="#/collections/forms">Dress forms </a><a href="#/collections/clothes-hangers">Hangers </a><a href="#/collections/labels-and-tags">Labels & tags </a><a href="#/collections/plastic-bags">Bags </a><a href="#/collections/tissue-paper">Tissue </a></div>':''}<div class="button-row">${button(collectionLink(slug),'Shop '+(key==='bags'?'paper bags':key==='walls'?'gridwall':key==='freight'?'showcases':'clothing racks')+' '+arrow)}${button('#/help','Ask A&B',true)}</div></article>`;
  }
  function help(kind,params=new URLSearchParams()) {
    const p=pById(params.get('product'));
    const q=params.get('q')||'';
    const returns=kind==='returns';
    return `<div class="page-width editorial-page narrow">${crumb(returns?'Returns & order questions':'Buying & delivery')}<h1>${returns?'Returns & order questions':'Buying & delivery'}</h1>${p?`<div class="context-card"><p><strong>${esc(p.title)}</strong><br>${p.sku?'SKU '+esc(p.sku):'Product reference AB-'+p.id}</p><div class="button-row"><button class="button" data-quote="${p.id}" data-intent="question">Ask about this item</button>${button(productLink(p),'Back to product',true)}</div></div>`:q?`<div class="context-card"><p>Product search: <strong>${esc(q)}</strong></p><button class="button" data-quote="search" data-query="${esc(q)}">Ask about your search</button></div>`:''}<p class="intro">${returns?'Have your order number, product details and any damage photographs ready when you contact A&B.':'Contact A&B for product details, delivery questions or help with an order.'}</p><div class="support-options"><section><h2>${returns?'Contact A&B about your order':'Product & delivery questions'}</h2><p>${returns?'Speak with the team before sending an item back. Ask for the return or damage-reporting steps that apply to your order.':'Have the product name or SKU, quantity and delivery location ready. For pickup, tell the team which location you plan to visit.'}</p><a href="tel:+18554881988">Call (855) 488-1988</a><p><a href="#/stores">Greensboro & Raleigh contact details </a></p></section>${returns?'':`<section><h2>Used fixtures</h2><p>Used merchandise is at Greensboro only. Ask about the fixture type, size, quantity and condition you need.</p><a href="#/used">Check used availability </a></section>`}</div><details><summary>Minimum order, returns & damage<svg class="disclosure-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 10h12"/><path class="disclosure-vertical" d="M10 4v12"/></svg></summary><p>For the terms that apply to your purchase, contact A&B with the item or order details.</p><a href="#/help/returns">Returns & order questions </a></details><details><summary>Visiting or collecting an item<svg class="disclosure-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 10h12"/><path class="disclosure-vertical" d="M10 4v12"/></svg></summary><p>Confirm the item, location and loading arrangements before travelling.</p><a href="#/stores">View store details </a></details></div>`;
  }

  function about() {
    return `<div class="page-width editorial-page narrow">${crumb('About A&B')}<h1>About A&B Store Fixtures</h1><p class="intro">A&B supplies store owners with hangers, jewelry displays, racks, packaging and other fixtures for their everyday needs.</p><p>Shop online or visit our Greensboro and Raleigh locations. Our warehouses carry additional merchandise beyond the online catalog. Used merchandise is at Greensboro only.</p><h2>Bring your product or project questions.</h2><p>Contact the team with the item you need, its measurements and quantity. For an existing display, have photographs and measurements ready when asking about parts or accessories.</p><div class="button-row">${button('#/stores','Contact a store')}${button('#/guides','Product guides',true)}</div><div class="about-image">${image(data.assets.showroom,'A&B warehouse showroom','',false,900)}</div><p class="small-note">Archive photograph of the A&B showroom.</p></div>`;
  }

  const missing = () => `<div class="page-width empty-state"><h1>Page not found.</h1><p>This page isn’t in the preview.</p>${button('#/collections/all','Explore the catalog')}</div>`;
  let previousPath = '';
  function render() {
    const [path,query=''] = (location.hash.slice(1) || '/').split('?');
    const parts = path.split('/').filter(Boolean);
    const params = new URLSearchParams(query);
    let content = '';
    if (!parts.length) content = home();
    else if (parts[0]==='collections') content = catalog(parts[1] || 'all',params);
    else if (parts[0]==='groups') content = catalog('all',params,false,parts[1]);
    else if (parts[0]==='search') content = catalog('all',params,true);
    else if (parts[0]==='products') content = product(parts[1]);
    else if (parts[0]==='cart') content = cartPage();
    else if (parts[0]==='stores') content = stores();
    else if (parts[0]==='used') content = used();
    else if (parts[0]==='guides') content = guidePage(parts[1]);
    else if (parts[0]==='help') content = help(parts[1],params);
    else if (parts[0]==='about') content = about();
    else content = missing();
    $('#main').innerHTML = content;
    document.title = `${$('#main h1')?.textContent.replace(/\s+/g,' ').trim() || 'A&B Store Fixtures'} | A&B design preview`;
    document.querySelectorAll('.catalog-nav details[open]').forEach(d=>d.open=false);
    $('#catalog-nav').classList.remove('is-open');
    $('.mobile-menu').setAttribute('aria-expanded','false');
    if (previousPath && previousPath !== location.hash) { window.scrollTo(0,0); $('#main').focus({preventScroll:true}); }
    previousPath = location.hash;
    updateCount();
  }
  let inquiryDraft=null;
  let inquiryTrigger=null;
  function openQuote(value,intent='delivery',query='') {
    const p=pById(value), used=value==='used', search=value==='search';
    const context=p?`${p.title} · ${p.sku||'Product reference AB-'+p.id}`:used?'Used fixtures · Greensboro':`Product search: ${query}`;
    const draftKey=`${value}:${intent}:${query}`;
    const draft=inquiryDraft?.key===draftKey?inquiryDraft.values:{};
    const field=(name,fallback='')=>esc(draft[name]??fallback);
    const receipt=used?'availability':intent==='delivery'?'delivery':intent;
    const dialog=$('#quote-dialog');
    inquiryTrigger=document.activeElement;
    dialog.dataset.context=context;
    dialog.dataset.key=draftKey;
    dialog.innerHTML=`<button class="dialog-close icon-button" type="button" aria-label="Close inquiry">×</button><h2 id="quote-heading">${used?'Check used availability':search?'Ask about a product':intent==='pack'?'Confirm pack quantity':intent==='availability'?'Ask about availability':intent==='question'?'Ask about this item':'Request pricing & delivery'}</h2><p class="quote-context">${esc(context)}</p><p class="small-note">Local preview. Nothing is sent. A request is not an order or reservation.</p><form id="quote-form"><input type="hidden" name="product_id" value="${p?.id||esc(value)}"><input type="hidden" name="sku" value="${esc(p?.sku||'')}"><input type="hidden" name="context" value="${esc(context)}"><label>${used?'How many fixtures do you need?':'Quantity'} (required)<input type="number" name="quantity" min="1" max="999" value="${field('quantity','1')}" required></label>${!used&&!search?`<label>What would you like to check?<select name="delivery"><option value="question">Product details or availability</option><option value="pickup">Pickup availability</option><option value="delivery">Delivery pricing</option></select></label>`:''}<div id="delivery-fields" hidden><label>Destination ZIP (required for delivery)<input name="zip" value="${field('zip')}" autocomplete="postal-code" pattern="[0-9]{5}(-[0-9]{4})?" placeholder="e.g. 27409" disabled></label><div class="form-grid"><label>Destination<select name="destination" disabled><option>Not sure yet</option><option>Business</option><option>Residential</option></select></label><label>Unloading access<select name="unloading" disabled><option>Not sure — need advice</option><option>Loading dock</option><option>Forklift available</option><option>May need a liftgate</option></select></label></div></div>${used?'<p>Used merchandise is at Greensboro only.</p>':''}<label>${used?'Fixture type, size and condition needed (required)':search?'Product details or SKU (required)':'Questions or timing (optional)'}<textarea name="details" rows="3"${used||search?' required':''}>${field('details',search?query:'')}</textarea></label><label>Email (required)<input name="email" type="email" autocomplete="email" value="${field('email')}" required></label><button class="button" type="submit">Review request ${arrow}</button><p class="small-note">Fields marked required are needed to review this request.</p></form>`;
    const select=$('[name="delivery"]',dialog);
    if(select)select.value=draft.delivery||(receipt==='delivery'?'delivery':'question');
    ['destination','unloading'].forEach(name=>{const el=$(`[name="${name}"]`,dialog);if(el&&draft[name])el.value=draft[name];});
    updateInquiryFields();
    dialog.showModal();
  }
  function updateInquiryFields() {
    const form=$('#quote-form');
    if(!form)return;
    const delivery=$('[name="delivery"]',form)?.value==='delivery';
    const region=$('#delivery-fields');
    region.hidden=!delivery;
    region.querySelectorAll('input,select').forEach(el=>el.disabled=!delivery);
    $('[name="zip"]',form).required=delivery;
  }
  function closeInquiry() {
    const form=$('#quote-form');
    if(form&&!form.dataset.reviewed)inquiryDraft={key:$('#quote-dialog').dataset.key,values:Object.fromEntries(new FormData(form))};
    $('#quote-dialog').close();
    inquiryTrigger?.focus({preventScroll:true});
  }

  document.addEventListener('click', event => {
    if (event.target.closest('.skip-to-content-link')) { event.preventDefault(); $('#main').focus(); $('#main').scrollIntoView(); }
    const menu = event.target.closest('.mobile-menu');
    if (menu) { const open = $('#catalog-nav').classList.toggle('is-open'); menu.setAttribute('aria-expanded',String(open)); }
    const quote = event.target.closest('[data-quote]');
    if (quote) openQuote(quote.dataset.quote,quote.dataset.intent||'delivery',quote.dataset.query||'');
    if (event.target.closest('.dialog-close')) closeInquiry();
    if(event.target.closest('[data-close-filters]')){$('#product-filters').open=false;$('#product-filters summary').focus();}
    const thumb = event.target.closest('[data-gallery]');
    if (thumb) { const img = $('.primary-image img'); img.src = sizedImage(thumb.dataset.gallery,1000); img.srcset=imageCandidates(thumb.dataset.gallery,1000); $('.product-zoom').href=thumb.dataset.gallery; document.querySelectorAll('[data-gallery]').forEach(b=>b.setAttribute('aria-pressed',String(b===thumb))); }
    const remove = event.target.closest('[data-remove]');
    if (remove) { const name = pById(remove.dataset.remove).title; delete cart[remove.dataset.remove]; saveCart(); render(); announce(`${name} removed from cart.`); const next=$('[data-remove]') || $('#main h1'); if(next){next.tabIndex=-1;next.focus({preventScroll:true});} }
    if (event.target.closest('[data-checkout]')) { $('#checkout-preview').innerHTML = '<p><strong>Checkout handoff preview.</strong> This local preview cannot take payment. Shipping and tax have not been calculated. See the review notes for the business rules still to confirm.</p>'; announce('Checkout preview opened. No order has been placed.'); }
  });
  document.addEventListener('change', event => {
    const el = event.target;
    if(el.matches('[name="delivery"]'))updateInquiryFields();
    if(el.matches('[data-sort]')){const [path,query='']=(location.hash.slice(1)||'/').split('?');const params=new URLSearchParams(query);params.set('sort',el.value);params.delete('page');location.hash=path+'?'+params;}
    if (el.matches('[data-family-select]')) location.hash = '#/products/'+el.value;
    if (el.matches('[data-cart-quantity]')) {
      const qty = Number(el.value);
      if (!Number.isInteger(qty) || qty<1 || qty>999) { el.value = cart[el.dataset.cartQuantity]; announce('Enter a whole quantity from 1 to 999.'); return; }
      cart[el.dataset.cartQuantity] = qty; const id=el.id; saveCart(); render(); $('#'+id)?.focus({preventScroll:true}); announce('Cart quantity and subtotal updated.');
    }
  });
  document.addEventListener('input', event => {
    if (event.target.matches('[data-cart-quantity]')) {
      const field = event.target;
      const p = pById(field.dataset.cartQuantity);
      const qty = Number(field.value);
      const valid = Number.isInteger(qty) && qty > 0 && qty <= 999;
      field.setAttribute('aria-invalid', String(!valid));
      if (valid) {
        cart[p.id] = qty;
        saveCart();
        const item = field.closest('.cart-item');
        $('.line-total', item).textContent = money(p.price * qty);
        if (p.pack) $('.unit-price', item).textContent = quantityText(p,qty);
        $('.subtotal strong').textContent = money(Object.entries(cart).reduce((sum,[id,n]) => sum + pById(id).price * n, 0));
        announce('Cart quantity and subtotal updated.');
      }
    }
    if (event.target.id === 'product-quantity') { const form=event.target.closest('form'); const p=pById(form.dataset.addProduct); const qty=Number(event.target.value); if(Number.isInteger(qty)&&qty>0&&qty<=999) $('#quantity-summary').textContent = totalText(p,qty); }
  });
  document.addEventListener('submit', event => {
    const form=event.target;
    event.preventDefault();
    if (form.matches('.header-search,[data-catalog-search]')) { const q = new FormData(form).get('q'); location.hash = '#/search?q='+encodeURIComponent(q); }
    if (form.matches('[data-filter-form]')) { const params=new URLSearchParams(); for(const [key,val] of new FormData(form)) if(val)params.set(key,val); location.hash=form.dataset.route+'?'+params; }
    if (form.matches('[data-add-product]')) {
      const p=pById(form.dataset.addProduct); const qty=Number(new FormData(form).get('quantity'));
      if (!p.available || p.mode!=='purchase' || p.unitReview || !Number.isInteger(qty) || qty<1 || qty>999) return;
      cart[p.id] = Math.min(999,(cart[p.id] || 0)+qty); saveCart(); announce(`${quantityText(p,qty)} added to your preview cart.`);
      let feedback = $('.add-feedback',form); if(!feedback){feedback=document.createElement('div');feedback.className='add-feedback';form.append(feedback);}feedback.innerHTML='<strong>Added to your cart.</strong> <a href="#/cart">View cart </a>';
    }
    if (form.id==='quote-form') {
      const values=Object.fromEntries(new FormData(form));
      const context=$('#quote-dialog').dataset.context;
      inquiryDraft={key:$('#quote-dialog').dataset.key,values};
      form.innerHTML=`<div class="notice" role="status"><strong>Request review — not sent</strong><p>${esc(context)}</p><dl><dt>Quantity</dt><dd>${esc(values.quantity)}</dd>${values.zip?`<dt>Delivery to</dt><dd>${esc(values.zip)} · ${esc(values.destination)} · ${esc(values.unloading)}</dd>`:''}<dt>Request</dt><dd>${esc(values.delivery==='pickup'?'Pickup availability':values.delivery==='delivery'?'Delivery pricing':'Product details or availability')}</dd><dt>Details</dt><dd>${esc(values.details||'None added')}</dd><dt>Reply to</dt><dd>${esc(values.email)}</dd></dl><p>This is a local summary. No message has been sent and no stock is reserved.</p></div><button type="button" class="button dialog-close">Close preview</button>`;
      form.dataset.reviewed='true';
      inquiryDraft={key:$('#quote-dialog').dataset.key,values};
    }
  });
  document.addEventListener('keydown', event=>{ if(event.key==='Escape'){document.querySelectorAll('.catalog-nav details').forEach(d=>d.open=false);if($('#product-filters')?.open){$('#product-filters').open=false;$('#product-filters summary').focus();}$('#catalog-nav').classList.remove('is-open');$('.mobile-menu').setAttribute('aria-expanded','false');} });
  document.addEventListener('toggle', event=>{if(event.target.matches('.catalog-nav details')&&event.target.open)document.querySelectorAll('.catalog-nav details').forEach(d=>{if(d!==event.target)d.open=false;});},true);
  $('#quote-dialog').addEventListener('cancel',event=>{event.preventDefault();closeInquiry();});
  header();
  render();
  window.addEventListener('hashchange',render);
})();
