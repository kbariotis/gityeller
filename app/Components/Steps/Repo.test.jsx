import React from 'react';
import Repo from './Repo';
import renderer from 'react-test-renderer';
import {shallow} from 'enzyme';

test('Take Snapshot', () => {
  const component = renderer.create(
    <Repo
      activeStep={1}
      repo="https://github.com/kbariotis/ansible-nodejs-digitalocean"
      next={function(){}}
      styles={{}}/>
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

it('Will show Next button on valid repo', () => {
  const checkbox = shallow(
    <Repo
      activeStep={1}
      next={function(){}}
      startOver={function(){}}
      styles={{}}/>
  );

  checkbox.find('input').simulate('keyup', {target: {value: 'https://github.com/kbariotis/ansible-nodejs-digitalocean'}});

  expect(checkbox.find('.btn').length).toBe(1);
});

it('Will not show Next button on not valid repo', () => {
  const checkbox = shallow(
    <Repo
      activeStep={1}
      next={function(){}}
      startOver={function(){}}
      styles={{}}/>
  );

  checkbox.find('input').simulate('keyup', {target: {value: 'not.a.valid.repo'}});

  expect(checkbox.find('.btn').length).toBe(0);
});

it('Will call next function on Enter with a valid repo', () => {
  const spy = jest.fn();
  const checkbox = shallow(
    <Repo
      activeStep={1}
      next={spy}
      startOver={function(){}}
      styles={{}}/>
  );

  checkbox.find('input').simulate('keyup', {keyCode: 13, target: {value: 'https://github.com/kbariotis/ansible-nodejs-digitalocean'}});

  expect(spy).toBeCalled();
});

it('Will not call next function on Enter with a not valid repo', () => {
  const spy = jest.fn();
  const checkbox = shallow(
    <Repo
      activeStep={1}
      next={spy}
      startOver={function(){}}
      styles={{}}/>
  );

  checkbox.find('input').simulate('keyup', {keyCode: 13, target: {value: 'not.a.valid.repo'}});

  expect(spy.mock.calls.length).toBe(0);
});
