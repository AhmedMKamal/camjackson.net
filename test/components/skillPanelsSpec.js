'use strict';
const expect = require('chai').expect;
const React = require('react');
const shallowRender = require('./shallowRender');
const SkillPanels = require('../../src/components/skillPanels');

describe('SkillPanels', () => {
  it('renders 6 skill panels', () => {
    const skillPanels = shallowRender(<SkillPanels/>);
    expect(skillPanels.props.children[1].props.children.length).to.equal(6);
  });
});
