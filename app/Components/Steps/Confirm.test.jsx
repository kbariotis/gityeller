import React from 'react';
import Confirm from './Confirm';
import renderer from 'react-test-renderer';

test('Take Snapshot', () => {
  const component = renderer.create(
    <Confirm
      activeStep={4}
      repo="https://github.com/kbariotis/ansible-nodejs-digitalocean"
      label="enhancement"
      email="konmpar@gmail.com"
      next={function(){}}
      startOver={function(){}}
      styles={{}}/>
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});
