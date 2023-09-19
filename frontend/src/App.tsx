//import { useState } from 'react'
import { Component } from "react";
import './App.css';
import Navigation from './components/Navigation/Navigation';

interface InitialState {
  route: string;
  isSignedIn: boolean;
}

interface Props {}

const initialState: InitialState = {
  route: 'game', // Change when signin is done
  isSignedIn: true,
};

class App extends Component<Props, InitialState> {
  constructor(props: Props) {
    super(props);
    this.state = initialState;
  }

  onRouteChange = (route: string): void => {
    if (route === 'signout') {
      this.setState(initialState);
    } else if (route === 'game' || route === 'profile' || route === 'chat' || route === 'pong') {
      this.setState({isSignedIn: true});
    }
    this.setState({route: route});
  }

  render() {
    const { isSignedIn, route }: {isSignedIn: boolean; route: string } = this.state;
    return (
        <div className="App">
          {
            (route === 'game' || route === 'chat' || route === 'profile' || route === 'pong') 
            ?
              <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
            : (
              route === 'signin' 
              ? '' /* <Signin onRouteChange={this.onRouteChange}/> */
              : '' /* <Register={this.onRouteChange)/> */
            )
          }
        </div>
    );
  }
}

export default App;
