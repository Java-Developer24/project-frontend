import{A as N,r as s,b as _,j as e,B as p,I as A,c as d,_ as C}from"./index-HHD5J08U.js";import{P}from"./PopoverComponent-BlY8peS9.js";const $=()=>{const{apiKey:t,setApiKey:m,user:x}=s.useContext(_),[i,u]=s.useState(null),[y,l]=s.useState(!1),[f,r]=s.useState(!1),g=localStorage.getItem("paidsms-token");async function h(){l(!0);const a=new Promise((n,b)=>{(async()=>{try{const o=(await d.get(`/api/user/change_api_key?apiKey=${x.apiKey}`,{headers:{Authorization:`Bearer ${g}`,"Content-Type":"application/json"}})).data.api_key;m(o),n(o)}catch(c){b(c)}finally{l(!1)}})()});await C.promise(a,{loading:"Changing API key...",success:"API key changed successfully",error:"Error changing API key"})}const k=a=>{u(n=>n===a?null:a)},j={wordBreak:"break-word",whiteSpace:"normal",overflowWrap:"break-word"},v=()=>{r(!0),navigator.clipboard.writeText(t)},w=[{name:"Get Number",id:"request_number",link:"/api/service/get-number?api_key=${api_key}&code=${service_code}&server=${serverNumber}"},{name:"Get Otp",id:"activation_status",link:"/api/service/get-otp?api_key=${api_key}&id=${id}"},{name:"Cancel Number",id:"get_activation_status",link:"/api/service/number-cancel?api_key=${api_key}&id=${id}"},{name:"Get Balance",id:"balance_request",link:"/api/user/balance?api_key=${api_key}"},{name:"Service Code and Price",id:"service_codes_prices",link:"/api/service/get-service?api_key=${api_key}"}];return e.jsxs("div",{className:"mt-20 lg:mt-10",children:[e.jsxs("div",{style:{textAlign:"center"},children:[e.jsx("div",{className:"flex gap-4 items-center justify-center",children:e.jsxs("h3",{className:"flex gap-3 flex-col md:flex-row text-[15px] lg:text-[30px] leading-[20px] lg:leading-[30px] font-normal lg:font-[500] text-center",children:[e.jsx("span",{className:"text-primary",children:"API Key:"})," ",e.jsxs("div",{className:" flex items-center justify-center gap-4",children:[t||"API key Not found Please change API Key",e.jsx(P,{buttonComponent:e.jsx(p,{variant:"link",className:"p-0 h-0",onClick:v,children:e.jsx(A.copy,{className:"w-5 h-5"})}),open:f,setOpen:r,popoverContent:"Copied!"})]})]})}),e.jsx(p,{type:"button",onClick:h,variant:"login",isLoading:y,className:"w-full md:w-[30%] text-sm font-normal mb-4",children:"Change API"})]}),e.jsx("div",{className:"w-full flex justify-center my-8",children:e.jsx("div",{className:"w-full max-w-[820px] flex flex-col items-center bg-[#121315] rounded-2xl p-5",children:w.map(a=>e.jsxs("div",{className:"w-full flex flex-col bg-[#18191c] rounded-2xl mb-2",children:[e.jsx("div",{className:"w-full flex items-center justify-between h-[50px] cursor-pointer",onClick:()=>k(a.id),children:e.jsxs("button",{className:"bg-transparent py-4 px-5 flex w-full items-center justify-between rounded-lg",children:[e.jsx("h3",{className:"font-normal",children:a.name}),e.jsx("div",{className:"flex items-center",children:e.jsx("p",{className:"text-xl",children:i===a.id?"-":"+"})})]})}),i===a.id&&e.jsx("div",{className:"w-full bg-[#1e1e1e] rounded-b-lg py-3 px-5 mt-2",style:j,children:e.jsxs("p",{className:"text-sm text-white",children:[d.defaults.baseURL,a.link]})})]},a.id))})})]})},B=N()($);export{B as default};
