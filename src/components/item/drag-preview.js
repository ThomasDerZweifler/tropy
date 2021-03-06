'use strict'

const React = require('react')
const { PureComponent } = React
const { PropTypes } = require('prop-types')
const { CoverImage } = require('./cover-image')
const cx = require('classnames')
const { arrayOf, string, shape, number } = PropTypes

class ItemDragPreview extends PureComponent {
  get classes() {
    return {
      'item': true,
      'drag-preview': true,
      'multiple': this.count > 1
    }
  }

  get item() {
    return this.props.items[0]
  }

  get count() {
    return this.props.items.length
  }

  render() {
    const { cache, size } = this.props

    return (
      <div className={cx(this.classes)}>
        <CoverImage cache={cache} size={size} item={this.item}/>
        {this.count > 1 &&
          <div className="badge">{this.count}</div>
        }
      </div>
    )

  }

  static propTypes = {
    cache: string.isRequired,
    size: number.isRequired,
    items: arrayOf(shape({
      id: number.isRequired
    })).isRequired
  }

  static defaultProps = {
    size: 64
  }
}

module.exports = {
  ItemDragPreview
}
