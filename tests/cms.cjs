/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
function harness({role='NATIONAL_ADMIN',preview=false,empty=false}={}) {
 const cache=new Map(); const content={};
 const db={siteContent:{findMany:async({where})=>Object.entries(content[where.page]||{}).map(([key,value])=>{const [section,field]=key.split('.');return{section,field,value,publishedValue:value};})},
 siteLeader:{findMany:async()=>empty?[]:[{id:'leader',name:'Leader',role:'President',bio:'Bio',initials:'L',color:'brand',imageUrl:'/casa-logo.png'}]},
 siteArticle:{findMany:async()=>empty?[]:[{slug:'story',title:'Story',kind:'News',excerpt:'Excerpt',body:'["Story body"]',imageUrl:'/casa-logo.png',meta:'Article meta',published:true},{slug:'other-story',title:'Other story',kind:'News',excerpt:'Other excerpt',body:'[]',imageUrl:null,meta:'',published:true}],findUnique:async()=>empty?null:{slug:'story',title:'Story',kind:'News',excerpt:'Excerpt',body:'["Story body"]',imageUrl:'/casa-logo.png',meta:'Article meta',published:true}},
 siteEvent:{findMany:async()=>empty?[]:[{month:'Nov',day:'1',kind:'Gathering',title:'Gathering',text:'Details',meta:'Venue'}]}};
 const invalidated=[];
 const mocks={
 'next/server':{NextResponse:{json:(body,init)=>({body,status:init?.status||200})}},
 'next/cache':{revalidatePath:(...args)=>invalidated.push(args)},
 '@/lib/audit':{createAuditLog:async()=>{}},
 '@/components/ui/CustomDropdown':({label,options,value})=>React.createElement('select',{'aria-label':label,defaultValue:value},options.map(option=>React.createElement('option',{key:option.value,value:option.value},option.label))),
 '@/lib/prisma':{db},'@/auth':{auth:async()=>role?{user:{id:'editor',role}}:null},
 'next/headers':{headers:async()=>new Headers(preview?{'x-cms-preview':'1'}:{})},
 'next/navigation':{usePathname:()=>'/about',notFound:()=>{throw Error('NOT_FOUND');}},
 'next/link':({children,href,...props})=>React.createElement('a',{...props,href},children),
 'next/image':({src,alt,width,height})=>React.createElement('img',{src,alt,width,height}),
 };
 function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const exports={};cache.set(file,exports);
  const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  vm.runInNewContext(js,{exports,require:id=>{if(id in mocks)return mocks[id];if(id.startsWith('@phosphor-icons/'))return new Proxy({}, {get:()=>()=>React.createElement('svg')});if(id.endsWith('.css'))return{};if(id.startsWith('@/')||id.startsWith('.')){const base=id.startsWith('@/')?path.resolve('src',id.slice(2)):path.resolve(path.dirname(file),id);const target=[base,base+'.ts',base+'.tsx'].find(item=>fs.existsSync(item)&&fs.statSync(item).isFile());if(target)return load(target);}return require(id);},URL,Headers,console,process});return exports;
 }
 return{load,content,db,invalidated};
}
const pagePaths={home:'src/app/(site)/page.tsx',about:'src/app/(site)/about/page.tsx',departments:'src/app/(site)/departments/page.tsx',contact:'src/app/(site)/contact/page.tsx',news:'src/app/(site)/news/page.tsx'};

test('every active CMS content field reaches the public website rendering',async()=>{
 const h=harness();const schema=h.load('src/lib/cms/schema.ts');const expected=[];
 const conditional=new Set(['form.sendingLabel','form.success']);
 for(const page of schema.CMS_PAGES){const values=schema.defaultContentForPage(page);h.content[page.slug]=values;
  for(const section of page.sections)for(const field of section.fields){const key=`${section.key}.${field.key}`;
   if(section.key==='seo'||field.type==='boolean'||field.type==='image')continue;
   if(field.type==='list'){const list=JSON.parse(values[key]);for(let i=0;i<list.length;i++)for(const sub of field.subFields){if(['href','icon','linkLabel'].includes(sub.key))continue;const marker=`CMS_${page.slug}_${section.key}_${field.key}_${i}_${sub.key}`;list[i][sub.key]=marker;expected.push(marker);}values[key]=JSON.stringify(list);continue;}
   if(/Href$/.test(field.key))continue;
   const marker=`CMS_${page.slug}_${section.key}_${field.key}`;
   values[key]=section.key==='socials'&&field.key!=='heading'?`https://example.test/${marker}`:marker;
   if(!conditional.has(key))expected.push(marker);
  }
 }
 let markup='';
 for(const file of Object.values(pagePaths)){const page=await h.load(file).default({searchParams:Promise.resolve({})});const layout=await h.load('src/app/(site)/layout.tsx').default({children:page});markup+=renderToStaticMarkup(layout);}
 const detail=await h.load('src/app/(site)/news/[slug]/page.tsx').default({params:Promise.resolve({slug:'story'}),searchParams:Promise.resolve({})});markup+=renderToStaticMarkup(detail);
 for(const marker of expected)assert.ok(markup.includes(marker),`CMS content not rendered: ${marker}`);
});

