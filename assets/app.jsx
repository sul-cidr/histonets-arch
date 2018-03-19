import React from "react";

// eslint-disable-next-line react/prefer-stateless-function
export default class HelloWorld extends React.Component {
  render() {
    return (<h1>Hello, world.<br/> {JSON.stringify(this.props)}</h1>);
  }
}
