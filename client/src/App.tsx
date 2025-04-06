import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Lists from "@/pages/Lists";
import Stores from "@/pages/Stores";
import Profile from "@/pages/Profile";
import ProductSearch from "./components/ProductSearch";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/lists" component={Lists} />
      <Route path="/stores" component={Stores} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}


function App() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">🛒 BallinOnABudget</h1>
      <ProductSearch />
    </div>
  );
}

export default App;