test('section visibility controls hide the corresponding public sections',async()=>{
 for(const [slug,section,key]of [['home','welcome','welcome.heading'],['home','community','community.eyebrow'],['home','next','next.heading'],['about','hero','hero.heading'],['about','overview','overview.heading'],['about','campus','campus.heading'],['about','leadership','leadership.heading'],['departments','grid','grid.items'],['departments','steps','steps.heading'],['contact','form','form.heading'],['news','eventsHead','eventsHead.heading'],['news','latestHead','latestHead.heading']]){
  const h=harness();const schema=h.load('src/lib/cms/schema.ts');h.content[slug]=schema.defaultContentForPage(schema.getCmsPage(slug));h.content[slug][`${section}.enabled`]='false';
  if(key.endsWith('.items'))h.content[slug][key]=JSON.stringify([{name:'HIDDEN_MARKER',text:'text',icon:'MusicNotes'}]);else h.content[slug][key]='HIDDEN_MARKER';
  const result=await h.load(pagePaths[slug]).default({searchParams:Promise.resolve({})});assert.ok(!renderToStaticMarkup(result).includes('HIDDEN_MARKER'),`${slug}.${section} still visible`);
 }
});

test('empty published collections stay empty instead of showing sample content',async()=>{
 const h=harness({empty:true});const news=h.load('src/lib/cms/news.ts');const leaders=h.load('src/lib/cms/leaders.ts');
 assert.equal((await news.getPublishedArticles()).length,0);assert.equal((await news.getPublishedEvents()).length,0);assert.equal((await leaders.getPublishedLeaders()).length,0);
 assert.equal(await news.getArticleBySlug('orientation-week-outreach-reaches-400-students'),undefined);
});

test('draft previews are limited to CMS roles including shared header and footer',async()=>{
 for(const role of ['NATIONAL_ADMIN','CONTENT_MANAGER','LOCAL_ADMIN',null]){const h=harness({role,preview:true});const api=h.load('src/lib/cms/preview.ts');const allowed=['NATIONAL_ADMIN','CONTENT_MANAGER'].includes(role);assert.equal(await api.resolvePreview(Promise.resolve({preview:'1'})),allowed);assert.equal(await api.resolveLayoutPreview(),allowed);}
});

test('published and draft values remain separate and empty published values are retained',async()=>{
 const h=harness();h.db.siteContent.findMany=async()=>[{section:'hero',field:'heading',value:'Draft heading',publishedValue:'Published heading'},{section:'hero',field:'body',value:'Draft body',publishedValue:''}];const api=h.load('src/lib/cms/content.ts');
 assert.equal((await api.getPageContent('about'))['hero.heading'],'Published heading');assert.equal((await api.getPageContent('about',true))['hero.heading'],'Draft heading');assert.equal((await api.getPageContent('about'))['hero.body'],'');
});

test('CMS links reject executable schemes and protocol-relative destinations',()=>{const api=harness().load('src/lib/cms/display.ts');assert.equal(api.safeHref('javascript:alert(1)'),'/contact');assert.equal(api.safeHref('//evil.example'),'/contact');assert.equal(api.safeHref('/about'),'/about');assert.equal(api.safeHref('https://example.test'),'https://example.test');});


test('saving and publishing new CMS fields updates drafts and live content independently',async()=>{
 const h=harness();const rows=new Map();
 h.db.siteContent.findMany=async({where})=>[...rows.values()].filter(row=>row.page===where.page);
 h.db.siteContent.upsert=async({where,create,update})=>{const key=JSON.stringify(where.page_section_field);rows.set(key,rows.has(key)?{...rows.get(key),...update}:create);};
 h.db.$transaction=async callback=>callback(h.db);
 const api=h.load('src/app/api/content/route.ts');
 const post=body=>new Request('http://local',{method:'POST',body:JSON.stringify(body)});
 const before=(await h.load('src/lib/cms/content.ts').getPageContent('global'))['footer.heading'];
 const draft=await api.POST(post({page:'global',action:'save',values:{'footer.heading':'New footer invitation','navigation.ctaLabel':'Visit our chapter'}}));
 assert.equal(draft.status,200);assert.equal(draft.body.content['footer.heading'],'New footer invitation');
 assert.equal((await h.load('src/lib/cms/content.ts').getPageContent('global'))['footer.heading'],before);
 const published=await api.POST(post({page:'global',action:'publish',values:{'footer.heading':'New footer invitation','navigation.ctaLabel':'Visit our chapter'}}));
 assert.equal(published.status,200);assert.equal((await h.load('src/lib/cms/content.ts').getPageContent('global'))['footer.heading'],'New footer invitation');assert.ok(h.invalidated.length>0);
});

test('page SEO values are editable through the same CMS field map',async()=>{
 const h=harness();h.content.about={'seo.title':'Edited about title','seo.description':'Edited search description','seo.image':'/casa-logo.png'};
 const result=await h.load('src/lib/cms/metadata.ts').cmsPageMetadata('about');
 assert.ok(result.title.absolute.includes('Edited about title'));assert.equal(result.description,'Edited search description');assert.equal(result.openGraph.images[0].url,'/casa-logo.png');
});


test('CMS content cannot terminate the structured-data script tag',()=>{
 const api=harness().load('src/lib/cms/display.ts');const name='</script><script>alert(1)</script>';const json=api.jsonLd({name});assert.ok(!json.includes('</script>'));assert.equal(JSON.parse(json).name,name);
});


test('existing home images and text remain visible after editor field regrouping',async()=>{
 const h=harness();h.db.siteContent.findMany=async()=>[{section:'heroImage',field:'image',value:'/uploaded-original.webp',publishedValue:'/uploaded-original.webp'},{section:'welcome',field:'communityHeading',value:'Existing heading',publishedValue:'Existing heading'}];const values=await h.load('src/lib/cms/content.ts').getPageContent('home');assert.equal(values['welcome.image'],'/uploaded-original.webp');assert.equal(values['community.heading'],'Existing heading');
});
