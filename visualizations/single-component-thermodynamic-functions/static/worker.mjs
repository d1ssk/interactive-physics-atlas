// Physics runs in a module worker so surface sampling cannot block the UI.
let dispatch;
try {
  ({dispatch}=await import('./physics.mjs'));
  self.onmessage=({data:{id,request}})=>{
    try{self.postMessage({id,ok:true,result:dispatch(request)});}
    catch(error){self.postMessage({id,ok:false,error:error.message});}
  };
  self.postMessage({ready:true});
} catch(error){self.postMessage({fatal:error.message});}
