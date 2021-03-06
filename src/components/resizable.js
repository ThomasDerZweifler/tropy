'use strict'

const React = require('react')
const { PureComponent } = React
const { PropTypes } = require('prop-types')
const { func, node, bool, number, oneOf } = PropTypes
const { Draggable } = require('./draggable')
const cx = require('classnames')
const { bounds } = require('../dom')
const { noop, restrict, titlecase, refine, round } = require('../common/util')
const { keys } = Object


const DIR = {
  top: 'row', right: 'col', bottom: 'row', left: 'col'
}

const DIM = {
  top: 'height', right: 'width', bottom: 'height', left: 'width'
}

const OPP = {
  top: 'bottom', right: 'left', bottom: 'top', left: 'right'
}

const AXS = {
  top: 'pageY', right: 'pageX', bottom: 'pageY', left: 'pageX'
}


class Resizable extends PureComponent {
  get classes() {
    return {
      resizable: true,
      disabled: this.props.isDisabled
    }
  }

  get dimension() {
    return DIM[this.props.edge]
  }

  get value() {
    return this.props.value
  }

  get cssValue() {
    return `${this.value}${this.props.isRelative ? '%' : 'px'}`
  }

  get cssMin() {
    return `${this.props.min}px`
  }

  get cssMax() {
    return this.props.max ? `${this.props.max}px` : null
  }

  get style() {
    const { cssValue, cssMin, cssMax, dimension } = this

    return {
      [dimension]: cssValue,
      [`min${titlecase(dimension)}`]: cssMin,
      [`max${titlecase(dimension)}`]: cssMax
    }
  }

  get isInverse() {
    return this.props.edge === 'left' || this.props.edge === 'top'
  }

  getNewValue(event) {
    const { edge, min, max, isRelative } = this.props

    let origin = bounds(this.container)[OPP[edge]]
    let value = event[AXS[edge]] - origin

    if (this.isInverse) value = -value

    value = restrict(value, min, max)

    if (isRelative) {
      value = restrict(round(value / this.scale), null, 100)
    }

    return value
  }

  setContainer = (container) => {
    this.container = container
  }

  handleDragStart = (event) => {
    const { edge, onDragStart } = this.props

    this.scale = bounds(this.container.parentElement)[DIM[edge]] / 100

    if (onDragStart) {
      return onDragStart(event, this)
    }
  }

  handleDrag = (event) => {
    if (this.props.onDrag) {
      this.props.onDrag(event, this)
    }

    if (this.props.onResize) {
      this.props.onResize(this.getNewValue(event), event, this)
    }
  }

  handleDragStop = (event) => {
    if (this.props.onDragStop) {
      this.props.onDragStop(event, this)
    }
  }


  renderHandle() {
    const { edge, isDisabled } = this.props

    return isDisabled ? null : (
      <Draggable
        onDragStart={this.handleDragStart}
        onDrag={this.handleDrag}
        onDragStop={this.handleDragStop}
        classes={cx([
          `resizable-handle-${DIR[edge]}`,
          `resizable-handle-${edge}`
        ])}/>
    )
  }

  render() {
    return (
      <div
        className={cx(this.classes)}
        ref={this.setContainer}
        style={this.style}>
        {this.props.children}
        {this.renderHandle()}
      </div>
    )
  }

  static propTypes = {
    children: node,
    edge: oneOf(keys(DIM)).isRequired,
    id: number,
    isDisabled: bool,
    isRelative: bool,
    value: number.isRequired,
    min: number.isRequired,
    max: number,
    onResize: func,
    onDrag: func,
    onDragStart: func,
    onDragStop: func,
  }

  static defaultProps = {
    min: 0
  }

}


class BufferedResizable extends Resizable {
  constructor(props) {
    super(props)

    this.state = {
      value: props.value
    }

    refine(this, 'handleDragStop', () => {
      const { value, onChange } = this.props

      if (value !== this.value && onChange) {
        onChange(this.value, this)
      }
    })
  }

  componentWillReceiveProps(props) {
    this.setState({ value: props.value })
  }

  get value() {
    return this.state.value
  }

  handleDrag = (event) => {
    const value = this.getNewValue(event)

    if (!this.props.onResize(value, event, this)) {
      this.setState({ value })
    }
  }

  static propTypes = {
    ...Resizable.propTypes,
    onChange: func,
    onResize: func.isRequired
  }

  static defaultProps = {
    ...Resizable.defaultProps,
    onResize: noop
  }
}


module.exports = {
  Resizable,
  BufferedResizable
}
