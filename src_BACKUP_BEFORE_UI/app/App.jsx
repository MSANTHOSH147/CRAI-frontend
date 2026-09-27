import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes.jsx";
import { FieldProvider } from "./FieldContext.jsx";

export default function App(){
  return <BrowserRouter><FieldProvider><AppRoutes/></FieldProvider></BrowserRouter>;
}

