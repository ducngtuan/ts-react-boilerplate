import React from 'react'
import renderer from 'react-test-renderer'

import App from '../App'

describe('<App />', () => {
  it('should render', () => {
    expect(renderer.create(<App />).toJSON()).toMatchSnapshot()
  })

  it('should add', () => {
    expect(1 + 2).toBe(3)
  })
})
