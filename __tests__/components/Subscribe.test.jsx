import React from 'react';
import Subscribe from './../../app/Components/Steps/Subscribe';
import renderer from 'react-test-renderer';

test('Take Snapshot', () => {
  const component = renderer.create(
    <Subscribe
      activeStep={5}
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
