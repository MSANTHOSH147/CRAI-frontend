import { createContext, useContext, useMemo, useState } from "react";

const Ctx = createContext(null);

const DEFAULT_FIELD = {
  farmId: 1,
  zoneId: "A1",
  fieldName: "My Field",
  zoneName: "Zone A1",
  crop: null,
};

export function FieldProvider({children}){
  const [selected,setSelected] = useState(DEFAULT_FIELD);
  const [language,setLanguage] = useState("en");
  const [notificationsOpen,setNotificationsOpen] = useState(false);
  const value = useMemo(()=>({
    selected,setSelected,language,setLanguage,notificationsOpen,setNotificationsOpen
  }),[selected,language,notificationsOpen]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFieldSelection(){
  return useContext(Ctx);
}
