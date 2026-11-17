const $ = (id) => document.getElementById(id);
const STORAGE = { meals: "messmeter_meals", waste: "messmeter_waste", ratings: "messmeter_ratings" };
const read = (key) => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } };
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const weekly = [
  ["Monday","Idli & sambar","Rice, dal & vegetable curry","Fruit & tea","Chapati & paneer curry"],
  ["Tuesday","Dosa & chutney","Rice, sambar & potato fry","Banana & milk","Vegetable rice & raita"],
  ["Wednesday","Upma","Rice, dal & beans curry","Biscuits & tea","Chapati & mixed vegetable curry"],
  ["Thursday","Poori & potato curry","Rice, rasam & vegetable fry","Fruit & milk","Fried rice & manchurian"],
  ["Friday","Pongal & chutney","Rice, dal & cabbage curry","Tea & biscuits","Chapati & dal fry"],
  ["Saturday","Pesarattu","Rice, sambar & egg curry","Samosa & tea","Vegetable pulao & raita"],
  ["Sunday","Poori & chutney","Special veg meals","Ice cream","Tomato rice & curd"]
];
$("weeklyMenu").innerHTML = weekly.map(day => `<article class="day-card"><h3>${day[0]}</h3><p><b>Breakfast:</b> ${day[1]}</p><p><b>Lunch:</b> ${day[2]}</p><p><b>Snacks:</b> ${day[3]}</p><p><b>Dinner:</b> ${day[4]}</p></article>`).join("");
$("todayDate").textContent = new Date().toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"short",year:"numeric"});
$("wasteDate").value = new Date().toISOString().slice(0,10);

function refreshMealCounts(){
  const meals=read(STORAGE.meals);
  $("responseCount").textContent=meals.length;
  $("dashboardResponses").textContent=meals.length;
  $("optedInTotal").textContent=meals.reduce((sum,m)=>sum+m.meals.length,0);
}
$("submitMeals").addEventListener("click",()=>{
  const name=$("studentName").value.trim();
  if(!name){$("mealMessage").textContent="Please enter your name first.";return;}
  const chosen=[...document.querySelectorAll(".meal-check:checked")].map(x=>x.value);
  const records=read(STORAGE.meals);
  records.push({name,meals:chosen,date:new Date().toISOString()});
  write(STORAGE.meals,records);refreshMealCounts();
  $("mealMessage").textContent=chosen.length?`Saved for ${name}: ${chosen.join(", ")}.`:`Saved for ${name}: opted out of all meals.`;
});
$("calculateHeadcount").addEventListener("click",()=>{
  const total=Number($("totalStudents").value),out=Number($("optedOut").value);
  if(!Number.isInteger(total)||total<1||!Number.isInteger(out)||out<0||out>total){alert("Enter valid whole numbers. Opt-outs cannot exceed total students.");return;}
  $("headcountResult").textContent=total-out;
});
$("saveWaste").addEventListener("click",()=>{
  const date=$("wasteDate").value,kg=Number($("wasteKg").value),note=$("wasteNote").value.trim();
  if(!date||$("wasteKg").value===""||!Number.isFinite(kg)||kg<0){$("wasteMessage").textContent="Enter a date and a valid waste amount (0 or more kg).";return;}
  const records=read(STORAGE.waste);records.push({date,kg,note});write(STORAGE.waste,records);
  $("wasteKg").value="";$("wasteNote").value="";$("wasteMessage").textContent="Waste record saved.";refreshDashboard();
});
function renderWaste(){
  const rows=read(STORAGE.waste).sort((a,b)=>b.date.localeCompare(a.date));
  $("wasteRows").innerHTML=rows.length?rows.map(r=>`<tr><td>${r.date}</td><td>${r.kg.toFixed(1)} kg</td><td>${escapeHTML(r.note||"—")}</td></tr>`).join(""):'<tr><td colspan="3">No records yet.</td></tr>';
}
$("submitRating").addEventListener("click",()=>{
  const dish=$("dishName").value.trim(),rating=Number($("dishRating").value),feedback=$("dishFeedback").value.trim();
  if(!dish){$("ratingMessage").textContent="Please enter a dish name.";return;}
  const records=read(STORAGE.ratings);records.push({dish,rating,feedback,date:new Date().toISOString()});write(STORAGE.ratings,records);
  $("dishName").value="";$("dishFeedback").value="";$("ratingMessage").textContent="Thank you! Your rating has been saved.";refreshDashboard();
});
function renderRatings(){
  const ratings=read(STORAGE.ratings),groups={};
  ratings.forEach(r=>{if(!groups[r.dish])groups[r.dish]=[];groups[r.dish].push(r.rating);});
  const summary=Object.entries(groups).map(([dish,values])=>({dish,avg:values.reduce((a,b)=>a+b,0)/values.length,count:values.length})).sort((a,b)=>b.avg-a.avg);
  $("ratingSummary").innerHTML=summary.length?summary.map(x=>`<p><b>${escapeHTML(x.dish)}</b> — ${x.avg.toFixed(1)} / 5 (${x.count} rating${x.count===1?"":"s"})</p>`).join(""):"No ratings submitted yet.";
  $("topDishes").innerHTML=summary.length?summary.filter(x=>x.avg>=3.5).slice(0,5).map(x=>`<p>${escapeHTML(x.dish)} — ${x.avg.toFixed(1)} ★</p>`).join("")||"No top-rated dishes yet.":"No ratings yet.";
  $("lowDishes").innerHTML=summary.length?summary.filter(x=>x.avg<3.5).sort((a,b)=>a.avg-b.avg).slice(0,5).map(x=>`<p>${escapeHTML(x.dish)} — ${x.avg.toFixed(1)} ★</p>`).join("")||"No dishes flagged for improvement.":"No ratings yet.";
  $("averageRating").textContent=ratings.length?(ratings.reduce((s,r)=>s+r.rating,0)/ratings.length).toFixed(1)+" / 5":"—";
}
let wasteChart;
function refreshDashboard(){
  const waste=read(STORAGE.waste);
  $("totalWaste").textContent=waste.reduce((s,r)=>s+r.kg,0).toFixed(1)+" kg";
  renderWaste();renderRatings();refreshMealCounts();
  const daily={};waste.forEach(r=>daily[r.date]=(daily[r.date]||0)+r.kg);
  const labels=Object.keys(daily).sort();
  $("chartFallback").style.display=labels.length?"none":"block";
  if(window.Chart){
    if(wasteChart)wasteChart.destroy();
    wasteChart=new Chart($("wasteChart"),{type:"bar",data:{labels,datasets:[{label:"Food waste (kg)",data:labels.map(d=>daily[d]),backgroundColor:"#77b78d",borderRadius:7}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,title:{display:true,text:"Kilograms"}}}}});
  }
}
function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
$("studentLoginForm").addEventListener("submit",e=>{e.preventDefault();alert("Student demo login successful! Welcome to MessMeter.");});
$("adminLoginForm").addEventListener("submit",e=>{e.preventDefault();alert("Admin demo login successful! Welcome to MessMeter.");});
$("exportData").addEventListener("click",()=>{
  const data={mealSelections:read(STORAGE.meals),foodWaste:read(STORAGE.waste),dishRatings:read(STORAGE.ratings)};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="messmeter-demo-data.json";a.click();URL.revokeObjectURL(url);
});
refreshDashboard();
