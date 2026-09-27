import {ChevronDown,MapPin} from "lucide-react";
import {useFieldSelection} from "../../app/FieldContext.jsx";
export default function FieldSelector({onOpen}){
 const {selected}=useFieldSelection();
 return <button className="field-select" onClick={onOpen} type="button"><MapPin size={16}/><span><b>{selected.fieldName}</b><small>{selected.zoneName}</small></span><ChevronDown size={15}/></button>
}
