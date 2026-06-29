import{a as w,d as $}from"./chunk-F3UEFQUY.js";import{$ as f,W as h,oa as b,oc as y}from"./chunk-NKI3CD56.js";import{a as g,b as p}from"./chunk-GAL4ENT6.js";var v=class m{http=f(w);api=$.apiUrl;_categories=b([]);_pages=b([]);pages=this._pages.asReadonly();constructor(){this.http.get(`${this.api}/Categories`).subscribe(t=>{this._categories.set(t),this.loadAll()})}getCanvaEmbedUrl(t){if(!t)return null;let o=t.match(/canva\.com\/design\/([a-zA-Z0-9_-]+)/);return o?`https://www.canva.com/design/${o[1]}/view?embed`:null}loadAll(){this.http.get(`${this.api}/Articles/admin`,{params:{page:1,pageSize:100}}).subscribe(t=>{let o=Array.isArray(t)?t:t.items??[];this._pages.set(o.map(r=>this.mapArticleToPage(r)))})}getById(t){return y(()=>this._pages().find(o=>o.id===t)??null)}create(t){let o={title:t.title,slug:t.slug,contentHtml:"<p></p>",excerpt:t.description??"",emoji:"\u{1F4C4}",readingTime:1,featured:!1,categoryIds:[]};return this.http.post(`${this.api}/Articles/admin`,o).subscribe(i=>{this._pages.update(e=>[this.mapArticleToPage(i),...e])}),p(g({id:Date.now().toString()},t),{blocks:[],createdAt:new Date,updatedAt:new Date})}update(t,o){let r=this._pages().find(e=>e.id===t);if(!r)return;let i={title:o.title??r.title,slug:o.slug??r.slug,contentHtml:this.blocksToHtml(r.blocks),excerpt:o.description??r.description??"",emoji:"\u{1F4C4}",readingTime:r.readingTime??1,featured:r.featured??!1,categoryIds:r.categoryId?[r.categoryId]:[]};this.http.put(`${this.api}/Articles/admin/${t}`,i).subscribe(()=>{if(this._pages.update(e=>e.map(n=>n.id===t?p(g(g({},n),o),{updatedAt:new Date}):n)),o.status){let e=o.status==="published"?2:1;this.http.patch(`${this.api}/Articles/admin/${t}/status`,{statusId:e}).subscribe()}})}updateBlocks(t,o,r){let i=this._pages().find(a=>a.id===t);if(!i)return;let e=this.blocksToHtml(o),n=JSON.stringify(o),u=r??i.readingTime??1,l={title:i.title,slug:i.slug,contentHtml:e,blocksJson:n,excerpt:i.description??"",emoji:"\u{1F4C4}",readingTime:u,featured:i.featured??!1,categoryIds:i.categoryId?[i.categoryId]:[]};this.http.put(`${this.api}/Articles/admin/${t}`,l).subscribe(()=>{this._pages.update(a=>a.map(s=>s.id===t?p(g({},s),{blocks:o,readingTime:u,updatedAt:new Date}):s))})}delete(t){this.http.delete(`${this.api}/Articles/admin/${t}`).subscribe(()=>{this._pages.update(o=>o.filter(r=>r.id!==t))})}slugify(t){return"/"+t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s-]/g,"").trim().replace(/\s+/g,"-")}blocksToHtml(t){let o="max-width:100%;overflow-wrap:anywhere;word-break:break-word;overflow-x:hidden;box-sizing:border-box",r="overflow-wrap:anywhere;word-break:break-word;margin:0 0 0.5rem;font-size:clamp(1.5rem,3vw,2.25rem);font-weight:800;line-height:1.2";return t.filter(i=>i.visible).sort((i,e)=>i.order-e.order).map(i=>{let e=i.data;switch(i.type){case"text":{let l=e.align??"left",a=[o,"display:block","width:100%","max-width:860px","margin:0 auto","padding:3rem 2rem","box-sizing:border-box",`text-align:${l}`,e.backgroundColor?`background-color:${e.backgroundColor}`:"",e.textColor?`color:${e.textColor}`:""].filter(Boolean).join(";"),s=[e.titleColor?`color:${e.titleColor}`:"","overflow-wrap:anywhere;word-break:break-word","font-size:1.875rem;font-weight:700;margin:0 0 1rem"].filter(Boolean).join(";"),d=e.title?`<h2 style="${s}">${e.title}</h2>`:"",c=e.html??"";return`<div class="article-block article-block--text" style="${a}">${d}${c}</div>`}case"video":{let l=e.url?.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/)?.[1];if(!l)return"";let a=e.title?`<h3 class="video-embed__title" style="margin:1rem 0 0;font-size:1.125rem;font-weight:600;color:#1e293b;text-align:center;line-height:1.4">${e.title}</h3>`:"";return`<div class="article-block article-block--video" style="display:block;width:70%;max-width:70%;margin:2rem auto;padding:0 1rem;box-sizing:border-box">
              <div class="video-embed" style="position:relative;width:100%;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;background:#000">
                <iframe src="https://www.youtube.com/embed/${l}"
                  style="position:absolute;top:0;left:0;width:100%;height:100%;border:0"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen></iframe>
              </div>
              ${a}
            </div>`}case"image":{let l=!!e.fullWidth,a=l?"article-block article-block--image article-block--image-full":"article-block article-block--image",s=l?"margin:2rem 0;width:100%;padding:0;box-sizing:border-box":"margin:2rem auto;width:100%;max-width:860px;padding:0 2rem;box-sizing:border-box",d="width:100%;max-width:100%;height:auto;border-radius:8px;display:block;object-fit:contain",c=e.caption?`<figcaption style="margin-top:0.5rem;text-align:center;font-size:0.875rem;color:#64748b">${e.caption}</figcaption>`:"";return`<figure class="${a}" style="${s}">
              <img src="${e.src}" alt="${e.alt??""}" style="${d}" />
              ${c}
            </figure>`}case"hero":{let l=e.backgroundColor?`background-color:${e.backgroundColor};`:"",a=e.titleColor?`color:${e.titleColor};`:"color:white;",s=e.subtitleColor?`color:${e.subtitleColor};`:"color:white;",d=[e.ctaBackgroundColor?`background:${e.ctaBackgroundColor};`:"background:#fff;",e.ctaTextColor?`color:${e.ctaTextColor};`:"color:#1e5fa8;","display:inline-block;padding:0.625rem 1.5rem;border-radius:999px;text-decoration:none;font-weight:700"].join("");return`<div class="article-block article-block--hero" style="position:relative;padding:2.5rem 3rem;overflow:hidden;min-height:220px;width:100%;${o};${l}">
              ${e.backgroundImage?`
                <img src="${e.backgroundImage}"
                  style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:0"
                  alt="hero background" />
                <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);z-index:1"></div>
              `:""}
              <div style="position:relative;z-index:2;max-width:100%;min-width:0">
                <h1 style="${a}${r}">${e.title??""}</h1>
                ${e.subtitle?`<p style="${s}text-shadow:0 1px 3px rgba(0,0,0,0.5);overflow-wrap:anywhere;word-break:break-word;margin:0 0 1.25rem">${e.subtitle}</p>`:""}
                ${e.ctaLabel?`<a href="${e.ctaRoute??"#"}" style="${d}">${e.ctaLabel}</a>`:""}
              </div>
            </div>`}case"cards-grid":{let l=e.backgroundColor?`background-color:${e.backgroundColor};`:"",a=e.titleColor?`color:${e.titleColor};`:"",s=e.subtitleColor?`color:${e.subtitleColor};`:"",d=["padding:1rem;border-radius:8px",e.cardBackgroundColor?`background:${e.cardBackgroundColor};`:"",e.cardBorderColor?`border:1px solid ${e.cardBorderColor};`:"border:1px solid #eee;",e.cardTextColor?`color:${e.cardTextColor};`:"",o].filter(Boolean).join(";");return`<div class="article-block article-block--cards" style="${l}${o};padding:2.5rem 2rem;width:100%">
              ${e.title?`<h2${a?` style="${a}"`:""}>${e.title}</h2>`:""}
              ${e.subtitle?`<p${s?` style="${s}"`:""}>${e.subtitle}</p>`:""}
              <div style="display:grid;grid-template-columns:repeat(${e.columns??2},1fr);gap:1rem;margin:1rem 0">
                ${(e.cards??[]).map(c=>`
                  <div style="${d}">
                    <strong>${c.title}</strong>
                    <p>${c.description}</p>
                  </div>`).join("")}
              </div>
            </div>`}case"slides":let n=e.canvaUrl?.match(/canva\.com\/design\/([a-zA-Z0-9_-]+)/);return n?`<div class="canva-embed" style="position:relative;width:100%;height:0;padding-top:56.2225%;
                box-shadow:0 2px 8px 0 rgba(63,69,81,0.16);margin-top:1.6em;margin-bottom:0.9em;overflow:hidden;
                border-radius:8px;">
              <iframe loading="lazy" style="position:absolute;width:100%;height:100%;top:0;left:0;border:none;padding:0;margin:0;"
                src="${`https://www.canva.com/design/${n[1]}/view?embed`}" allowfullscreen="allowfullscreen" allow="fullscreen">
              </iframe>
            </div>`:"";case"cta":return`<div class="article-block article-block--cta" style="padding:4rem 2rem;text-align:center;background:#f0f4f8;width:100%;${o}">
              <h2>${e.title}</h2>
              ${e.description?`<p>${e.description}</p>`:""}
              <a href="${e.primaryRoute}" style="display:inline-block;padding:0.75rem 1.5rem;background:#1e5fa8;color:white;border-radius:6px;text-decoration:none">
                ${e.primaryLabel}
              </a>
            </div>`;default:return""}}).join(`
`)}mapArticleToPage(t){let o=e=>e?new Date(e):new Date,r=[];if(t.blocksJson)try{r=JSON.parse(t.blocksJson)}catch{r=[]}else t.contentHtml&&(r=[{id:"text-1",type:"text",visible:!0,order:1,data:{title:t.title,html:t.contentHtml,align:"left"}}]);let i=this._categories().find(e=>e.slug===t.category);return{id:t.id,title:t.title,slug:t.slug,status:t.statusName==="Published"?"published":t.statusName==="Draft"?"draft":"archived",description:t.excerpt??"",categoryId:i?.categoryId??null,featured:t.featured??!1,readingTime:t.readingTime??1,blocks:r,createdAt:o(t.createdAt),updatedAt:o(t.updatedAt??t.createdAt)}}static \u0275fac=function(o){return new(o||m)};static \u0275prov=h({token:m,factory:m.\u0275fac,providedIn:"root"})};export{v as a};
