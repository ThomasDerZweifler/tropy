'use strict'

const React = require('react')

const { Component, PropTypes } = React
const { noop } = require('../common/util')

class Editable extends Component {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onCancel: PropTypes.func
  }

  static defaultProps = {
    onCancel: noop
  }

  constructor(props) {
    super(props)

    this.state = {
      editing: false,
      value: props.value
    }
  }

  update = (event) => {
    this.setState({ value: event.target.value })
  }

  start = () => {
    this.setState({ editing: true })
  }

  stop = () => {
    if (this.state.value !== this.props.value) {
      this.props.onChange(this.state.value)
    } else {
      this.props.onCancel()
    }

    this.setState({ editing: false })
  }

  focus(input) {
    if (input) {
      input.focus()
      input.select()
    }
  }


  componentWillReceiveProps({ value }) {
    this.setState({ value, editing: false })
  }

  render() {
    return (this.state.editing) ? (
      <input
        className="editable"
        type="text"
        ref={this.focus}
        value={this.state.value}
        onChange={this.update}
        onBlur={this.stop}/>
    ) : (
      <span
        className="editable"
        onDoubleClick={this.start}>
        {this.props.value}
      </span>
    )
  }
}

module.exports = {
  Editable
}