import React from 'react';
import Label from './../../app/Components/Steps/Label';
import renderer from 'react-test-renderer';
import {shallow} from 'enzyme';

test('Take Snapshot', () => {
  const component = renderer.create(
    <Label
      activeStep={2}
      repo="kbariotis/ansible-nodejs-digitalocean"
      next={function(){}}
      startOver={function(){}}
      styles={{}}/>
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});
