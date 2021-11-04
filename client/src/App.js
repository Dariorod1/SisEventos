import logo from './logo.svg';
import './App.css';
import Eventos  from './components/Eventos';
import Evento from './components/Evento';
import { Route, Switch, Link } from "react-router-dom";
import Login from './components/Login';

function App() {
  return (
    <div className="App">
      <Route  path='/home' component={Eventos} />
      <Route exact path = "/" component={Login} />
      <Route
        exact
        path="/evento/:id"
        render={({ match }) => <Evento id={match.params.id} />}
      ></Route>
    </div>
  );
}

export default App;
