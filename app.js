(() => {
  "use strict";

  const VERSION = "0.1.5";
  const STORAGE_KEY = "STRUKTUR_LAB_STATE_v0_1";
  const STAGES = ["mass","ms","ir","nmr","hypothesis"];
  const STAGE_TITLES = {
    mass:["Phase 1","Molare Masse"], ms:["Phase 2","Massenspektrometrie"], ir:["Phase 3","IR-Spektroskopie"],
    nmr:["Phase 4","¹H-NMR-Spektroskopie"], hypothesis:["Phase 5","Stoffklasse & Strukturhypothese"]
  };
  const TOOLBOX = {
    elemental:`<h3>Elementaranalyse → Verhältnisformel</h3><p>Kein Messgerät-Modul, sondern ein kompakter Rechenweg. Die Elementaranalyse liefert Massenanteile. Daraus kann eine Verhältnisformel entstehen.</p><div class="formula-steps"><div>1 · Massenanteile als Gramm in 100 g Probe lesen.</div><div>2 · Für jedes Element durch die molare Atommasse dividieren.</div><div>3 · Alle Stoffmengen durch den kleinsten Wert teilen.</div><div>4 · Auf ein kleines ganzzahliges Verhältnis bringen → Verhältnisformel.</div><div>5 · Mit der molaren Masse kann daraus gegebenenfalls die Summenformel bestimmt werden.</div></div><p class="hint">Wichtig: Eine gewöhnliche Molmasse plus niedrig aufgelöstes EI-MS bestimmt nicht allgemein eindeutig eine Summenformel. Später kann HRMS/exakte Masse ergänzt werden.</p>`,
    ms:`<h3>MS-Basics</h3><ul><li><strong>x-Achse:</strong> m/z, also Masse-zu-Ladung.</li><li><strong>y-Achse:</strong> relative Intensität; der stärkste Peak ist der Basispeak = 100 %.</li><li>Ein Molekülion kann einen Hinweis auf die Molekülmasse geben, muss aber weder stark noch überhaupt deutlich sichtbar sein.</li><li>Bei der Fragmentierung entstehen geladene und neutrale Teilchen. <strong>Detektiert wird nur das geladene Ion.</strong></li><li>Typische Wege sind z. B. α-Spaltungen neben Heteroatomen oder der Verlust kleiner neutraler Moleküle wie H₂O.</li><li>Nicht jeder kleine Peak lässt sich eindeutig nur einer Struktur zuordnen.</li></ul><p class="hint">Arbeitsfrage: Welche wenigen Peaks sind diagnostisch – und welcher plausible Fragmentierungsweg könnte zu ihnen führen?</p>`,
    ir:`<h3>IR-Basics</h3><p>Im IR werden vor allem Bindungsschwingungen sichtbar. Für eine schnelle Orientierung helfen zwei Ebenen:</p><ul><li><strong>Funktionsgruppenbereich:</strong> grob oberhalb von ca. 1500 cm⁻¹ – typische Bereiche wie O–H oder C=O.</li><li><strong>Fingerprintbereich:</strong> grob unterhalb von ca. 1500 cm⁻¹ – komplexes, substanzspezifisches Muster.</li></ul><p>Wichtige Orientierungsbereiche: O–H (Alkohol) etwa 3200–3600 cm⁻¹, Säure-OH sehr breit etwa 2500–3300 cm⁻¹, C=O oft etwa 1650–1800 cm⁻¹, C–O häufig etwa 1000–1300 cm⁻¹.</p><p class="hint">Die eingeblendeten Bereiche sind Hinweise, keine automatische Peakzuordnung.</p>`,
    nmr:`<h3>¹H-NMR-Basics</h3><p>Vier Fragen führen durch ein einfaches Protonenspektrum:</p><ul><li><strong>Wo?</strong> Chemische Verschiebung δ in ppm.</li><li><strong>Wie viel?</strong> Integration → relatives Protonenverhältnis.</li><li><strong>Wie aufgespalten?</strong> Multiplizität → Information über Nachbarprotonen.</li><li><strong>Wie viele?</strong> Zahl der Signale → Zahl unterschiedlicher Protonenumgebungen.</li></ul><p>Für einfache Systeme hilft oft die n+1-Regel. Austauschbare OH-Protonen können Lage und Aufspaltung variabel zeigen.</p><p class="hint">Orientierung: Alkyl grob 0–2,5 ppm; H an C neben O/N/Halogen oft 3–5 ppm; Aromaten häufig 6–8,5 ppm; Aldehyde etwa 9–10 ppm; Carbonsäure-OH oft 10–13 ppm.</p>`
  };

  let db={substances:[],cases:[],classes:[]};
  let state=null;
  let currentStage="mass";
  let selectedClass=null;
  let selectedStructure=null;
  let referenceUnlocked=false;
  let referenceMethod="ir";
  let referenceCandidateId=null;
  let activeSignalId=null;
  let activeMsFragmentMz=null;
  let workbenchMethod="ms";
  let workbenchMode="learn";
  const el={};

  document.addEventListener("DOMContentLoaded", init);

  async function init(){
    bindEls();
    const [s,c]=await Promise.all([
      fetch("data/structure-substances.json",{cache:"no-store"}).then(r=>r.json()),
      fetch("data/structure-cases.json",{cache:"no-store"}).then(r=>r.json())
    ]);
    db={substances:s.substances,cases:c.cases,classes:c.classes};
    populateCases();
    bindEvents();
    loadOrReset();
    renderAll();
  }

  function bindEls(){
    ["modeSelect","caseSelect","caseLabel","caseIntro","toolboxBtn","toolboxOverlay","toolboxCloseBtn","toolboxContent",
      "stageKicker","stageTitle","stageHelpBtn","massValue","formulaBox","massNote","msCanvas","msReadout","msNote",
      "irCanvas","irReadout","irNote","irGroupsToggle","irFingerprintToggle","nmrCanvas","nmrReadout","nmrSignalTable",
      "nmrRegionsToggle","nmrNote","classGrid","classFeedback","structureStage","structureGrid","hypothesisNote",
      "submitHypothesisBtn","structureFeedback","nameStage","nameInput","checkNameBtn","nameFeedback","spectraWorkbenchStage",
      "workbenchCandidateWrap","workbenchCandidateSelect","workbenchCanvas","workbenchLegend","workbenchLearnPanel",
      "workbenchMsPanel","workbenchMsPeakList","workbenchMsDetail","workbenchIrPanel","workbenchIrGroupsToggle","workbenchIrFingerprintToggle",
      "workbenchNmrPanel","workbenchNmrSignalList","workbenchNmrStructure","workbenchNmrFeedback","workbenchCompareHint",
      "journalView","progressText","copyJournalBtn","resetCaseBtn"]
      .forEach(id=>el[id]=document.getElementById(id));
  }

  function populateCases(){
    el.caseSelect.innerHTML=db.cases.map(c=>`<option value="${c.id}">${c.label_de}</option>`).join("");
  }

  function bindEvents(){
    el.modeSelect.addEventListener("change",()=>resetCase(true));
    el.caseSelect.addEventListener("change",()=>resetCase(true));
    document.querySelectorAll(".step").forEach(b=>b.addEventListener("click",()=>openStage(b.dataset.step)));
    document.querySelectorAll(".next-btn").forEach(b=>b.addEventListener("click",()=>advance(b.dataset.next)));
    el.toolboxBtn.addEventListener("click",()=>openToolbox("elemental"));
    el.toolboxCloseBtn.addEventListener("click",closeToolbox);
    el.toolboxOverlay.addEventListener("click",e=>{if(e.target===el.toolboxOverlay)closeToolbox();});
    document.querySelectorAll(".toolbox-tabs button").forEach(b=>b.addEventListener("click",()=>showToolboxTopic(b.dataset.topic)));
    document.querySelectorAll(".contextual-help").forEach(b=>b.addEventListener("click",()=>openToolbox(b.dataset.topic)));
    el.stageHelpBtn.addEventListener("click",()=>openToolbox(currentStage==="mass"?"elemental":currentStage==="hypothesis"?"nmr":currentStage));
    ["massNote","msNote","irNote","nmrNote","hypothesisNote"].forEach(k=>el[k].addEventListener("input",()=>{state.notes[k]=el[k].value;save();renderJournal();}));
    el.irGroupsToggle.addEventListener("change",drawIr);
    el.irFingerprintToggle.addEventListener("change",drawIr);
    el.nmrRegionsToggle.addEventListener("change",drawNmr);
    el.msCanvas.addEventListener("click",handleMsClick);
    el.irCanvas.addEventListener("click",handleIrClick);
    el.nmrCanvas.addEventListener("click",handleNmrClick);
    el.submitHypothesisBtn.addEventListener("click",submitHypothesis);
    el.checkNameBtn.addEventListener("click",checkName);
    document.querySelectorAll("[data-workbench-method]").forEach(b=>b.addEventListener("click",()=>{
      workbenchMethod=b.dataset.workbenchMethod;
      state.workbenchMethod=workbenchMethod;
      save();
      renderWorkbench();
    }));
    document.querySelectorAll("[data-workbench-mode]").forEach(b=>b.addEventListener("click",()=>{
      workbenchMode=b.dataset.workbenchMode;
      state.workbenchMode=workbenchMode;
      save();
      renderWorkbench();
    }));
    el.workbenchCandidateSelect.addEventListener("change",()=>{
      referenceCandidateId=el.workbenchCandidateSelect.value;
      state.referenceCandidateId=referenceCandidateId;
      save();
      renderWorkbench();
    });
    el.workbenchIrGroupsToggle.addEventListener("change",renderWorkbench);
    el.workbenchIrFingerprintToggle.addEventListener("change",renderWorkbench);
    el.workbenchMsPeakList.addEventListener("click",e=>{
      const b=e.target.closest("[data-fragment-mz]");
      if(!b) return;
      activeMsFragmentMz=Number(b.dataset.fragmentMz);
      renderWorkbench();
    });
    el.workbenchNmrSignalList.addEventListener("click",e=>{
      const b=e.target.closest("[data-signal-id]");
      if(!b) return;
      activeSignalId=b.dataset.signalId;
      renderWorkbench();
    });
    el.workbenchNmrStructure.addEventListener("click",e=>{
      const b=e.target.closest("[data-proton-group]");
      if(!b) return;
      activeSignalId=b.dataset.protonGroup;
      renderWorkbench();
    });
    el.workbenchCanvas.addEventListener("click",handleWorkbenchCanvasClick);
    el.copyJournalBtn.addEventListener("click",copyJournal);
    el.resetCaseBtn.addEventListener("click",()=>resetCase(false));
  }

  function loadOrReset(){
    const wanted={caseId:el.caseSelect.value,mode:el.modeSelect.value};
    try{
      const old=JSON.parse(localStorage.getItem(STORAGE_KEY));
      if(old&&old.caseId===wanted.caseId&&old.mode===wanted.mode){
        state=old;
        if(!Array.isArray(state.candidateOrder) || state.candidateOrder.length!==currentCaseIdsFor(wanted.caseId).length){
          state.candidateOrder=shuffledCandidateIds(wanted.caseId);
        }
        currentStage=old.currentStage||"mass";selectedClass=old.selectedClass||null;selectedStructure=old.selectedStructure||null;referenceUnlocked=!!old.referenceUnlocked;referenceCandidateId=old.referenceCandidateId||null;workbenchMethod=old.workbenchMethod||"ms";workbenchMode=old.workbenchMode||"learn";
        localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
        return;
      }
    }catch(_){ }
    state=freshState(wanted.caseId,wanted.mode);
  }

  function shuffledCandidateIds(caseId){
    const item=db.cases.find(c=>c.id===caseId);
    const ids=[...(item?.candidate_ids||[])];
    for(let i=ids.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [ids[i],ids[j]]=[ids[j],ids[i]];
    }
    return ids;
  }

  function freshState(caseId,mode){return {caseId,mode,unlocked:["mass"],notes:{massNote:"",msNote:"",irNote:"",nmrNote:"",hypothesisNote:""},selectedClass:null,selectedStructure:null,nameVerified:false,currentStage:"mass",referenceUnlocked:false,referenceCandidateId:null,protonAssignments:{},candidateOrder:shuffledCandidateIds(caseId),workbenchMethod:"ms",workbenchMode:"learn"};}
  function save(){state.currentStage=currentStage;state.selectedClass=selectedClass;state.selectedStructure=selectedStructure;state.referenceUnlocked=referenceUnlocked;state.referenceCandidateId=referenceCandidateId;state.workbenchMethod=workbenchMethod;state.workbenchMode=workbenchMode;localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
  function resetCase(changed){
    const caseId=el.caseSelect.value, mode=el.modeSelect.value;
    state=freshState(caseId,mode);currentStage="mass";selectedClass=null;selectedStructure=null;referenceUnlocked=false;referenceCandidateId=null;activeSignalId=null;activeMsFragmentMz=null;workbenchMethod="ms";workbenchMode="learn";
    save();renderAll(); if(!changed) window.scrollTo({top:0,behavior:"smooth"});
  }

  function currentCaseIdsFor(caseId){return db.cases.find(c=>c.id===caseId)?.candidate_ids||[];}
  function currentCase(){return db.cases.find(c=>c.id===state.caseId)||db.cases[0];}
  function sub(id){return db.substances.find(s=>s.id===id);}
  function target(){return sub(currentCase().target_substance_id);}

  function renderAll(){
    el.modeSelect.value=state.mode;el.caseSelect.value=state.caseId;
    const c=currentCase(),t=target();el.caseLabel.textContent=c.label_de;el.caseIntro.textContent=c.intro_de;
    el.massValue.textContent=`${t.mass_measurement.value} ± ${t.mass_measurement.uncertainty}`;
    el.formulaBox.textContent=state.mode==="basic"?`Summenformel: ${t.formula}`:"Summenformel im Expertenmodus nicht vorgegeben";
    el.formulaBox.classList.toggle("muted",state.mode!=="basic");
    Object.keys(state.notes).forEach(k=>{if(el[k])el[k].value=state.notes[k]||"";});
    renderStepper();openStage(currentStage,true);renderClassGrid();renderStructures();renderHypothesisState();renderJournal();
    requestAnimationFrame(()=>{drawMs();drawIr();drawNmr();});
  }

  function renderStepper(){
    document.querySelectorAll(".step").forEach(b=>{
      const s=b.dataset.step;b.classList.toggle("locked",!state.unlocked.includes(s));b.classList.toggle("done",state.unlocked.includes(s)&&STAGES.indexOf(s)<STAGES.indexOf(currentStage));b.classList.toggle("active",s===currentStage);
    });
    el.progressText.textContent=`${Math.max(1,state.unlocked.length)} / 5`;
  }

  function openStage(stage,force=false){
    if(!force&&!state.unlocked.includes(stage))return;
    currentStage=stage;save();
    document.querySelectorAll(".stage").forEach(s=>s.classList.remove("active"));
    document.getElementById("stage"+stage[0].toUpperCase()+stage.slice(1)).classList.add("active");
    const [k,t]=STAGE_TITLES[stage];el.stageKicker.textContent=k;el.stageTitle.textContent=t;renderStepper();
    if(stage==="ms")drawMs();if(stage==="ir")drawIr();if(stage==="nmr")drawNmr();
  }

  function advance(next){
    const key=currentStage+"Note";
    if(el[key]&&el[key].value.trim().length<3){setTemporaryReadout(currentStage,"Notiere zumindest einen kurzen Befund, bevor du weitergehst.");return;}
    if(!state.unlocked.includes(next))state.unlocked.push(next);save();openStage(next);renderJournal();
  }

  function setTemporaryReadout(stage,text){
    const map={ms:el.msReadout,ir:el.irReadout,nmr:el.nmrReadout};
    if(map[stage])map[stage].textContent=text;else alert(text);
  }

  function openToolbox(topic){el.toolboxOverlay.classList.add("open");el.toolboxOverlay.setAttribute("aria-hidden","false");showToolboxTopic(topic);}
  function closeToolbox(){el.toolboxOverlay.classList.remove("open");el.toolboxOverlay.setAttribute("aria-hidden","true");}
  function showToolboxTopic(topic){document.querySelectorAll(".toolbox-tabs button").forEach(b=>b.classList.toggle("active",b.dataset.topic===topic));el.toolboxContent.innerHTML=TOOLBOX[topic]||TOOLBOX.ms;}

  function renderJournal(){
    const items=[
      ["M",state.notes.massNote],["MS",state.notes.msNote],["IR",state.notes.irNote],["¹H-NMR",state.notes.nmrNote],
      ["Stoffklasse",selectedClass||""],["Struktur",selectedStructure?"Strukturhypothese festgelegt":""],["Begründung",state.notes.hypothesisNote]
    ];
    el.journalView.innerHTML=items.map(([k,v])=>`<div class="journal-item ${v?"":"empty"}"><strong>${k}</strong><span>${escapeHtml(v||"noch offen")}</span></div>`).join("");
  }

  function renderClassGrid(){
    el.classGrid.innerHTML=db.classes.map(c=>`<button class="class-choice ${selectedClass===c?"selected":""}" data-class="${c}" type="button">${c}</button>`).join("");
    el.classGrid.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>chooseClass(b.dataset.class)));
    if(selectedClass)showClassFeedback(selectedClass);
  }

  function chooseClass(cls){selectedClass=cls;state.selectedClass=cls;save();renderClassGrid();showClassFeedback(cls);renderJournal();}
  function showClassFeedback(cls){
    const t=target(),correct=cls===t.primary_class;el.classFeedback.className=`feedback ${correct?"good":"warn"}`;
    el.classFeedback.textContent=(t.class_feedback&&t.class_feedback[cls])|| (correct?"Diese Stoffklasse ist mit den Daten vereinbar.":"Diese Wahl erklärt die bisherigen Befunde nicht vollständig.");
    el.structureStage.classList.toggle("unlocked",correct);
  }

  function renderStructures(){
    if(!Array.isArray(state.candidateOrder) || !state.candidateOrder.length){
      state.candidateOrder=shuffledCandidateIds(state.caseId);
      save();
    }
    const ids=state.candidateOrder, candidates=ids.map(sub).filter(Boolean);
    el.structureGrid.innerHTML=candidates.map((s,i)=>`<button class="structure-card ${selectedStructure===s.id?"selected":""}" data-id="${s.id}" type="button" aria-label="Strukturkandidat ${i+1}">${s.structure_svg||`<strong>Struktur ${i+1}</strong>`}</button>`).join("");
    el.structureGrid.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{selectedStructure=b.dataset.id;state.selectedStructure=selectedStructure;save();renderStructures();renderJournal();}));
  }

  function submitHypothesis(){
    if(selectedClass!==target().primary_class){el.structureFeedback.className="feedback warn";el.structureFeedback.textContent="Lege zuerst eine Stoffklasse fest, die deine bisherigen Befunde überzeugend erklärt.";return;}
    if(!selectedStructure){el.structureFeedback.className="feedback warn";el.structureFeedback.textContent="Wähle eine Strukturkarte aus und begründe deine Wahl.";return;}
    if((state.notes.hypothesisNote||"").trim().length<8){el.structureFeedback.className="feedback warn";el.structureFeedback.textContent="Ergänze eine kurze Begründung aus mindestens zwei Analysenschritten.";return;}
    if(selectedStructure===target().id){
      el.structureFeedback.className="feedback good";
      el.structureFeedback.textContent="Die Strukturhypothese ist mit den vorliegenden Analysedaten vereinbar. Ordne ihr nun einen Stoffnamen zu.";
      el.nameStage.classList.add("unlocked");
    }else{
      state.nameVerified=false;
      referenceUnlocked=false;
      state.referenceUnlocked=false;
      save();
      el.structureFeedback.className="feedback warn";
      el.structureFeedback.textContent="Diese Struktur erklärt mindestens einen deiner dokumentierten Befunde nicht ausreichend. Vergleiche insbesondere Summenformel/M, IR-Funktionsgruppe und Zahl bzw. Muster der NMR-Signale. Die Spektrenwerkstatt bleibt gesperrt.";
      el.nameStage.classList.remove("unlocked");
      renderHypothesisState();
    }
  }

  function normalizeName(s){return (s||"").toLocaleLowerCase("de").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"");}
  function checkName(){
    if(selectedStructure!==target().id){return;}
    const ok=(target().synonyms||[target().name_de]).some(x=>normalizeName(x)===normalizeName(el.nameInput.value));
    if(ok){
      state.nameVerified=true;
      referenceUnlocked=true;
      state.referenceUnlocked=true;
      ensureReferenceCandidate();
      save();
      el.nameFeedback.className="feedback good";
      el.nameFeedback.textContent=`Namenszuordnung passt: ${target().name_de}. Die Spektrenwerkstatt ist jetzt freigeschaltet.`;
      renderHypothesisState();
    }else{
      el.nameFeedback.className="feedback warn";
      el.nameFeedback.textContent="Der Name passt noch nicht zur ausgewählten Struktur. Prüfe Stoffklasse und systematische bzw. gebräuchliche Benennung.";
    }
  }

  function availableReferenceCandidates(){
    return currentCase().candidate_ids.map(id=>sub(id)).filter(Boolean);
  }

  function ensureReferenceCandidate(){
    const candidates=availableReferenceCandidates();
    if(referenceCandidateId && candidates.some(s=>s.id===referenceCandidateId)) return;
    const alternative=candidates.find(s=>s.id!==target().id && s.ms?.peaks?.length && s.ir?.bands?.length && s.h1_nmr?.signals?.length);
    referenceCandidateId=(alternative||candidates.find(s=>s.id===target().id)||candidates[0])?.id||target().id;
    state.referenceCandidateId=referenceCandidateId;
  }

  function renderReferenceCandidateOptions(){
    ensureReferenceCandidate();
    const candidates=availableReferenceCandidates();
    el.workbenchCandidateSelect.innerHTML=candidates.map(s=>{
      const ready=!!(s.ms?.peaks?.length && s.ir?.bands?.length && s.h1_nmr?.signals?.length);
      const suffix=s.id===target().id?" · eigene Hypothese":"";
      return `<option value="${s.id}" ${ready?"":"disabled"}>${s.name_de}${suffix}${ready?"":" · Spektren folgen"}</option>`;
    }).join("");
    el.workbenchCandidateSelect.value=referenceCandidateId;
  }

  function unlockReference(){
    referenceUnlocked=true;
    state.referenceUnlocked=true;
    ensureReferenceCandidate();
    save();
    el.referenceCompare.hidden=false;
    el.referenceFeedback.className="feedback good";
    el.referenceFeedback.textContent="Kandidatenvergleich geöffnet. Deine Hypothese bleibt festgelegt; jetzt kannst du rückblickend prüfen, warum andere Kandidaten schlechter zu den Spektren passen.";
    renderReferenceCandidateOptions();
    renderReferenceComparison();
  }

  function renderHypothesisState(){
    const classOk=selectedClass===target().primary_class;
    const structureOk=selectedStructure===target().id;
    el.structureStage.classList.toggle("unlocked",classOk);
    el.nameStage.classList.toggle("unlocked",structureOk);
    el.spectraWorkbenchStage.classList.toggle("unlocked",!!state.nameVerified);

    if(state.nameVerified){
      ensureReferenceCandidate();
      requestAnimationFrame(renderWorkbench);
    }
  }

  function canvasPoint(evt,canvas){const r=canvas.getBoundingClientRect();return {x:(evt.clientX-r.left)*canvas.width/r.width,y:(evt.clientY-r.top)*canvas.height/r.height};}

  function drawMs(){
    const canvas=el.msCanvas,ctx=canvas.getContext("2d"),peaks=target().ms?.peaks||[];baseCanvas(ctx,canvas);
    const p={l:65,r:25,t:25,b:50},w=canvas.width-p.l-p.r,h=canvas.height-p.t-p.b,maxMz=Math.max(100,...peaks.map(x=>x.mz+8));
    gridAxes(ctx,p,w,h,"m/z","rel. Intensität / %",0,maxMz,0,100,false);
    ctx.strokeStyle="#5de0ed";ctx.lineWidth=3;
    peaks.forEach(pk=>{const x=p.l+w*pk.mz/maxMz,y=p.t+h-h*pk.intensity/100;ctx.beginPath();ctx.moveTo(x,p.t+h);ctx.lineTo(x,y);ctx.stroke();});
    canvas._plot={type:"ms",p,w,h,maxMz,peaks};
  }

  function handleMsClick(evt){const c=el.msCanvas,o=c._plot;if(!o)return;const q=canvasPoint(evt,c);let best=null,dist=20;for(const pk of o.peaks){const x=o.p.l+o.w*pk.mz/o.maxMz,d=Math.abs(q.x-x);if(d<dist){dist=d;best=pk;}}el.msReadout.textContent=best?`m/z ${best.mz} · relative Intensität ${best.intensity} %`:"Kein Peak in unmittelbarer Nähe.";}

  function irTransmissionAt(cm,bands){let drop=0;for(const b of bands){const sigma=(b.width||50)/2.355;drop+=b.strength*Math.exp(-0.5*Math.pow((cm-b.cm1)/sigma,2));}return Math.max(.04,Math.min(.98,.96-drop*.78));}
  function drawIr(){
    const canvas=el.irCanvas,ctx=canvas.getContext("2d"),bands=target().ir?.bands||[];baseCanvas(ctx,canvas);const p={l:65,r:25,t:25,b:55},w=canvas.width-p.l-p.r,h=canvas.height-p.t-p.b;
    if(el.irGroupsToggle.checked){const areas=[[3600,3200,"O–H"],[3300,2500,"COOH-OH"],[1800,1650,"C=O"],[1300,1000,"C–O"]];ctx.font="12px system-ui";for(const [hi,lo,label] of areas){const x1=p.l+w*(4000-hi)/3500,x2=p.l+w*(4000-lo)/3500;ctx.fillStyle="rgba(96,165,250,.10)";ctx.fillRect(x1,p.t,x2-x1,h);ctx.fillStyle="#88aee0";ctx.textBaseline="top";ctx.fillText(label,x1+4,p.t+2);ctx.textBaseline="alphabetic";}}
    if(el.irFingerprintToggle.checked){const x=p.l+w*(4000-1500)/3500;ctx.fillStyle="rgba(251,191,36,.08)";ctx.fillRect(x,p.t,p.l+w-x,h);ctx.fillStyle="#c8a951";ctx.textBaseline="top";ctx.fillText("Fingerprintbereich",x+8,p.t+2);ctx.textBaseline="alphabetic";}
    gridAxes(ctx,p,w,h,"Wellenzahl / cm⁻¹","Transmission",4000,500,0,1,true);
    ctx.strokeStyle="#59d4df";ctx.lineWidth=2.2;ctx.beginPath();const n=900;for(let i=0;i<n;i++){const cm=4000-3500*i/(n-1),tr=irTransmissionAt(cm,bands),x=p.l+w*i/(n-1),y=p.t+h-h*tr;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();canvas._plot={type:"ir",p,w,h};
  }
  function handleIrClick(evt){const c=el.irCanvas,o=c._plot;if(!o)return;const q=canvasPoint(evt,c),ratio=Math.max(0,Math.min(1,(q.x-o.p.l)/o.w)),cm=4000-3500*ratio;el.irReadout.textContent=`Wellenzahl ≈ ${Math.round(cm)} cm⁻¹`;}

  function multiplicityLines(sig){const map={s:[1],t:[1,2,1],q:[1,3,3,1],d:[1,1],"br s":[1]};return map[sig.multiplicity]||[1];}
  function drawNmr(){
    const canvas=el.nmrCanvas,ctx=canvas.getContext("2d"),signals=target().h1_nmr?.signals||[];baseCanvas(ctx,canvas);const p={l:65,r:25,t:25,b:55},w=canvas.width-p.l-p.r,h=canvas.height-p.t-p.b;
    if(el.nmrRegionsToggle.checked){const regs=[[2.5,0,"Alkyl"],[5,3,"C neben O/N/X"],[8.5,6,"Aromat"],[10,9,"Aldehyd"],[13,10,"COOH"]];ctx.font="11px system-ui";for(const [hi,lo,label] of regs){const x1=p.l+w*(12-hi)/12,x2=p.l+w*(12-lo)/12;ctx.fillStyle="rgba(96,165,250,.09)";ctx.fillRect(x1,p.t,x2-x1,h);ctx.fillStyle="#82a9d9";ctx.fillText(label,x1+3,p.t+14);}}
    gridAxes(ctx,p,w,h,"δ / ppm","rel. Signal",12,0,0,1,true);
    ctx.strokeStyle="#6ae2ec";ctx.lineWidth=2;const maxInt=Math.max(1,...signals.map(s=>s.integration));
    signals.forEach(sig=>{const lines=multiplicityLines(sig),spacing=6,total=(lines.length-1)*spacing,baseX=p.l+w*(12-sig.delta)/12;const rel=sig.integration/maxInt;lines.forEach((amp,i)=>{const x=baseX-total/2+i*spacing;let peakHeight=h*.82*rel*(amp/Math.max(...lines));if(sig.exchangeable) peakHeight=Math.max(peakHeight,h*.28);const y=p.t+h-peakHeight;ctx.beginPath();ctx.moveTo(x,p.t+h);ctx.lineTo(x,y);ctx.stroke();});if(sig.multiplicity==="br s"){const broadHeight=Math.max(h*.40,h*.82*Math.max(rel,0.35));ctx.globalAlpha=.22;ctx.lineWidth=16;ctx.beginPath();ctx.moveTo(baseX,p.t+h);ctx.lineTo(baseX,p.t+h-broadHeight);ctx.stroke();ctx.globalAlpha=.55;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(baseX,p.t+h);ctx.lineTo(baseX,p.t+h-broadHeight);ctx.stroke();ctx.globalAlpha=1;ctx.lineWidth=2;}});
    canvas._plot={type:"nmr",p,w,h,signals};
    const ratio=signals.map(s=>s.integration).join(" : ");
    el.nmrSignalTable.innerHTML=signals.map((s,i)=>`<span class="signal-chip"><strong>Signal ${i+1}</strong> · δ ${s.delta.toLocaleString("de-AT")} ppm · ${s.integration} H · ${s.multiplicity}${s.exchangeable?" · austauschbar":""}</span>`).join("")+`<span class="signal-chip meta">relative Integrale: ${ratio}</span>`;
  }
  function handleNmrClick(evt){const c=el.nmrCanvas,o=c._plot;if(!o)return;const q=canvasPoint(evt,c);let best=null,dist=24;for(const s of o.signals){const x=o.p.l+o.w*(12-s.delta)/12,d=Math.abs(q.x-x);if(d<dist){dist=d;best=s;}}el.nmrReadout.textContent=best?`δ ${best.delta.toLocaleString("de-AT")} ppm · Integral ${best.integration} H · ${best.multiplicity}${best.exchangeable?" · austauschbares Proton":""}`:"Kein Signal in unmittelbarer Nähe.";}

  function baseCanvas(ctx,canvas){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle="#07101b";ctx.fillRect(0,0,canvas.width,canvas.height);}
  function gridAxes(ctx,p,w,h,xLabel,yLabel,xStart,xEnd,yMin,yMax,reversed){
    ctx.strokeStyle="#2b425f";ctx.fillStyle="#8ea4bd";ctx.font="12px system-ui";ctx.textAlign="center";
    for(let i=0;i<=8;i++){const x=p.l+w*i/8;ctx.beginPath();ctx.moveTo(x,p.t);ctx.lineTo(x,p.t+h);ctx.stroke();const v=xStart+(xEnd-xStart)*i/8;ctx.fillText(Math.round(v*10)/10,x,p.t+h+20);}for(let i=0;i<=5;i++){const y=p.t+h-h*i/5;ctx.beginPath();ctx.moveTo(p.l,y);ctx.lineTo(p.l+w,y);ctx.stroke();}
    ctx.strokeStyle="#b8c8da";ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(p.l,p.t);ctx.lineTo(p.l,p.t+h);ctx.lineTo(p.l+w,p.t+h);ctx.stroke();ctx.fillStyle="#a9bad0";ctx.fillText(xLabel,p.l+w/2,p.t+h+42);ctx.save();ctx.translate(17,p.t+h/2);ctx.rotate(-Math.PI/2);ctx.fillText(yLabel,0,0);ctx.restore();ctx.textAlign="left";
  }

  function referenceSubstance(){
    return sub(referenceCandidateId) || target();
  }

  function drawReferenceMs(ctx,canvas,unknown,reference){
    baseCanvas(ctx,canvas);
    const all=[...(unknown||[]),...(reference||[])];
    const p={l:65,r:25,t:30,b:52},w=canvas.width-p.l-p.r,h=canvas.height-p.t-p.b;
    const maxMz=Math.max(100,...all.map(x=>x.mz+8));
    gridAxes(ctx,p,w,h,"m/z","rel. Intensität / %",0,maxMz,0,100,false);

    ctx.strokeStyle="#5de0ed";ctx.lineWidth=4;ctx.globalAlpha=.68;ctx.setLineDash([]);
    (unknown||[]).forEach(pk=>{const x=p.l+w*pk.mz/maxMz,y=p.t+h-h*pk.intensity/100;ctx.beginPath();ctx.moveTo(x,p.t+h);ctx.lineTo(x,y);ctx.stroke();});

    ctx.strokeStyle="#f5c66a";ctx.lineWidth=2.2;ctx.globalAlpha=1;ctx.setLineDash([7,5]);
    (reference||[]).forEach(pk=>{const x=p.l+w*pk.mz/maxMz,y=p.t+h-h*pk.intensity/100;ctx.beginPath();ctx.moveTo(x,p.t+h);ctx.lineTo(x,y);ctx.stroke();});
    ctx.setLineDash([]);
  }

  function drawReferenceIr(ctx,canvas,unknown,reference){
    baseCanvas(ctx,canvas);
    const p={l:65,r:25,t:30,b:55},w=canvas.width-p.l-p.r,h=canvas.height-p.t-p.b;
    gridAxes(ctx,p,w,h,"Wellenzahl / cm⁻¹","Transmission",4000,500,0,1,true);
    const n=900;
    function trace(bands,stroke,width,dash,alpha){
      ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.globalAlpha=alpha;ctx.setLineDash(dash);ctx.beginPath();
      for(let i=0;i<n;i++){
        const cm=4000-3500*i/(n-1),tr=irTransmissionAt(cm,bands||[]),x=p.l+w*i/(n-1),y=p.t+h-h*tr;
        if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      ctx.stroke();
    }
    trace(unknown,"#59d4df",4,[],.68);
    trace(reference,"#f5c66a",2.2,[9,6],1);
    ctx.globalAlpha=1;ctx.setLineDash([]);
  }

  function drawReferenceNmr(ctx,canvas,unknown,reference){
    baseCanvas(ctx,canvas);
    const p={l:65,r:25,t:30,b:55},w=canvas.width-p.l-p.r,h=canvas.height-p.t-p.b;
    gridAxes(ctx,p,w,h,"δ / ppm","rel. Signal",12,0,0,1,true);

    function trace(signals,stroke,width,dash,alpha){
      const maxInt=Math.max(1,...(signals||[]).map(s=>s.integration));
      ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.globalAlpha=alpha;ctx.setLineDash(dash);
      (signals||[]).forEach(sig=>{
        const lines=multiplicityLines(sig),spacing=6,total=(lines.length-1)*spacing,baseX=p.l+w*(12-sig.delta)/12,rel=sig.integration/maxInt;
        lines.forEach((amp,i)=>{
          const x=baseX-total/2+i*spacing;
          let peakHeight=h*.82*rel*(amp/Math.max(...lines));
          if(sig.exchangeable) peakHeight=Math.max(peakHeight,h*.28);
          ctx.beginPath();ctx.moveTo(x,p.t+h);ctx.lineTo(x,p.t+h-peakHeight);ctx.stroke();
        });
      });
    }
    trace(unknown,"#6ae2ec",4,[],.68);
    trace(reference,"#f5c66a",2.2,[7,5],1);
    ctx.globalAlpha=1;ctx.setLineDash([]);
  }

  function renderWorkbench(){
    if(!state.nameVerified || !el.spectraWorkbenchStage) return;

    document.querySelectorAll("[data-workbench-method]").forEach(b=>b.classList.toggle("active",b.dataset.workbenchMethod===workbenchMethod));
    document.querySelectorAll("[data-workbench-mode]").forEach(b=>b.classList.toggle("active",b.dataset.workbenchMode===workbenchMode));

    const compare=workbenchMode==="compare";
    el.workbenchCandidateWrap.hidden=!compare;
    el.workbenchCompareHint.hidden=!compare;
    el.workbenchLearnPanel.hidden=compare;

    if(compare){
      renderReferenceCandidateOptions();
      renderWorkbenchComparison();
      return;
    }

    el.workbenchMsPanel.hidden=workbenchMethod!=="ms";
    el.workbenchIrPanel.hidden=workbenchMethod!=="ir";
    el.workbenchNmrPanel.hidden=workbenchMethod!=="nmr";

    if(workbenchMethod==="ms") renderWorkbenchMsLearning();
    else if(workbenchMethod==="ir") renderWorkbenchIrLearning();
    else renderWorkbenchNmrLearning();
  }

  function renderWorkbenchComparison(){
    const ref=referenceSubstance(),unknown=target(),ctx=el.workbenchCanvas.getContext("2d");
    if(workbenchMethod==="ms"){
      drawReferenceMs(ctx,el.workbenchCanvas,unknown.ms?.peaks||[],ref.ms?.peaks||[]);
      el.workbenchLegend.textContent=`MS: unbekannt durchgezogen · ${ref.name_de} gestrichelt`;
    }else if(workbenchMethod==="nmr"){
      drawReferenceNmr(ctx,el.workbenchCanvas,unknown.h1_nmr?.signals||[],ref.h1_nmr?.signals||[]);
      el.workbenchLegend.textContent=`¹H-NMR: unbekannt durchgezogen · ${ref.name_de} gestrichelt`;
    }else{
      drawReferenceIr(ctx,el.workbenchCanvas,unknown.ir?.bands||[],ref.ir?.bands||[]);
      el.workbenchLegend.textContent=`IR: unbekannt durchgezogen · ${ref.name_de} gestrichelt`;
    }
    el.workbenchCanvas._workbenchPlot={type:"compare"};
  }

  function renderWorkbenchMsLearning(){
    const canvas=el.workbenchCanvas,ctx=canvas.getContext("2d"),peaks=target().ms?.peaks||[],diagnostic=msDiagnosticFragments();
    baseCanvas(ctx,canvas);
    const p={l:62,r:22,t:28,b:52},w=canvas.width-p.l-p.r,h=canvas.height-p.t-p.b,maxMz=Math.max(100,...peaks.map(x=>x.mz+8));
    gridAxes(ctx,p,w,h,"m/z","rel. Intensität / %",0,maxMz,0,100,false);

    if(activeMsFragmentMz!==null && !diagnostic.some(f=>f.mz===activeMsFragmentMz)) activeMsFragmentMz=null;
    peaks.forEach(pk=>{
      const isDiagnostic=diagnostic.some(f=>f.mz===pk.mz),active=activeMsFragmentMz===pk.mz;
      ctx.strokeStyle=active?"#f5c66a":isDiagnostic?"#67e8f9":"#45627f";
      ctx.lineWidth=active?5:isDiagnostic?3:1.5;
      ctx.globalAlpha=isDiagnostic?1:.55;
      const x=p.l+w*pk.mz/maxMz,y=p.t+h-h*pk.intensity/100;
      ctx.beginPath();ctx.moveTo(x,p.t+h);ctx.lineTo(x,y);ctx.stroke();
      if(isDiagnostic){
        ctx.fillStyle=active?"#f5c66a":"#9cecf3";ctx.globalAlpha=1;ctx.font="12px system-ui";ctx.textAlign="center";
        ctx.fillText(String(pk.mz),x,Math.max(p.t+12,y-7));
      }
    });
    ctx.globalAlpha=1;ctx.textAlign="left";
    canvas._workbenchPlot={type:"ms-learn",p,w,h,maxMz,diagnostic};
    el.workbenchLegend.textContent=diagnostic.length?"MS-Lernansicht · diagnostische Peaks hervorgehoben":"MS-Lernansicht · noch keine diagnostischen Fragmente kuratiert";

    el.workbenchMsPeakList.innerHTML=diagnostic.map(f=>`<button type="button" class="fragment-chip ${activeMsFragmentMz===f.mz?"active":""}" data-fragment-mz="${f.mz}"><strong>m/z ${f.mz}</strong><span>${escapeHtml(f.label)}</span></button>`).join("");
    const frag=diagnostic.find(x=>x.mz===activeMsFragmentMz);
    if(!diagnostic.length){
      el.workbenchMsDetail.className="feedback neutral";
      el.workbenchMsDetail.textContent="Für diesen Stoff ist die MS-Fragment-Lernhilfe noch nicht kuratiert.";
    }else if(frag){
      el.workbenchMsDetail.className="fragment-detail";
      el.workbenchMsDetail.innerHTML=`<div class="fragment-head"><strong>m/z ${frag.mz} · ${escapeHtml(frag.label)}</strong><span class="fragment-ion">${escapeHtml(frag.ion_formula||"")}</span></div><div><strong>Weg:</strong> ${escapeHtml(frag.pathway||"")}</div><p>${escapeHtml(frag.note||"")}</p><p class="hint">Detektiert wird das geladene Fragmention; ein gleichzeitig entstehendes neutrales Teilchen erzeugt keinen Peak.</p>`;
    }else{
      el.workbenchMsDetail.className="feedback neutral";
      el.workbenchMsDetail.textContent="Wähle einen markierten diagnostischen Peak. Es werden bewusst nur wenige gut begründbare Fragmente erklärt.";
    }
  }

  function renderWorkbenchIrLearning(){
    const canvas=el.workbenchCanvas,ctx=canvas.getContext("2d"),bands=target().ir?.bands||[];
    baseCanvas(ctx,canvas);
    const p={l:65,r:25,t:28,b:55},w=canvas.width-p.l-p.r,h=canvas.height-p.t-p.b;

    if(el.workbenchIrGroupsToggle.checked){
      const areas=[[3600,3200,"O–H"],[3300,2500,"COOH-OH"],[1800,1650,"C=O"],[1300,1000,"C–O"]];
      ctx.font="12px system-ui";
      for(const [hi,lo,label] of areas){
        const x1=p.l+w*(4000-hi)/3500,x2=p.l+w*(4000-lo)/3500;
        ctx.fillStyle="rgba(96,165,250,.10)";ctx.fillRect(x1,p.t,x2-x1,h);
        ctx.fillStyle="#88aee0";ctx.textBaseline="top";ctx.fillText(label,x1+4,p.t+2);ctx.textBaseline="alphabetic";
      }
    }
    if(el.workbenchIrFingerprintToggle.checked){
      const x=p.l+w*(4000-1500)/3500;
      ctx.fillStyle="rgba(251,191,36,.08)";ctx.fillRect(x,p.t,p.l+w-x,h);
      ctx.fillStyle="#c8a951";ctx.textBaseline="top";ctx.fillText("Fingerprintbereich",x+8,p.t+2);ctx.textBaseline="alphabetic";
    }
    gridAxes(ctx,p,w,h,"Wellenzahl / cm⁻¹","Transmission",4000,500,0,1,true);
    ctx.strokeStyle="#59d4df";ctx.lineWidth=2.4;ctx.beginPath();
    const n=900;
    for(let i=0;i<n;i++){
      const cm=4000-3500*i/(n-1),tr=irTransmissionAt(cm,bands),x=p.l+w*i/(n-1),y=p.t+h-h*tr;
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.stroke();
    canvas._workbenchPlot={type:"ir-learn"};
    el.workbenchLegend.textContent="IR-Lernansicht · Funktionsgruppen- und Fingerprintbereiche optional einblendbar";
  }

  function renderWorkbenchNmrLearning(){
    const canvas=el.workbenchCanvas,ctx=canvas.getContext("2d"),signals=target().h1_nmr?.signals||[],groups=protonGroups();
    baseCanvas(ctx,canvas);
    const p={l:65,r:25,t:28,b:55},w=canvas.width-p.l-p.r,h=canvas.height-p.t-p.b;
    gridAxes(ctx,p,w,h,"δ / ppm","rel. Signal",12,0,0,1,true);
    const maxInt=Math.max(1,...signals.map(s=>s.integration));

    signals.forEach(sig=>{
      const lines=multiplicityLines(sig),spacing=6,total=(lines.length-1)*spacing,baseX=p.l+w*(12-sig.delta)/12,rel=sig.integration/maxInt,active=activeSignalId===sig.id;
      ctx.strokeStyle=active?"#f5c66a":"#6ae2ec";
      ctx.lineWidth=active?4:2.4;
      lines.forEach((amp,i)=>{
        const x=baseX-total/2+i*spacing;
        let peakHeight=h*.82*rel*(amp/Math.max(...lines));
        if(sig.exchangeable)peakHeight=Math.max(peakHeight,h*.28);
        ctx.beginPath();ctx.moveTo(x,p.t+h);ctx.lineTo(x,p.t+h-peakHeight);ctx.stroke();
      });
    });
    canvas._workbenchPlot={type:"nmr-learn",p,w,h,signals};
    el.workbenchLegend.textContent=activeSignalId?"¹H-NMR-Lernansicht · ausgewähltes Signal hervorgehoben":"¹H-NMR-Lernansicht · Signal auswählen, um die Protonengruppe zu verknüpfen";

    el.workbenchNmrSignalList.innerHTML=signals.map((sig,i)=>{
      const active=activeSignalId===sig.id;
      return `<button type="button" class="proton-signal ${active?"active":""}" data-signal-id="${sig.id}"><strong>Signal ${i+1}</strong><span>δ ${sig.delta.toLocaleString("de-AT")} ppm · ${sig.integration} H · ${sig.multiplicity}</span></button>`;
    }).join("");

    if(!groups.length){
      el.workbenchNmrStructure.innerHTML="";
      el.workbenchNmrFeedback.className="feedback neutral";
      el.workbenchNmrFeedback.textContent="Für diesen Stoff ist die Protonengruppen-Verknüpfung noch nicht kuratiert.";
      return;
    }

    let markers="";
    for(const group of groups){
      for(const hotspot of group.hotspots||[]){
        const active=activeSignalId===group.id,w0=hotspot.w||58,h0=hotspot.h||34;
        markers+=`<g class="proton-group-hit ${active?"active":""}" data-proton-group="${group.id}" role="button" aria-label="${group.label||"Protonengruppe"}"><rect x="${hotspot.x-w0/2}" y="${hotspot.y-h0/2}" width="${w0}" height="${h0}" rx="9" ry="9"></rect></g>`;
      }
    }
    const annotated=(target().structure_svg||"").replace(/(<svg[^>]*>)/,`$1${markers}`);
    el.workbenchNmrStructure.innerHTML=`<div class="proton-svg">${annotated}</div>`;
    const group=groups.find(g=>g.id===activeSignalId);
    const signal=signals.find(s=>s.id===activeSignalId);
    if(group&&signal){
      el.workbenchNmrFeedback.className="feedback good";
      el.workbenchNmrFeedback.innerHTML=`<strong>${escapeHtml(group.label||"Protonengruppe")}</strong><br><span class="nmr-signal-meta">δ ${signal.delta.toLocaleString("de-AT")} ppm · ${signal.integration} H · ${escapeHtml(signal.multiplicity)}</span><br>${escapeHtml(group.note||"")}`;
    }else{
      el.workbenchNmrFeedback.className="feedback neutral";
      el.workbenchNmrFeedback.textContent="Klicke auf einen Signalchip oder direkt auf eine Protonengruppe in der Struktur.";
    }
  }

  function handleWorkbenchCanvasClick(evt){
    if(workbenchMode!=="learn") return;
    const o=el.workbenchCanvas._workbenchPlot;
    if(!o) return;
    const q=canvasPoint(evt,el.workbenchCanvas);

    if(workbenchMethod==="ms" && o.type==="ms-learn"){
      let best=null,dist=24;
      for(const f of o.diagnostic){
        const x=o.p.l+o.w*f.mz/o.maxMz,d=Math.abs(q.x-x);
        if(d<dist){dist=d;best=f;}
      }
      if(best){activeMsFragmentMz=best.mz;renderWorkbench();}
      return;
    }

    if(workbenchMethod==="nmr" && o.type==="nmr-learn"){
      let best=null,dist=28;
      for(const sig of o.signals){
        const x=o.p.l+o.w*(12-sig.delta)/12,d=Math.abs(q.x-x);
        if(d<dist){dist=d;best=sig;}
      }
      if(best){activeSignalId=best.id;renderWorkbench();}
    }
  }

  function renderReferenceComparison(){
    if(!referenceUnlocked || !el.referenceCanvas) return;
    document.querySelectorAll("[data-reference-method]").forEach(b=>b.classList.toggle("active",b.dataset.referenceMethod===referenceMethod));
    const ref=referenceSubstance(),unknown=target();
    const ctx=el.referenceCanvas.getContext("2d");

    if(referenceMethod==="ms"){
      drawReferenceMs(ctx,el.referenceCanvas,unknown.ms?.peaks||[],ref.ms?.peaks||[]);
      el.referenceLegend.textContent=`MS: unbekannt durchgezogen · ${ref.name_de} gestrichelt`;
    }else if(referenceMethod==="nmr"){
      drawReferenceNmr(ctx,el.referenceCanvas,unknown.h1_nmr?.signals||[],ref.h1_nmr?.signals||[]);
      el.referenceLegend.textContent=`¹H-NMR: unbekannt durchgezogen · ${ref.name_de} gestrichelt`;
    }else{
      drawReferenceIr(ctx,el.referenceCanvas,unknown.ir?.bands||[],ref.ir?.bands||[]);
      el.referenceLegend.textContent=`IR: unbekannt durchgezogen · ${ref.name_de} gestrichelt`;
    }
  }

  function protonGroups(){return target().h1_nmr?.proton_groups||[];}

  function protonViewBox(){
    const m=(target().structure_svg||"").match(/viewBox=['"]([^'"]+)['"]/);
    const parts=(m?m[1]:"0 0 300 100").trim().split(/\s+/).map(Number);
    return {x:parts[0]||0,y:parts[1]||0,w:parts[2]||300,h:parts[3]||100};
  }

  function renderProtonAssignment(){
    if(!state.nameVerified || !el.protonAssignmentStage) return;
    const signals=target().h1_nmr?.signals||[],groups=protonGroups();
    if(!groups.length){
      el.protonFeedback.className="feedback neutral";
      el.protonFeedback.textContent="Für diesen Stoff ist die Protonengruppen-Verknüpfung noch nicht kuratiert.";
      return;
    }

    el.protonSignalList.innerHTML=signals.map((sig,i)=>{
      const active=activeSignalId===sig.id;
      return `<button type="button" class="proton-signal ${active?"active":""}" data-signal-id="${sig.id}">
        <strong>Signal ${i+1}</strong>
        <span>δ ${sig.delta.toLocaleString("de-AT")} ppm · ${sig.integration} H · ${sig.multiplicity}</span>
      </button>`;
    }).join("");

    let markers="";
    for(const group of groups){
      for(const hotspot of group.hotspots||[]){
        const active=activeSignalId===group.id;
        const w=hotspot.w||58,h=hotspot.h||34;
        markers+=`<g class="proton-group-hit ${active?"active":""}" data-proton-group="${group.id}" role="button" aria-label="${group.label||"Protonengruppe"}">
          <rect x="${hotspot.x-w/2}" y="${hotspot.y-h/2}" width="${w}" height="${h}" rx="9" ry="9"></rect>
        </g>`;
      }
    }

    const source=target().structure_svg||"";
    const annotated=source.replace(/(<svg[^>]*>)/, `$1${markers}`);
    el.protonStructure.innerHTML=`<div class="proton-svg">${annotated}</div>`;

    const group=groups.find(g=>g.id===activeSignalId);
    if(group){
      el.protonFeedback.className="feedback good";
      el.protonFeedback.innerHTML=`<strong>${escapeHtml(group.label||"Protonengruppe")}</strong><br>${escapeHtml(group.note||"")}`;
    }else{
      el.protonFeedback.className="feedback neutral";
      el.protonFeedback.textContent="Klicke auf ein NMR-Signal oder direkt auf eine Protonengruppe in der Struktur. Das zugehörige Gegenstück wird hervorgehoben.";
    }
  }


  function msDiagnosticFragments(){
    return target().ms?.diagnostic_fragments||[];
  }

  function renderMsFragmentLearning(){
    if(!state.nameVerified || !el.msFragmentStage) return;
    const fragments=msDiagnosticFragments();
    if(!fragments.length){
      el.msFragmentDetail.className="feedback neutral";
      el.msFragmentDetail.textContent="Für diesen Stoff ist die MS-Fragment-Lernhilfe noch nicht kuratiert.";
      el.msFragmentPeakList.innerHTML="";
      drawMsFragmentCanvas();
      return;
    }

    if(activeMsFragmentMz!==null && !fragments.some(f=>f.mz===activeMsFragmentMz)) activeMsFragmentMz=null;
    el.msFragmentPeakList.innerHTML=fragments.map(f=>`<button type="button" class="fragment-chip ${activeMsFragmentMz===f.mz?"active":""}" data-fragment-mz="${f.mz}"><strong>m/z ${f.mz}</strong><span>${escapeHtml(f.label)}</span></button>`).join("");
    drawMsFragmentCanvas();

    const f=fragments.find(x=>x.mz===activeMsFragmentMz);
    if(f){
      el.msFragmentDetail.className="fragment-detail";
      el.msFragmentDetail.innerHTML=`<div class="fragment-head"><strong>m/z ${f.mz} · ${escapeHtml(f.label)}</strong><span class="fragment-ion">${escapeHtml(f.ion_formula||"")}</span></div><div><strong>Weg:</strong> ${escapeHtml(f.pathway||"")}</div><p>${escapeHtml(f.note||"")}</p><p class="hint">Im Massenspektrometer erscheint dieser Peak, weil das angegebene Fragment geladen ist. Das gleichzeitig entstehende neutrale Teilchen wird nicht detektiert.</p>`;
    }else{
      el.msFragmentDetail.className="feedback neutral";
      el.msFragmentDetail.textContent="Wähle einen markierten diagnostischen Peak. Es werden bewusst nur wenige gut begründbare Fragmente erklärt.";
    }
  }

  function drawMsFragmentCanvas(){
    const canvas=el.msFragmentCanvas,ctx=canvas.getContext("2d"),peaks=target().ms?.peaks||[],diagnostic=msDiagnosticFragments();
    baseCanvas(ctx,canvas);
    const p={l:58,r:20,t:24,b:48},w=canvas.width-p.l-p.r,h=canvas.height-p.t-p.b,maxMz=Math.max(100,...peaks.map(x=>x.mz+8));
    gridAxes(ctx,p,w,h,"m/z","rel. Intensität / %",0,maxMz,0,100,false);

    peaks.forEach(pk=>{
      const isDiagnostic=diagnostic.some(f=>f.mz===pk.mz);
      const active=activeMsFragmentMz===pk.mz;
      ctx.strokeStyle=active?"#f5c66a":isDiagnostic?"#67e8f9":"#45627f";
      ctx.lineWidth=active?5:isDiagnostic?3:1.5;
      ctx.globalAlpha=isDiagnostic?1:.55;
      const x=p.l+w*pk.mz/maxMz,y=p.t+h-h*pk.intensity/100;
      ctx.beginPath();ctx.moveTo(x,p.t+h);ctx.lineTo(x,y);ctx.stroke();
      if(isDiagnostic){
        ctx.fillStyle=active?"#f5c66a":"#9cecf3";ctx.globalAlpha=1;ctx.font="12px system-ui";ctx.textAlign="center";ctx.fillText(String(pk.mz),x,Math.max(p.t+12,y-7));
      }
    });
    ctx.globalAlpha=1;ctx.textAlign="left";
    canvas._fragmentPlot={p,w,h,maxMz,diagnostic};
  }

  function selectMsFragment(mz){
    activeMsFragmentMz=mz;
    renderMsFragmentLearning();
  }

  function handleMsFragmentCanvasClick(evt){
    const o=el.msFragmentCanvas._fragmentPlot;
    if(!o) return;
    const q=canvasPoint(evt,el.msFragmentCanvas);
    let best=null,dist=22;
    for(const f of o.diagnostic){
      const x=o.p.l+o.w*f.mz/o.maxMz,d=Math.abs(q.x-x);
      if(d<dist){dist=d;best=f;}
    }
    if(best) selectMsFragment(best.mz);
  }

  async function copyJournal(){const text=journalText();try{await navigator.clipboard.writeText(text);el.copyJournalBtn.textContent="Kopiert ✓";setTimeout(()=>el.copyJournalBtn.textContent="Protokoll kopieren",1200);}catch(_){alert(text);}}
  function journalText(){const c=currentCase(),t=target();return [`STRUKTUR-LAB v${VERSION}`,c.label_de,`Modus: ${state.mode==="basic"?"Basis":"Experte"}`,`M: ${t.mass_measurement.value} ± ${t.mass_measurement.uncertainty} g/mol`,state.mode==="basic"?`Summenformel: ${t.formula}`:"Summenformel: nicht vorgegeben","",`M-Befund: ${state.notes.massNote||"–"}`,`MS-Befund: ${state.notes.msNote||"–"}`,`IR-Befund: ${state.notes.irNote||"–"}`,`NMR-Befund: ${state.notes.nmrNote||"–"}`,`Stoffklasse: ${selectedClass||"–"}`,`Strukturhypothese: ${selectedStructure||"–"}`,`Begründung: ${state.notes.hypothesisNote||"–"}`,`Name bestätigt: ${state.nameVerified?"ja":"nein"}`].join("\n");}
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}

  window.StructurLab={version:VERSION,getState:()=>structuredClone(state)};
})();
