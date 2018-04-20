import React from "react";
import { shallow } from "enzyme";
import App from "../collections.create";

describe("<App>", () => {
  it("renders as expected", () => {
    const component = shallow(<App uploadUrl="/" imageFormats={['png', 'jpg']} />);
    expect(component).toMatchSnapshot();
  });
});
