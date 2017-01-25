import React from 'react';
import Email from './Email';
import renderer from 'react-test-renderer';
import {shallow} from 'enzyme';

test('Take Snapshot', () => {
  const component = renderer.create(
    <Email
      activeStep={3}
      next={function(){}}
      startOver={function(){}}
      styles={{}}/>
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

it('Will show Next button on valid email', () => {
  const checkbox = shallow(
    <Email
      activeStep={3}
      next={function(){}}
      startOver={function(){}}
      styles={{}}/>
  );

  checkbox.find('input').simulate('keyup', {target: {value: 'konmpar@gmail.com'}});

  expect(checkbox.find('.btn').length).toBe(2);
});

it('Will not show Next button on not valid email', () => {
  const checkbox = shallow(
    <Email
      activeStep={3}
      next={function(){}}
      startOver={function(){}}
      styles={{}}/>
  );

  checkbox.find('input').simulate('keyup', {target: {value: 'not.a.valid.email'}});

  expect(checkbox.find('.btn').length).toBe(1);
});

it('Will call next function on Enter with a valid email', () => {
  const spy = jest.fn();
  const checkbox = shallow(
    <Email
      activeStep={3}
      next={spy}
      startOver={function(){}}
      styles={{}}/>
  );

  checkbox.find('input').simulate('keyup', {keyCode: 13, target: {value: 'konmpar@gmail.com'}});

  expect(spy).toBeCalled();
});

it('Will not call next function on Enter with a not valid email', () => {
  const spy = jest.fn();
  const checkbox = shallow(
    <Email
      activeStep={3}
      next={spy}
      startOver={function(){}}
      styles={{}}/>
  );

  checkbox.find('input').simulate('keyup', {keyCode: 13, target: {value: 'not.a.valid.email'}});

  expect(spy.mock.calls.length).toBe(0);
});
