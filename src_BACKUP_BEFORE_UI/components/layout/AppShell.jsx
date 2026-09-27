import {Outlet} from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import MobileBottomNav from "./MobileBottomNav.jsx";

export default function AppShell(){
 return <div className="app-shell"><Sidebar/><main className="app-main"><Topbar/><div className="app-content"><Outlet/></div></main><MobileBottomNav/></div>
}
