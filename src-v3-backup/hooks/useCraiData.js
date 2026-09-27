import {useCallback,useEffect,useRef,useState} from "react";
export function useCraiData(fetcher,deps=[]){
  const [state,setState]=useState({status:"loading",data:null,error:null});
  const controller=useRef(null);
  const refresh=useCallback(()=>{
    controller.current?.abort();
    const c=new AbortController(); controller.current=c;
    setState(s=>({...s,status:"loading",error:null}));
    Promise.resolve(fetcher({signal:c.signal}))
      .then(data=>{if(!c.signal.aborted)setState({status:"success",data,error:null})})
      .catch(error=>{if(!c.signal.aborted)setState({status:"error",data:null,error})});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },deps);
  useEffect(()=>{refresh();return()=>controller.current?.abort()},[refresh]);
  return {...state,refresh};
}
