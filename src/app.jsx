// Shared React application. Uses class components for portability across Vite and standalone builds.
export function DAAAppFactory(React, DATA) {
  const { lessons, questions, labs, resourceLinks } = DATA;
  const E = React.createElement;
  const KEY = 'daa-final-prep-progress-v1';
  const navStudy = [{id:'overview',name:'Overview',ico:'home'},{id:'lessons',name:'Lessons',ico:'book'},{id:'flashcards',name:'Flashcards',ico:'layers'},{id:'lab',name:'Practice Lab',ico:'code'}];
  const navPractice = [{id:'previous',name:'Previous questions',ico:'list'},{id:'mock',name:'Mock final',ico:'timer'},{id:'mistakes',name:'Mistake review',ico:'alert'},{id:'progress',name:'Progress',ico:'chart'},{id:'materials',name:'Materials',ico:'folder'}];
  const initial = { theme:'dark',completed:[],cardRatings:{},quizHistory:[],mockHistory:[],mistakes:{},labDone:{},labMistakes:{},draft:null };
  const safeRead = () => { try { const v = JSON.parse(localStorage.getItem(KEY)); return v && typeof v === 'object' ? {...initial,...v} : {...initial}; } catch (e) { return {...initial}; } };
  const shuffle = arr => {let a=[...arr]; for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const byId = Object.fromEntries(questions.map(q=>[q.id,q]));
  const cards=lessons.flatMap(l=>[
    ...l.quick.map((p,i)=>({id:`l${l.id}-q${i}`,lesson:l.id,front:p[0],back:p[1]})),
    ...l.terms.map((t,i)=>({id:`l${l.id}-t${i}`,lesson:l.id,front:t[0],back:`${t[1]} — ${t[2]}`}))]);
  const pct=(num,den)=>den ? Math.round(num/den*100):0;
  const avg=items=>items.length?Math.round(items.reduce((s,x)=>s+x.percentage,0)/items.length):0;
  const timeFmt=(ms)=>{let s=Math.max(0,Math.ceil(ms/1000));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;};
  const escNorm = s => String(s||'').trim().replace(/\s+/g,'').replace(/;$/,'');
  const labelMode = {lesson:'Lesson quiz',previous:'Previous questions',mistakes:'Mistake review',mock:'Mock final'};

  function Icon({name,size=18}) {
    const specs={
      home:<><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></>,
      book:<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>,
      layers:<><path d="m12 2-9 5 9 5 9-5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5"/></>,
      code:<><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 4l-4 16"/></>,
      list:<><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></>,
      timer:<><circle cx="12" cy="13" r="9"/><path d="M12 8v5l3 2M9 2h6"/></>,
      alert:<><path d="M10.3 3.6 2 18a2 2 0 0 0 1.7 3h16.6A2 2 0 0 0 22 18L13.7 3.6a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></>,
      chart:<><path d="M3 3v18h18M7 16l4-5 4 2 5-7"/></>,
      folder:<><path d="M3 5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></>,
      moon:<><path d="M20.5 14a8.5 8.5 0 0 1-10.5-10.5A8.5 8.5 0 1 0 20.5 14Z"/></>,
      sun:<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
      check:<><path d="M20 6 9 17l-5-5"/></>,
      arrow:<><path d="M5 12h14m-6-6 6 6-6 6"/></>,
      chevron:<><path d="m9 18 6-6-6-6"/></>,
      left:<><path d="m15 18-6-6 6-6"/></>,
      rotate:<><path d="M3 11a9 9 0 1 1 2.6 6.3M3 4v7h7"/></>,
      bookmark:<><path d="M5 4h14v18l-7-4-7 4z"/></>,
      download:<><path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4"/></>,
      upload:<><path d="M12 16V4m-4 4 4-4 4 4M4 17v4h16v-4"/></>,
      spark:<><path d="m12 3 1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8L12 3zM20 18v4M18 20h4"/></>,
      shield:<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m8 12 3 3 5-6"/></>,
      menu:<><path d="M4 6h16M4 12h16M4 18h16"/></>,
      close:<><path d="M5 5l14 14M19 5 5 19"/></>,
      trash:<><path d="M3 6h18M8 6V4h8v2M5 6l1 15h12l1-15M10 10v7M14 10v7"/></>,
      edit:<><path d="M12 20h9M16 3l5 5-12 12H4v-5L16 3z"/></>,
      target:<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>
    };
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{specs[name]||specs.spark}</svg>;
  }
  function Ring({value,size=104}) {return <div className="ring" style={{width:size,height:size,background:`conic-gradient(var(--accent) ${value}%,var(--line) 0)`}}><div><strong>{value}%</strong><small>complete</small></div></div>;}
  function Pill({children,tone='neutral'}) {return <span className={`pill pill-${tone}`}>{children}</span>;}

  class App extends React.Component {
    constructor(props){
      super(props);const progress=safeRead();
      this.state={ progress,page:'overview',selectedLesson:1,cardTopic:'all',cardIndex:0,cardFlipped:false,repeatOnly:false,activeQuiz:progress.draft||null,finishedResult:null,questionTopic:'all',questionSource:'sample',labId:'merge',labAnswers:{},labResult:null,labHint:-1,labShow:false,traceStep:0,mobileNav:false,clock:Date.now(),search:'',message:''};
      this.fileInput={current:null}; this.timer=null;
    }
    componentDidMount(){
      document.documentElement.setAttribute('data-theme',this.state.progress.theme);
      this.timer=setInterval(()=>{this.setState({clock:Date.now()}); const d=this.state.activeQuiz; if(d && d.type==='mock' && d.deadline <= Date.now()) this.finishQuiz(true);},1000);
      if(this.state.activeQuiz) this.setState({page:'quiz'});
    }
    componentWillUnmount(){clearInterval(this.timer);}
    saveProgress(patch){
      this.setState(prev=>({progress:{...prev.progress,...(typeof patch==='function'?patch(prev.progress):patch)}}),()=>{try{localStorage.setItem(KEY,JSON.stringify(this.state.progress));}catch(e){}document.documentElement.setAttribute('data-theme',this.state.progress.theme);});
    }
    navigate=(page,more={})=>{this.setState({page,mobileNav:false,search:'',message:'',...more});window.scrollTo({top:0,behavior:'smooth'});};
    goLesson=(id)=>this.navigate('lessons',{selectedLesson:id});
    toggleComplete=(id)=>this.saveProgress(p=>({completed:p.completed.includes(id)?p.completed.filter(x=>x!==id):[...p.completed,id]}));
    flashFor=()=>cards.filter(c=>(this.state.cardTopic==='all'||c.lesson===Number(this.state.cardTopic)) && (!this.state.repeatOnly||this.state.progress.cardRatings[c.id]==='repeat'));
    flashLesson=(id)=>this.navigate('flashcards',{cardTopic:String(id),cardIndex:0,cardFlipped:false,repeatOnly:false});
    rateCard=(rating)=>{
      const available=this.flashFor(),card=available[this.state.cardIndex]||available[0];if(!card)return;
      this.saveProgress(p=>({cardRatings:{...p.cardRatings,[card.id]:rating}}));
      this.setState({cardFlipped:false,cardIndex:available.length ? (this.state.cardIndex+1)%available.length : 0});
    };
    openQuiz=(type,lessonId=null)=>{
      let pool=questions.filter(q=>type==='lesson'?q.lesson===lessonId:type==='mistakes'?!!this.state.progress.mistakes[q.id] : (this.state.questionTopic==='all'||q.lesson===Number(this.state.questionTopic)) && (this.state.questionSource==='all'||q.source===this.state.questionSource));
      if(type==='mock'){
        const selected=lessons.flatMap(l=>shuffle(questions.filter(q=>q.lesson===l.id)).slice(0,2));
        const extra=shuffle(questions.filter(q=>!selected.some(s=>s.id===q.id))).slice(0,5);
        pool=shuffle([...selected,...extra]);
      }else pool=shuffle(pool).slice(0,type==='lesson'?8:type==='mistakes'?25:15);
      if(!pool.length){this.setState({message:'Для выбранных фильтров вопросов пока нет.'});return;}
      const draft={type,lessonId,ids:pool.map(x=>x.id),index:0,answers:{},revealed:{},started:Date.now(),deadline:type==='mock'?Date.now()+25*60*1000:null};
      this.setState({activeQuiz:draft,finishedResult:null,page:'quiz',message:''},()=>this.saveProgress({draft}));
      window.scrollTo(0,0);
    };
    setDraft=(draft)=>this.setState({activeQuiz:draft},()=>this.saveProgress({draft}));
    answerQuiz=(option)=>{
      const d=this.state.activeQuiz;if(!d)return;
      const id=d.ids[d.index];if(d.type!=='mock'&&d.revealed[id])return;
      const newDraft={...d,answers:{...d.answers,[id]:option},revealed:d.type==='mock'?d.revealed:{...d.revealed,[id]:true}};
      this.setDraft(newDraft);
    };
    stepQuiz=(delta)=>{
      const d=this.state.activeQuiz;if(!d)return;
      const next=d.index+delta;if(next>=0&&next<d.ids.length)this.setDraft({...d,index:next});
      else if(next>=d.ids.length)this.finishQuiz(false);
    };
    finishQuiz=(timedOut=false)=>{
      const d=this.state.activeQuiz;if(!d)return;
      const correct=d.ids.filter(id=>d.answers[id]===byId[id].answer).length;
      const result={id:Date.now(),type:d.type,lessonId:d.lessonId,questionIds:d.ids,answers:d.answers,correct,total:d.ids.length,percentage:pct(correct,d.ids.length),date:new Date().toISOString(),timedOut};
      this.saveProgress(p=>{
        const mistakes={...p.mistakes};d.ids.forEach(id=>{if(d.answers[id]===byId[id].answer)delete mistakes[id];else mistakes[id]={count:(mistakes[id]?.count||0)+1,date:Date.now()};});
        const field=d.type==='mock'?'mockHistory':'quizHistory';
        return {[field]:[result,...p[field]].slice(0,100),mistakes,draft:null};
      });
      this.setState({activeQuiz:null,finishedResult:result,page:'result'});window.scrollTo(0,0);
    };
    labChange=(i,value)=>this.setState(prev=>({labAnswers:{...prev.labAnswers,[this.state.labId]:{...(prev.labAnswers[this.state.labId]||{}),[i]:value}},labResult:null}));
    testLab=()=>{
      const lab=labs.find(l=>l.id===this.state.labId);const vals=this.state.labAnswers[lab.id]||{};
      const ok=lab.blanks.every((b,i)=>escNorm(vals[i])===escNorm(b));
      this.setState({labResult:ok?'correct':'wrong'});
      if(ok)this.saveProgress(p=>({labDone:{...p.labDone,[lab.id]:true},labMistakes:{...p.labMistakes,[lab.id]:false}}));
      else this.saveProgress(p=>({labMistakes:{...p.labMistakes,[lab.id]:true}}));
    };
    downloadBackup=()=>{
      const blob=new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),progress:this.state.progress},null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='daa-final-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),500);
    };
    importBackup=(e)=>{const f=e.target.files?.[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{try{const obj=JSON.parse(reader.result);const p=obj.progress;if(!p||!Array.isArray(p.completed)||typeof p.cardRatings!=='object')throw Error('Invalid');this.saveProgress({...initial,...p,draft:null});this.setState({message:'Прогресс успешно импортирован!',activeQuiz:null});}catch(err){this.setState({message:'Файл не похож на резервную копию DAA Final.'});}};reader.readAsText(f);e.target.value='';};
    resetProgress=()=>{if(window.confirm('Удалить весь сохранённый прогресс на этом устройстве?')){const theme=this.state.progress.theme;this.saveProgress({...initial,theme});this.navigate('overview');}};
    topTitle=()=>({overview:'Your learning dashboard',lessons:'Lessons',flashcards:'Flashcards',lab:'Practice Lab',previous:'Previous questions',mock:'Mock final',mistakes:'Mistake review',progress:'Your progress',materials:'Materials',quiz:'Practice session',result:'Session results'})[this.state.page];
    navLink=(it)=> <button type="button" key={it.id} className={`nav-link ${this.state.page===it.id||(it.id==='previous'&&this.state.page==='quiz')?'active':''}`} onClick={()=>this.navigate(it.id)}><Icon name={it.ico}/><span>{it.name}</span>{it.id==='mistakes'&&Object.keys(this.state.progress.mistakes).length>0&&<span className="nav-count">{Object.keys(this.state.progress.mistakes).length}</span>}</button>;
    sidebar=()=> <aside className={`sidebar ${this.state.mobileNav?'mobile-open':''}`}>
      <div className="brand"><div className="brand-mark">D<span>/</span>A</div><div><strong>DAA final</strong><small>DESIGN & ANALYSIS</small></div><button className="mobile-close icon-btn" onClick={()=>this.setState({mobileNav:false})}><Icon name="close"/></button></div>
      <div className="sidebar-scroll"><div className="nav-label">STUDY</div><nav>{navStudy.map(this.navLink)}</nav><div className="nav-label mt26">PRACTICE</div><nav>{navPractice.map(this.navLink)}</nav></div>
      <div className="sidebar-bottom"><div className="side-goal"><div className="side-goal-top"><span>YOUR PROGRESS</span><strong>{pct(this.state.progress.completed.length,10)}%</strong></div><div className="meter"><span style={{width:`${pct(this.state.progress.completed.length,10)}%`}}/></div><small>{this.state.progress.completed.length} / 10 lectures completed</small></div><div className="sidebar-foot"><Icon name="shield" size={15}/> Learning stays on this device</div></div>
    </aside>;
    header=()=> <header className="topbar"><div className="top-left"><button className="mobile-menu icon-btn" onClick={()=>this.setState({mobileNav:true})}><Icon name="menu"/></button><div className="breadcrumb">DAA FINAL PREP <span>/</span> <strong>{this.topTitle()}</strong></div></div><div className="top-right"><span className="save-status"><span className="status-dot"/> Saved on this device</span><button className="theme-switch" aria-label="Переключить тему" onClick={()=>this.saveProgress({theme:this.state.progress.theme==='dark'?'light':'dark'})}><Icon name={this.state.progress.theme==='dark'?'sun':'moon'} size={17}/><span>{this.state.progress.theme==='dark'?'Light':'Dark'}</span></button></div></header>;
    mainHeading=(eyebrow,title,subtitle,action)=> <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</div>{action&&<div className="heading-action">{action}</div>}</div>;
    overview=()=>{
      const p=this.state.progress,completed=p.completed.length,known=Object.values(p.cardRatings).filter(v=>v==='know').length,history=[...p.quizHistory,...p.mockHistory],accuracy=avg(history);
      const latest=history.slice().sort((a,b)=>b.id-a.id).slice(0,4);
      return <>
        <div className="hero"><div className="hero-content"><Pill tone="accent"><Icon name="spark" size={13}/> YOUR FINAL EXAM COMPANION</Pill><h1>Learn smarter.<br/><span>Finish stronger.</span></h1><p>Твои 10 тем по DAA: от Big-O и Merge Sort до Kasai и Aho-Corasick. Повторяй теорию, решай задачи и возвращайся к ошибкам.</p><div className="hero-actions"><button className="btn primary" onClick={()=>this.goLesson(lessons.find(l=>!p.completed.includes(l.id))?.id||1)}>Continue studying <Icon name="arrow" size={16}/></button><button className="btn ghost" onClick={()=>this.navigate('mock')}>Try mock exam</button></div></div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="hero-core">O(n log n)</div><span className="hero-mini m1">[0, 1, 2]</span><span className="hero-mini m2">DP → OPT</span><span className="hero-mini m3">100%</span></div></div>
        <div className="stats-grid"><div className="stat-card"><div className="stat-top">COMPLETED LESSONS <Icon name="book" size={18}/></div><strong>{completed}<span> / 10</span></strong><div className="stat-bottom">{pct(completed,10)}% of all topics</div></div><div className="stat-card"><div className="stat-top">AVERAGE SCORE <Icon name="target" size={18}/></div><strong>{accuracy}<span>%</span></strong><div className="stat-bottom">{history.length} completed sessions</div></div><div className="stat-card"><div className="stat-top">FLASHCARDS KNOWN <Icon name="layers" size={18}/></div><strong>{known}<span> / {cards.length}</span></strong><div className="stat-bottom">Keep your memory sharp</div></div><div className="stat-card"><div className="stat-top">TO REVIEW <Icon name="alert" size={18}/></div><strong>{Object.keys(p.mistakes).length}</strong><div className="stat-bottom">Questions to revisit</div></div></div>
        <div className="section-title"><div><h2>Course roadmap</h2><p>10 lectures · Theory + practice</p></div><button className="text-link" onClick={()=>this.navigate('lessons')}>All lessons <Icon name="arrow" size={16}/></button></div>
        <div className="lesson-grid">{lessons.map(l=><button key={l.id} className="lesson-tile" onClick={()=>this.goLesson(l.id)}><div className="tile-top"><span className="tile-index">{String(l.id).padStart(2,'0')}</span>{p.completed.includes(l.id)?<Pill tone="success">Completed</Pill>:<Pill>{l.minutes} min</Pill>}</div><h3>{l.ru}</h3><span className="tile-sub">{l.en}</span><div className="tile-bottom"><span>{l.unit}</span><Icon name={p.completed.includes(l.id)?'check':'arrow'} size={17}/></div></button>)}</div>
        <div className="bottom-grid"><div className="panel"><div className="panel-heading"><h3>Quick actions</h3><span className="muted">Keep the momentum</span></div><div className="action-list"><button onClick={()=>this.navigate('flashcards')}><span className="action-symbol pink"><Icon name="layers"/></span><span><b>Review flashcards</b><small>Recall the essential concepts</small></span><Icon name="chevron"/></button><button onClick={()=>this.navigate('lab')}><span className="action-symbol blue"><Icon name="code"/></span><span><b>Practice Java implementations</b><small>9 code-completion challenges</small></span><Icon name="chevron"/></button><button onClick={()=>this.navigate('mistakes')}><span className="action-symbol orange"><Icon name="rotate"/></span><span><b>Work on mistakes</b><small>Learn from incorrect answers</small></span><Icon name="chevron"/></button></div></div><div className="panel"><div className="panel-heading"><h3>Recent activity</h3><span className="muted">Your latest scores</span></div>{latest.length?latest.map(h=><div className="recent-row" key={h.id}><span className={`score-dot ${h.percentage>=75?'good':'low'}`}>{h.percentage}%</span><span className="grow"><b>{labelMode[h.type]}</b><small>{new Date(h.date).toLocaleDateString('ru-RU')} · {h.correct}/{h.total} correct</small></span></div>):<div className="empty-minor">Ты пока не проходила тесты. Начни с мини-квиза!</div>}</div></div>
      </>;
    };
    lessonsPage=()=>{const l=lessons.find(x=>x.id===this.state.selectedLesson)||lessons[0],completed=this.state.progress.completed.includes(l.id);return <>
      {this.mainHeading('STUDY / LESSONS',l.ru,`${l.en} · Lecture ${String(l.id).padStart(2,'0')} of 10`,<Pill tone="accent">{l.minutes} MIN READ</Pill>)}
      <div className="lesson-layout"><div className="lesson-article"><div className="lesson-select"><label htmlFor="select-lesson">SELECT LESSON</label><select id="select-lesson" value={l.id} onChange={e=>this.goLesson(Number(e.target.value))}>{lessons.map(x=><option value={x.id} key={x.id}>{String(x.id).padStart(2,'0')} · {x.ru}</option>)}</select></div>
       <div className="lesson-intro"><div className="section-kicker">OVERVIEW</div><h2>Главная идея</h2><p>{l.lead}</p><div className="formula-block"><span>KEY TAKEAWAY</span><code>{l.formula}</code></div></div>
       <div className="lesson-paper"><div className="section-kicker">KEY CONCEPTS</div><h2>Термины, которые нужно знать</h2><div className="term-table"><div className="term-head"><span>TERM / ENGLISH</span><span>ОПРЕДЕЛЕНИЕ</span></div>{l.terms.map((t,i)=><div className="term-row" key={i}><div><strong>{t[0]}</strong><small>{t[1]}</small></div><p>{t[2]}</p></div>)}</div></div>
       {l.sections.map((s,i)=><section className="lesson-paper" key={i}><div className="section-kicker">PART {String(i+1).padStart(2,'0')}</div><h2>{s.title}</h2><p>{s.body}</p></section>)}
       <div className="lesson-paper"><div className="section-kicker">IMPLEMENTATION / JAVA</div><h2>Код и логика</h2><pre className="code-block"><div className="code-toolbar"><span><span className="window-dots">● ● ●</span> Java snippet</span><button onClick={()=>{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(l.snippet).then(()=>this.setState({message:'Код скопирован!'})).catch(()=>this.setState({message:'Скопируй код вручную из блока.'}));}else this.setState({message:'Выдели и скопируй код вручную.'});}}>Copy code</button></div><code>{l.snippet}</code></pre></div>
       <div className="lesson-paper"><div className="section-kicker">EXAM CHECKLIST</div><h2>Ловушки на экзамене</h2><div className="pitfalls">{l.pitfalls.map((p,i)=><div key={i}><span>!</span>{p}</div>)}</div></div>
       <div className="lesson-end"><span>Lecture {l.id} / 10</span><button className="btn primary" onClick={()=>this.goLesson(l.id===10?1:l.id+1)}>{l.id===10?'Back to lecture 1':'Next lesson'} <Icon name="arrow" size={16}/></button></div>
      </div><div className="lesson-actions"><div className="actions-panel"><div className="section-kicker">YOUR STUDY SESSION</div><Ring value={completed?100:0} size={106}/><h3>{completed?'Lesson completed':'Keep learning'}</h3><p>{completed?'Отлично! Повтори карточки или переходи дальше.':'Отмечай завершение после прочтения и закрепи знания тестом.'}</p><button className={`btn ${completed?'outline':'primary'} full`} onClick={()=>this.toggleComplete(l.id)}><Icon name="check" size={17}/>{completed?'Unmark complete':'Mark complete ✓'}</button><button className="btn subtle full" onClick={()=>this.flashLesson(l.id)}><Icon name="layers" size={17}/> Open flashcards</button><button className="btn subtle full" onClick={()=>this.openQuiz('lesson',l.id)}><Icon name="target" size={17}/> Take lesson quiz</button><button className="btn subtle full" onClick={()=>this.goLesson(l.id===10?1:l.id+1)}><Icon name="arrow" size={17}/> Next lesson</button></div><div className="actions-tip"><Icon name="spark"/><div><strong>Study tip</strong><p>Запомни purpose → steps → complexity → pitfalls. Это помогает и для MCQ, и для блока кода.</p></div></div></div></div>
    </>;};
    flashcardsPage=()=>{
      const available=this.flashFor();let idx=Math.min(this.state.cardIndex,Math.max(0,available.length-1)),card=available[idx];let known=available.filter(c=>this.state.progress.cardRatings[c.id]==='know').length;
      return <>{this.mainHeading('STUDY / ACTIVE RECALL','Flashcards','Переворачивай карточки, отмечай «Знаю» или «Повторить». Результаты сохраняются автоматически.')}
       <div className="control-panel"><label>Тема<select value={this.state.cardTopic} onChange={e=>this.setState({cardTopic:e.target.value,cardIndex:0,cardFlipped:false})}><option value="all">Все 10 тем</option>{lessons.map(l=><option value={l.id} key={l.id}>{l.id}. {l.en}</option>)}</select></label><label className="checkline"><input type="checkbox" checked={this.state.repeatOnly} onChange={e=>this.setState({repeatOnly:e.target.checked,cardIndex:0,cardFlipped:false})}/> Только «Повторить»</label><span className="muted">{known} / {available.length} known</span></div>
       {card?<div className="flash-shell"><div className="flash-above"><Pill tone="accent">LECTURE {card.lesson}</Pill><span>{idx+1} / {available.length}</span></div><button className={`flash-card ${this.state.cardFlipped?'flipped':''}`} onClick={()=>this.setState({cardFlipped:!this.state.cardFlipped})}><span className="flash-icon"><Icon name="layers" size={24}/></span><span className="flash-label">{this.state.cardFlipped?'ANSWER / ОБЪЯСНЕНИЕ':'QUESTION / ВСПОМНИ'}</span><strong>{this.state.cardFlipped?card.back:card.front}</strong><small><Icon name="rotate" size={14}/> Нажми, чтобы перевернуть</small></button><div className="flash-buttons"><button className="btn subtle" onClick={()=>this.setState({cardFlipped:false,cardIndex:(idx+available.length-1)%available.length})}><Icon name="left"/> Previous</button><button className="btn outline" onClick={()=>this.rateCard('repeat')}><Icon name="rotate"/> Повторить</button><button className="btn primary" onClick={()=>this.rateCard('know')}><Icon name="check"/> Знаю</button><button className="btn subtle" onClick={()=>this.setState({cardFlipped:false,cardIndex:(idx+1)%available.length})}>Next <Icon name="arrow"/></button></div><p className="center-muted">Если отметишь «Повторить», карточка попадёт в отдельную подборку для повторения.</p></div>:<div className="empty-card"><Icon name="check" size={30}/><h3>Карточек для повторения пока нет</h3><p>Выбери все карточки или другую тему.</p><button className="btn primary" onClick={()=>this.setState({repeatOnly:false,cardIndex:0})}>Show all cards</button></div>}
      </>;
    };
    labPage=()=>{const lab=labs.find(l=>l.id===this.state.labId)||labs[0],vals=this.state.labAnswers[lab.id]||{};
      const parts=lab.template.split(/(\{\{\d+\}\})/g);
      return <>{this.mainHeading('STUDY / PRACTICE LAB','Java implementation lab','9 упражнений по алгоритмам, которые могут встретиться в блоке Implementation. Код не выполняется: проверяются заполненные фрагменты.')}
       <div className="lab-layout"><div className="lab-list"><div className="lab-list-title">IMPLEMENTATION TOPICS</div>{labs.map((l,i)=><button key={l.id} className={`lab-picker ${l.id===lab.id?'active':''}`} onClick={()=>this.setState({labId:l.id,labResult:null,labHint:-1,labShow:false,traceStep:0})}><span className="lab-n">{String(i+1).padStart(2,'0')}</span><span className="grow"><b>{l.title}</b><small>Lecture {l.lesson} · {l.difficulty}</small></span>{this.state.progress.labDone[l.id]?<Icon name="check" size={17}/>:<Icon name="chevron" size={16}/>}</button>)}</div>
       <div className="lab-work"><div className="panel lab-info"><div className="row-space"><div><div className="section-kicker">CODE COMPLETION</div><h2>{lab.title}</h2><p>{lab.subtitle}</p></div><Pill tone="accent">{lab.lang}</Pill></div><div className="lab-description">{lab.description}</div><div className="lab-code" role="group" aria-label="Заполни недостающие фрагменты Java-кода"><div className="code-toolbar"><span><span className="window-dots">● ● ●</span> Main.java</span><span>{lab.blanks.length} blanks</span></div><code>{parts.map((part,i)=>{const match=part.match(/^\{\{(\d+)\}\}$/);return match?<input key={i} aria-label={`Пропуск ${match[1]}`} placeholder={`blank ${match[1]}`} className="inline-code-input" style={{width:`${Math.min(460,Math.max(135,lab.blanks[Number(match[1])-1].length*7+28))}px`}} value={vals[Number(match[1])-1]||''} onChange={e=>this.labChange(Number(match[1])-1,e.target.value)}/>:<span key={i}>{part}</span>;})}</code></div><div className="lab-buttons"><button className="btn primary" onClick={this.testLab}><Icon name="check"/> Check my code</button><button className="btn subtle" onClick={()=>this.setState({labHint:(this.state.labHint+1)%lab.hints.length})}>Show hint</button><button className="btn outline" onClick={()=>this.setState({labShow:!this.state.labShow})}>{this.state.labShow?'Hide solution':'Show solution'}</button></div>{this.state.labHint>=0&&<div className="inline-note">Hint {this.state.labHint+1}: {lab.hints[this.state.labHint]}</div>}{this.state.labResult&&<div className={`lab-feedback ${this.state.labResult==='correct'?'success':'error'}`}><Icon name={this.state.labResult==='correct'?'check':'alert'}/><span>{this.state.labResult==='correct'?'Все фрагменты совпали с эталонной реализацией. Отлично!':'Есть неточность. Посмотри подсказку или эталонное решение, затем попробуй снова.'}</span></div>}{this.state.labShow&&<div className="solution-panel"><div className="section-kicker">REFERENCE SOLUTION</div><pre><code>{lab.template.replace(/\{\{(\d+)\}\}/g,(_,num)=>lab.blanks[Number(num)-1])}</code></pre><p>{lab.why}</p></div>}</div>
       <div className="panel trace-panel"><div className="row-space"><div><div className="section-kicker">ALGORITHM TRACE</div><h3>Пошаговая трассировка</h3></div><Pill>{this.state.traceStep+1} / {lab.trace.length}</Pill></div><div className="trace-big"><span>STEP {String(this.state.traceStep+1).padStart(2,'0')}</span><strong>{lab.trace[this.state.traceStep]}</strong></div><div className="trace-controls"><button className="btn subtle" disabled={this.state.traceStep===0} onClick={()=>this.setState({traceStep:this.state.traceStep-1})}>Previous</button><div className="trace-dots">{lab.trace.map((s,i)=><button title={`Step ${i+1}`} key={i} className={i===this.state.traceStep?'active':''} onClick={()=>this.setState({traceStep:i})}/>)}</div><button className="btn subtle" disabled={this.state.traceStep===lab.trace.length-1} onClick={()=>this.setState({traceStep:this.state.traceStep+1})}>Next</button></div></div></div></div>
      </>;
    };
    previousPage=()=>{const filtered=questions.filter(q=>(this.state.questionTopic==='all'||q.lesson===Number(this.state.questionTopic))&&(this.state.questionSource==='all'||q.source===this.state.questionSource));return <>{this.mainHeading('PRACTICE / QUESTION BANK','Previous questions','Вопросы из присланного sample set и дополнительные тренировочные варианты с объяснением каждого ответа.')}
      <div className="bank-hero"><div><Pill tone="accent">QUESTION BANK</Pill><h2>{filtered.length} questions available</h2><p>Отвечай на вопросы в случайном порядке. Неправильные ответы автоматически попадут в Mistake review.</p></div><button className="btn primary" onClick={()=>this.openQuiz('previous')}>Start practice <Icon name="arrow"/></button></div>
      <div className="control-panel"><label>Тема<select value={this.state.questionTopic} onChange={e=>this.setState({questionTopic:e.target.value})}><option value="all">Все темы</option>{lessons.map(l=><option value={l.id} key={l.id}>Lecture {l.id} · {l.en}</option>)}</select></label><label>Источник<select value={this.state.questionSource} onChange={e=>this.setState({questionSource:e.target.value})}><option value="sample">Из sample questions</option><option value="generated">Дополнительная практика</option><option value="all">Все вопросы</option></select></label><Pill tone="neutral">MCQ · 4 options</Pill></div>
      <div className="bank-list">{filtered.map((q,i)=><div className="bank-row" key={q.id}><div className="bank-index">{String(i+1).padStart(2,'0')}</div><div className="grow"><b>{q.text}</b><small>Lecture {q.lesson} · {q.source==='sample'?'Sample':'Practice variant'}</small></div><span className="muted"><Icon name="chevron"/></span></div>)}</div>
      </>;
    };
    mockPage=()=>{const latest=this.state.progress.mockHistory[0];return <>{this.mainHeading('PRACTICE / EXAM SIMULATOR','Mock final exam','Пробный экзамен по всем 10 темам с таймером, итоговой оценкой и разбором решений.')}
      <div className="mock-landing"><div className="mock-emblem"><Icon name="timer" size={46}/></div><Pill tone="accent">EXAM READY</Pill><h2>Are you ready for your final?</h2><p>25 случайных вопросов. Равномерное покрытие тем курса. Вопросы проверяются после отправки, как на настоящем экзамене. Прогресс попытки сохраняется даже при перезагрузке.</p><div className="mock-facts"><div><Icon name="list"/><strong>25</strong><span>questions</span></div><div><Icon name="timer"/><strong>25:00</strong><span>time limit</span></div><div><Icon name="target"/><strong>100</strong><span>max points</span></div></div><button className="btn primary large" onClick={()=>this.openQuiz('mock')}>Start mock final <Icon name="arrow"/></button><small>Проверка ответов и объяснения откроются сразу после завершения.</small></div>
      {latest&&<div className="panel mock-history"><div><strong>Последняя попытка</strong><p>{new Date(latest.date).toLocaleString('ru-RU')}</p></div><Pill tone={latest.percentage>=75?'success':'neutral'}>{latest.percentage}% · {latest.correct}/{latest.total}</Pill><button className="btn subtle" onClick={()=>this.setState({finishedResult:latest,page:'result'})}>View details</button></div>}
      </>;
    };
    quizPage=()=>{const d=this.state.activeQuiz;if(!d)return this.overview();const q=byId[d.ids[d.index]],selected=d.answers[q.id],answered=selected!==undefined,show=d.type!=='mock' && d.revealed[q.id],timeLeft=d.deadline?d.deadline-this.state.clock:null,answeredCount=Object.keys(d.answers).length;
      return <>{this.mainHeading('PRACTICE / ACTIVE SESSION',labelMode[d.type],d.type==='mock'?'Экзаменационный режим: результаты появятся после отправки.':'Отвечай и сразу узнавай правильную логику.',<Pill tone={d.type==='mock'?'warning':'accent'}>{d.type==='mock'?timeFmt(timeLeft):'Instant feedback'}</Pill>)}
       <div className="quiz-shell"><div className="quiz-top"><span>QUESTION {d.index+1} / {d.ids.length}</span><div className="quiz-meter"><span style={{width:`${pct(d.index+1,d.ids.length)}%`}}/></div><Pill>Lecture {q.lesson}</Pill></div><div className="quiz-question"><h2>{q.text}</h2><div className="quiz-options">{q.options.map((opt,i)=>{let cn='quiz-option';if(answered&&selected===i)cn+=' selected';if(show&&i===q.answer)cn+=' right';if(show&&selected===i&&i!==q.answer)cn+=' wrong';return <button key={i} disabled={show} className={cn} onClick={()=>this.answerQuiz(i)}><span className="option-letter">{'ABCD'[i]}</span><span>{opt}</span>{show&&i===q.answer&&<Icon name="check"/>}</button>;})}</div>
       {show&&<div className={`explain ${selected===q.answer?'right':'wrong'}`}><div className="expl-heading"><Icon name={selected===q.answer?'check':'alert'}/>{selected===q.answer?'Correct!':'Not quite. Правильный ответ: '+ 'ABCD'[q.answer]}</div><p>{q.explain}</p></div>}
       <div className="quiz-controls"><button className="btn subtle" disabled={d.index===0} onClick={()=>this.stepQuiz(-1)}><Icon name="left"/> Previous</button><span>{answeredCount} of {d.ids.length} answered</span><button className="btn primary" disabled={d.type!=='mock'&&!show} onClick={()=>this.stepQuiz(1)}>{d.index===d.ids.length-1?'Finish & check':'Next question'} <Icon name="arrow"/></button></div></div><div className="quiz-side"><h3>Question navigator</h3><div className="qnav">{d.ids.map((id,i)=><button key={id} className={`${i===d.index?'active':''} ${d.answers[id]!==undefined?'answered':''}`} onClick={()=>this.setDraft({...d,index:i})}>{i+1}</button>)}</div>{d.type==='mock'&&<><p className="muted small">В mock режиме можно менять ответы до отправки.</p><button className="btn outline full" onClick={()=>this.finishQuiz(false)}>Submit exam</button></>}</div></div>
      </>;
    };
    resultPage=()=>{const r=this.state.finishedResult;if(!r)return this.overview();return <>{this.mainHeading('PRACTICE / RESULTS','Session completed','Разбор ответов поможет закрепить правильную логику.')}
      <div className="result-top panel"><Ring value={r.percentage} size={138}/><div><Pill tone={r.percentage>=75?'success':'warning'}>{r.percentage>=75?'GOOD WORK':'KEEP PRACTICING'}</Pill><h2>{r.correct} / {r.total} correct</h2><p>Итоговый балл: {r.percentage} из 100. {r.timedOut?'Время истекло. ':''}Неверные и пропущенные ответы добавлены в Mistake review.</p><div className="result-actions"><button className="btn primary" onClick={()=>this.navigate('mistakes')}>Review mistakes <Icon name="arrow"/></button><button className="btn subtle" onClick={()=>this.navigate('overview')}>Dashboard</button></div></div></div>
      <div className="section-title"><h2>Answer review</h2><Pill>{r.questionIds.length} questions</Pill></div><div className="review-list">{r.questionIds.map((id,i)=>{const q=byId[id],ans=r.answers[id],correct=ans===q.answer;return <div className={`review-item ${correct?'good':'bad'}`} key={id}><div className="review-header"><span className="review-number">{i+1}</span><b>{q.text}</b><Pill tone={correct?'success':'warning'}>{correct?'Correct':'Incorrect'}</Pill></div><div className="review-answer"><span>Your answer: {ans===undefined?'Not answered':`${'ABCD'[ans]}. ${q.options[ans]}`}</span><span>Correct: {'ABCD'[q.answer]}. {q.options[q.answer]}</span></div><p>{q.explain}</p></div>;})}</div>
      </>;
    };
    mistakesPage=()=>{const wrong=questions.filter(q=>this.state.progress.mistakes[q.id]),labWrong=labs.filter(l=>this.state.progress.labMistakes[l.id]);return <>{this.mainHeading('PRACTICE / SPACED REVIEW','Mistake review','Сюда автоматически попадают ошибки тестов и Java Practice Lab. Правильный повторный ответ снимает вопрос с повторения.')}
       <div className="bank-hero"><div><Pill tone="warning">REVIEW QUEUE</Pill><h2>{wrong.length} questions · {labWrong.length} code tasks</h2><p>Ошибки помогают найти слабые темы. Повтори объяснение и проверь себя снова.</p></div><button className="btn primary" disabled={!wrong.length} onClick={()=>this.openQuiz('mistakes')}>Retry wrong answers <Icon name="arrow"/></button></div>
       {!wrong.length&&!labWrong.length&&<div className="empty-card"><Icon name="check" size={28}/><h3>Список ошибок пуст!</h3><p>Пройди sample questions или mini quizzes. Все неверные ответы появятся здесь.</p><button className="btn outline" onClick={()=>this.navigate('previous')}>Open questions</button></div>}
       {wrong.length>0&&<div className="review-list">{wrong.map(q=><div className="review-item" key={q.id}><div className="review-header"><Pill tone="warning">Lecture {q.lesson}</Pill><b>{q.text}</b></div><p className="muted">{q.explain}</p><small>{this.state.progress.mistakes[q.id].count} incorrect attempt(s)</small></div>)}</div>}
       {labWrong.length>0&&<><div className="section-title"><h2>Java code tasks to review</h2></div><div className="bank-list">{labWrong.map(l=><button className="bank-row" key={l.id} onClick={()=>this.navigate('lab',{labId:l.id,labResult:null,labShow:false})}><Icon name="code"/><div className="grow"><b>{l.title}</b><small>{l.subtitle}</small></div><Icon name="arrow"/></button>)}</div></>}
      </>;
    };
    progressPage=()=>{const p=this.state.progress,all=[...p.quizHistory,...p.mockHistory],known=Object.values(p.cardRatings).filter(r=>r==='know').length;return <>{this.mainHeading('ANALYTICS / PROGRESS','Learning progress','Твой реальный прогресс и результаты всех попыток хранятся в localStorage этого браузера.')}
      <div className="progress-top panel"><Ring value={pct(p.completed.length,10)} size={138}/><div><h2>{p.completed.length} of 10 lectures completed</h2><p>Средний результат тестов: {avg(all)}%. Знаешь {known} из {cards.length} карточек. Java tasks выполнено {Object.values(p.labDone).filter(Boolean).length}/{labs.length}.</p><div className="small-pills"><Pill tone="accent">{all.length} sessions</Pill><Pill tone="neutral">{Object.keys(p.mistakes).length} questions to review</Pill></div></div></div>
      <div className="section-title"><h2>Progress by topic</h2></div><div className="panel progress-list">{lessons.map(l=>{const attempts=all.flatMap(x=>x.questionIds.map(id=>({id,answer:x.answers[id]}))).filter(x=>byId[x.id]?.lesson===l.id);const pctScore=attempts.length?pct(attempts.filter(x=>x.answer===byId[x.id].answer).length,attempts.length):null;return <div className="topic-row" key={l.id}><span className="topic-n">{String(l.id).padStart(2,'0')}</span><div className="grow"><div className="row-space"><b>{l.en}</b><span>{p.completed.includes(l.id)?'100%':'0%'} · {pctScore===null?'No quiz score':`avg ${pctScore}%`}</span></div><div className="meter"><span style={{width:p.completed.includes(l.id)?'100%':'0%'}}/></div></div><button className="small-link" onClick={()=>this.goLesson(l.id)}>Open <Icon name="chevron" size={14}/></button></div>;})}</div>
      <div className="section-title"><h2>Attempts history</h2></div><div className="panel history-table"><div className="history-head"><span>SESSION</span><span>DATE</span><span>SCORE</span></div>{all.length?all.sort((a,b)=>b.id-a.id).slice(0,15).map(h=><div className="history-row" key={h.id}><b>{labelMode[h.type]} {h.lessonId?`· Lecture ${h.lessonId}`:''}</b><span>{new Date(h.date).toLocaleDateString('ru-RU')}</span><strong>{h.percentage}%</strong></div>):<div className="empty-minor">Пока нет завершённых тестов.</div>}</div>
      <div className="panel backup-panel"><div><h3>Backup your progress</h3><p>Экспортируй JSON, чтобы перенести результаты в другой браузер. При очистке данных сайта localStorage может удалиться.</p></div><div className="backup-actions"><button className="btn subtle" onClick={this.downloadBackup}><Icon name="download"/> Export JSON</button><button className="btn subtle" onClick={()=>this.fileInput.current?.click()}><Icon name="upload"/> Import JSON</button><input ref={el=>{this.fileInput.current=el;}} type="file" accept="application/json,.json" style={{display:'none'}} onChange={this.importBackup}/><button className="btn danger" onClick={this.resetProgress}><Icon name="trash"/> Reset</button></div></div>
      </>;
    };
    materialsPage=()=> <>{this.mainHeading('STUDY / RESOURCE LIBRARY','Materials & cheat sheets','Краткие формулы для повторения и проверенные внешние ресурсы по алгоритмам.')}
      <div className="materials-grid">{lessons.map(l=><article className="material-card" key={l.id}><div className="material-top"><Pill tone="accent">LECTURE {String(l.id).padStart(2,'0')}</Pill><button className="small-link" onClick={()=>this.goLesson(l.id)}>Open <Icon name="arrow" size={15}/></button></div><h3>{l.en}</h3><div className="formula-mini">{l.formula}</div><div className="material-points">{l.quick.slice(0,3).map((x,i)=><p key={i}><Icon name="check" size={14}/>{x[0]}: {x[1]}</p>)}</div></article>)}</div><div className="section-title"><h2>Useful resources</h2></div><div className="bank-list">{resourceLinks.map(link=><a className="bank-row resource-row" key={link.url} href={link.url} target="_blank" rel="noreferrer"><Icon name="folder"/><div className="grow"><b>{link.title}</b><small>{link.desc}</small></div><Icon name="arrow"/></a>)}</div><p className="source-note">Учебные конспекты переработаны на основе загруженных лекций 1–10 и присланных примерных вопросов. Дополнительные тренировочные вопросы составлены для практики, не являются официальным банком экзамена.</p></>;
    render(){const page=this.state.page;return <div className="app-layout">{this.sidebar()}{this.state.mobileNav&&<button className="scrim" aria-label="Close menu" onClick={()=>this.setState({mobileNav:false})}/>}<div className="app-content">{this.header()}<main className="main-area">
      {page==='overview'&&this.overview()}{page==='lessons'&&this.lessonsPage()}{page==='flashcards'&&this.flashcardsPage()}{page==='lab'&&this.labPage()}{page==='previous'&&this.previousPage()}{page==='mock'&&this.mockPage()}{page==='quiz'&&this.quizPage()}{page==='result'&&this.resultPage()}{page==='mistakes'&&this.mistakesPage()}{page==='progress'&&this.progressPage()}{page==='materials'&&this.materialsPage()}
      {this.state.message&&<div className="toast" role="status" onClick={()=>this.setState({message:''})}>{this.state.message} <Icon name="close" size={15}/></div>}
      <footer className="footer">DAA FINAL PREP <span>•</span> Built for focused exam preparation <span>•</span> Your progress stays on this device</footer>
    </main></div></div>;}
  }
  return App;
}
