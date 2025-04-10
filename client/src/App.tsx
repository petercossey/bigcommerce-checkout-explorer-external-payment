import { Switch, Route } from "wouter";
import CheckoutExplorer from "@/components/CheckoutExplorer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CheckoutExplorer} />
    </Switch>
  );
}

function App() {
  return <Router />;
}

export default App;
