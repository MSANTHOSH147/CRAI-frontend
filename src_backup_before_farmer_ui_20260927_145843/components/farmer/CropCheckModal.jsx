import {useState} from "react";
import {Camera,UploadCloud,CheckCircle2,ArrowRight,RefreshCw} from "lucide-react";
import Modal from "../common/Modal.jsx";
import Button from "../common/Button.jsx";

export default function CropCheckModal({open,onClose,onContinue}){
 const [file,setFile]=useState(null);
 const [preview,setPreview]=useState("");
 const [step,setStep]=useState(1);
 function choose(e){
  const f=e.target.files?.[0]; if(!f)return;
  setFile(f); setPreview(URL.createObjectURL(f)); setStep(2);
 }
 function close(){setFile(null);setPreview("");setStep(1);onClose();}
 return <Modal open={open} onClose={close} title="Check your crop" wide>
  {step===1&&<div className="check-grid"><div className="upload-zone"><div className="upload-icon"><Camera size={26}/></div><h3>Start with a crop photo</h3><p>CRAI begins with an observation. A photo is not enough by itself to make a protective decision.</p><label className="upload-button"><UploadCloud size={17}/> Choose photo<input type="file" accept="image/*" onChange={choose}/></label></div><div className="check-explainer"><b>What happens next?</b><ol><li>Visual evidence is inspected.</li><li>Missing environmental evidence is identified.</li><li>CRAI requests what it needs.</li><li>Evidence is fused before a risk decision.</li></ol></div></div>}
  {step===2&&<div className="check-grid"><div className="preview-card">{preview&&<img src={preview} alt="Selected crop"/>}<div className="preview-overlay"><CheckCircle2 size={17}/> Photo ready for assessment</div></div><div className="check-explainer"><div className="eyebrow">OBSERVATION READY</div><h3>{file?.name}</h3><p>This preview is local to this browser. The current backend does not expose a confirmed crop-image upload route in this frontend contract, so CRAI will not pretend that the image was persisted.</p><div className="notice-card"><RefreshCw size={17}/><div><b>Next step</b><p>Open the SIH evidence journey to demonstrate the complete pipeline.</p></div></div><div className="modal-actions"><Button variant="secondary" onClick={()=>setStep(1)}>Choose another</Button><Button onClick={()=>{onContinue?.();close()}}>Continue to evidence journey <ArrowRight size={16}/></Button></div></div></div>}
 </Modal>
}
